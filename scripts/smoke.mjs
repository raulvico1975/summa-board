import fs from "node:fs/promises";

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";

async function readSeed() {
  const raw = await fs.readFile("scripts/.seed-output.json", "utf8");
  return JSON.parse(raw);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const seed = await readSeed();

const pollSlug = seed.poll.slug;
const optionIds = seed.poll.optionIds;
const meetingId = seed.meeting.meetingId;
const ownerEmail = seed.owner?.email;
const ownerPassword = seed.owner?.password;

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
assert(icsRes.ok, "L'endpoint ICS no ha retornat OK");
assert((icsRes.headers.get("content-type") || "").includes("text/calendar"), "ICS content-type invàlid");

if (ownerEmail && ownerPassword) {
  const authRes = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ownerEmail,
        password: ownerPassword,
        returnSecureToken: true,
      }),
    }
  );

  assert(authRes.ok, "Sign-in owner a l'emulador ha fallat");
  const authData = await authRes.json();
  assert(Boolean(authData.idToken), "Sign-in owner sense idToken");

  const sessionRes = await fetch(`${baseUrl}/api/auth/session-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: authData.idToken }),
  });

  assert(sessionRes.ok, "Session login owner ha fallat");
  const setCookie = sessionRes.headers.get("set-cookie");
  assert(Boolean(setCookie), "Session login owner sense cookie");

  const dashboardRes = await fetch(`${baseUrl}/dashboard`, {
    headers: { cookie: setCookie },
  });
  assert(dashboardRes.ok, "Dashboard owner no accessible després de login");
}

console.log("Smoke OK");
