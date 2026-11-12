import React from "react";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { C, fontFamily, tw } from "../theme";
import { SEGMENTS } from "../timeline";
import { useT } from "./base";

export const PHONE_SCALE = 1.12;
export const SW = Math.round(390 * PHONE_SCALE);
export const SH = Math.round(844 * PHONE_SCALE);
const BEZEL = 13;

/** Phone frame playing the cut list from timeline.ts. Children are drawn over the screen. */
export const Phone: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { fps } = useVideoConfig();
  const t = useT();
  // soft blink when the footage changes to a different recording
  const changes = SEGMENTS.filter((s, i) => i > 0 && SEGMENTS[i - 1].clip !== s.clip).map((s) => s.start);
  const blink = Math.max(0, ...changes.map((c) => (t < c ? tw(t, c - 0.15, c) : 1 - tw(t, c, c + 0.4))));
  return (
    <div
      style={{
        width: SW + BEZEL * 2,
        height: SH + BEZEL * 2,
        borderRadius: 62,
        background: C.ink,
        padding: BEZEL,
        boxShadow: "0 40px 80px rgba(20,33,31,0.22)",
      }}
    >
      <div style={{ position: "relative", width: SW, height: SH, borderRadius: 50, overflow: "hidden", background: C.mist }}>
        {SEGMENTS.map((s, i) => (
          <Sequence key={i} from={s.from} durationInFrames={s.frames} layout="none" name={`${s.clip} ${s.a}-${s.b} @${s.rate.toFixed(2)}x`}>
            <Video
              src={staticFile(`clips/${s.clip}.mp4`)}
              muted
              trimBefore={Math.round(s.a * fps)}
              playbackRate={s.rate}
              style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH }}
            />
          </Sequence>
        ))}
        <div style={{ position: "absolute", inset: 0, background: C.mist, opacity: blink }} />
        {children}
      </div>
    </div>
  );
};

/** "Sped up" marker shown while a slow AI wait is fast-forwarded. */
export const SpeedChip: React.FC = () => {
  const t = useT();
  const s = SEGMENTS.find((x) => t >= x.start && t < x.end && x.rate >= 2.5);
  if (!s) return null;
  const o = Math.min(tw(t, s.start, s.start + 0.2), 1 - tw(t, s.end - 0.2, s.end));
  return (
    <div
      style={{
        opacity: o,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily,
        fontSize: 24,
        fontWeight: 700,
        color: C.white,
        background: C.ink,
        borderRadius: 999,
        padding: "9px 20px 11px",
        whiteSpace: "nowrap",
      }}
    >
      <svg width={26} height={18} viewBox="0 0 26 18">
        <path d="M1 1l11 8-11 8zM14 1l11 8-11 8z" fill={C.sun} />
      </svg>
      Fast forward
    </div>
  );
};
