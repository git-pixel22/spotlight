// Renders out/spotlight-launch-raw.mp4 one scene at a time.
// The 2880x1800 recordings are heavy to decode; a single long render can exhaust memory on a small machine,
// so each scene gets its own short-lived renderer, the mix is rendered on its own, and the parts are joined losslessly.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const g = JSON.parse(fs.readFileSync(path.join(root, "src/data/grid.json"), "utf8"));
const F = (b) => Math.round((g.lead + b * g.period) * 30);
const total = Math.round((g.lead + g.endVideoBeat * g.period + g.tail) * 30);
const cuts = [0, ...[16, 24, 32, 36, 48, 64, 80, 96, 112, 128, 136, 144].map(F), total];
const run = (args) => execFileSync("npx", args, { cwd: root, stdio: ["ignore", "ignore", "inherit"] });
const only = process.argv.slice(2).map(Number); // optional: chunk indexes to re-render

const dir = path.join(root, "out/chunks");
fs.mkdirSync(dir, { recursive: true });
console.log("bundling");
run(["remotion", "bundle", "--log=error"]);

const parts = [];
for (let i = 0; i + 1 < cuts.length; i++) {
  const file = path.join(dir, `part${String(i).padStart(2, "0")}.mp4`);
  parts.push(file);
  if (only.length && !only.includes(i) && fs.existsSync(file)) continue;
  const t0 = Date.now();
  run([
    "remotion", "render", "build", "SpotlightLaunch", file,
    `--frames=${cuts[i]}-${cuts[i + 1] - 1}`,
    "--muted", "--codec=h264", "--crf=16", "--concurrency=1",
    "--media-cache-size-in-bytes=300000000", "--timeout=120000", "--log=error",
  ]);
  console.log(`part ${i}: frames ${cuts[i]}-${cuts[i + 1] - 1} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}

console.log("audio mix");
const wav = path.join(root, "out/mix.wav");
run(["remotion", "render", "build", "SpotlightLaunchAudio", wav, "--concurrency=1", "--log=error"]);

const list = path.join(dir, "list.txt");
fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join("\n") + "\n");
execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", list, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-shortest", "-movflags", "+faststart", path.join(root, "out/spotlight-launch-raw.mp4")]);
console.log("wrote out/spotlight-launch-raw.mp4");
