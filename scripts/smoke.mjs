import fs from "node:fs/promises";

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const emulatorAuthBase = process.env.SMOKE_AUTH_BASE || "http://127.0.0.1:9099";

async function readSeed() {
  const raw = await fs.readFile("scripts/.seed-output.json", "utf8");
  return JSON.parse(raw);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function signInEmulator(email, password) {
  const authRes = await fetch(
    `${emulatorAuthBase}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );

  assert(authRes.ok, `Sign-in emulator ha fallat per ${email}`);
  const authData = await authRes.json();
  assert(Boolean(authData.idToken), `Sign-in sense idToken per ${email}`);
  return authData.idToken;
}

async function createSession(idToken) {
  const sessionRes = await fetch(`${baseUrl}/api/auth/session-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  assert(sessionRes.ok, "Session login ha fallat");
  const setCookie = sessionRes.headers.get("set-cookie");
  assert(Boolean(setCookie), "Session login sense cookie");
  return setCookie;
}

const seed = await readSeed();

const pollSlug = seed.poll.slug;
const pollId = seed.poll.pollId;
const optionIds = seed.poll.optionIds;
const meetingId = seed.meeting.meetingId;
const ownerEmail = seed.owner?.email;
const ownerPassword = seed.owner?.password;

const homeRes = await fetch(`${baseUrl}/`);
assert(homeRes.ok, "La pàgina pública / no respon OK");
const homeHtml = await homeRes.text();
assert(homeHtml.includes("Accés entitat"), "A / no es veu el CTA d'accés");
assert(homeHtml.includes("Donar d'alta entitat"), "A / no es veu el CTA d'alta");

const pollRes = await fetch(`${baseUrl}/p/${pollSlug}`);
assert(pollRes.ok, "La pàgina pública de votació no respon OK");

const loginRes = await fetch(`${baseUrl}/login`);
assert(loginRes.ok, "La pàgina /login no respon OK");

const availability = Object.fromEntries(optionIds.map((id, index) => [id, index !== 1]));

const voteRes = await fetch(`${baseUrl}/api/public/vote`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    slug: pollSlug,
    voterName: "Test Smoke",
    availabilityByOptionId: availability,
  }),
});

assert(voteRes.ok, "El primer vot no ha retornat OK");
const voteData = await voteRes.json();
assert(Boolean(voteData.voterToken), "No s'ha retornat voterToken");
assert(Boolean(voteData.voterId), "No s'ha retornat voterId");

const voteResOther = await fetch(`${baseUrl}/api/public/vote`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    slug: pollSlug,
    voterName: "Test Smoke Segon Usuari",
    availabilityByOptionId: Object.fromEntries(optionIds.map((id, index) => [id, index !== 0])),
  }),
});

assert(voteResOther.ok, "El vot del segon usuari no ha retornat OK");
const voteDataOther = await voteResOther.json();
assert(Boolean(voteDataOther.voterId), "El segon usuari no ha retornat voterId");
assert(
  voteDataOther.voterId !== voteData.voterId,
  "Dos usuaris diferents no poden compartir voterId"
);

const voteRes2 = await fetch(`${baseUrl}/api/public/vote`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    slug: pollSlug,
    voterName: "Test Smoke Editat",
    voterToken: voteData.voterToken,
    availabilityByOptionId: Object.fromEntries(optionIds.map((id) => [id, true])),
  }),
});

assert(voteRes2.ok, "El re-vot no ha retornat OK");
const voteData2 = await voteRes2.json();
assert(voteData2.voterId === voteData.voterId, "El re-vot no ha mantingut voterId");

const icsRes = await fetch(`${baseUrl}/api/public/ics?meetingId=${meetingId}`);
assert(icsRes.status === 401 || icsRes.status === 403, "ICS hauria d'estar protegit");

if (ownerEmail && ownerPassword) {
  const ownerIdToken = await signInEmulator(ownerEmail, ownerPassword);
  const ownerCookie = await createSession(ownerIdToken);

  const ownerDashboardRes = await fetch(`${baseUrl}/dashboard`, {
    headers: { cookie: ownerCookie },
  });
  assert(ownerDashboardRes.ok, "Dashboard owner no accessible després de login");

  const ownerIcsRes = await fetch(`${baseUrl}/api/public/ics?meetingId=${meetingId}`, {
    headers: { cookie: ownerCookie },
  });
  assert(ownerIcsRes.ok, "ICS owner no accessible amb sessió vàlida");
  assert((ownerIcsRes.headers.get("content-type") || "").includes("text/calendar"), "ICS content-type invàlid");

  const signupSuffix = Date.now();
  const signupOrg = `Entitat Smoke ${signupSuffix}`;
  const signupEmail = `owner-${signupSuffix}@summa.local`;
  const signupPassword = "12345678";

  const signupRes = await fetch(`${baseUrl}/api/auth/entity-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", origin: baseUrl },
    body: JSON.stringify({
      orgName: signupOrg,
      contactName: "Owner Smoke",
      email: signupEmail,
      password: signupPassword,
    }),
  });
  assert(signupRes.ok, `Alta d'entitat ha fallat (${signupRes.status})`);
  const signupData = await signupRes.json();
  assert(signupData.ok === true, "Alta d'entitat sense resposta ok=true");

  const secondOwnerIdToken = await signInEmulator(signupEmail, signupPassword);
  const secondOwnerCookie = await createSession(secondOwnerIdToken);

  const secondDashboardRes = await fetch(`${baseUrl}/dashboard`, {
    headers: { cookie: secondOwnerCookie },
  });
  assert(secondDashboardRes.ok, "Dashboard del nou owner no accessible");
  const secondDashboardHtml = await secondDashboardRes.text();
  assert(secondDashboardHtml.includes(signupOrg), "El dashboard del nou owner no mostra el nom de la seva entitat");
  assert(!secondDashboardHtml.includes("Junta mensual"), "El nou owner veu dades d'una altra entitat");

  const crossPollRes = await fetch(`${baseUrl}/polls/${pollId}`, {
    headers: { cookie: secondOwnerCookie },
    redirect: "manual",
  });
  assert(crossPollRes.status === 404, "Aïllament trencat: una entitat pot obrir la votació d'una altra");

  const logoutRes = await fetch(`${baseUrl}/api/auth/session-logout`, {
    method: "POST",
    headers: { cookie: ownerCookie, origin: baseUrl },
  });
  assert(logoutRes.ok, "Logout API ha fallat");

  const revokedDashboardRes = await fetch(`${baseUrl}/dashboard`, {
    headers: { cookie: ownerCookie },
    redirect: "manual",
  });
  assert(
    (revokedDashboardRes.status === 307 || revokedDashboardRes.status === 303) &&
      revokedDashboardRes.headers.get("location") === "/login",
    "Logout no revoca la sessió al servidor"
  );
}

console.log("Smoke OK");
