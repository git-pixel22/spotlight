import "server-only";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { instagramCrop } from "@/lib/instagram";

/**
 * Returns a URL Instagram will accept: the original if it fits, otherwise a centre-cropped
 * copy stored next to the user's photos (so Delete my data removes it too). Falls back to the
 * original on any error, leaving Buffer to report the problem.
 */
export async function instagramSafeUrl(url: string, userId: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const input = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(input).metadata();
    if (!meta.width || !meta.height) return url;
    // EXIF orientations 5 to 8 mean the stored pixels are rotated 90 degrees.
    const turned = (meta.orientation ?? 1) >= 5;
    const box = instagramCrop(turned ? meta.height : meta.width, turned ? meta.width : meta.height);
    if (!box) return url;
    const out = await sharp(input).rotate().extract(box).jpeg({ quality: 88 }).toBuffer();
    const blob = await put(`users/${userId}/instagram.jpg`, out, { access: "public", addRandomSuffix: true, contentType: "image/jpeg" });
    return blob.url;
  } catch (err) {
    console.error("Instagram crop failed", err);
    return url;
  }
}
