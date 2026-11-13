// Uploads the sample week's photos to Vercel Blob at stable public URLs.
// usage: node scripts/upload-sample.mjs <dir of .jpg files> [folder, default "sample"]
// Use a new folder for new photos, so the live site keeps its current ones until a deploy.
import { put } from "@vercel/blob";
import { readFileSync, readdirSync } from "node:fs";
const [dir, folder = "sample"] = process.argv.slice(2);
for (const f of readdirSync(dir).filter((f) => f.endsWith(".jpg"))) {
  const b = await put(`${folder}/${f}`, readFileSync(`${dir}/${f}`), { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "image/jpeg" });
  console.log(b.url);
}
