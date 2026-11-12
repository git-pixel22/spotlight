import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, fontFamily, headline, tw } from "../theme";
import { T_END, voTime } from "../timeline";
import { Mark, useT } from "../ui/base";
import { irisScale } from "./LogoScene";

export const EndCard: React.FC = () => {
  const t = useT();
  if (t < T_END) return null;
  const covered = t >= T_END + 0.72;
  const detail = tw(t, T_END + 1.3, T_END + 1.75);
  const lineAt = voTime("vo9.wav", 5.05);
  const line = tw(t, lineAt, lineAt + 0.7);
  const url = tw(t, lineAt + 1.5, lineAt + 2.1);
  const built = tw(t, lineAt + 1.8, lineAt + 2.4);
  const up = (o: number) => ({ opacity: o, translate: `0px ${interpolate(o, [0, 1], [18, 0])}px` });
  return (
    <AbsoluteFill>
      {covered ? <AbsoluteFill style={{ background: C.mist }} /> : null}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 38 }}>
          <Mark size={160} discScale={irisScale(t, T_END, 40)} detail={detail} />
          <div style={{ ...headline, fontSize: 160, opacity: detail, translate: `${interpolate(detail, [0, 1], [-26, 0])}px 0px` }}>Spotlight</div>
        </div>
        <div style={{ ...headline, fontSize: 84, marginTop: 64, ...up(line) }}>You're already living your content.</div>
        <div
          style={{
            marginTop: 64,
            fontFamily,
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: "-0.015em",
            color: C.white,
            background: C.ink,
            borderRadius: 999,
            padding: "18px 46px 22px",
            ...up(url),
          }}
        >
          spotlight.meetrajat.com
        </div>
        <div style={{ marginTop: 34, fontFamily, fontSize: 32, fontWeight: 500, color: C.muted, ...up(built) }}>
          Built on the Buffer API for Buffer Commit 2026
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
