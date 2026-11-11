import { put } from "@vercel/blob";
import { readFileSync, readdirSync } from "node:fs";
const dir = process.argv[2];
for (const f of readdirSync(dir).filter((f) => f.endsWith(".jpg"))) {
  const b = await put(`sample/${f}`, readFileSync(`${dir}/${f}`), { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "image/jpeg" });
  console.log(b.url);
}
