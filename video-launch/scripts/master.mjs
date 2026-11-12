// Loudness-normalise the raw render to about -14 LUFS (plain gain plus a safety limiter) and write the 720p preview.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = path.join(root, "out/spotlight-launch-raw.mp4");
const final = path.join(root, "out/spotlight-launch.mp4");
const preview = path.join(root, "out/spotlight-launch-720p.mp4");
const TARGET = -14;

const lufs = (file) => {
  const r = spawnSync("ffmpeg", ["-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" });
  const s = r.stderr.slice(r.stderr.lastIndexOf("Summary:"));
  return { i: parseFloat(s.match(/I:\s+(-?[\d.]+) LUFS/)[1]), peak: parseFloat(s.match(/Peak:\s+(-?[\d.]+) dBFS/)[1]) };
};
// Prefer the uncompressed mix from scripts/render.mjs so the audio is only encoded once.
const mix = path.join(root, "out/mix.wav");
const audio = fs.existsSync(mix) && fs.statSync(mix).mtimeMs >= fs.statSync(raw).mtimeMs - 600000 ? mix : raw;
const before = lufs(audio);
const gain = TARGET - before.i;
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", raw, "-i", audio, "-map", "0:v", "-map", "1:a", "-shortest", "-c:v", "copy", "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=0.8:attack=3:release=60:level=false`, "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", final]);
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", final, "-vf", "scale=1280:720:flags=lanczos", "-c:v", "libx264", "-crf", "21", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", preview]);
const after = lufs(final);
console.log(`raw ${before.i} LUFS (peak ${before.peak} dBFS), gain ${gain.toFixed(2)} dB -> final ${after.i} LUFS (true peak ${after.peak} dBFS)`);
