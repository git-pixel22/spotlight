// Builds public/audio/music.wav (the beat-aligned music edit) and public/audio/answer-snippet.wav.
// Usage: node scripts/build-audio.mjs [path/to/what-about-action.mp3]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const g = JSON.parse(fs.readFileSync(path.join(root, "src/data/grid.json"), "utf8"));
const src = process.argv[2] ?? path.resolve(root, "../video/public/music", g.track);
const answerSrc = process.argv[3] ?? path.resolve(root, "../video/public/audio/answer.wav");
const out = path.join(root, "public/audio");
fs.mkdirSync(out, { recursive: true });

const beat = (b) => g.t0 + g.period * b; // track time of track beat b
const PRE = 0.015; // cut this far ahead of the kick so its transient is never clipped
const XF = 0.01; // splice crossfade

// Part A: lead-in + video beats 0..splice. Part B: outro from the resume beat to the end.
const aStart = beat(g.startBeat) - g.lead;
const aEnd = beat(g.startBeat + g.spliceVideoBeat) - PRE + XF;
const bStart = beat(g.resumeTrackBeat) - PRE;
const total = g.lead + g.endVideoBeat * g.period + g.tail;
const bLen = total - (aEnd - aStart) + XF + 0.05;
const fc = [
  `[0:a]atrim=${aStart.toFixed(5)}:${aEnd.toFixed(5)},asetpts=PTS-STARTPTS[a]`,
  `[0:a]atrim=${bStart.toFixed(5)}:${(bStart + bLen).toFixed(5)},asetpts=PTS-STARTPTS[b]`,
  `[a][b]acrossfade=d=${XF}:c1=tri:c2=tri[m]`,
  `[m]afade=t=in:d=0.09,afade=t=out:st=${(total - 0.7).toFixed(3)}:d=0.7,atrim=0:${total.toFixed(4)}[o]`,
].join(";");
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", src, "-filter_complex", fc, "-map", "[o]", "-ar", "48000", "-c:a", "pcm_s16le", path.join(out, "music.wav")]);
console.log(`music.wav: ${total.toFixed(3)} s (track ${aStart.toFixed(3)}..${aEnd.toFixed(3)} + ${bStart.toFixed(3)}..)`);

// Answer snippet: "Um, so, matcha Oreo. Every single time." End at the quietest point after the phrase.
const R = 48000;
const raw = execFileSync("ffmpeg", ["-v", "error", "-i", answerSrc, "-ac", "1", "-ar", String(R), "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
const pcm = new Int16Array(raw.buffer, raw.byteOffset, raw.length / 2);
let best = Infinity;
let cut = 3.55;
for (let t = 3.5; t < 3.62; t += 0.01) {
  let s = 0;
  const n = Math.round(0.06 * R);
  const i0 = Math.round(t * R);
  for (let i = 0; i < n; i++) s += (pcm[i0 + i] / 32768) ** 2;
  if (s < best) {
    best = s;
    cut = t + 0.03;
  }
}
const a0 = 0.06;
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", answerSrc, "-af", `atrim=${a0}:${cut.toFixed(3)},asetpts=PTS-STARTPTS,highpass=f=80,afade=t=in:d=0.03,afade=t=out:st=${(cut - a0 - 0.12).toFixed(3)}:d=0.12,volume=3dB`, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", path.join(out, "answer-snippet.wav")]);
console.log(`answer-snippet.wav: ${(cut - a0).toFixed(2)} s (source ${a0}..${cut.toFixed(2)}, floor ${(10 * Math.log10(best / (0.06 * R) + 1e-12)).toFixed(0)} dB)`);
