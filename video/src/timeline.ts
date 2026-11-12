import { FPS } from "./theme";

/**
 * Single source of truth for the edit (v2). All times are seconds.
 *
 * v2 is narration-driven: every narration file plays whole, back to back
 * (about 0.4 s between lines), and the footage is cut and retimed to fit it.
 * Scene pictures change 0.3 to 0.6 s after the next line has started (J-cut)
 * or while the previous line is still finishing (L-cut).
 */

/* ------------------------------------------------------------------ */
/* Narration                                                           */
/* ------------------------------------------------------------------ */

// First and last voiced instant inside each file (from silence detection).
const SPEECH: Record<string, [number, number]> = {
  "vo1.wav": [0.24, 4.34],
  "vo2.wav": [0.22, 7.15],
  "vo3.wav": [0.21, 3.69],
  "vo4.wav": [0.24, 6.29],
  "vo5.wav": [0.28, 6.7],
  "vo6.wav": [0.29, 6.99],
  "answer.wav": [0.1, 10.97],
  "vo7.wav": [0.19, 9.33],
  "vo8.wav": [0.23, 4.89],
  "vo9.wav": [0.0, 6.5],
};
const GAP = 0.4; // silence between one line ending and the next starting
const LOGO_BEAT = 1.3; // music-only beat while the logo forms
const ANSWER_BREATH = 0.75; // deliberate breath before the owner speaks
const SWEEP_HOLD = 2.0; // music-only beat while the spotlight sweeps the photo grid
const VO5_SPLIT = 4.03; // inside the pause before "and skips the rest."
const STACK_SECONDS = 5.7; // stack on screen before the iris; the chain lights in a music-only beat

/** File start time so that its first word lands `gap` after the previous file's last word. */
const after = (prevFile: string, prevAt: number, file: string, gap = GAP) =>
  prevAt + SPEECH[prevFile][1] + gap - SPEECH[file][0];

const A1 = 0.5;
const A2 = after("vo1.wav", A1, "vo2.wav");
const A3 = after("vo2.wav", A2, "vo3.wav", LOGO_BEAT);
const A4 = after("vo3.wav", A3, "vo4.wav");
const A5 = after("vo4.wav", A4, "vo5.wav");
const A5B = A5 + VO5_SPLIT + SWEEP_HOLD;
const A6 = after("vo5.wav", A5 + SWEEP_HOLD, "vo6.wav");
const AANS = after("vo6.wav", A6, "answer.wav", ANSWER_BREATH);
const A7 = after("answer.wav", AANS, "vo7.wav");
const A8 = after("vo7.wav", A7, "vo8.wav");

// Scene 8b: the Buffer drafts clip (placeholder until the real one exists)
export const BUFFER_CLIP = "buffer-clip.mp4"; // drop this file into public/ to replace the placeholder
export const BUFFER_CLIP_SECONDS = 4;
export const T_BUFFER = A8 + 5.1; // the saved confirmation holds about 2 s first
export const T_STACK = T_BUFFER + BUFFER_CLIP_SECONDS;
const A9 = T_STACK - 0.6; // "It all runs on free tiers" starts over the Buffer clip (J-cut)
const VO9_SPLIT = 3.9; // inside the pause between "…every step." and "Spotlight."
export const T_END = T_STACK + STACK_SECONDS; // yellow iris
const A9B = T_END + 0.95; // "Spotlight." lands as the logo forms

export type Chunk = { text: string; a: number; b: number };
export type Vo = { file: string; at: number; s0: number; s1: number; chunks: Chunk[]; owner?: boolean };

export const VO: Vo[] = [
  {
    file: "vo1.wav", at: A1, s0: 0, s1: 4.76,
    chunks: [
      { text: "Every small business has a camera roll", a: 0.2, b: 2.2 },
      { text: "full of posts that never got posted.", a: 2.2, b: 4.5 },
    ],
  },
  {
    file: "vo2.wav", at: A2, s0: 0, s1: 7.44,
    chunks: [
      { text: "The potter, the barber, the home baker.", a: 0.15, b: 3.2 },
      { text: "They're living their content.", a: 3.3, b: 4.8 },
      { text: "They just don't have time to turn it into posts.", a: 4.85, b: 7.3 },
    ],
  },
  {
    file: "vo3.wav", at: A3, s0: 0, s1: 4.0,
    chunks: [
      { text: "Spotlight helps them notice it.", a: 0.15, b: 2.05 },
      { text: "It's built on the Buffer API.", a: 2.1, b: 3.85 },
    ],
  },
  {
    file: "vo4.wav", at: A4, s0: 0, s1: 6.64,
    chunks: [
      { text: "Connect Buffer,", a: 0.2, b: 1.3 },
      { text: "and Spotlight reads your recent posts", a: 1.3, b: 3.25 },
      { text: "to learn what you do and how you write.", a: 3.25, b: 5.6 },
      { text: "No forms.", a: 5.6, b: 6.45 },
    ],
  },
  {
    file: "vo5.wav", at: A5, s0: 0, s1: VO5_SPLIT,
    chunks: [
      { text: "Drop the week's photos.", a: 0.2, b: 1.7 },
      { text: "Spotlight picks the moments worth sharing,", a: 1.7, b: 4.03 },
    ],
  },
  {
    file: "vo5.wav", at: A5B, s0: VO5_SPLIT, s1: 7.0,
    chunks: [
      { text: "and skips the rest.", a: 4.1, b: 5.4 },
      { text: "You can always bring one back.", a: 5.4, b: 6.85 },
    ],
  },
  {
    file: "vo6.wav", at: A6, s0: 0, s1: 7.24,
    chunks: [
      { text: "For each moment, it asks one question", a: 0.2, b: 3.0 },
      { text: "only you can answer.", a: 3.0, b: 4.6 },
      { text: "You answer out loud, in about ten seconds.", a: 4.65, b: 7.2 },
    ],
  },
  {
    file: "answer.wav", at: AANS, s0: 0, s1: 11.16, owner: true,
    chunks: [
      { text: "Um, so, matcha Oreo.", a: 0.05, b: 2.2 },
      { text: "Every single time.", a: 2.3, b: 3.55 },
      { text: "I almost didn't make it, like,", a: 3.55, b: 5.6 },
      { text: "I thought matcha was too niche, you know?", a: 5.6, b: 8.05 },
      { text: "And now people message me", a: 8.05, b: 9.1 },
      { text: "just to ask if it's in the box this week.", a: 9.1, b: 11.1 },
    ],
  },
  {
    file: "vo7.wav", at: A7, s0: 0, s1: 9.64,
    chunks: [
      { text: "Your answer becomes a post for every channel,", a: 0.15, b: 3.05 },
      { text: "in your own words.", a: 3.05, b: 4.4 },
      { text: "Filler goes, nothing gets invented,", a: 4.45, b: 7.0 },
      { text: "and that rule is enforced in code.", a: 7.05, b: 9.45 },
    ],
  },
  {
    file: "vo8.wav", at: A8, s0: 0, s1: 5.28,
    chunks: [
      { text: "Save them as drafts, add them to your queue,", a: 0.2, b: 2.6 },
      { text: "or pick a time.", a: 2.6, b: 3.7 },
      { text: "They land straight in Buffer.", a: 3.7, b: 5.1 },
    ],
  },
  {
    file: "vo9.wav", at: A9, s0: 0, s1: VO9_SPLIT,
    chunks: [
      { text: "It all runs on free tiers,", a: 0, b: 1.8 },
      { text: "with a backup model for every step.", a: 1.85, b: 3.9 },
    ],
  },
  {
    file: "vo9.wav", at: A9B, s0: VO9_SPLIT, s1: 6.8,
    chunks: [
      { text: "Spotlight.", a: 4.1, b: 4.95 },
      { text: "You're already living your content.", a: 5.0, b: 6.8 },
    ],
  },
];

/** Time of a spoken phrase, for syncing pictures and overlays to narration. */
export const voTime = (file: string, src: number) => {
  const v = VO.find((x) => x.file === file && src >= x.s0 - 0.01 && src < x.s1 + 0.01)!;
  return v.at + (src - v.s0);
};

export type Cue = { text: string; from: number; to: number; owner: boolean };
export const CUES: Cue[] = VO.flatMap((v) =>
  v.chunks.map((c) => ({
    text: c.text,
    from: v.at + (c.a - v.s0),
    to: v.at + (c.b - v.s0),
    owner: !!v.owner,
  })),
);

/** Voiced intervals on the composition clock (used for music ducking and checks). */
export const SPEECH_SPANS: [number, number][] = VO.map((v) => {
  let [a, b] = SPEECH[v.file];
  if (v.file === "vo9.wav") [a, b] = v.s0 === 0 ? [0, 3.58] : [4.15, 6.5]; // the two halves of vo9
  if (v.file === "vo5.wav") [a, b] = v.s0 === 0 ? [0.28, 3.87] : [4.19, 6.7];
  return [v.at + a - v.s0, v.at + b - v.s0] as [number, number];
});

/* ------------------------------------------------------------------ */
/* Picture                                                             */
/* ------------------------------------------------------------------ */

export const T_LOGO = A2 + SPEECH["vo2.wav"][1] + 0.1; // yellow iris closes over the opening
export const T_LANDING = voTime("vo3.wav", 2.17) + 0.75; // cut to the landing page mid "…Buffer API." (L-cut)
export const T_PRODUCT = voTime("vo4.wav", 1.36) + 0.1; // phone arrives as "and Spotlight reads…" begins (L-cut)
const PHONE_START = T_PRODUCT + 0.3;

// Scene picture cuts, each 0.4 to 0.5 s after the scene's narration has started (J-cut)
export const S4 = T_PRODUCT;
export const S5 = voTime("vo5.wav", SPEECH["vo5.wav"][0]) + 0.45;
export const S6 = voTime("vo6.wav", SPEECH["vo6.wav"][0]) + 0.45;
export const S7 = A7 + 0.5;
export const S8 = voTime("vo8.wav", SPEECH["vo8.wav"][0]) + 0.4;

export type Clip = "welcome" | "photos" | "voice";
/** Source range [a, b] shown until composition time `until`; the speed follows from that. */
type Spec = { clip: Clip; a: number; b: number; until: number };

const SPECS: Spec[] = [
  // Scene 4, welcome.mp4: loading, profile card, scroll to channels
  { clip: "welcome", a: 9.5, b: 13.3, until: A4 + 3.25 },
  { clip: "welcome", a: 13.3, b: 15.6, until: A4 + 5.6 },
  { clip: "welcome", a: 17.0, b: 21.3, until: S5 },
  // Scene 5, photos.mp4: drop, upload, sweep, reveal, rescue
  { clip: "photos", a: 2.0, b: 4.3, until: A5 + 2.0 },
  { clip: "photos", a: 4.3, b: 6.7, until: A5 + 2.5 },
  { clip: "photos", a: 14, b: 39.3, until: A5 + 5.75 }, // the whole sweep, fast forward
  { clip: "photos", a: 39.3, b: 42.3, until: A5 + 7.6 },
  { clip: "photos", a: 42.3, b: 44.0, until: S6 },
  // Scene 6, voice.mp4: question, mic, listening at 1x (answer.wav starts at source 2.9 s)
  { clip: "voice", a: 0.1, b: 1.6, until: A6 + 4.6 },
  { clip: "voice", a: 1.6, b: 2.0, until: A6 + 5.0 },
  { clip: "voice", a: 2.0, b: 2.7, until: AANS - 0.2 },
  { clip: "voice", a: 2.7, b: 14.1, until: AANS + 11.2 },
  // Scene 7: writing down and fitting (fast forward), transcript, per-channel posts
  { clip: "voice", a: 17.0, b: 20.9, until: A7 + 0.5 },
  { clip: "voice", a: 20.9, b: 23.0, until: A7 + 1.7 },
  { clip: "voice", a: 23.0, b: 28.8, until: A7 + 2.45 },
  { clip: "voice", a: 28.8, b: 31.3, until: A7 + 4.95 },
  { clip: "voice", a: 31.3, b: 33.7, until: S8 },
  // Scene 8: send options, sending (fast forward), confirmation
  { clip: "voice", a: 33.7, b: 34.85, until: A8 + 2.3 },
  { clip: "voice", a: 34.85, b: 38.8, until: A8 + 2.95 },
  { clip: "voice", a: 38.8, b: 41.5, until: T_BUFFER + 0.6 },
];

export type PlacedSeg = { clip: Clip; a: number; b: number; rate: number; from: number; frames: number; start: number; end: number };

export const SEGMENTS: PlacedSeg[] = (() => {
  let f = Math.round(PHONE_START * FPS);
  return SPECS.map((s) => {
    const endF = Math.round(s.until * FPS);
    const frames = endF - f;
    if (frames <= 0) throw new Error(`Segment ${s.clip} ${s.a} has no time`);
    const placed = { clip: s.clip, a: s.a, b: s.b, rate: (s.b - s.a) / (frames / FPS), from: f, frames, start: f / FPS, end: endF / FPS };
    f = endF;
    return placed;
  });
})();

/** Composition time at which a source time of a clip is on screen. */
export const at = (clip: Clip, src: number): number => {
  const s = SEGMENTS.find((x) => x.clip === clip && src >= x.a && src <= x.b);
  if (!s) throw new Error(`No segment shows ${clip} @ ${src}`);
  return s.start + (src - s.a) / s.rate;
};

// Key synced moments
export const E = {
  profileCard: at("welcome", 13.5),
  photosIn: at("photos", 2.5),
  picked: at("photos", 39.55),
  rescue: at("photos", 42.8),
  scrollToMic: at("voice", 1.7),
  answer: AANS,
  writing: at("voice", 17.0),
  transcript: at("voice", 21.0),
  posts: at("voice", 29.0),
  sendTap: at("voice", 34.85),
  saved: at("voice", 38.9),
};

/* ------------------------------------------------------------------ */
/* Music                                                               */
/* ------------------------------------------------------------------ */

// The tail after the last word is stretched (2.3 to 3.4 s) so that the "5 picked" reveal
// falls on a strong beat: the bed ends on the track's last chord, which is on the same
// half-bar grid (110 bpm) 2.5 s before the end.
const HALF_BAR = (2 * 60) / 110;
const BASE_TOTAL = A9B + (SPEECH["vo9.wav"][1] - VO9_SPLIT) + 2.3;
const mod = (x: number, m: number) => ((x % m) + m) % m;
export const TOTAL = BASE_TOTAL + mod(2.5 - (BASE_TOTAL - E.picked), HALF_BAR);
export const TOTAL_FRAMES = Math.round(TOTAL * FPS);

// "Swings and Slides" (Mixkit, 110 bpm). The track's own ending is used: its last
// chord rings out at 133.4 s, so the bed starts wherever makes that the last frame.
export const MUSIC = {
  file: "music/swings-and-slides.mp3",
  trackEnd: 133.4,
  // integrated loudness of each section of the track (LUFS), measured with ebur128
  sections: [
    { until: 78.5, lufs: -18.3 },
    { until: 104, lufs: -15.0 },
    { until: 120, lufs: -16.4 },
    { until: 999, lufs: -13.1 },
  ],
  under: -25, // LUFS under narration
  lift: 6, // dB up in gaps of a second or more, on the logo and on the end card
};
export const MUSIC_OFFSET = MUSIC.trackEnd - TOTAL_FRAMES / FPS;

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

/** Linear gain for the music bed at composition time t. */
export const musicGain = (t: number): number => {
  const tau = MUSIC_OFFSET + t;
  // section loudness, crossfaded over 1.5 s around each boundary
  let lufs = MUSIC.sections[0].lufs;
  for (let i = 1; i < MUSIC.sections.length; i++) {
    const edge = MUSIC.sections[i - 1].until;
    lufs += (MUSIC.sections[i].lufs - MUSIC.sections[i - 1].lufs) * smooth((tau - edge + 0.75) / 1.5);
  }
  // 0 while someone is speaking, 1 in the clear
  let up = 1;
  for (const [a, b] of SPEECH_SPANS) {
    let u = 1;
    if (t >= a - 0.35 && t < a) u = 1 - smooth((t - (a - 0.35)) / 0.35);
    else if (t >= a && t <= b + 0.1) u = 0;
    else if (t > b + 0.1 && t < b + 0.75) u = smooth((t - b - 0.1) / 0.65);
    up = Math.min(up, u);
  }
  const db = MUSIC.under - lufs + MUSIC.lift * up;
  const fadeIn = smooth(t / 1.0);
  const fadeOut = smooth((TOTAL - t) / 0.5);
  return Math.pow(10, db / 20) * fadeIn * fadeOut;
};
