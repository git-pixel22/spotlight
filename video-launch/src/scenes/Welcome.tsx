import React from "react";
import { AbsoluteFill, interpolate, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { F, P, S } from "../beats";
import { C, outExpo, tw } from "../theme";
import { useT } from "../ui/base";
import { Lines } from "../ui/Kinetic";

const SCALE = 1.06;
const SW = Math.round(390 * SCALE);
const SH = Math.round(844 * SCALE);
const BEZEL = 13;
const CARD_AT = 13.53; // welcome.mp4: the "Here's what we noticed" card appears

/** Scene 4 (beats 32 to 36): onboarding on a phone. The profile card lands on beat 33. */
export const Welcome: React.FC = () => {
  const start = F(S.welcome);
  const t = useT(start);
  const l = t - start / 30;
  const inn = tw(l + 1 / 30, 0, 0.5, 0, 1, outExpo);
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <div
        style={{
          position: "absolute",
          left: 500,
          top: (1080 - SH - BEZEL * 2) / 2,
          width: SW + BEZEL * 2,
          height: SH + BEZEL * 2,
          borderRadius: 62,
          background: C.ink,
          padding: BEZEL,
          boxShadow: "0 50px 100px -20px rgba(20,33,31,0.35)",
          opacity: interpolate(inn, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }),
          translate: `0px ${interpolate(inn, [0, 1], [70, 0])}px`,
          rotate: `${interpolate(inn, [0, 1], [-3, 0])}deg`,
        }}
      >
        <div style={{ position: "relative", width: SW, height: SH, borderRadius: 50, overflow: "hidden", background: C.mist }}>
          <Video src={staticFile("clips/welcome.mp4")} muted trimBefore={Math.round((CARD_AT - P) * 30)} style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 1040, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
        <Lines start={start} at={S.welcome} size={104} lines={[["It learns"], ["how you"], [{ t: "write.", hl: true }]]} lineBeats={[S.welcome, S.welcome + 1, S.welcome + 1.14]} />
      </div>
    </AbsoluteFill>
  );
};
