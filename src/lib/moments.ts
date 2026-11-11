import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { User } from "@/lib/session";
import { isSupported } from "@/lib/channels";

export async function getOwnedMoment(user: User, id: string) {
  return db.query.moments.findFirst({
    where: and(eq(schema.moments.id, id), eq(schema.moments.userId, user.id)),
  });
}

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function targetChannels(user: User) {
  const selected = new Set(user.selectedChannelIds);
  return user.channels.filter((c) => selected.has(c.id) && isSupported(c.service));
}
