import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type SessionOptions } from "iron-session";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export type SessionData = {
  userId?: string;
  // OAuth handshake values, only present between /login and /callback
  oauthState?: string;
  oauthVerifier?: string;
};

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "spotlight_session",
  ttl: 60 * 60 * 24 * 30,
  cookieOptions: {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, session.userId) });
  return user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

export class UnauthorizedError extends Error {}

/** For route handlers: throws instead of redirecting. */
export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError("Not signed in");
  return user;
}

export type User = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/**
 * A human name to greet with. Buffer accounts often have no display name, so
 * fall back to a channel's display name (e.g. the LinkedIn profile name).
 */
export function firstName(user: Pick<User, "name" | "channels">): string | null {
  const looksLikeName = (s?: string | null) => !!s && !s.includes("@") && !/[._\d]/.test(s);
  const name = [user.name, ...user.channels.map((c) => c.displayName)].find(looksLikeName);
  return name ? name.trim().split(/\s+/)[0] : null;
}
