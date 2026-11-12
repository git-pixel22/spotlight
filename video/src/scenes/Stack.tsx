import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, fontFamily, headline, inOut, tw } from "../theme";
import { T_END, T_STACK, voTime } from "../timeline";
import { Caption, Wordmark, useT } from "../ui/base";

const TIERS = [
  { name: "Gemini", role: "Sees photos, fits words", fact: "Free tier, three backups behind it" },
  { name: "Groq Whisper", role: "Hears your answer", fact: "2,000 voice notes a day" },
  { name: "Vercel + Neon", role: "Photos and data", fact: "1 GB photos, 1 GB database" },
  { name: "Buffer API", role: "Publishing", fact: "Free on every plan" },
];
const CHAIN = ["Gemini Flash", "Flash-Lite", "Gemma", "Qwen on Groq"];

export const Stack: React.FC = () => {
  const t = useT();
  const end = T_END + 0.8;
  if (t < T_STACK || t > end) return null;
  const s = T_STACK;
  const head = tw(t, s + 0.25, s + 0.85);
  const chainAt = voTime("vo9.wav", 1.9);
  const chain = tw(t, chainAt - 0.2, chainAt + 0.4);
  return (
    <AbsoluteFill style={{ background: C.mist, opacity: tw(t, s, s + 0.5) }}>
      <div style={{ position: "absolute", left: 130, top: 70 }}>
        <Wordmark size={36} />
      </div>
      <div style={{ position: "absolute", left: 130, top: 168, ...headline, fontSize: 120, opacity: head, translate: `0px ${interpolate(head, [0, 1], [20, 0])}px` }}>
        The $0 stack
      </div>
      <div style={{ position: "absolute", left: 130, top: 348, display: "flex", gap: 24 }}>
        {TIERS.map((x, i) => {
          const a = tw(t, s + 0.6 + i * 0.14, s + 1.2 + i * 0.14);
          return (
            <div
              key={x.name}
              style={{
                width: 397,
                height: 296,
                background: C.white,
                border: `2px solid ${C.line}`,
                borderRadius: 28,
                padding: "26px 30px",
                position: "relative",
                opacity: a,
                translate: `0px ${interpolate(a, [0, 1], [26, 0])}px`,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: C.sun,
                  border: `2.5px solid ${C.ink}`,
                  borderRadius: 999,
                  padding: "2px 16px 5px",
                  fontFamily,
                  fontWeight: 800,
                  fontSize: 30,
                  color: C.ink,
                }}
              >
                $0
              </div>
              <div style={{ ...headline, fontSize: 46, marginTop: 18 }}>{x.name}</div>
              <div style={{ fontFamily, fontSize: 28, fontWeight: 500, color: C.muted, marginTop: 12 }}>{x.role}</div>
              <div style={{ fontFamily, fontSize: 30, fontWeight: 700, color: C.ink, letterSpacing: "-0.015em", lineHeight: 1.2, marginTop: 22 }}>{x.fact}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 130, top: 700, opacity: chain, translate: `0px ${interpolate(chain, [0, 1], [20, 0])}px` }}>
        <div style={{ fontFamily, fontSize: 30, fontWeight: 600, color: C.muted, marginBottom: 20 }}>
          A backup model for every step. If one is busy, the next one answers.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {CHAIN.map((c, i) => {
            const litAt = chainAt + 0.25 + i * 0.42;
            const lit = tw(t, litAt, litAt + 0.3, 0, 1, inOut);
            return (
              <React.Fragment key={c}>
                {i > 0 ? (
                  <svg width={56} height={24} viewBox="0 0 56 24" style={{ opacity: 0.25 + 0.75 * lit }}>
                    <path d="M2 12h48M40 3l10 9-10 9" fill="none" stroke={C.ink} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
                <div
                  style={{
                    fontFamily,
                    fontSize: 38,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: C.ink,
                    background: lit > 0.5 ? C.sun : C.white,
                    border: `2.5px solid ${lit > 0.5 ? C.ink : C.line}`,
                    borderRadius: 999,
                    padding: "16px 34px 20px",
                    scale: String(1 + 0.03 * lit),
                  }}
                >
                  {c}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <Caption from={T_STACK} to={T_END + 0.2} variant="plain" style={{ bottom: 64 }} />
    </AbsoluteFill>
  );
};
