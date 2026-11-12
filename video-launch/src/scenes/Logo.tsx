import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { F, S } from "../beats";
import { LOGO } from "../config";
import { C, headline, inOut, outExpo, tw } from "../theme";
import { Mark, useT } from "../ui/base";
import { Lines } from "../ui/Kinetic";

/** Scene 2 (beats 16 to 24): the drop. The frame is solid sun on the beat, then the disc settles into the mark. */
export const Logo: React.FC = () => {
  const start = F(S.logo);
  const t = useT(start);
  const l = t - start / 30;
  const disc = tw(l, 0.07, 0.62, 36, 1, outExpo);
  const detail = tw(l, 0.28, 0.6, 0, 1, inOut);
  const word = tw(l, 0.2, 0.75, 0, 1, outExpo);
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <div style={{ position: "absolute", left: LOGO.left, top: LOGO.top }}>
        <Mark size={LOGO.size} discScale={disc} detail={detail} />
      </div>
      <div
        style={{
          position: "absolute",
          left: LOGO.left + LOGO.size + LOGO.gap,
          top: LOGO.top + LOGO.size / 2,
          ...headline,
          fontSize: LOGO.size,
          lineHeight: 1,
          translate: `${interpolate(word, [0, 1], [-70, 0])}px -52%`,
          opacity: interpolate(word, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Spotlight
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 596, display: "flex", justifyContent: "center" }}>
        <Lines start={start} at={20} size={80} align="center" lines={[["You're already living your content."]]} />
      </div>
    </AbsoluteFill>
  );
};
