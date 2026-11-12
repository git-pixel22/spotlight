import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { F, S, TQ } from "../beats";
import { C, fontFamily, headline, inCubic, outBack, outExpo, tw } from "../theme";
import { useT } from "../ui/base";
import { Lines } from "../ui/Kinetic";

const TIERS = [
  { name: "Gemini", role: "Sees photos, fits words" },
  { name: "Groq Whisper", role: "Hears your answer" },
  { name: "Vercel + Neon", role: "Photos and data" },
  { name: "Buffer API", role: "Publishing" },
];
const CHAIN = ["Gemini Flash", "Flash-Lite", "Gemma", "Qwen on Groq"];

/** Where the end card's logo disc sits; the sun iris that closes this scene grows from here. */
export const END_DISC = { x: 585, y: 318 };

/** Scene 11 (beats 136 to 144): the $0 stack. A card every half beat, then the fallback chain lights beat by beat. */
export const Stack: React.FC = () => {
  const start = F(S.stack);
  const t = useT(start);
  const B = S.stack;
  const iris = tw(t, TQ(S.end) - 0.26, TQ(S.end), 0, 1, inCubic);
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <div style={{ position: "absolute", left: 130, top: 150 }}>
        <Lines start={start} at={B} size={132} lines={[["Built on a ", { t: "$0", hl: true }, " stack."]]} />
      </div>
      <div style={{ position: "absolute", left: 130, top: 408, display: "flex", gap: 24 }}>
        {TIERS.map((x, i) => {
          const at = TQ(B + 1 + i * 0.5);
          const a = tw(t + 1 / 30, at, at + 0.4, 0, 1, outBack);
          return (
            <div
              key={x.name}
              style={{
                width: 397,
                height: 262,
                background: C.white,
                border: `2px solid ${C.line}`,
                borderRadius: 30,
                padding: "30px 32px",
                boxSizing: "border-box",
                opacity: interpolate(a, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
                translate: `0px ${interpolate(a, [0, 1], [40, 0])}px`,
                scale: interpolate(a, [0, 1], [0.94, 1]),
              }}
            >
              <div style={{ display: "inline-block", background: C.sun, borderRadius: 999, padding: "4px 20px 8px", fontFamily, fontWeight: 800, fontSize: 36, letterSpacing: "-0.02em", color: C.ink }}>
                $0/mo
              </div>
              <div style={{ ...headline, fontSize: 50, marginTop: 26 }}>{x.name}</div>
              <div style={{ fontFamily, fontSize: 30, fontWeight: 500, color: C.muted, marginTop: 12 }}>{x.role}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 130, top: 748 }}>
        <div
          style={{
            fontFamily,
            fontSize: 36,
            fontWeight: 600,
            color: C.muted,
            marginBottom: 24,
            opacity: tw(t, TQ(B + 3.5), TQ(B + 3.5) + 0.3),
          }}
        >
          A backup model for every step
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {CHAIN.map((c, i) => {
            const show = tw(t, TQ(B + 3.5) + i * 0.04, TQ(B + 3.5) + 0.35 + i * 0.04);
            const lit = tw(t + 1 / 30, TQ(B + 4 + i), TQ(B + 4 + i) + 0.22, 0, 1, outExpo);
            return (
              <React.Fragment key={c}>
                {i > 0 ? (
                  <svg width={56} height={24} viewBox="0 0 56 24" style={{ opacity: show * (0.25 + 0.75 * lit) }}>
                    <path d="M2 12h48M40 3l10 9-10 9" fill="none" stroke={C.ink} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
                <div
                  style={{
                    fontFamily,
                    fontSize: 42,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: C.ink,
                    background: lit > 0.3 ? C.sun : C.white,
                    border: `2.5px solid ${lit > 0.3 ? C.sun : C.line}`,
                    borderRadius: 999,
                    padding: "16px 36px 21px",
                    opacity: show,
                    scale: 1 + 0.06 * Math.sin(Math.PI * lit) + 0.03 * lit,
                  }}
                >
                  {c}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {iris > 0 ? (
        <div
          style={{
            position: "absolute",
            left: END_DISC.x - 40,
            top: END_DISC.y - 40,
            width: 80,
            height: 80,
            borderRadius: 40,
            background: C.sun,
            scale: interpolate(iris, [0, 1], [0, 41]),
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
