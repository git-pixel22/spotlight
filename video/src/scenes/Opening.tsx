import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { C, fontFamily, headline, inOut, tw } from "../theme";
import { T_LOGO, voTime } from "../timeline";
import { Caption, Check, Spot, useT } from "../ui/base";

// 6 x 4 camera roll. The three photos the spotlight picks become scene 2's owners.
const ROLL = [
  "market", "bakery-donuts", "plants", "threads", "owner-cafe", "bakery-brownies",
  "candles", "pottery-hands", "bike-workshop", "flowers-vase", "bakery-cookie-box", "yoga-class",
  "bakery-display-case", "sewing", "pottery-wheel", "barber", "florist", "tattoo",
  "owner-potter", "bakery-muffins", "bakery-croissants", "bakery-display-trays", "bakery-cookies-assorted", "market",
];
const TILE = 308;
const GAP = 12;
const LEFT = 6;
const TOP = -94;
const rect = (i: number) => ({
  x: LEFT + (i % 6) * (TILE + GAP),
  y: TOP + Math.floor(i / 6) * (TILE + GAP),
});
const center = (i: number) => ({ x: rect(i).x + TILE / 2, y: rect(i).y + TILE / 2 });

const PICKS = [
  { i: 7, label: "The potter", lit: 3.75, said: voTime("vo2.wav", 0.25) },
  { i: 15, label: "The barber", lit: 4.75, said: voTime("vo2.wav", 1.2) },
  { i: 10, label: "The home baker", lit: 5.75, said: voTime("vo2.wav", 2.1) },
];
const CARD = { w: 430, h: 580, gap: 56, top: 132 };
const cardX = (k: number) => (1920 - (3 * CARD.w + 2 * CARD.gap)) / 2 + k * (CARD.w + CARD.gap);

const DIM_AT = 2.5;
const MORPH = 6.45;
const NO_TIME = voTime("vo2.wav", 4.9);

export const Opening: React.FC = () => {
  const t = useT();
  if (t > T_LOGO + 1.2) return null;

  const dim = tw(t, DIM_AT, DIM_AT + 0.9, 0, 0.8, inOut);
  const p = [center(PICKS[0].i), center(PICKS[1].i), center(PICKS[2].i)];
  const keys = [2.7, 3.7, 4.7, 5.7];
  const sx = interpolate(t, keys, [-260, p[0].x, p[1].x, p[2].x], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: inOut });
  const sy = interpolate(t, keys, [620, p[0].y, p[1].y, p[2].y], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: inOut });
  const morph = tw(t, MORPH, MORPH + 1.0, 0, 1, inOut);
  const rollScale = interpolate(t, [0, MORPH + 1], [1.05, 1.0]);
  const dark = tw(t, NO_TIME, NO_TIME + 0.9, 0, 1, inOut);

  return (
    <AbsoluteFill style={{ background: C.mist }}>
      {/* camera roll */}
      <AbsoluteFill style={{ opacity: 1 - morph, scale: String(rollScale) }}>
        {ROLL.map((name, i) => (
          <Img
            key={i}
            src={staticFile(`photos/${name}.jpg`)}
            style={{
              position: "absolute",
              left: rect(i).x,
              top: rect(i).y,
              width: TILE,
              height: TILE,
              objectFit: "cover",
              borderRadius: 14,
              opacity: tw(t, 0.05 + (i % 6) * 0.03 + Math.floor(i / 6) * 0.05, 0.6 + (i % 6) * 0.03 + Math.floor(i / 6) * 0.05),
            }}
          />
        ))}
        <Spot x={sx} y={sy} rx={330} dim={dim} warm={0.2} soft={0.5} />
      </AbsoluteFill>

      {/* the three picked photos: lit in the roll, then they become the owner cards */}
      {PICKS.map((pk, k) => {
        const lit = tw(t, pk.lit, pk.lit + 0.45);
        if (lit <= 0) return null;
        const r = rect(pk.i);
        const x = interpolate(morph, [0, 1], [r.x, cardX(k)]);
        const y = interpolate(morph, [0, 1], [r.y, CARD.top]);
        const w = interpolate(morph, [0, 1], [TILE, CARD.w]);
        const h = interpolate(morph, [0, 1], [TILE, CARD.h]);
        const pop = 1 + 0.035 * tw(t, pk.said, pk.said + 0.5) * (1 - tw(t, pk.said + 0.7, pk.said + 1.3, 0, 1, inOut));
        const labelIn = tw(t, pk.said, pk.said + 0.5);
        const stamp = tw(t, NO_TIME + 0.35 + k * 0.28, NO_TIME + 0.8 + k * 0.28);
        return (
          <React.Fragment key={k}>
            <div
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: w,
                height: h,
                borderRadius: interpolate(morph, [0, 1], [14, 30]),
                overflow: "hidden",
                opacity: lit,
                scale: String((1 + 0.03 * lit * (1 - morph)) * pop),
                boxShadow: `0 0 0 ${6 * (1 - morph) * lit}px ${C.sun}, 0 ${30 * morph}px ${70 * morph}px rgba(20,33,31,${0.16 * morph})`,
              }}
            >
              <Img
                src={staticFile(`photos/${ROLL[pk.i]}.jpg`)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  scale: String(interpolate(t, [MORPH, T_LOGO + 1], [1.0, 1.08], { extrapolateLeft: "clamp" })),
                  filter: `grayscale(${dark * 0.9}) brightness(${1 - dark * 0.45})`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: stamp,
                  scale: String(interpolate(stamp, [0, 1], [1.12, 1])),
                }}
              >
                <div
                  style={{
                    fontFamily,
                    fontWeight: 700,
                    fontSize: 34,
                    color: C.white,
                    border: `3px solid ${C.white}`,
                    borderRadius: 999,
                    padding: "12px 30px 15px",
                    rotate: "-5deg",
                    background: "rgba(20,33,31,0.35)",
                  }}
                >
                  Never posted
                </div>
              </div>
            </div>
            {/* check badge while in the roll */}
            <div
              style={{
                position: "absolute",
                left: r.x + TILE - 58,
                top: r.y + 16,
                opacity: lit * (1 - tw(t, MORPH, MORPH + 0.3)),
                scale: String(interpolate(lit, [0, 1], [0.5, 1])),
              }}
            >
              <Check size={44} />
            </div>
            <div
              style={{
                position: "absolute",
                left: cardX(k),
                top: CARD.top + CARD.h + 30,
                width: CARD.w,
                textAlign: "center",
                ...headline,
                fontSize: 50,
                opacity: labelIn,
                translate: `0px ${interpolate(labelIn, [0, 1], [16, 0])}px`,
              }}
            >
              {pk.label}
            </div>
          </React.Fragment>
        );
      })}

      <Caption from={0} to={T_LOGO + 0.6} variant="pill" style={{ bottom: 70 }} />
    </AbsoluteFill>
  );
};
