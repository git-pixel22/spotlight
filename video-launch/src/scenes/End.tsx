import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { F, S, TQ } from "../beats";
import { C, fontFamily, headline, inOut, outExpo, tw } from "../theme";
import { Mark, useT } from "../ui/base";
import { Lines } from "../ui/Kinetic";

const SIZE = 168;

/** Scene 12 (beat 144 to the end, the outro): logo on the downbeat, then tagline, URL and credit on the bars after. */
export const End: React.FC = () => {
  const start = F(S.end);
  const t = useT(start);
  const l = t - start / 30;
  const B = S.end;
  const disc = tw(l, 0.07, 0.62, 40, 1, outExpo); // solid sun on the downbeat, settling into the mark
  const logo = tw(l, 0.12, 0.7, 0, 1, outExpo);
  const detail = tw(l, 0.3, 0.62, 0, 1, inOut);
  const url = tw(t + 1 / 30, TQ(B + 4), TQ(B + 4) + 0.45, 0, 1, outExpo);
  const credit = tw(t + 1 / 30, TQ(B + 6), TQ(B + 6) + 0.45, 0, 1, outExpo);
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 38 }}>
          <Mark size={SIZE} discScale={disc} detail={detail} />
          <div style={{ ...headline, fontSize: SIZE, lineHeight: 1, opacity: interpolate(logo, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }), translate: `${interpolate(logo, [0, 1], [-50, 0])}px -2%` }}>
            Spotlight
          </div>
        </div>
        <div style={{ marginTop: 64, height: 88 }}>
          <Lines start={start} at={B + 2} size={82} align="center" lines={[["You're already living your content."]]} />
        </div>
        <div
          style={{
            marginTop: 64,
            background: C.ink,
            color: C.white,
            borderRadius: 999,
            padding: "20px 52px 26px",
            fontFamily,
            fontSize: 54,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            opacity: interpolate(url, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
            translate: `0px ${interpolate(url, [0, 1], [30, 0])}px`,
            scale: interpolate(url, [0, 1], [0.94, 1]),
          }}
        >
          spotlight.meetrajat.com
        </div>
        <div
          style={{
            marginTop: 50,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily,
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: C.muted,
            opacity: credit,
            translate: `0px ${interpolate(credit, [0, 1], [16, 0])}px`,
          }}
        >
          <span style={{ width: 20, height: 20, borderRadius: 10, background: C.sun }} />
          Built on the Buffer API for Buffer Commit 2026
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
