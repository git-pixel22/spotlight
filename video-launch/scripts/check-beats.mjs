// Beat-sync report: where every cut and hit sits against the kicks actually audible in the final file.
// Usage: node scripts/check-beats.mjs [out/spotlight-launch.mp4]
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const g = JSON.parse(fs.readFileSync(path.join(root, "src/data/grid.json"), "utf8"));
const file = process.argv[2] ?? path.join(root, "out/spotlight-launch.mp4");
const FPS = 30;
const T = (b) => g.lead + b * g.period;
const F = (b) => Math.round(T(b) * FPS);

// 1. Kick onsets measured in the rendered audio (steepest rise of the low band, 1 ms steps).
const R = 44100;
const raw = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-vn", "-ac", "1", "-ar", String(R), "-f", "s16le", "-"], { maxBuffer: 1 << 29 });
const pcm = new Int16Array(raw.buffer, raw.byteOffset, raw.length / 2);
const a = 1 - Math.exp((-2 * Math.PI * 200) / R);
const lp = new Float32Array(pcm.length);
let y = 0;
for (let i = 0; i < pcm.length; i++) {
  y += a * (pcm[i] / 32768 - y);
  lp[i] = y;
}
const win = Math.round(0.004 * R);
const env = (i) => {
  let s = 0;
  for (let k = 0; k < win; k++) s += Math.abs(lp[i + k] ?? 0);
  return s / win;
};
const onsetNear = (t) => {
  const c = Math.round(t * R);
  const w = Math.round(0.07 * R);
  let best = 0;
  let bi = -1;
  let prev = env(Math.max(0, c - w));
  for (let i = Math.max(0, c - w) + Math.round(0.001 * R); i < c + w; i += Math.round(0.001 * R)) {
    const e = env(i);
    if (e - prev > best) {
      best = e - prev;
      bi = i;
    }
    prev = e;
  }
  return best > 0.02 ? bi / R : null; // a real kick; the breakdown (beats 80 to 111) has none, so only the grid applies there
};

// 2. Picture cuts found in the rendered video.
const sc = spawnSync("ffmpeg", ["-nostats", "-i", file, "-an", "-vf", "select='gt(scene,0.12)',showinfo", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 28 });
const cuts = [...sc.stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) => parseFloat(m[1]));

const HITS = [
  [0, "cold open: line 1"],
  [8, "line 2, grid dims"],
  [11, "spotlight 1"],
  [12, "spotlight 2"],
  [13, "spotlight 3"],
  [16, "DROP: logo"],
  [20, "tagline"],
  [24, "cut: landing"],
  [30, "click: Connect Buffer"],
  [32, "cut: welcome phone"],
  [33, "profile card"],
  [36, "cut: home"],
  [38, "text: goes quiet"],
  [47, "click: Drop photos"],
  [48, "cut: photos"],
  [50, "click: Choose photos"],
  [54, "click: Find my moments"],
  [57, "cut: sweep starts"],
  [64, "found: 5 picked"],
  [65, "text: 2 skipped"],
  [68, "text: Bring one back"],
  [71, "click: rescue"],
  [78, "click: Add 1 and answer"],
  [80, "cut: voice (breakdown)"],
  [84, "click: mic"],
  [94, "click: stop"],
  [96, "cut: transcript"],
  [98, "strike 1"],
  [99, "strike 2"],
  [100, "strike 3"],
  [101, "text: Nothing invented"],
  [108, "click: Make my posts"],
  [112, "DROP 2: posts"],
  [114, "text: Every channel"],
  [120, "cut: send buttons"],
  [122, "click: Save as drafts"],
  [124, "cut: Saved / Straight into Buffer"],
  [128, "cut: Buffer clip slot"],
  [136, "cut: $0 stack"],
  [137, "card 1"],
  [140, "chain 1"],
  [141, "chain 2"],
  [142, "chain 3"],
  [143, "chain 4"],
  [144, "cut: end card (outro)"],
  [146, "tagline"],
  [148, "URL"],
  [150, "credit"],
];
console.log(`file ${path.basename(file)}; grid ${(60 / g.period).toFixed(2)} bpm, beat = ${(g.period * FPS).toFixed(3)} frames`);
console.log("beat  frame  time(s)  vs grid   vs kick   scene-cut  what");
let worst = 0;
const offs = [];
for (const [b, what] of HITS) {
  const f = F(b);
  const tf = f / FPS;
  const grid = (tf - T(b)) * 1000;
  const k = onsetNear(T(b));
  const kick = k === null ? null : (tf - k) * 1000;
  const cut = cuts.find((c) => Math.abs(c - tf) < 0.05);
  if (kick !== null) {
    offs.push(kick);
    worst = Math.max(worst, Math.abs(kick));
  }
  console.log(
    `${String(b).padStart(4)}  ${String(f).padStart(5)}  ${tf.toFixed(3).padStart(7)}  ${(grid >= 0 ? "+" : "") + grid.toFixed(0).padStart(3)} ms   ${kick === null ? " (no kick) " : ((kick >= 0 ? "+" : "") + kick.toFixed(0)).padStart(4) + " ms   "}  ${cut === undefined ? "    -    " : ((cut - tf) * 1000).toFixed(0).padStart(4) + " ms  "}  ${what}`,
  );
}
const mean = offs.reduce((s, v) => s + v, 0) / offs.length;
const rms = Math.sqrt(offs.reduce((s, v) => s + v * v, 0) / offs.length);
console.log(`\nvs measured kick: mean ${mean.toFixed(1)} ms, rms ${rms.toFixed(1)} ms, worst ${worst.toFixed(1)} ms (one frame = 33.3 ms; + means picture after the kick)`);
