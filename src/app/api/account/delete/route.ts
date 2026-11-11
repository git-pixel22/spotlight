import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { del, list } from "@vercel/blob";
import { db, schema } from "@/lib/db";
import { getSession, requireApiUser } from "@/lib/session";
import { handle } from "@/lib/api";

/** Deletes everything Spotlight stores about the user: photos, moments, drafts, tokens, profile. */
export async function POST() {
  return handle(async () => {
    const user = await requireApiUser();

    // Photos live in Blob under users/<id>/; remove them page by page.
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: `users/${user.id}/`, cursor });
      if (page.blobs.length) await del(page.blobs.map((b) => b.url));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    // Tokens, moments and drafts cascade from the user row.
    await db.delete(schema.users).where(eq(schema.users.id, user.id));
    await db.delete(schema.aiCalls).where(eq(schema.aiCalls.userId, user.id));

    const session = await getSession();
    session.destroy();
    return NextResponse.redirect(`${process.env.APP_URL}/?notice=deleted`, { status: 303 });
  });
}
