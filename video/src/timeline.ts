import { FPS } from "./theme";

/**
 * Single source of truth for the edit. All times are seconds.
 * Phone footage is cut into segments (source range + speed); everything
 * else (narration, captions, overlays) is placed relative to those cuts
 * with at(clip, sourceTime), so retiming a segment keeps the sync.
 */

export type Clip = "welcome" | "photos" | "voice";
export type Seg = { clip: Clip; a: number; b: number; rate: number };

// Opening, logo and landing run on fixed times.
export const T_LOGO = 15.0; // yellow iris starts closing over the opening
export const T_LANDING = 21.0;
export const T_PRODUCT = 24.3; // phone layout starts appearing
const PHONE_START = 24.7; // first phone footage frame

const SEGS: Seg[] = [
  // Scene 4, welcome.mp4: loading (sped up), profile card, scroll to channels
  { clip: "welcome", a: 8.5, b: 13.3, rate: 2 },
  { clip: "welcome", a: 13.3, b: 17.3, rate: 1 },
  { clip: "welcome", a: 17.3, b: 21.3, rate: 2 },
  // Scene 5, photos.mp4: drop, upload, sweep, reveal + rescue
  { clip: "photos", a: 1.6, b: 4.6, rate: 1 },
  { clip: "photos", a: 4.6, b: 14, rate: 6 },
  { clip: "photos", a: 14, b: 39.3, rate: 7 },
  { clip: "photos", a: 39.3, b: 44.8, rate: 1 },
  // Scene 6, voice.mp4: question, mic, listening (1x, synced to answer.wav), transcript
  { clip: "voice", a: 0.1, b: 1.6, rate: 0.34 },
  { clip: "voice", a: 1.6, b: 2.0, rate: 1 },
  { clip: "voice", a: 2.0, b: 2.7, rate: 0.26 },
  { clip: "voice", a: 2.7, b: 14.5, rate: 1 },
  { clip: "voice", a: 17.0, b: 20.9, rate: 4 },
  { clip: "voice", a: 20.9, b: 23.0, rate: 1 },
  // Scene 7: fitting (sped up), per-channel posts
  { clip: "voice", a: 23.0, b: 28.8, rate: 4 },
  { clip: "voice", a: 28.8, b: 31.3, rate: 1 },
  { clip: "voice", a: 31.3, b: 33.7, rate: 0.37 },
  // Scene 8: send options, sending (sped up), confirmation
  { clip: "voice", a: 33.7, b: 34.85, rate: 0.45 },
  { clip: "voice", a: 34.85, b: 38.8, rate: 3.5 },
  { clip: "voice", a: 38.8, b: 42.6, rate: 1 },
];

export type PlacedSeg = Seg & { from: number; frames: number; start: number; end: number };

export const SEGMENTS: PlacedSeg[] = (() => {
  let f = Math.round(PHONE_START * FPS);
  return SEGS.map((s) => {
    const frames = Math.round(((s.b - s.a) / s.rate) * FPS);
    const placed = { ...s, from: f, frames, start: f / FPS, end: (f + frames) / FPS };
    f += frames;
    return placed;
  });
})();

/** Composition time at which a source time of a clip is on screen. */
export const at = (clip: Clip, src: number): number => {
  const s = SEGMENTS.find((x) => x.clip === clip && src >= x.a && src <= x.b);
  if (!s) throw new Error(`No segment shows ${clip} @ ${src}`);
  return s.start + (src - s.a) / s.rate;
};

const segStart = (clip: Clip, a: number) => SEGMENTS.find((s) => s.clip === clip && s.a === a)!.start;

// Scene boundaries inside the product section
export const S4 = T_PRODUCT;
export const S5 = segStart("photos", 1.6);
export const S6 = segStart("voice", 0.1);
export const S7 = segStart("voice", 23.0);
export const S8 = segStart("voice", 33.7);
export const T_PRODUCT_END = SEGMENTS[SEGMENTS.length - 1].end;

// Scene 8b: the Buffer drafts clip (placeholder until the real one exists)
export const BUFFER_CLIP = "buffer-clip.mp4"; // drop this file into public/ to replace the placeholder
export const BUFFER_CLIP_SECONDS = 6;
export const T_BUFFER = T_PRODUCT_END - 0.3;
export const T_STACK = T_BUFFER + BUFFER_CLIP_SECONDS;
export const T_END = T_STACK + 5.7;
export const TOTAL = T_END + 6.8;
export const TOTAL_FRAMES = Math.ceil(TOTAL * FPS);

// Key synced moments
export const E = {
  profileCard: at("welcome", 13.5),
  photosIn: at("photos", 2.5),
  findTap: at("photos", 4.0),
  sweepStart: at("photos", 14),
  picked: at("photos", 39.55),
  rescue: at("photos", 42.8),
  scrollToMic: at("voice", 1.7),
  answer: at("voice", 2.9),
  writing: at("voice", 17.0),
  transcript: at("voice", 21.0),
  fitting: at("voice", 23.6),
  posts: at("voice", 29.0),
  sendTap: at("voice", 34.85),
  saved: at("voice", 38.9),
};

/** Narration. Each piece plays source range [s0, s1] of a file starting at `at`.
 *  Caption chunks are timed in source seconds (from pause detection). */
export type Chunk = { text: string; a: number; b: number };
export type Vo = { file: string; at: number; s0: number; s1: number; chunks: Chunk[]; owner?: boolean };

const vo6bAt = E.answer - 2.55;
const vo8aAt = S8 + 0.25;

export const VO: Vo[] = [
  {
    file: "vo1.wav", at: 0.7, s0: 0, s1: 4.76,
    chunks: [
      { text: "Every small business has a camera roll", a: 0.2, b: 2.2 },
      { text: "full of posts that never got posted.", a: 2.2, b: 4.7 },
    ],
  },
  {
    file: "vo2.wav", at: 7.3, s0: 0, s1: 7.44,
    chunks: [
      { text: "The potter, the barber, the home baker.", a: 0.15, b: 3.2 },
      { text: "They're living their content.", a: 3.3, b: 4.8 },
      { text: "They just don't have time to turn it into posts.", a: 4.85, b: 7.4 },
    ],
  },
  {
    file: "vo3.wav", at: 16.6, s0: 0, s1: 4.0,
    chunks: [
      { text: "Spotlight helps them notice it.", a: 0.15, b: 2.05 },
      { text: "It's built on the Buffer API.", a: 2.1, b: 4.0 },
    ],
  },
  { file: "vo4.wav", at: 22.2, s0: 0.1, s1: 1.2, chunks: [{ text: "Connect Buffer,", a: 0.2, b: 1.9 }] },
  {
    file: "vo4.wav", at: T_PRODUCT + 0.9, s0: 1.25, s1: 5.4,
    chunks: [
      { text: "and Spotlight reads your recent posts", a: 1.3, b: 3.25 },
      { text: "to learn what you do and how you write.", a: 3.25, b: 5.6 },
    ],
  },
  { file: "vo4.wav", at: E.profileCard + 3.1, s0: 5.55, s1: 6.64, chunks: [{ text: "No forms.", a: 5.6, b: 7.4 }] },
  { file: "vo5.wav", at: S5 + 0.5, s0: 0.1, s1: 1.66, chunks: [{ text: "Drop the week's photos.", a: 0.2, b: 2.6 }] },
  {
    file: "vo5.wav", at: E.sweepStart - 0.3, s0: 1.66, s1: 4.02,
    chunks: [{ text: "Spotlight picks the moments worth sharing,", a: 1.7, b: 4.3 }],
  },
  { file: "vo5.wav", at: E.picked + 0.15, s0: 4.05, s1: 5.3, chunks: [{ text: "and skips the rest.", a: 4.1, b: 5.9 }] },
  {
    file: "vo5.wav", at: E.rescue - 1.0, s0: 5.4, s1: 7.0,
    chunks: [{ text: "You can always bring one back.", a: 5.45, b: 7.6 }],
  },
  {
    file: "vo6.wav", at: S6 + 0.2, s0: 0.1, s1: 4.45,
    chunks: [
      { text: "For each moment, it asks one question", a: 0.2, b: 3.0 },
      { text: "only you can answer.", a: 3.0, b: 4.6 },
    ],
  },
  {
    file: "vo6.wav", at: vo6bAt, s0: 4.6, s1: 7.15,
    chunks: [{ text: "You answer out loud, in about ten seconds.", a: 4.65, b: 7.1 }],
  },
  {
    file: "answer.wav", at: E.answer, s0: 0, s1: 11.16, owner: true,
    chunks: [
      { text: "Um, so, matcha Oreo.", a: 0.05, b: 2.2 },
      { text: "Every single time.", a: 2.3, b: 3.55 },
      { text: "I almost didn't make it, like,", a: 3.55, b: 5.6 },
      { text: "I thought matcha was too niche, you know?", a: 5.6, b: 8.05 },
      { text: "And now people message me", a: 8.05, b: 9.1 },
      { text: "just to ask if it's in the box this week.", a: 9.1, b: 11.4 },
    ],
  },
  {
    file: "vo7.wav", at: S7 + 0.2, s0: 0, s1: 9.64,
    chunks: [
      { text: "Your answer becomes a post for every channel,", a: 0.15, b: 3.05 },
      { text: "in your own words.", a: 3.05, b: 4.4 },
      { text: "Filler goes, nothing gets invented,", a: 4.45, b: 7.0 },
      { text: "and that rule is enforced in code.", a: 7.05, b: 9.75 },
    ],
  },
  {
    file: "vo8.wav", at: vo8aAt, s0: 0.1, s1: 3.5,
    chunks: [
      { text: "Save them as drafts, add them to your queue,", a: 0.2, b: 2.6 },
      { text: "or pick a time.", a: 2.6, b: 3.7 },
    ],
  },
  {
    file: "vo8.wav", at: Math.max(E.saved + 0.25, vo8aAt + 3.7), s0: 3.6, s1: 5.28,
    chunks: [{ text: "They land straight in Buffer.", a: 3.7, b: 6.0 }],
  },
  {
    file: "vo9.wav", at: T_STACK + 0.3, s0: 0, s1: 3.9,
    chunks: [
      { text: "It all runs on free tiers,", a: 0, b: 1.8 },
      { text: "with a backup model for every step.", a: 1.85, b: 4.6 },
    ],
  },
  {
    file: "vo9.wav", at: T_END + 0.9, s0: 4.0, s1: 6.8,
    chunks: [
      { text: "Spotlight.", a: 4.1, b: 4.95 },
      { text: "You're already living your content.", a: 5.0, b: 7.3 },
    ],
  },
];

export type Cue = { text: string; from: number; to: number; owner: boolean };
export const CUES: Cue[] = VO.flatMap((v) =>
  v.chunks.map((c) => ({
    text: c.text,
    from: v.at + (c.a - v.s0),
    to: v.at + (c.b - v.s0),
    owner: !!v.owner,
  })),
);

/** Time of a spoken phrase, for syncing overlays to narration. */
export const voTime = (file: string, src: number) => {
  const v = VO.find((x) => x.file === file && src >= x.s0 - 0.01 && src <= x.s1 + 0.01)!;
  return v.at + (src - v.s0);
};
