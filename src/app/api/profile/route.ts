import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { handle, jsonError } from "@/lib/api";
import { requireApiUser } from "@/lib/session";
import { fetchSentPosts } from "@/lib/buffer/api";
import { generateJson, underDailyCap } from "@/lib/ai/router";
import { PROFILE_SYSTEM, profilePrompt, profileSchema } from "@/lib/ai/prompts";

export const maxDuration = 60;

/** Builds the "here's what we noticed about you" profile from sent posts. */
export async function POST(request: NextRequest) {
  return handle(async () => {
    const user = await requireApiUser();
    const body = z.object({ selfDescription: z.string().max(500).optional() }).parse(await request.json().catch(() => ({})));
    if (!(await underDailyCap(user.id, "profile"))) return jsonError(429, "Daily limit reached for profile rebuilds. Try again tomorrow.");

    const posts = (await fetchSentPosts(user.id, user.organizationId, 50))
      .filter((p) => p.text?.trim())
      .map((p) => ({ service: p.channelService, text: p.text! }));

    if (!posts.length && !body.selfDescription) {
      return NextResponse.json({ needsDescription: true });
    }

    const { data, model } = await generateJson({
      task: "profile",
      userId: user.id,
      system: PROFILE_SYSTEM,
      prompt: profilePrompt(posts, body.selfDescription),
      schema: profileSchema,
    });
    const profile = { ...data, basedOnPosts: posts.length };
    await db.update(schema.users).set({ profile, updatedAt: new Date() }).where(eq(schema.users.id, user.id));
    return NextResponse.json({ profile, model });
  });
}

const patchSchema = z.object({
  summary: z.string().min(3).max(600).optional(),
  selectedChannelIds: z.array(z.string()).optional(),
});

export async function PATCH(request: NextRequest) {
  return handle(async () => {
    const user = await requireApiUser();
    const body = patchSchema.parse(await request.json());
    const update: Partial<typeof schema.users.$inferInsert> = { updatedAt: new Date() };
    if (body.selectedChannelIds) {
      const valid = new Set(user.channels.map((c) => c.id));
      update.selectedChannelIds = body.selectedChannelIds.filter((id) => valid.has(id));
    }
    if (body.summary && user.profile) update.profile = { ...user.profile, summary: body.summary };
    await db.update(schema.users).set(update).where(eq(schema.users.id, user.id));
    return NextResponse.json({ ok: true });
  });
}
