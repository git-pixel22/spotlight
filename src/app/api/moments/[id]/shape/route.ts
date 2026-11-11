import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { handle, jsonError } from "@/lib/api";
import { requireApiUser } from "@/lib/session";
import { getOwnedMoment, targetChannels } from "@/lib/moments";
import { generateJson, underDailyCap } from "@/lib/ai/router";
import { SHAPE_SYSTEM, shapePrompt, shapeSchema } from "@/lib/ai/prompts";
import { ruleFor } from "@/lib/channels";
import { samplePostsFor } from "@/lib/sample";

export const maxDuration = 60;

const bodySchema = z.object({
  take: z.string().trim().min(2).max(4000),
  useSampleAnswer: z.boolean().optional(),
});

/** Turns the user's own answer into one post per channel, keeping their words. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/moments/[id]/shape">) {
  return handle(async () => {
    const user = await requireApiUser();
    const { id } = await ctx.params;
    const moment = await getOwnedMoment(user, id);
    if (!moment) return jsonError(404, "Moment not found");
    const { take, useSampleAnswer } = bodySchema.parse(await request.json());

    const channels = targetChannels(user).filter((c) => !ruleFor(c.service).requiresImage || moment.photos.length > 0);
    if (!channels.length) return jsonError(400, "Pick at least one channel that can take this post.");

    let cleanedTake = take;
    let posts: { channelId: string; text: string }[];
    let altTexts: string[] = moment.photos.map((p) => p.alt ?? "");
    let model = "precomputed";

    const sample = moment.source === "sample" && useSampleAnswer ? samplePostsFor(moment.title, channels) : null;
    if (sample) {
      posts = sample.posts;
      altTexts = sample.altTexts;
    } else {
      if (!(await underDailyCap(user.id, "shape"))) return jsonError(429, "Daily limit reached. Try again tomorrow.");
      const result = await generateJson({
        task: "shape",
        userId: user.id,
        system: SHAPE_SYSTEM,
        prompt: shapePrompt({
          profile: user.profile,
          momentTitle: moment.title,
          question: moment.question,
          take,
          channels,
          photoCount: moment.photos.length,
          photoObservation: moment.observation,
        }),
        schema: shapeSchema,
      });
      model = result.model;
      cleanedTake = result.data.cleanedTake;
      altTexts = result.data.altTexts;
      const byId = new Map(result.data.posts.map((p) => [p.channelId, p.text]));
      // Keep only known channels and hard-enforce each network's limit.
      posts = channels.map((c) => ({
        channelId: c.id,
        text: (byId.get(c.id) ?? cleanedTake).slice(0, ruleFor(c.service).limit),
      }));
    }

    const photos = moment.photos.map((p, i) => ({ ...p, alt: altTexts[i] ?? p.alt ?? "" }));
    await db.update(schema.moments).set({ take: cleanedTake, photos, status: "answered" }).where(eq(schema.moments.id, moment.id));

    await db.delete(schema.drafts).where(and(eq(schema.drafts.momentId, moment.id), eq(schema.drafts.status, "draft")));
    const service = new Map(channels.map((c) => [c.id, c.service]));
    const drafts = await db
      .insert(schema.drafts)
      .values(posts.map((p) => ({ momentId: moment.id, userId: user.id, channelId: p.channelId, service: service.get(p.channelId)!, text: p.text })))
      .returning();

    return NextResponse.json({ take: cleanedTake, photos, drafts, model });
  });
}
