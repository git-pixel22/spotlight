import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { S, TQ } from "../beats";
import { PLACED } from "../edit";
import { C, fontFamily, inOut, outExpo, tw } from "../theme";
import { useT } from "../ui/base";
import { Browser } from "../ui/Browser";
import { Lines, Slot, TextColumn, winRect } from "../ui/Kinetic";
import { Stepper } from "../ui/Stepper";

const STEP_MARKS = [S.photos, S.photos + 9, S.voice, S.posts];

/** Scene 3 (beats 24 to 32): the landing page, centered. The camera rides the cursor to "Connect Buffer to start". */
export const Landing: React.FC = () => (
  <AbsoluteFill style={{ background: C.mist }}>
    <Browser scene={PLACED.landing} rect={winRect("center")} />
  </AbsoluteFill>
);

/** Scene 5 (beats 36 to 48): signed-in home. Zoom on the 7-day queue strip, then the click into the photo drop. */
export const Home: React.FC = () => {
  const s = PLACED.home.f0;
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <Browser scene={PLACED.home} rect={winRect("right")} from="right" />
      <TextColumn window="right">
        <Slot>
          <Lines start={s} at={S.home} out={S.home + 8} lines={[["See where"], ["your week"], ["goes ", { t: "quiet.", hl: true }]]} lineBeats={[S.home, S.home + 1, S.home + 2]} />
          <div style={{ position: "absolute" }}>
            <Lines start={s} at={S.home + 8} lines={[["So, what"], ["happened"], ["this week?"]]} />
          </div>
        </Slot>
      </TextColumn>
    </AbsoluteFill>
  );
};

/** Scene 6 (beats 48 to 80): drop the photos, the spotlight sweep, 5 picked and 2 skipped, rescue one. */
export const Photos: React.FC = () => {
  const s = PLACED.photos.f0;
  const B = S.photos;
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <Browser scene={PLACED.photos} rect={winRect("left")} from="left" />
      <TextColumn window="left">
        <Stepper start={s} marks={STEP_MARKS} end={S.buffer} />
        <Slot>
          <div style={{ position: "absolute" }}>
            <Lines start={s} at={B} out={B + 9} lines={[["Drop the"], ["week's"], ["photos."]]} />
          </div>
          <div style={{ position: "absolute" }}>
            <Lines start={s} at={B + 9} out={B + 16} lines={[["It notices"], ["the ", { t: "moments.", hl: true }]]} />
          </div>
          <div style={{ position: "absolute" }}>
            <Lines start={s} at={B + 16} out={B + 20} lines={[[{ t: "5 picked.", hl: true }], ["2 skipped."]]} lineBeats={[B + 16, B + 17]} />
          </div>
          <div style={{ position: "absolute" }}>
            <Lines start={s} at={B + 20} lines={[["Bring"], ["one back."]]} />
          </div>
        </Slot>
      </TextColumn>
    </AbsoluteFill>
  );
};

/** The owner's words appearing as she says them (the snippet starts on beat 85). */
const SpokenBubble: React.FC<{ start: number }> = ({ start }) => {
  const t = useT(start);
  const a = TQ(S.voice + 5);
  const end = TQ(S.voice + 14);
  if (t < a - 0.2 || t > end) return null;
  const inn = tw(t, a - 0.2, a + 0.2, 0, 1, outExpo);
  const out = tw(t, end - 0.2, end - 0.03, 0, 1, inOut);
  const chunks: [string, number][] = [
    ["Um, so,", 0.0],
    ["matcha Oreo.", 0.72],
    ["Every single time.", 2.26],
  ];
  const speaking = t >= a && t < a + 3.45;
  return (
    <div
      style={{
        marginTop: 40,
        background: C.white,
        borderRadius: 28,
        border: `2px solid ${C.line}`,
        padding: "24px 30px 28px",
        width: 470,
        opacity: inn * (1 - out),
        translate: `0px ${interpolate(inn, [0, 1], [24, 0])}px`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5, height: 34, marginBottom: 14 }}>
        {Array.from({ length: 22 }).map((_, i) => {
          const v = speaking ? 0.25 + 0.75 * Math.abs(Math.sin(t * 9 + i * 1.7) * Math.sin(t * 5.3 + i * 0.6)) : 0.14;
          return <div key={i} style={{ width: 6, height: 34 * v, borderRadius: 3, background: i % 5 === 2 ? C.sun : C.ink }} />;
        })}
      </div>
      <div style={{ fontFamily, fontSize: 40, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", color: C.ink }}>
        {chunks.map(([text, at], i) => {
          const p = tw(t, a + at, a + at + 0.3, 0, 1, outExpo);
          return (
            <span key={i} style={{ opacity: p }}>
              {text}{" "}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Filler words struck out on the transcript itself (recording CSS px), one per beat. */
const Strikes: React.FC<{ start: number }> = ({ start }) => {
  const t = useT(start);
  const B = S.voice;
  if (t < TQ(B + 16) || t >= TQ(B + 24)) return null;
  const words: [number, number, number, number][] = [
    // x0, x1, y center, beat
    [391.5, 447.5, 314.5, B + 18],
    [850.5, 881, 314.5, B + 19],
    [470, 547, 338.5, B + 20],
  ];
  return (
    <>
      {words.map(([x0, x1, y, beat], i) => {
        const p = tw(t + 1 / 30, TQ(beat), TQ(beat) + 0.32, 0, 1, outExpo);
        if (p <= 0) return null;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x0, top: y - 11, width: (x1 - x0) * p, height: 22, background: C.sun, opacity: 0.75, borderRadius: 3, mixBlendMode: "multiply" }} />
            <div style={{ position: "absolute", left: x0, top: y - 0.2, width: (x1 - x0) * p, height: 1.8, background: C.ink, borderRadius: 1 }} />
          </React.Fragment>
        );
      })}
    </>
  );
};

/** Scene 7 (beats 80 to 112, the breakdown): one question, answered out loud; the transcript; filler struck out. */
export const Voice: React.FC = () => {
  const s = PLACED.voice.f0;
  const B = S.voice;
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <Browser scene={PLACED.voice} rect={winRect("right")} from="right" overlay={<Strikes start={s} />} />
      <TextColumn window="right">
        <Stepper start={s} marks={STEP_MARKS} end={S.buffer} />
        <Slot>
          <div style={{ position: "absolute" }}>
            <Lines start={s} at={B} out={B + 4} lines={[["One"], ["question."]]} />
          </div>
          <div style={{ position: "absolute" }}>
            <Lines start={s} at={B + 4} out={B + 16} lines={[["Answer"], ["out loud."]]} />
            <SpokenBubble start={s} />
          </div>
          <div style={{ position: "absolute" }}>
            <Lines start={s} at={B + 16} out={B + 21} lines={[["Filler"], [{ t: "goes.", hl: true }]]} />
          </div>
          <div style={{ position: "absolute" }}>
            <Lines start={s} at={B + 21} out={B + 30} lines={[["Nothing"], ["invented."]]} />
          </div>
        </Slot>
      </TextColumn>
    </AbsoluteFill>
  );
};

/** Scenes 8 and 9 (beats 112 to 128, the second drop): per-channel posts, then save as drafts and the confirmation. */
export const Posts: React.FC = () => {
  const s = PLACED.posts.f0;
  const B = S.posts;
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <Browser scene={PLACED.posts} rect={winRect("left")} from="left" />
      <TextColumn window="left">
        <Stepper start={s} marks={STEP_MARKS} end={S.buffer} />
        <Slot>
          <div style={{ position: "absolute" }}>
            <Lines start={s} at={B} out={B + 12} lines={[["Your words."], ["Every"], [{ t: "channel.", hl: true }]]} lineBeats={[B, B + 2, B + 2.14]} />
          </div>
          <div style={{ position: "absolute" }}>
            <Lines start={s} at={B + 12} lines={[["Straight"], ["into"], [{ t: "Buffer.", hl: true }]]} />
          </div>
        </Slot>
      </TextColumn>
    </AbsoluteFill>
  );
};
