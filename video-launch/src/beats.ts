import grid from "./data/grid.json";
import { FPS } from "./theme";

/**
 * Beat grid of the music edit (public/audio/music.wav, built by scripts/build-audio.mjs).
 * "What About Action?" is 121.0 bpm. Video beat 0 is track beat 16; the drop (track beat 32)
 * is video beat 16. Every cut, text hit and click in the edit is placed on this grid.
 */
export const P = grid.period;
export const LEAD = grid.lead;

/** Seconds at which video beat `b` sounds. */
export const T = (b: number) => LEAD + b * P;
/** Nearest frame to video beat `b`. */
export const F = (b: number) => Math.round(T(b) * FPS);
/** Time of that frame: what the picture uses, so a hit and a cut on the same beat share a frame. */
export const TQ = (b: number) => F(b) / FPS;

export const END_BEAT = grid.endVideoBeat;
export const TOTAL_SECONDS = T(END_BEAT) + grid.tail;
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS);

/** Scene boundaries, in beats (4 beats to the bar). */
export const S = {
  cold: 0,
  logo: 16, // the drop
  landing: 24,
  welcome: 32,
  home: 36,
  photos: 48,
  voice: 80, // breakdown: the music goes quiet
  posts: 112, // second drop
  buffer: 128,
  stack: 136,
  end: 144, // outro
  fin: END_BEAT,
};
