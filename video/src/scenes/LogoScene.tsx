import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, headline, inOut, tw } from "../theme";
import { T_LANDING, T_LOGO, voTime } from "../timeline";
import { Caption, Chip, Mark, useT } from "../ui/base";

/** Yellow disc closes over the previous scene, then settles as the logo's disc. */
export const irisScale = (t: number, start: number, cover = 34) =>
  t < start + 0.75
    ? tw(t, start, start + 0.7, 0, cover, inOut)
    : tw(t, start + 0.75, start + 1.6, cover, 1, inOut);

export const LogoScene: React.FC = () => {
  const t = useT();
  if (t < T_LOGO || t > T_LANDING + 0.7) return null;
  const covered = t >= T_LOGO + 0.72;
  const detail = tw(t, T_LOGO + 1.35, T_LOGO + 1.8);
  const line1 = tw(t, T_LOGO + 1.9, T_LOGO + 2.5);
  const line2 = tw(t, voTime("vo3.wav", 0.2), voTime("vo3.wav", 0.2) + 0.6);
  const badge = tw(t, voTime("vo3.wav", 2.2), voTime("vo3.wav", 2.2) + 0.6);
  const out = 1 - tw(t, T_LANDING - 0.4, T_LANDING + 0.05, 0, 1, inOut);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {covered ? <AbsoluteFill style={{ background: C.mist }} /> : null}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <Mark size={190} discScale={irisScale(t, T_LOGO)} detail={detail} />
          <div
            style={{
              ...headline,
              fontSize: 190,
              opacity: detail,
              translate: `${interpolate(detail, [0, 1], [-30, 0])}px 0px`,
            }}
          >
            Spotlight
          </div>
        </div>
        <div style={{ ...headline, fontSize: 62, marginTop: 56, textAlign: "center", lineHeight: 1.16 }}>
          <div style={{ opacity: line1, translate: `0px ${interpolate(line1, [0, 1], [18, 0])}px` }}>
            You're already living your content.
          </div>
          <div style={{ opacity: line2, translate: `0px ${interpolate(line2, [0, 1], [18, 0])}px` }}>
            Spotlight helps you notice it.
          </div>
        </div>
        <div style={{ marginTop: 50, opacity: badge, scale: String(interpolate(badge, [0, 1], [0.92, 1])) }}>
          <Chip style={{ fontSize: 32, padding: "14px 32px 17px" }}>
            <span style={{ width: 18, height: 18, borderRadius: 9, background: C.sun, border: `2.5px solid ${C.ink}` }} />
            Built on the Buffer API
          </Chip>
        </div>
      </AbsoluteFill>
      <Caption from={T_LOGO + 1} to={T_LANDING} variant="plain" style={{ bottom: 70 }} />
    </AbsoluteFill>
  );
};
