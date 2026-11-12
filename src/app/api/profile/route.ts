import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { handle, jsonError } from "@/lib/api";
import { requireApiUser } from "@/lib/session";
import { fetchSentPosts } from "@/lib/buffer/api";
import { AllModelsFailedError, generateJson, underDailyCap } from "@/lib/ai/router";
import type { Profile } from "@/lib/db/schema";
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

    let profile: Profile;
    let model = "basic";
    try {
      const result = await generateJson({
        task: "profile",
        userId: user.id,
        system: PROFILE_SYSTEM,
        prompt: profilePrompt(posts, body.selfDescription),
        schema: profileSchema,
      });
      profile = { ...result.data, basedOnPosts: posts.length };
      model = result.model;
    } catch (err) {
      // Never strand someone at onboarding because the free AI is busy: let them in with a
      // basic profile they can edit, and the rest of the app (or the sample week) still works.
      if (!(err instanceof AllModelsFailedError)) throw err;
      profile = basicProfile(posts, body.selfDescription);
    }
    await db.update(schema.users).set({ profile, updatedAt: new Date() }).where(eq(schema.users.id, user.id));
    return NextResponse.json({ profile, model });
  });
}

/** A profile from simple counts over their posts, for when no AI model is available. */
function basicProfile(posts: { text: string }[], selfDescription?: string): Profile {
  const n = posts.length;
  const share = (re: RegExp) => (n ? posts.filter((p) => re.test(p.text)).length / n : 0);
  const avg = n ? posts.reduce((sum, p) => sum + p.text.length, 0) / n : 0;
  const about = selfDescription?.trim();
  return {
    summary: about ? `You told us: ${about}` : "You post about your work on social media.",
    business: about ? about.slice(0, 60) : "small business or creator",
    topics: [],
    voice: {
      tone: "plain and friendly",
      length: avg > 400 ? "long" : avg > 140 ? "medium" : "short",
      emoji: share(/\p{Extended_Pictographic}/u) > 0.3 ? "a few" : share(/\p{Extended_Pictographic}/u) > 0 ? "rarely" : "none",
      hashtags: share(/(^|\s)#\w/) > 0.3 ? "a few at the end" : "none",
      language: "the language they answer in",
    },
    recentTopics: [],
    basedOnPosts: n,
    basic: true,
  };
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
