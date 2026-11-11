import "server-only";
import { createHash, randomBytes } from "node:crypto";

const AUTH_URL = "https://auth.buffer.com/auth";
const TOKEN_URL = "https://auth.buffer.com/token";

// Least privilege: only what Spotlight uses, plus offline_access for refresh tokens.
export const SCOPES = [
  "account:read",
  "posts:read",
  "posts:write",
  "ideas:read",
  "ideas:write",
  "offline_access",
];

export function redirectUri() {
  return `${process.env.APP_URL}/api/auth/callback`;
}

export function createPkce() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(16).toString("base64url");
  return { verifier, challenge, state };
}

export function authorizeUrl(challenge: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.BUFFER_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPES.join(" "),
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "consent",
  });
  return `${AUTH_URL}?${params}`;
}

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
};

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.BUFFER_CLIENT_ID!,
      client_secret: process.env.BUFFER_CLIENT_SECRET!,
      ...body,
    }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Buffer token endpoint ${res.status}: ${json.error_description ?? json.error ?? "unknown"}`);
  }
  return json as TokenResponse;
}

export function exchangeCode(code: string, verifier: string) {
  return tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(),
    code_verifier: verifier,
  });
}

export function refreshTokens(refreshToken: string) {
  return tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken });
}
