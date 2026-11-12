import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FPS, headline } from "../theme";

/** Composition time in seconds for a component that lives in a <Sequence from={start}>. */
export const useT = (start = 0) => (useCurrentFrame() + start) / FPS;

/** The viewfinder mark. discScale > 1 lets the yellow disc act as an iris. */
export const Mark: React.FC<{ size: number; discScale?: number; detail?: number; ink?: string }> = ({
  size,
  discScale = 1,
  detail = 1,
  ink = C.ink,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ overflow: "visible", display: "block", flexShrink: 0 }}>
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

export const Check: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
    <circle cx={12} cy={12} r={12} fill={C.sun} />
    <path d="M6.8 12.4l3.4 3.4 7-7.4" fill="none" stroke={C.ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
