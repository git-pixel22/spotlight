// Freeze frames used where the edit holds on a static screen.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stills = [
  ["voice", 23.6, "voice_transcript"], // transcript with the filler words, after the page settles
  ["voice", 44.74, "voice_saved"], // "Saved as drafts in Buffer."
];
for (const [clip, t, name] of stills) {
  execFileSync("ffmpeg", ["-y", "-v", "error", "-ss", String(t), "-i", path.join(root, `public/clips/${clip}.mp4`), "-frames:v", "1", path.join(root, `public/stills/${name}.png`)]);
  console.log(`${name}.png <- ${clip} @ ${t}s`);
}
