import React from "react";
import { TQ } from "../beats";
import { C, fontFamily, tw } from "../theme";
import { useT } from "./base";

const STEPS = ["Drop", "Notice", "Answer", "Post"];

/** The product's own four steps, as a progress row above the headline. `marks` are the beats at which each step starts. */
export const Stepper: React.FC<{ start: number; marks: number[]; end: number }> = ({ start, marks, end }) => {
  const t = useT(start);
  return (
    <div style={{ position: "absolute", left: 0, top: 34, display: "flex", gap: 12 }}>
      {STEPS.map((s, i) => {
        const a = TQ(marks[i]);
        const b = i + 1 < marks.length ? TQ(marks[i + 1]) : TQ(end);
        const fill = tw(t, a, b, 0, 1, (n) => n);
        const on = t >= a - 0.001;
        const active = on && t < b;
        return (
          <div key={s} style={{ width: 104 }}>
            <div style={{ height: 6, borderRadius: 3, background: C.line, overflow: "hidden" }}>
              <div style={{ width: `${fill * 100}%`, height: "100%", background: C.ink, borderRadius: 3 }} />
            </div>
            <div
              style={{
                marginTop: 12,
                fontFamily,
                fontSize: 27,
                fontWeight: active ? 800 : 600,
                letterSpacing: "-0.01em",
                color: on ? C.ink : C.muted,
                opacity: on ? 1 : 0.55,
              }}
            >
              {s}
            </div>
          </div>
        );
      })}
    </div>
  );
};
