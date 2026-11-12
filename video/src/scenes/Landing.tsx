import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { C, fontFamily, inOut, tw } from "../theme";
import { T_LANDING, T_PRODUCT, voTime } from "../timeline";
import { Caption, Spot, useT } from "../ui/base";

const FW = 1500;
const FH = 790;
const OFF = -265; // the recording is shown 1:1, cropped to the hero
const BAR = 54;
const LEFT = (1920 - FW) / 2;
const TOP = 60;
// "Connect Buffer to start" button, in the 1920x1080 recording
const BTN = { x: 490, y: 583 };
const bx = LEFT + OFF + BTN.x;
const by = TOP + BAR + BTN.y;

export const Landing: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const end = T_PRODUCT + 0.6;
  const visible = t >= T_LANDING - 0.1 && t <= end;
  if (!visible) return null;
  const click = voTime("vo4.wav", 0.75);
  const inn = tw(t, T_LANDING + 0.05, T_LANDING + 0.75);
  const out = tw(t, T_PRODUCT - 0.1, end, 0, 1, inOut);
  const dim = tw(t, T_LANDING + 0.9, T_LANDING + 1.6, 0, 0.66, inOut) * (1 - out);
  const cur = tw(t, T_LANDING + 0.8, click - 0.15, 0, 1, inOut);
  const ripple = tw(t, click, click + 0.6);
  const press = tw(t, click - 0.08, click + 0.04) * (1 - tw(t, click + 0.04, click + 0.3));
  return (
      <AbsoluteFill style={{ opacity: Math.min(inn, 1 - out) }}>
        <div
          style={{
            position: "absolute",
            left: LEFT,
            top: TOP,
            width: FW,
            height: FH + BAR,
            borderRadius: 22,
            overflow: "hidden",
            background: C.white,
            boxShadow: "0 40px 90px rgba(20,33,31,0.16), 0 0 0 2px rgba(20,33,31,0.08)",
            scale: String(interpolate(inn, [0, 1], [0.965, 1]) - out * 0.03),
          }}
        >
          <div style={{ height: BAR, background: C.white, borderBottom: `2px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 22px", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: C.line }} />
            ))}
            <div
              style={{
                margin: "0 auto",
                translate: "-33px 0px",
                fontFamily,
                fontSize: 21,
                fontWeight: 500,
                color: C.muted,
                background: C.mist,
                borderRadius: 999,
                padding: "5px 60px 7px",
              }}
            >
              spotlight.meetrajat.com
            </div>
          </div>
          <Sequence from={Math.round((T_LANDING - 0.1) * fps)} layout="none">
            <Video src={staticFile("clips/landing.mp4")} muted trimBefore={Math.round(0.4 * fps)} style={{ position: "absolute", left: OFF, top: BAR, width: 1920, height: 1080 }} />
          </Sequence>
        </div>
        <Spot x={bx} y={by} rx={420} ry={210} dim={dim} warm={0.16} soft={0.5} />
        {/* click ripple */}
        <div
          style={{
            position: "absolute",
            left: bx - 120,
            top: by - 120,
            width: 240,
            height: 240,
            borderRadius: 120,
            border: `5px solid ${C.sun}`,
            opacity: (1 - ripple) * (t >= click ? 1 : 0),
            scale: String(interpolate(ripple, [0, 1], [0.2, 1])),
          }}
        />
        {/* cursor */}
        <svg
          width={56}
          height={56}
          viewBox="0 0 24 24"
          style={{
            position: "absolute",
            left: interpolate(cur, [0, 1], [bx + 420, bx + 24]),
            top: interpolate(cur, [0, 1], [by + 260, by + 4]),
            opacity: Math.min(tw(t, T_LANDING + 0.8, T_LANDING + 1.1), 1 - out),
            scale: String(1 - press * 0.14),
            filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))",
          }}
        >
          <path d="M5 3l14 7.5-6.2 1.6L10.5 19z" fill={C.white} stroke={C.ink} strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
        <Caption from={T_LANDING + 0.3} to={T_PRODUCT + 0.2} variant="pill" style={{ bottom: 40 }} />
      </AbsoluteFill>
  );
};
