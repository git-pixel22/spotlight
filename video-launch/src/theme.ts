import { loadFont } from "@remotion/google-fonts/SchibstedGrotesk";
import { Easing, interpolate } from "remotion";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const C = {
  mist: "#EFF3EE",
  ink: "#14211F",
  sun: "#FFCB1F",
  white: "#FFFFFF",
  muted: "#4B5B57",
  line: "#D5DCD6",
  raised: "#1C2C29",
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const outBack = Easing.bezier(0.34, 1.45, 0.64, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
export const inCubic = Easing.bezier(0.5, 0, 0.9, 0.4);

/** Clamped interpolate over a time range in seconds. */
export const tw = (
  t: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing: (n: number) => number = outExpo,
) =>
  interpolate(t, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const headline = {
  fontFamily,
  fontWeight: 800,
  letterSpacing: "-0.035em",
  color: C.ink,
  lineHeight: 1.04,
} as const;
