import fs from "node:fs/promises";

const baseUrl = process.env.MONITOR_BASE_URL || "http://127.0.0.1:3000";
const authBase = process.env.MONITOR_AUTH_BASE || "http://127.0.0.1:9099";
const intervalMs = Number(process.env.MONITOR_INTERVAL_MS || 15000);
const watchMode = process.argv.includes("--watch");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readSeedSafe() {
  try {
    const raw = await fs.readFile("scripts/.seed-output.json", "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function runCheck() {
  const started = new Date();
  const seed = await readSeedSafe();

  const loginRes = await fetch(`${baseUrl}/login`, { cache: "no-store" });
  assert(loginRes.ok, `GET /login ha fallat (${loginRes.status})`);

  if (!seed?.owner?.email || !seed?.owner?.password) {
    console.log(`[${started.toISOString()}] /login OK (sense seed per provar sessió owner)`);
    return;
  }

  const signInRes = await fetch(
    `${authBase}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: seed.owner.email,
        password: seed.owner.password,
        returnSecureToken: true,
      }),
    }
  );

  assert(signInRes.ok, `Sign-in emulator ha fallat (${signInRes.status})`);
  const signInData = await signInRes.json();
  assert(Boolean(signInData.idToken), "Sign-in sense idToken");

  const sessionRes = await fetch(`${baseUrl}/api/auth/session-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: signInData.idToken }),
  });

  assert(sessionRes.ok, `Session login ha fallat (${sessionRes.status})`);
  const sessionCookie = sessionRes.headers.get("set-cookie");
  assert(Boolean(sessionCookie), "Session login sense cookie");

  const dashboardRes = await fetch(`${baseUrl}/dashboard`, {
    headers: {
      cookie: sessionCookie,
    },
  });

  assert(dashboardRes.ok, `GET /dashboard ha fallat (${dashboardRes.status})`);
  const dashboardHtml = await dashboardRes.text();
  assert(
    dashboardHtml.includes("Votacions") || dashboardHtml.includes("Tauler"),
    "Dashboard no conté contingut esperat"
  );

  console.log(`[${started.toISOString()}] /login OK + sessió owner OK`);
}

async function main() {
  if (!watchMode) {
    await runCheck();
    return;
  }

  console.log(`Monitor de /login actiu cada ${intervalMs}ms`);

  while (true) {
    try {
      await runCheck();
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] ERROR monitor /login:`,
        error instanceof Error ? error.message : error
      );
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

await main();
