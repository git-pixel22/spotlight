import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { S, TQ } from "../beats";
import { LOGO_DISC } from "../config";
import { C, inCubic, inOut, outBack, outExpo, tw } from "../theme";
import { Check, useT } from "../ui/base";
import { Lines } from "../ui/Kinetic";

const COLS = 7;
const CELL = 250;
const PITCH = 264;
const X0 = (1920 - (COLS * CELL + (COLS - 1) * (PITCH - CELL))) / 2;
const Y0 = (1080 - (4 * CELL + 3 * (PITCH - CELL))) / 2;

const PHOTOS = [
  "pottery-wheel", "bakery-cookie-box", "barber", "florist", "bike-workshop", "candles", "bakery-croissants",
  "market", "bakery-muffins", "owner-cafe", "threads", "plants", "tattoo", "pottery-hands",
  "sewing", "bakery-donuts", "yoga-class", "owner-potter", "bakery-display-case", "flowers-vase", "bakery-brownies",
  "bakery-cookies-assorted", "florist", "bakery-display-trays", "barber", "pottery-wheel", "market", "candles",
];
// The three the spotlight finds, one per kick (beats 11, 12, 13): [cell index, beat]
const LIT: [number, number][] = [
  [1, 11],
  [13, 12],
  [25, 13],
];

const cellPos = (i: number) => ({ x: X0 + (i % COLS) * PITCH, y: Y0 + Math.floor(i / COLS) * PITCH });

/** Scene 1 (beats 0 to 16): the camera roll nobody posts from. Ends as three spotlights merge into the logo's disc. */
export const ColdOpen: React.FC = () => {
  const t = useT();
  const push = tw(t, 0, TQ(14), 1.1, 1.03, (n) => n);
  const dim = t < TQ(8) - 0.05 ? 0.6 : tw(t, TQ(8) - 0.05, TQ(8) + 0.2, 0.6, 0.88);
  const gridOut = tw(t, TQ(14), TQ(14) + 0.5, 0, 1, inOut);
  const merge = tw(t, TQ(14) + 0.12, TQ(15.4), 0, 1, inOut);
  const burst = tw(t, TQ(16) - 0.24, TQ(16), 0, 1, inCubic);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ scale: push, opacity: 1 - gridOut }}>
        {PHOTOS.map((p, i) => {
          const { x, y } = cellPos(i);
          const delay = ((i % COLS) + Math.floor(i / COLS) * 1.5) * 0.022;
          const a = tw(t + 0.2, delay, delay + 0.5, 0, 1, outExpo); // already most of the way in on frame 0, so the poster frame is not empty
          return (
            <Img
              key={i}
              src={staticFile(`photos/${p}.jpg`)}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: CELL,
                height: CELL,
                objectFit: "cover",
                borderRadius: 26,
                opacity: a,
                scale: interpolate(a, [0, 1], [0.82, 1]),
              }}
            />
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.ink, opacity: dim }} />

      {/* the three moments worth sharing */}
      {LIT.map(([i, beat]) => {
        const lt = TQ(beat);
        if (t < lt - 0.001) return null;
        const { x, y } = cellPos(i);
        const cx = 960 + (x + CELL / 2 - 960) * push;
        const cy = 540 + (y + CELL / 2 - 540) * push;
        const pop = tw(t + 1 / 30, lt, lt + 0.4, 0, 1, outBack);
        const toDisc = tw(t, TQ(14), TQ(14) + 0.3, 0, 1, inOut);
        const size = interpolate(toDisc, [0, 1], [CELL * push * interpolate(pop, [0, 1], [1, 1.1]), LOGO_DISC.r * 2]);
        const px = interpolate(merge, [0, 1], [cx, LOGO_DISC.x]);
        const py = interpolate(merge, [0, 1], [cy, LOGO_DISC.y]);
        const glow = interpolate(pop, [0, 1], [0, 1]) * (1 - toDisc);
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: cx - 330,
                top: cy - 330,
                width: 660,
                height: 660,
                borderRadius: 330,
                background: `radial-gradient(circle, rgba(255,203,31,${0.5 * glow}) 0%, rgba(255,203,31,${0.16 * glow}) 45%, rgba(255,203,31,0) 70%)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: px - size / 2,
                top: py - size / 2,
                width: size,
                height: size,
                borderRadius: interpolate(toDisc, [0, 1], [28, size / 2]),
                overflow: "hidden",
                background: C.sun,
                boxShadow: `0 30px 60px rgba(0,0,0,${0.45 * (1 - toDisc)})`,
              }}
            >
              <Img src={staticFile(`photos/${PHOTOS[i]}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 1 - toDisc }} />
            </div>
            <div style={{ position: "absolute", left: cx + (CELL * push * 1.1) / 2 - 44, top: cy - (CELL * push * 1.1) / 2 - 12, scale: pop, opacity: 1 - toDisc }}>
              <Check size={56} />
            </div>
          </React.Fragment>
        );
      })}

      {/* the merged disc bursts into the drop */}
      {burst > 0 ? (
        <div
          style={{
            position: "absolute",
            left: LOGO_DISC.x - LOGO_DISC.r,
            top: LOGO_DISC.y - LOGO_DISC.r,
            width: LOGO_DISC.r * 2,
            height: LOGO_DISC.r * 2,
            borderRadius: LOGO_DISC.r,
            background: C.sun,
            scale: interpolate(burst, [0, 1], [1, 36]),
          }}
        />
      ) : null}

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute" }}>
          <Lines start={0} at={S.cold} out={8} size={150} color={C.white} align="center" stagger={0.1} lines={[["Your week is"], ["full of ", { t: "posts.", hl: true }]]} />
        </div>
        <div style={{ position: "absolute" }}>
          <Lines start={0} at={8} out={14} size={150} color={C.white} align="center" stagger={0.1} lines={[["You just never"], ["post them."]]} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
