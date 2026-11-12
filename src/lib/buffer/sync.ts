import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { fetchChannels } from "@/lib/buffer/api";
import { isSupported } from "@/lib/channels";

type User = typeof schema.users.$inferSelect;

/**
 * Re-reads the user's channels from Buffer, so a channel connected after signing in shows
 * up without signing out and back in. Channels Spotlight hasn't seen before start selected;
 * channels the user turned off stay off. On any Buffer error, keeps what was stored.
 */
export async function syncChannels(user: User): Promise<User> {
  try {
    const channels = (await fetchChannels({ userId: user.id }, user.organizationId))
      .filter((c) => !c.isDisconnected)
      .map(({ id, service, name, displayName, avatar, timezone }) => ({ id, service, name, displayName, avatar, timezone }));
    const known = new Set(user.channels.map((c) => c.id));
    const present = new Set(channels.map((c) => c.id));
    const selectedChannelIds = [
      ...user.selectedChannelIds.filter((id) => present.has(id)),
      ...channels.filter((c) => !known.has(c.id) && isSupported(c.service)).map((c) => c.id),
    ];
    const [updated] = await db
      .update(schema.users)
      .set({ channels, selectedChannelIds, updatedAt: new Date() })
      .where(eq(schema.users.id, user.id))
      .returning();
    return updated ?? user;
  } catch (err) {
    console.error("Channel sync failed", err);
    return user;
  }
}
