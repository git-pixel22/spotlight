import { NextResponse, type NextRequest } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { handle, jsonError } from "@/lib/api";
import { requireApiUser } from "@/lib/session";
import { getOwnedMoment } from "@/lib/moments";
import { createIdea, createPost } from "@/lib/buffer/api";
import { ruleFor } from "@/lib/channels";

export const maxDuration = 60;

const bodySchema = z.object({
  mode: z.enum(["draft", "queue", "scheduled", "idea"]),
  dueAt: z.iso.datetime().optional(),
  posts: z.array(z.object({ draftId: z.uuid(), text: z.string().trim().min(1) })).min(1),
});

/** Sends the reviewed posts to Buffer as drafts, queued posts, or one Idea. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/moments/[id]/send">) {
  return handle(async () => {
    const user = await requireApiUser();
    const { id } = await ctx.params;
    const moment = await getOwnedMoment(user, id);
    if (!moment) return jsonError(404, "Moment not found");
    const { mode, posts, dueAt } = bodySchema.parse(await request.json());
    if (mode === "scheduled" && (!dueAt || new Date(dueAt).getTime() < Date.now() + 60_000)) {
      return jsonError(400, "Pick a time at least a minute from now.");
    }

    const rows = await db.query.drafts.findMany({
      where: and(eq(schema.drafts.momentId, moment.id), inArray(schema.drafts.id, posts.map((p) => p.draftId))),
    });
    const textById = new Map(posts.map((p) => [p.draftId, p.text]));
    const images = moment.photos.map((p) => ({ url: p.url, alt: p.alt }));

    if (mode === "idea") {
      // An Idea is channel-agnostic: save the longest version as the starting point.
      const longest = rows.map((r) => textById.get(r.id) ?? r.text).sort((a, b) => b.length - a.length)[0];
      const ideaId = await createIdea(user.id, { organizationId: user.organizationId, title: moment.title, text: longest, images });
      await db.update(schema.drafts).set({ status: "sent", sendMode: "idea", bufferIdeaId: ideaId }).where(inArray(schema.drafts.id, rows.map((r) => r.id)));
      await db.update(schema.moments).set({ status: "sent" }).where(eq(schema.moments.id, moment.id));
      return NextResponse.json({ results: [{ ok: true, ideaId }] });
    }

    const results = [];
    for (const row of rows) {
      const rule = ruleFor(row.service);
      const text = (textById.get(row.id) ?? row.text).slice(0, rule.limit);
      try {
        const post = await createPost(user.id, {
          channelId: row.channelId,
          service: row.service,
          text,
          images: images.slice(0, rule.maxImages),
          mode,
          dueAt,
        });
        const postId = post.id;
        await db.update(schema.drafts).set({ text, status: "sent", sendMode: mode, bufferPostId: postId, error: null }).where(eq(schema.drafts.id, row.id));
        results.push({ draftId: row.id, channelId: row.channelId, ok: true, postId, dueAt: post.dueAt });
      } catch (err) {
        const error = (err as Error).message;
        await db.update(schema.drafts).set({ text, status: "failed", sendMode: mode, error }).where(eq(schema.drafts.id, row.id));
        results.push({ draftId: row.id, channelId: row.channelId, ok: false, error });
      }
    }
    if (results.some((r) => r.ok)) {
      await db.update(schema.moments).set({ status: "sent" }).where(eq(schema.moments.id, moment.id));
    }
    return NextResponse.json({ results });
  });
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/moments/[id]/send">) {
  return handle(async () => {
    const user = await requireApiUser();
    const { id } = await ctx.params;
    const moment = await getOwnedMoment(user, id);
    if (!moment) return jsonError(404, "Moment not found");
    await db.update(schema.moments).set({ status: "dismissed" }).where(eq(schema.moments.id, moment.id));
    return NextResponse.json({ ok: true });
  });
}
