import { NextResponse, type NextRequest } from "next/server";
import { handle, jsonError } from "@/lib/api";
import { requireApiUser } from "@/lib/session";
import { transcribe, underDailyCap } from "@/lib/ai/router";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  return handle(async () => {
    const user = await requireApiUser();
    if (!(await underDailyCap(user.id, "transcribe"))) return jsonError(429, "Daily voice limit reached. You can still type your answer.");
    const form = await request.formData();
    const audio = form.get("audio");
    if (!(audio instanceof File) || audio.size === 0) return jsonError(400, "No audio");
    if (audio.size > 10 * 1024 * 1024) return jsonError(413, "Recording too long");
    const text = await transcribe(user.id, Buffer.from(await audio.arrayBuffer()), audio.type || "audio/webm");
    return NextResponse.json({ text });
  });
}
