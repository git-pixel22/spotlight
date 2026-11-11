import "server-only";
import { getAccessToken } from "./tokens";

const API_URL = "https://api.buffer.com";

export class BufferApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public retryAfterSec?: number,
  ) {
    super(message);
  }
}

type GqlResponse<T> = { data?: T; errors?: { message: string; extensions?: { code?: string } }[] };

/** Call Buffer's GraphQL API as a connected user. Retries once on a short 429. */
export async function bufferGql<T>(
  userId: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  return gqlWithToken<T>(await getAccessToken(userId), query, variables);
}

export async function gqlWithToken<T>(
  token: string,
  query: string,
  variables?: Record<string, unknown>,
  retried = false,
): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? "60");
    // Wait out short resets; surface long ones instead of blocking (Buffer's guidance).
    if (!retried && retryAfter <= 5) {
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return gqlWithToken<T>(token, query, variables, true);
    }
    throw new BufferApiError("Buffer rate limit reached, try again shortly", 429, retryAfter);
  }

  const json = (await res.json().catch(() => ({}))) as GqlResponse<T>;
  if (!res.ok || json.errors?.length) {
    const msg = json.errors?.map((e) => e.message).join("; ") ?? `HTTP ${res.status}`;
    throw new BufferApiError(msg, res.status);
  }
  return json.data as T;
}
