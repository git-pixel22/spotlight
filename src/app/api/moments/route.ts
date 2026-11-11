import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { handle, jsonError } from "@/lib/api";
import { requireApiUser } from "@/lib/session";
import { generateJson, underDailyCap, type ImageInput } from "@/lib/ai/router";
import { MOMENTS_SYSTEM, momentsPrompt, momentsSchema } from "@/lib/ai/prompts";

export const maxDuration = 90;

const bodySchema = z.object({
  photos: z
    .array(z.object({ url: z.url(), takenAt: z.string().optional() }))
    .min(1)
    .max(20),
});

// Only fetch our own Blob store's files (no server-side requests to arbitrary URLs).
function isOurBlob(url: string) {
  const host = new URL(url).hostname;
  return host.endsWith(".public.blob.vercel-storage.com");
}

async function toImageInput(url: string): Promise<ImageInput> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Couldn't read photo (${res.status})`);
  return { mimeType: res.headers.get("content-type") ?? "image/jpeg", data: Buffer.from(await res.arrayBuffer()).toString("base64") };
}

/** Photo dump: one vision call finds the 3-5 moments worth sharing. */
export async function POST(request: NextRequest) {
  return handle(async () => {
    const user = await requireApiUser();
    const { photos } = bodySchema.parse(await request.json());
    if (!photos.every((p) => isOurBlob(p.url))) return jsonError(400, "Unknown photo source");
    if (!(await underDailyCap(user.id, "moments"))) {
      return jsonError(429, "You've used today's free photo checks. Try the sample week, or come back tomorrow.");
    }

    const images = await Promise.all(photos.map((p) => toImageInput(p.url)));
    const { data, model } = await generateJson({
      task: "moments",
      userId: user.id,
      system: MOMENTS_SYSTEM,
      prompt: momentsPrompt(user.profile, photos.map((p, index) => ({ index, takenAt: p.takenAt }))),
      schema: momentsSchema,
      images,
    });

    const rows = data.moments
      .map((m) => ({
        userId: user.id,
        source: "photo_dump" as const,
        photos: [...new Set(m.photoIndexes)].filter((i) => i < photos.length).map((i) => ({ url: photos[i].url })),
        title: m.title,
        observation: m.observation,
        question: m.question,
      }))
      .filter((m) => m.photos.length);

    const inserted = rows.length ? await db.insert(schema.moments).values(rows).returning() : [];
    return NextResponse.json({ moments: inserted, model });
  });
}
