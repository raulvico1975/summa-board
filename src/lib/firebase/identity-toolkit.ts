const firebaseApiKey =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyBcly9Qtk4BrgudbiDAhEhTNCHzNLb6fpM";

function getIdentityToolkitBaseUrl(): string {
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (emulatorHost) {
    return `http://${emulatorHost}/identitytoolkit.googleapis.com/v1`;
  }

  return "https://identitytoolkit.googleapis.com/v1";
}

async function identityToolkitFetch<T>(path: string, body: Record<string, unknown>): Promise<T | null> {
  const response = await fetch(
    `${getIdentityToolkitBaseUrl()}/${path}?key=${encodeURIComponent(firebaseApiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ idToken: string; localId: string } | null> {
  const data = await identityToolkitFetch<{ idToken?: unknown; localId?: unknown }>("accounts:signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });

  if (!data || typeof data.idToken !== "string" || typeof data.localId !== "string") {
    return null;
  }

  return {
    idToken: data.idToken,
    localId: data.localId,
  };
}

export async function sendVerificationEmailWithIdToken(input: {
  idToken: string;
  continueUrl?: string | null;
}): Promise<boolean> {
  const payload: Record<string, unknown> = {
    requestType: "VERIFY_EMAIL",
    idToken: input.idToken,
  };

  if (input.continueUrl) {
    payload.continueUrl = input.continueUrl;
    payload.canHandleCodeInApp = false;
  }

  const data = await identityToolkitFetch<{ email?: unknown }>("accounts:sendOobCode", payload);
  return !!data;
}
