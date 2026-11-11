import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { handle } from "@/lib/api";
import { requireApiUser } from "@/lib/session";

const bodySchema = z.object({
  title: z.string().trim().max(120).optional(),
  question: z.string().trim().max(300).optional(),
  source: z.enum(["voice", "calendar"]).default("voice"),
});

/** A moment the user answers right away: "Record a thought" or a calendar prompt. */
export async function POST(request: NextRequest) {
  return handle(async () => {
    const user = await requireApiUser();
    const body = bodySchema.parse(await request.json().catch(() => ({})));
    const [moment] = await db
      .insert(schema.moments)
      .values({
        userId: user.id,
        source: body.source,
        photos: [],
        title: body.title || "A thought worth sharing",
        question: body.question || "What's on your mind? Say it like you'd tell a regular.",
      })
      .returning();
    return NextResponse.json({ moment });
  });
}
