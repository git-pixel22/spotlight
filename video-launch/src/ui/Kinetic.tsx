import React from "react";
import { interpolate } from "remotion";
import { TQ } from "../beats";
import { C, headline, inOut, outExpo, tw } from "../theme";
import { useT } from "./base";

export type Part = string | { t: string; hl?: boolean };

/**
 * A headline that hits on a beat: each line rises out of a mask, a few frames apart,
 * and the whole card clears just before beat `out`. `hl` words get a sun fill wiped in behind them.
 */
export const Lines: React.FC<{
  start: number; // frame offset of the enclosing Sequence
  at: number; // beat
  out?: number; // beat
  lines: Part[][];
  size?: number;
  color?: string;
  align?: "left" | "center";
  stagger?: number; // seconds between lines
  lineBeats?: number[]; // optional: beat for each line instead of a stagger
  style?: React.CSSProperties;
}> = ({ start, at, out, lines, size = 86, color = C.ink, align = "left", stagger = 0.07, lineBeats, style }) => {
  const t = useT(start);
  const t0 = TQ(at);
  const t1 = out === undefined ? Infinity : TQ(out);
  if (t < t0 - 0.001 || t >= t1) return null;
  const exit = out === undefined ? 0 : tw(t, t1 - 0.17, t1 - 0.03, 0, 1, inOut);
  return (
    <div
      style={{
        ...headline,
        fontSize: size,
        color,
        textAlign: align,
        opacity: 1 - exit,
        translate: `0px ${interpolate(exit, [0, 1], [0, -size * 0.18])}px`,
        ...style,
      }}
    >
      {lines.map((parts, i) => {
        const lt = lineBeats ? TQ(lineBeats[i]) : t0 + i * stagger;
        // one frame of head start so the line is already visible on the beat's own frame
        const p = tw(t + 1 / 30, lt, lt + 0.42, 0, 1, outExpo);
        return (
          <div key={i} style={{ overflow: "hidden", padding: "0.06em 0.14em 0.16em", margin: "-0.06em -0.14em -0.16em" }}>
            <div style={{ translate: `0px ${interpolate(p, [0, 1], [135, 0])}%`, whiteSpace: "nowrap", opacity: p > 0 ? 1 : 0 }}>
              {parts.map((part, j) => {
                if (typeof part === "string") return <span key={j}>{part}</span>;
                const h = tw(t, lt + 0.1, lt + 0.48, 0, 1, outExpo);
                return (
                  <span key={j} style={{ position: "relative", display: "inline-block", isolation: "isolate", color: part.hl ? C.ink : undefined }}>
                    {part.hl ? (
                      <span
                        style={{
                          position: "absolute",
                          left: "-0.1em",
                          right: "-0.1em",
                          top: "0.1em",
                          bottom: "-0.02em",
                          background: C.sun,
                          borderRadius: "0.12em",
                          zIndex: -1,
                          transformOrigin: "0% 50%",
                          scale: `${h} 1`,
                        }}
                      />
                    ) : null}
                    {part.t}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const WIN_SIDE = { w: 1184, h: 740, bar: 46, y: 147 };
export const WIN_CENTER = { w: 1344, h: 840, bar: 46, y: 97 };
const GUTTER = 64;
const GAP = 60;

/** Where the floating window sits for each layout. */
export const winRect = (side: "left" | "right" | "center") =>
  side === "center"
    ? { x: (1920 - WIN_CENTER.w) / 2, y: WIN_CENTER.y, w: WIN_CENTER.w, h: WIN_CENTER.h }
    : { x: side === "right" ? 1920 - GUTTER - WIN_SIDE.w : GUTTER, y: WIN_SIDE.y, w: WIN_SIDE.w, h: WIN_SIDE.h };

/** The text column beside a side-docked window. `window` is the side the window is on. */
export const TextColumn: React.FC<{ window: "left" | "right"; children: React.ReactNode }> = ({ window, children }) => {
  const x = window === "right" ? 96 : GUTTER + WIN_SIDE.w + GAP;
  const w = window === "right" ? 1920 - GUTTER - WIN_SIDE.w - GAP - 96 : 1920 - x - 72;
  return <div style={{ position: "absolute", left: x, top: WIN_SIDE.y, width: w, height: WIN_SIDE.h + WIN_SIDE.bar }}>{children}</div>;
};

/** Vertically centered slot inside a TextColumn; cards for different beats stack in the same slot. */
export const Slot: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", ...style }}>{children}</div>
);
