import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { handle } from "@/lib/api";
import { requireApiUser } from "@/lib/session";
import { SAMPLE_MOMENTS } from "@/lib/sample";

/** Loads the sample bakery week. No AI calls: everything is precomputed. */
export async function POST() {
  return handle(async () => {
    const user = await requireApiUser();
    // Replace any unanswered sample moments so repeated clicks don't pile up.
    await db
      .delete(schema.moments)
      .where(and(eq(schema.moments.userId, user.id), eq(schema.moments.source, "sample"), inArray(schema.moments.status, ["new", "answered"])));
    const moments = await db
      .insert(schema.moments)
      .values(
        SAMPLE_MOMENTS.map((m) => ({
          userId: user.id,
          source: "sample" as const,
          photos: m.photos,
          title: m.title,
          observation: m.observation,
          question: m.question,
        })),
      )
      .returning();
    return NextResponse.json({ moments });
  });
}
