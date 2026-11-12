import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily, headline, tw } from "../theme";
import { CUES } from "../timeline";

/** Current composition time in seconds. */
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/** The viewfinder mark. discScale > 1 lets the yellow disc act as an iris. */
export const Mark: React.FC<{ size: number; discScale?: number; detail?: number; ink?: string }> = ({
  size,
  discScale = 1,
  detail = 1,
  ink = C.ink,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ overflow: "visible", display: "block" }}>
    <path
      d="M3 13V8a5 5 0 0 1 5-5h5M29 19v5a5 5 0 0 1-5 5h-5"
      fill="none"
      stroke={ink}
      strokeWidth={3.4}
      strokeLinecap="round"
      opacity={detail}
    />
    <circle cx={16} cy={16} r={8 * discScale} fill={C.sun} />
    <circle cx={16} cy={16} r={8} fill="none" stroke={ink} strokeWidth={2.6} opacity={detail} />
  </svg>
);

export const Wordmark: React.FC<{ size?: number; color?: string }> = ({ size = 34, color = C.ink }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
    <Mark size={size * 1.25} ink={color} />
    <div style={{ ...headline, fontSize: size, color }}>Spotlight</div>
  </div>
);

/** A soft light that dims everything else. Coordinates are in the parent's pixels. */
export const Spot: React.FC<{
  x: number;
  y: number;
  rx: number;
  ry?: number;
  dim: number;
  warm?: number;
  soft?: number;
}> = ({ x, y, rx, ry = rx, dim, warm = 0.12, soft = 0.55 }) => {
  if (dim <= 0.001) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${rx}px ${ry}px at ${x}px ${y}px, rgba(20,33,31,0) ${soft * 100}%, rgba(20,33,31,${dim}) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${rx}px ${ry}px at ${x}px ${y}px, rgba(255,203,31,${warm * Math.min(1, dim * 1.4)}) 0%, rgba(255,203,31,0) 85%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Narration caption for the current time. */
export const Caption: React.FC<{
  from: number;
  to: number;
  variant: "pill" | "plain" | "side";
  style?: React.CSSProperties;
  includeOwner?: boolean;
}> = ({ from, to, variant, style, includeOwner = false }) => {
  const t = useT();
  if (t < from || t >= to) return null;
  const cue = CUES.find((c) => t >= c.from && t < c.to && (includeOwner || !c.owner));
  if (!cue) return null;
  const o = Math.min(tw(t, cue.from, cue.from + 0.22), 1 - tw(t, cue.to - 0.14, cue.to));
  const y = tw(t, cue.from, cue.from + 0.4, 12, 0);
  if (variant === "side") {
    return (
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 852,
          width: 960,
          height: 130,
          display: "flex",
          alignItems: "center",
          ...style,
        }}
      >
        <div
          style={{
            opacity: o,
            translate: `0px ${y}px`,
            borderLeft: `8px solid ${C.sun}`,
            paddingLeft: 28,
            fontFamily,
            fontSize: 44,
            lineHeight: 1.22,
            fontWeight: 600,
            letterSpacing: "-0.015em",
            color: C.ink,
          }}
        >
          {cue.text}
        </div>
      </div>
    );
  }
  const pill = variant === "pill";
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 84,
        display: "flex",
        justifyContent: "center",
        ...style,
      }}
    >
      <div
        style={{
          opacity: o,
          translate: `0px ${y}px`,
          fontFamily,
          fontSize: 46,
          fontWeight: 600,
          letterSpacing: "-0.015em",
          lineHeight: 1.2,
          color: pill ? C.white : C.ink,
          background: pill ? "rgba(20,33,31,0.92)" : "transparent",
          padding: pill ? "20px 40px 24px" : 0,
          borderRadius: 26,
          maxWidth: 1500,
          textAlign: "center",
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};

export const Chip: React.FC<{ children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }> = ({
  children,
  dark,
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      fontFamily,
      fontSize: 28,
      fontWeight: 700,
      letterSpacing: "-0.01em",
      color: dark ? C.white : C.ink,
      background: dark ? C.ink : C.white,
      border: dark ? "none" : `2px solid ${C.line}`,
      borderRadius: 999,
      padding: "12px 26px 14px",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Check: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
    <circle cx={12} cy={12} r={12} fill={C.sun} />
    <path d="M6.8 12.4l3.4 3.4 7-7.4" fill="none" stroke={C.ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
