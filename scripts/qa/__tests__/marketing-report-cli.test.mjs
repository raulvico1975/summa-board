import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const script = fileURLToPath(new URL('../../marketing/marketing-report.mjs', import.meta.url));

function runReport(failedSource, strict) {
  const dir = mkdtempSync(join(tmpdir(), 'summa-marketing-test-'));
  try {
    const preload = join(dir, 'offline.mjs');
    writeFileSync(preload, `
      globalThis.fetch = async (url) => {
        const source = String(url).includes('/webmasters/') ? 'gsc' : 'ga4';
        const failed = source === ${JSON.stringify(failedSource)};
        return new Response(JSON.stringify(failed
          ? { error: { message: 'Request had insufficient authentication scopes.' } }
          : { rows: [] }), { status: failed ? 403 : 200 });
      };
    `);
    return spawnSync(process.execPath, [
      '--import', preload, script, '--days', '14', '--end-date', '2026-09-05',
      '--no-hosting', '--no-write', ...(strict ? ['--require-analytics'] : []),
    ], {
      encoding: 'utf8', timeout: 10000,
      env: { ...process.env, GOOGLE_MARKETING_ACCESS_TOKEN: 'offline-test-token', GA4_PROPERTY_ID: '123' },
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

for (const source of ['gsc', 'ga4']) {
  test(`strict report fails when ${source} is unavailable but still explains the missing source`, () => {
    const result = runReport(source, true);
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stdout, /insufficient authentication scopes/);
    assert.match(result.stderr, /Informe incomplet/);
    assert.doesNotMatch(result.stdout + result.stderr, /offline-test-token/);
  });
}

test('strict report accepts available sources with genuinely zero activity', () => {
  const result = runReport(null, true);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Search Console: Disponible/);
  assert.match(result.stdout, /Google Analytics 4: Disponible/);
});

test('non-strict diagnostic report keeps its existing exit behavior', () => {
  const result = runReport('gsc', false);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /insufficient authentication scopes/);
});
