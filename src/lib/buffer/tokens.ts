import "server-only";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/crypto";
import { refreshTokens, type TokenResponse } from "./oauth";

const REFRESH_EARLY_MS = 2 * 60 * 1000;

export class ReauthRequiredError extends Error {}

export async function saveTokens(userId: string, t: TokenResponse) {
  const values = {
    userId,
    accessTokenEnc: encrypt(t.access_token),
    refreshTokenEnc: t.refresh_token ? encrypt(t.refresh_token) : null,
    expiresAt: new Date(Date.now() + t.expires_in * 1000),
    scope: t.scope ?? null,
    refreshLeaseUntil: null,
    updatedAt: new Date(),
  };
  await db
    .insert(schema.bufferTokens)
    .values(values)
    .onConflictDoUpdate({ target: schema.bufferTokens.userId, set: values });
}

async function readRow(userId: string) {
  return db.query.bufferTokens.findFirst({ where: eq(schema.bufferTokens.userId, userId) });
}

/**
 * Returns a valid access token, refreshing it shortly before expiry.
 *
 * Buffer rotates refresh tokens and reusing an old one revokes the whole grant,
 * so two parallel requests must never refresh at once. A short lease row-update
 * acts as the lock: whoever wins the UPDATE refreshes, everyone else waits and
 * re-reads the fresh token.
 */
export async function getAccessToken(userId: string): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const row = await readRow(userId);
    if (!row) throw new ReauthRequiredError("No Buffer connection");

    if (row.expiresAt.getTime() - Date.now() > REFRESH_EARLY_MS) {
      return decrypt(row.accessTokenEnc);
    }
    if (!row.refreshTokenEnc) throw new ReauthRequiredError("Access expired, no refresh token");

    const won = await db
      .update(schema.bufferTokens)
      .set({ refreshLeaseUntil: sql`now() + interval '30 seconds'` })
      .where(
        and(
          eq(schema.bufferTokens.userId, userId),
          eq(schema.bufferTokens.updatedAt, row.updatedAt),
          or(isNull(schema.bufferTokens.refreshLeaseUntil), lt(schema.bufferTokens.refreshLeaseUntil, sql`now()`)),
        ),
      )
      .returning({ userId: schema.bufferTokens.userId });

    if (won.length) {
      try {
        const fresh = await refreshTokens(decrypt(row.refreshTokenEnc));
        // Persist the rotated refresh token before anything can use it.
        await saveTokens(userId, { ...fresh, refresh_token: fresh.refresh_token ?? decrypt(row.refreshTokenEnc) });
        return fresh.access_token;
      } catch (err) {
        await db
          .update(schema.bufferTokens)
          .set({ refreshLeaseUntil: null })
          .where(eq(schema.bufferTokens.userId, userId));
        throw new ReauthRequiredError(`Refresh failed: ${(err as Error).message}`);
      }
    }
    // Someone else is refreshing: wait and re-read.
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("Timed out waiting for token refresh");
}
