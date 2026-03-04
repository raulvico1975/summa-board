import crypto from "node:crypto";

export function generateVoterToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function hashVoterToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function voterIdFromTokenHash(tokenHash: string): string {
  return tokenHash.slice(0, 24);
}

export function randomId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}
