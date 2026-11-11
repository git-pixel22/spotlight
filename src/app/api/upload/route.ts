import { NextResponse, type NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { handle, jsonError } from "@/lib/api";
import { requireApiUser } from "@/lib/session";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Stores one (already resized) photo in Vercel Blob. Buffer has no upload
 * endpoint and fetches media when the post publishes, so every photo needs a
 * stable public HTTPS URL.
 */
export async function POST(request: NextRequest) {
  return handle(async () => {
    const user = await requireApiUser();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError(400, "No file");
    if (!TYPES.has(file.type)) return jsonError(415, "Photos only (JPEG, PNG or WebP)");
    if (file.size > MAX_BYTES) return jsonError(413, "Photo too large");

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const blob = await put(`users/${user.id}/photo.${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  });
}
