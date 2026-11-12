import React from "react";
import { Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import { TQ } from "../beats";
import { Placed, VH, VW } from "../edit";
import { C, FPS, fontFamily, outExpo, tw } from "../theme";

const BAR = 46;

/** Window chrome: rounded, thin top bar with the URL, soft shadow. Children fill the 16:10 content area. */
export const WindowFrame: React.FC<{
  rect: { x: number; y: number; w: number; h: number };
  url: string;
  enter: number; // 0..1 entrance progress
  from?: "left" | "right" | "below";
  children: React.ReactNode;
}> = ({ rect, url, enter, from = "below", children }) => {
  const d = interpolate(enter, [0, 1], [46, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h + BAR,
        borderRadius: 20,
        background: C.white,
        boxShadow: "0 0 0 1px rgba(20,33,31,0.10), 0 60px 120px -30px rgba(20,33,31,0.34), 0 24px 48px -24px rgba(20,33,31,0.28)",
        overflow: "hidden",
        opacity: interpolate(enter, [0, 0.12], [0.4, 1], { extrapolateRight: "clamp" }),
        scale: interpolate(enter, [0, 1], [0.95, 1]),
        translate: from === "below" ? `0px ${d}px` : `${from === "left" ? -d : d}px 0px`,
      }}
    >
      <div style={{ height: BAR, display: "flex", alignItems: "center", padding: "0 18px", borderBottom: `1px solid ${C.line}`, background: C.white, position: "relative" }}>
        <div style={{ display: "flex", gap: 9 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 13, height: 13, borderRadius: 7, background: C.line }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: C.mist,
              borderRadius: 9,
              padding: "5px 54px 6px",
              fontFamily,
              fontSize: 17,
              fontWeight: 500,
              color: C.muted,
              letterSpacing: "0.005em",
            }}
          >
            <svg width={11} height={14} viewBox="0 0 11 14">
              <rect x={0.5} y={6} width={10} height={7.5} rx={2} fill={C.muted} />
              <path d="M2.8 6V4.2a2.7 2.7 0 0 1 5.4 0V6" fill="none" stroke={C.muted} strokeWidth={1.6} />
            </svg>
            {url}
          </div>
        </div>
      </div>
      <div style={{ position: "relative", width: rect.w, height: rect.h, overflow: "hidden", background: C.mist }}>{children}</div>
    </div>
  );
};

const ClickRing: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => {
  const dt = t - TQ(at);
  if (dt < -0.001 || dt > 0.55) return null;
  const p = tw(dt, 0, 0.5, 0, 1, outExpo);
  const r = interpolate(p, [0, 1], [8, 46]);
  return (
    <>
      <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: C.sun, opacity: 0.55 * (1 - p) }} />
      <div
        style={{
          position: "absolute",
          left: x - r,
          top: y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          boxSizing: "border-box",
          border: `${interpolate(p, [0, 1], [3, 1])}px solid ${C.ink}`,
          opacity: 0.7 * (1 - p),
        }}
      />
    </>
  );
};

/**
 * A recording inside the floating window, seen through the precomputed camera for its scene.
 * `overlay` is drawn in the recording's own CSS-pixel space, so it rides the camera.
 */
export const Browser: React.FC<{
  scene: Placed;
  rect: { x: number; y: number; w: number; h: number };
  from?: "left" | "right" | "below";
  overlay?: React.ReactNode;
}> = ({ scene, rect, from, overlay }) => {
  const local = useCurrentFrame();
  const frame = local + scene.f0;
  const t = frame / FPS;
  const cam = scene.cam[Math.min(scene.cam.length - 1, Math.max(0, local))];
  const k = (rect.w / VW) * cam.z;
  const enter = tw((local + 1) / FPS, 0, 0.5, 0, 1, outExpo);
  return (
    <WindowFrame rect={rect} url="spotlight.meetrajat.com" enter={enter} from={from}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: VW,
          height: VH,
          transformOrigin: "0 0",
          translate: `${-(cam.x - VW / 2 / cam.z) * k}px ${-(cam.y - VH / 2 / cam.z) * k}px`,
          scale: k,
        }}
      >
        {scene.segs.map((s, i) => {
          const next = scene.segs[i + 1];
          const tail = next?.xf ?? 0; // keep playing underneath while the next segment dissolves in
          const style: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: VW, height: VH };
          const fade = s.xf ? tw(frame + 1, s.from, s.from + s.xf, 0, 1, (n) => n) : 1;
          return (
            <Sequence key={i} from={s.from - scene.f0} durationInFrames={s.frames + tail} layout="none" name={`${s.clip} ${s.a}-${s.b} @${s.rate.toFixed(2)}x`}>
              {s.still ? (
                <Img src={staticFile(`stills/${s.still}.png`)} style={{ ...style, opacity: fade }} />
              ) : (
                <Video src={staticFile(`clips/${s.clip}.mp4`)} muted trimBefore={s.trim} playbackRate={s.rate} style={{ ...style, opacity: fade }} />
              )}
            </Sequence>
          );
        })}
        {overlay}
        {scene.def.clicks.map((c, i) => (
          <ClickRing key={i} t={t} at={c.at} x={c.x} y={c.y} />
        ))}
      </div>
    </WindowFrame>
  );
};
