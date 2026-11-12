import { F, P, S, T } from "./beats";
import { FPS } from "./theme";
import landingCursor from "./data/landing.cursor.json";
import homeCursor from "./data/home.cursor.json";
import photosCursor from "./data/photos.cursor.json";
import voiceCursor from "./data/voice.cursor.json";

/**
 * The picture edit for every browser scene: which part of which recording plays when
 * (speed follows from the beats it has to fill), where the camera looks, and where the clicks land.
 *
 * Source times are seconds in the recording. Positions are CSS px of its 1440x900 viewport.
 * Click times come from <clip>.events.json; cursor positions come from src/data/<clip>.cursor.json,
 * a per-frame track of the drawn cursor (the logged move durations are shorter than the real glides).
 */

export type Clip = "landing" | "home" | "photos" | "voice";
export const VW = 1440;
export const VH = 900;

const CURSOR: Record<Clip, number[][]> = {
  landing: landingCursor,
  home: homeCursor,
  photos: photosCursor,
  voice: voiceCursor,
};

/** Source range a..b of a recording, shown until beat `to`. `still` holds a freeze frame instead. */
export type Seg = { clip: Clip; a: number; b: number; to: number; still?: string; xf?: number };
/**
 * Camera keyframe: from beat `at`, aim for zoom `z`, centered on (x, y) blended toward the cursor by `follow`
 * (no x/y means follow the cursor). The camera eases there on a critically damped spring of stiffness `w`.
 */
export type Kf = { at: number; z: number; x?: number; y?: number; follow?: number; snap?: boolean; w?: number };
export type Click = { at: number; x: number; y: number };
export type SceneDef = { id: string; from: number; to: number; segs: Seg[]; cam: Kf[]; clicks: Click[] };

const LEAD_IN = 0.62 / P; // beats before a click at which the zoom-in starts (0.62 s)

export const LANDING: SceneDef = {
  id: "landing",
  from: S.landing,
  to: S.welcome,
  segs: [
    { clip: "landing", a: 9.19, b: 12.165, to: S.landing + 6 }, // glide to the button, click on beat 30
    { clip: "landing", a: 12.165, b: 13.16, to: S.welcome },
  ],
  cam: [
    { at: S.landing, z: 1, x: 720, y: 450, snap: true },
    { at: S.landing + 1, z: 1.22, x: 660, y: 410, follow: 0.45, w: 4 },
    { at: S.landing + 6 - LEAD_IN - 0.4, z: 2.0, x: 300, y: 500, follow: 0.2, w: 7.5 },
  ],
  clicks: [{ at: S.landing + 6, x: 251.4, y: 450 }],
};

export const HOME: SceneDef = {
  id: "home",
  from: S.home,
  to: S.photos,
  segs: [
    { clip: "home", a: 6.6, b: 9.0, to: S.home + 4 }, // scroll down to "Your week in Buffer"
    { clip: "home", a: 9.0, b: 10.0, to: S.home + 6 },
    { clip: "home", a: 17.0, b: 18.4, to: S.home + 8, xf: 4 }, // scroll back up
    { clip: "home", a: 19.13, b: 20.618, to: S.home + 11 }, // click "Drop this week's photos" on beat 47
    { clip: "home", a: 20.618, b: 21.1, to: S.photos }, // cut before the recording navigates away
  ],
  cam: [
    { at: S.home, z: 1.3, x: 720, y: 330, snap: true },
    { at: S.home + 1.3, z: 1.8, x: 720, y: 392, follow: 0.08, w: 6 }, // the 7-day queue strip
    { at: S.home + 6, z: 1.35, x: 720, y: 400, w: 6 },
    { at: S.home + 11 - LEAD_IN - 0.5, z: 1.8, x: 600, y: 390, follow: 0.1, w: 7.5 },
  ],
  clicks: [{ at: S.home + 11, x: 596.7, y: 396.5 }],
};

const PH = S.photos;
export const PHOTOS: SceneDef = {
  id: "photos",
  from: PH,
  to: S.voice,
  segs: [
    { clip: "photos", a: 2.26, b: 3.252, to: PH + 2 }, // click "Choose photos" on beat 50
    { clip: "photos", a: 3.252, b: 4.4, to: PH + 4 }, // 7 photos appear
    { clip: "photos", a: 6.1, b: 8.251, to: PH + 6 }, // click "Find my moments" on beat 54
    { clip: "photos", a: 8.251, b: 15.9, to: PH + 9 }, // uploading, fast
    { clip: "photos", a: 15.9, b: 21.83, to: PH + 16 }, // the spotlight sweep; "found" lands on beat 64
    { clip: "photos", a: 21.83, b: 23.9, to: PH + 19 },
    { clip: "photos", a: 23.9, b: 26.209, to: PH + 23 }, // rescue a skipped photo on beat 71
    { clip: "photos", a: 26.209, b: 27.85, to: PH + 26 },
    { clip: "photos", a: 27.85, b: 30.052, to: PH + 30 }, // click "Add 1 and answer my moments" on beat 78
    { clip: "photos", a: 30.052, b: 30.7, to: S.voice },
  ],
  cam: [
    { at: PH, z: 1.35, x: 720, y: 330, snap: true },
    { at: PH + 2 - LEAD_IN - 0.5, z: 1.75, x: 720, y: 334, w: 7 },
    { at: PH + 3, z: 1.5, x: 720, y: 385, w: 5 },
    { at: PH + 6 - LEAD_IN, z: 1.95, x: 720, y: 520, w: 7.5 },
    { at: PH + 7, z: 1.5, x: 720, y: 390, w: 5 },
    { at: PH + 9, z: 1.85, x: 720, y: 372, w: 4.5 }, // push in on the sweep
    { at: PH + 16, z: 1.62, x: 720, y: 452, w: 6 }, // picks + the result card
    { at: PH + 23 - LEAD_IN - 0.3, z: 2.1, x: 565, y: 335, follow: 0.1, w: 7.5 },
    { at: PH + 25.6, z: 1.62, x: 720, y: 452, follow: 0.1, w: 5 },
    { at: PH + 30 - LEAD_IN, z: 1.9, x: 720, y: 545, follow: 0.1, w: 7.5 },
  ],
  clicks: [
    { at: PH + 2, x: 720, y: 334.5 },
    { at: PH + 6, x: 720, y: 548.9 },
    { at: PH + 23, x: 435.2, y: 293.7 },
    { at: PH + 30, x: 720, y: 651.3 },
  ],
};

const VO = S.voice;
export const VOICE: SceneDef = {
  id: "voice",
  from: VO,
  to: S.posts,
  segs: [
    { clip: "voice", a: 1.9, b: 3.893, to: VO + 4 }, // tap the mic on beat 84
    { clip: "voice", a: 3.893, b: 7.86, to: VO + 12 }, // listening, real time (the owner's answer plays)
    { clip: "voice", a: 16.07, b: 17.056, to: VO + 14, xf: 4 }, // tap stop on beat 94
    { clip: "voice", a: 17.056, b: 21.7, to: VO + 16 }, // "Writing down what you said", fast
    { clip: "voice", a: 23.6, b: 23.6, to: VO + 24, still: "voice_transcript" }, // transcript on beat 96
    { clip: "voice", a: 23.62, b: 25.99, to: VO + 28 }, // click "Make my posts" on beat 108
    { clip: "voice", a: 25.99, b: 31.72, to: S.posts }, // fitting, fast; cut just before the posts start to fade in, so they land on the drop
  ],
  cam: [
    { at: VO, z: 1.45, x: 720, y: 520, snap: true },
    { at: VO + 0.6, z: 1.7, x: 720, y: 560, w: 5 },
    { at: VO + 4 - LEAD_IN - 0.3, z: 1.92, x: 720, y: 585, w: 7 },
    { at: VO + 16, z: 1.85, x: 720, y: 330, snap: true },
    { at: VO + 16.02, z: 2.08, x: 720, y: 330, w: 1.6 }, // slow push in on the transcript
    { at: VO + 24, z: 1.6, x: 720, y: 400, follow: 0.3, w: 5 },
    { at: VO + 28 - LEAD_IN - 0.2, z: 2.0, x: 610, y: 420, follow: 0.1, w: 7.5 },
    { at: VO + 29, z: 1.75, x: 720, y: 390, w: 3 },
  ],
  clicks: [
    { at: VO + 4, x: 720, y: 631.3 },
    { at: VO + 14, x: 720, y: 631.3 },
    { at: VO + 28, x: 450.4, y: 449.8 },
  ],
};

const PO = S.posts;
export const POSTS: SceneDef = {
  id: "posts",
  from: PO,
  to: S.buffer,
  segs: [
    { clip: "voice", a: 32.27, b: 36.0, to: PO + 8 }, // per-channel posts, then the scroll to the send buttons
    { clip: "voice", a: 39.4, b: 40.886, to: PO + 10, xf: 3 }, // click "Save as drafts in Buffer" on beat 122
    { clip: "voice", a: 40.886, b: 44.18, to: PO + 12 }, // sending, fast
    // "Saved as drafts in Buffer." on beat 124. The recording jumps around for half a second here, so hold its settled last frame.
    { clip: "voice", a: 44.74, b: 44.74, to: S.buffer, still: "voice_saved" },
  ],
  cam: [
    { at: PO, z: 1.72, x: 720, y: 432, snap: true },
    { at: PO + 0.1, z: 1.8, x: 760, y: 432, w: 2 },
    { at: PO + 2.6, z: 1.8, x: 740, y: 300, w: 3.4 }, // ride the scroll down to the buttons
    { at: PO + 8, z: 1.75, x: 660, y: 330, snap: true },
    { at: PO + 8.05, z: 2.0, x: 625, y: 420, follow: 0.1, w: 8 },
    { at: PO + 12, z: 1.62, x: 720, y: 470, snap: true }, // the confirmation panel
    { at: PO + 12.02, z: 1.86, x: 720, y: 480, w: 2 },
  ],
  clicks: [{ at: PO + 10, x: 477.4, y: 449.8 }],
};

export const SCENES = [LANDING, HOME, PHOTOS, VOICE, POSTS];

/* ------------------------------------------------------------------ */
/* Placement: beats to frames, and the camera path                     */
/* ------------------------------------------------------------------ */

export type PlacedSeg = Seg & { from: number; frames: number; rate: number; trim: number };
export type Cam = { x: number; y: number; z: number };
export type Placed = { def: SceneDef; f0: number; f1: number; segs: PlacedSeg[]; cam: Cam[] };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const clampCenter = (x: number, y: number, z: number): [number, number] => [
  clamp(x, VW / 2 / z, VW - VW / 2 / z),
  clamp(y, VH / 2 / z, VH - VH / 2 / z),
];

const place = (def: SceneDef): Placed => {
  const f0 = F(def.from);
  const f1 = F(def.to);
  let f = f0;
  const segs: PlacedSeg[] = def.segs.map((s) => {
    const end = F(s.to);
    const frames = end - f;
    if (frames <= 0) throw new Error(`${def.id}: segment at ${s.a} has no time`);
    const trim = Math.round(s.a * FPS);
    const placed = { ...s, from: f, frames, trim, rate: s.still ? 0 : (s.b - trim / FPS) / (frames / FPS) };
    f = end;
    return placed;
  });
  if (f !== f1) throw new Error(`${def.id}: segments end at frame ${f}, scene ends at ${f1}`);

  const srcAt = (frame: number) => {
    const s = segs.find((x) => frame >= x.from && frame < x.from + x.frames) ?? segs[segs.length - 1];
    return { clip: s.clip, t: s.trim / FPS + ((frame - s.from) / FPS) * s.rate };
  };
  const cursorAt = (frame: number) => {
    const { clip, t } = srcAt(frame);
    const track = CURSOR[clip];
    const p = track[clamp(Math.round(t * FPS), 0, track.length - 1)];
    return { x: p[0], y: p[1] };
  };

  // Spring-smoothed camera, simulated once at 4 substeps per frame.
  const kfs = def.cam.map((k) => ({ ...k, t: T(k.at) }));
  const SUB = 4;
  const dt = 1 / FPS / SUB;
  const EASE_IN = 0.1; // seconds
  const st = { x: 720, y: 450, lz: 0, vx: 0, vy: 0, vz: 0 };
  const aim = { x: 720, y: 450, lz: 0 };
  let last = -1;
  const cam: Cam[] = [];
  for (let frame = f0; frame < f1; frame++) {
    for (let sub = 0; sub < SUB; sub++) {
      const t = (frame + (sub + 1) / SUB - 1) / FPS;
      let ki = 0;
      for (let i = 0; i < kfs.length; i++) if (kfs[i].t <= t + 1e-6 || i === 0) ki = i;
      const k = kfs[ki];
      const cur = cursorAt(frame);
      const fol = k.x === undefined ? 1 : (k.follow ?? 0);
      const [tx, ty] = clampCenter((k.x ?? cur.x) * (1 - fol) + cur.x * fol, (k.y ?? cur.y) * (1 - fol) + cur.y * fol, k.z);
      const tz = Math.log(k.z);
      if (ki !== last && (k.snap || last === -1)) {
        Object.assign(st, { x: tx, y: ty, lz: tz, vx: 0, vy: 0, vz: 0 });
        Object.assign(aim, { x: tx, y: ty, lz: tz });
      } else {
        // the aim point itself glides to each new target, so every move eases in as well as out
        const g = 1 - Math.exp(-dt / EASE_IN);
        aim.x += (tx - aim.x) * g;
        aim.y += (ty - aim.y) * g;
        aim.lz += (tz - aim.lz) * g;
        const w = k.w ?? 6;
        st.vx += (-2 * w * st.vx - w * w * (st.x - aim.x)) * dt;
        st.vy += (-2 * w * st.vy - w * w * (st.y - aim.y)) * dt;
        st.vz += (-2 * w * st.vz - w * w * (st.lz - aim.lz)) * dt;
        st.x += st.vx * dt;
        st.y += st.vy * dt;
        st.lz += st.vz * dt;
      }
      last = ki;
    }
    const z = Math.exp(st.lz);
    const [x, y] = clampCenter(st.x, st.y, z);
    cam.push({ x, y, z });
  }
  return { def, f0, f1, segs, cam };
};

export const PLACED: Record<string, Placed> = Object.fromEntries(SCENES.map((d) => [d.id, place(d)]));
