import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createInMemoryPublicMcpRateLimiter,
  createPublicMcpOAuthHttpHandler,
} from '@/lib/public-mcp/oauth-http';
import { PublicMcpAuthError } from '@/lib/public-mcp/oauth';
import {
  createFixturePublicMcpReadService,
  createLocalFixtureActor,
} from '@/lib/public-mcp/server';

const initializeRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: { name: 'summa-m2-http-test', version: '0.1.0' },
  },
};

function request(body: unknown = initializeRequest, headers: HeadersInit = {}) {
  return new Request('https://mcp.example.test/mcp', {
    method: 'POST',
    headers: {
      accept: 'application/json, text/event-stream',
      authorization: 'Bearer fixture-token',
      'content-type': 'application/json',
      ...Object.fromEntries(new Headers(headers).entries()),
    },
    body: JSON.stringify(body),
  });
}

function handler(overrides: Partial<Parameters<typeof createPublicMcpOAuthHttpHandler>[0]> = {}) {
  return createPublicMcpOAuthHttpHandler({
    async resolveActor() { return createLocalFixtureActor(); },
    readService: createFixturePublicMcpReadService(),
    resourceMetadataUrl: 'https://mcp.example.test/.well-known/oauth-protected-resource/mcp',
    rateLimiter: createInMemoryPublicMcpRateLimiter({ maxRequests: 10, windowMs: 60_000 }),
    ...overrides,
  });
}

test('M2 HTTP boundary returns an OAuth discovery challenge before MCP processing', async () => {
  const response = await handler({
    async resolveActor() { throw new PublicMcpAuthError('MISSING_ACCESS_TOKEN', 401); },
  })(request());
  assert.equal(response.status, 401);
  assert.match(response.headers.get('www-authenticate') ?? '', /resource_metadata="https:\/\/mcp\.example\.test/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('M2 HTTP boundary rejects oversized payloads before resolving identity', async () => {
  let resolved = false;
  const response = await handler({
    maxPayloadBytes: 32,
    async resolveActor() { resolved = true; return createLocalFixtureActor(); },
  })(request({ q: 'x'.repeat(100) }));
  assert.equal(response.status, 413);
  assert.equal(resolved, false);
});

test('M2 HTTP boundary rate-limits by a hashed actor reference', async () => {
  const rateLimiter = createInMemoryPublicMcpRateLimiter({ maxRequests: 1, windowMs: 60_000 });
  const handle = handler({ rateLimiter, nowMs: () => 1_000 });
  assert.equal((await handle(request())).status, 200);
  assert.equal((await handle(request())).status, 429);
});

test('M2 HTTP boundary keeps the authenticated fixture loop stateless and no-store', async () => {
  const response = await handler()(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const payload = await response.json() as { result?: { capabilities?: { tools?: unknown } } };
  assert.equal(typeof payload.result?.capabilities?.tools, 'object');
});

test('M2 HTTP boundary rejects JSON-RPC batches before auth, rate limiting, or reads', async () => {
  let actorResolutions = 0;
  let rateLimitConsumes = 0;
  let contactReads = 0;
  const logs: Array<{ event: string; status: number; code?: string; actorRef?: string }> = [];
  const fixtureReadService = createFixturePublicMcpReadService();
  const handle = handler({
    async resolveActor() {
      actorResolutions += 1;
      return createLocalFixtureActor();
    },
    rateLimiter: {
      consume() {
        rateLimitConsumes += 1;
        return true;
      },
    },
    readService: {
      ...fixtureReadService,
      async searchContacts(actor, input) {
        contactReads += 1;
        return fixtureReadService.searchContacts(actor, input);
      },
    },
    log(entry) { logs.push(entry); },
  });

  for (const batch of [
    [],
    [
      {
        jsonrpc: '2.0', id: 10, method: 'tools/call',
        params: { name: 'search_contacts', arguments: { q: 'prova' } },
      },
      {
        jsonrpc: '2.0', id: 11, method: 'tools/call',
        params: { name: 'search_contacts', arguments: { q: 'prova' } },
      },
    ],
  ]) {
    const response = await handle(request(batch));
    assert.equal(response.status, 400);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { error: 'MCP_BATCH_NOT_SUPPORTED' });
  }

  assert.equal(actorResolutions, 0);
  assert.equal(rateLimitConsumes, 0);
  assert.equal(contactReads, 0);
  assert.deepEqual(logs, [
    { event: 'payload_rejected', status: 400, code: 'MCP_BATCH_NOT_SUPPORTED' },
    { event: 'payload_rejected', status: 400, code: 'MCP_BATCH_NOT_SUPPORTED' },
  ]);
});

test('M2 HTTP boundary keeps individual tools/list and tools/call requests working', async () => {
  let contactReads = 0;
  const fixtureReadService = createFixturePublicMcpReadService();
  const handle = handler({
    readService: {
      ...fixtureReadService,
      async searchContacts(actor, input) {
        contactReads += 1;
        return fixtureReadService.searchContacts(actor, input);
      },
    },
  });

  const listed = await handle(request({ jsonrpc: '2.0', id: 20, method: 'tools/list', params: {} }));
  assert.equal(listed.status, 200);
  const listedPayload = await listed.json() as { result?: { tools?: Array<{ name?: string }> } };
  assert.equal(listedPayload.result?.tools?.some(({ name }) => name === 'search_contacts'), true);

  const called = await handle(request({
    jsonrpc: '2.0', id: 21, method: 'tools/call',
    params: { name: 'search_contacts', arguments: { q: 'prova' } },
  }));
  assert.equal(called.status, 200);
  const calledPayload = await called.json() as { result?: { isError?: boolean } };
  assert.equal(calledPayload.result?.isError, undefined);
  assert.equal(contactReads, 1);
});

test('M2 HTTP boundary rejects a direct call to an ungranted tool without reading data', async () => {
  let contactReads = 0;
  const actor = createLocalFixtureActor();
  actor.allowedTools = ['get_session_context'];
  const fixtureReadService = createFixturePublicMcpReadService();
  const response = await handler({
    async resolveActor() { return actor; },
    readService: {
      ...fixtureReadService,
      async searchContacts(serviceActor, input) {
        contactReads += 1;
        return fixtureReadService.searchContacts(serviceActor, input);
      },
    },
  })(request({
    jsonrpc: '2.0', id: 30, method: 'tools/call',
    params: { name: 'search_contacts', arguments: { q: 'prova' } },
  }));

  assert.equal(response.status, 200);
  const payload = await response.json() as { result?: { isError?: boolean; content?: unknown } };
  assert.equal(payload.result?.isError, true);
  assert.match(JSON.stringify(payload.result?.content), /not found/i);
  assert.equal(contactReads, 0);
});

test('M2 HTTP boundary denies granted tools independently for missing scope or permission', async () => {
  for (const scenario of [
    {
      name: 'scope',
      change(actor: ReturnType<typeof createLocalFixtureActor>) {
        actor.scopes = actor.scopes.filter((scope) => scope !== 'contacts.search');
      },
    },
    {
      name: 'permission',
      change(actor: ReturnType<typeof createLocalFixtureActor>) {
        actor.permissions = actor.permissions.filter((permission) => (
          permission !== 'sections.donants'
          && permission !== 'sections.proveidors'
          && permission !== 'sections.treballadors'
        ));
      },
    },
  ]) {
    let contactReads = 0;
    const actor = createLocalFixtureActor();
    assert.equal(actor.allowedTools.includes('search_contacts'), true);
    scenario.change(actor);
    const fixtureReadService = createFixturePublicMcpReadService();
    const response = await handler({
      async resolveActor() { return actor; },
      readService: {
        ...fixtureReadService,
        async searchContacts(serviceActor, input) {
          contactReads += 1;
          return fixtureReadService.searchContacts(serviceActor, input);
        },
      },
    })(request({
      jsonrpc: '2.0', id: scenario.name, method: 'tools/call',
      params: { name: 'search_contacts', arguments: { q: 'prova' } },
    }));

    assert.equal(response.status, 200, scenario.name);
    const payload = await response.json() as { result?: { isError?: boolean; content?: unknown } };
    assert.equal(payload.result?.isError, true, scenario.name);
    assert.match(JSON.stringify(payload.result?.content), /not found/i, scenario.name);
    assert.equal(contactReads, 0, scenario.name);
  }
});
