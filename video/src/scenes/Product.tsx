import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, fontFamily, headline, inOut, tw, vis } from "../theme";
import { CUES, E, S4, S5, S6, S7, S8, T_BUFFER, T_PRODUCT, voTime } from "../timeline";
import { Caption, Check, Chip, Spot, Wordmark, useT } from "../ui/base";
import { PHONE_SCALE, Phone, SH, SpeedChip, SW } from "../ui/Phone";

const PX = 1490; // phone centre
const LEFT = 130;
const COLW = 960;
const END = T_BUFFER + 0.5;

const SCENES = [
  { from: S4, to: S5, step: "Connect", title: ["It learns how", "you write."] },
  { from: S5, to: S6, step: "Drop", title: ["It notices", "the moments."] },
  { from: S6, to: S7, step: "Answer", title: ["One question.", "Your voice."] },
  { from: S7, to: S8, step: "Fit", title: ["Your words,", "fitted."] },
  { from: S8, to: END, step: "Send", title: ["Straight", "into Buffer."] },
];

const rise = (o: number, d = 18) => ({ opacity: o, translate: `0px ${interpolate(o, [0, 1], [d, 0])}px` });

const Titles: React.FC = () => {
  const t = useT();
  return (
    <>
      {SCENES.map((s, i) => {
        const o = vis(t, s.from + (i === 0 ? 0.5 : 0.05), s.to + 0.05, 0.5, 0.25);
        if (o <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: LEFT, top: 168, width: COLW, ...rise(o) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  background: C.sun,
                  border: `3px solid ${C.ink}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily,
                  fontWeight: 800,
                  fontSize: 28,
                  color: C.ink,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontFamily, fontWeight: 700, fontSize: 32, color: C.muted, letterSpacing: "-0.01em" }}>{s.step}</div>
            </div>
            <div style={{ ...headline, fontSize: 96 }}>
              {s.title.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};

const Stepper: React.FC = () => {
  const t = useT();
  return (
    <div style={{ position: "absolute", left: LEFT, top: 996, display: "flex", gap: 14, opacity: tw(t, S4 + 0.6, S4 + 1.2) }}>
      {SCENES.map((s, i) => {
        const p = tw(t, s.from, s.to, 0, 1, (n) => n);
        const active = t >= s.from && t < s.to;
        return (
          <div key={i} style={{ width: 150 }}>
            <div style={{ height: 6, borderRadius: 3, background: C.line, overflow: "hidden" }}>
              <div style={{ width: `${p * 100}%`, height: "100%", background: C.ink, borderRadius: 3 }} />
            </div>
            <div style={{ fontFamily, fontSize: 22, fontWeight: active ? 700 : 500, color: active ? C.ink : C.muted, marginTop: 10 }}>{s.step}</div>
          </div>
        );
      })}
    </div>
  );
};

const MID_TOP = 496;

/* ---------- scene 4: what it noticed ---------- */
const NOTICED = [
  ["Tone", "Conversational, witty"],
  ["Length", "Medium, structured"],
  ["Emoji", "A few per post"],
  ["Hashtags", "None"],
];
const Noticed: React.FC = () => {
  const t = useT();
  const o = vis(t, E.profileCard + 0.3, S5, 0.5, 0.25);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: LEFT, top: MID_TOP, width: COLW, opacity: o }}>
      <div style={{ fontFamily, fontSize: 28, fontWeight: 600, color: C.muted, marginBottom: 20 }}>Noticed from your last 50 posts</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        {NOTICED.map(([k, v], i) => {
          const a = tw(t, E.profileCard + 0.45 + i * 0.16, E.profileCard + 1.0 + i * 0.16);
          return (
            <div key={k} style={{ width: 430, background: C.white, border: `2px solid ${C.line}`, borderRadius: 22, padding: "18px 26px 22px", ...rise(a) }}>
              <div style={{ fontFamily, fontSize: 24, fontWeight: 600, color: C.muted }}>{k}</div>
              <div style={{ fontFamily, fontSize: 36, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em", marginTop: 2 }}>{v}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- scene 5: counts ---------- */
const Counts: React.FC = () => {
  const t = useT();
  const o = vis(t, E.photosIn, S6, 0.4, 0.25);
  if (o <= 0) return null;
  const tiles = [
    { n: "7", l: "photos in", at: E.photosIn + 0.1, sun: false },
    { n: "5", l: "picked", at: E.picked + 0.1, sun: true },
    { n: "2", l: "skipped", at: E.picked + 0.45, sun: false },
    { n: "1", l: "brought back", at: E.rescue + 0.15, sun: true },
  ];
  return (
    <div style={{ position: "absolute", left: LEFT, top: MID_TOP + 8, width: COLW, display: "flex", gap: 18, opacity: o }}>
      {tiles.map((x) => {
        const a = tw(t, x.at, x.at + 0.55);
        return (
          <div
            key={x.l}
            style={{
              width: 226,
              background: x.sun ? C.sun : C.white,
              border: `2px solid ${x.sun ? C.ink : C.line}`,
              borderRadius: 24,
              padding: "14px 22px 22px",
              ...rise(a, 24),
            }}
          >
            <div style={{ ...headline, fontSize: 104 }}>{x.n}</div>
            <div style={{ fontFamily, fontSize: 26, fontWeight: 600, color: C.ink, marginTop: 2, whiteSpace: "nowrap" }}>{x.l}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- scene 6: question + the owner's voice ---------- */
const ANSWER_END = E.answer + 11.2;
const Bars: React.FC<{ t: number }> = ({ t }) => {
  const speaking = CUES.some((c) => c.owner && t >= c.from && t < c.to - 0.15) && t < ANSWER_END - 0.1;
  const amp = speaking ? 1 : 0.12;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, height: 64 }}>
      {Array.from({ length: 40 }).map((_, i) => {
        const v = 0.5 + 0.5 * Math.sin(t * (7 + (i % 5) * 1.7) + i * 1.3) * Math.sin(t * 3.1 + i * 0.6);
        const h = 8 + 56 * amp * (0.25 + 0.75 * Math.abs(v)) * (0.55 + 0.45 * Math.sin((i / 39) * Math.PI));
        return <div key={i} style={{ width: 7, height: h, borderRadius: 4, background: C.sun }} />;
      })}
    </div>
  );
};

const Voice: React.FC = () => {
  const t = useT();
  const qAt = voTime("vo6.wav", 1.37);
  const hideAll = E.transcript - 0.45;
  const q = vis(t, qAt, hideAll, 0.5, 0.3);
  const card = vis(t, E.answer - 0.1, hideAll, 0.5, 0.3);
  if (q <= 0 && card <= 0) return null;
  const cue = CUES.find((c) => c.owner && t >= c.from && t < c.to);
  const writing = t >= E.writing;
  return (
    <div style={{ position: "absolute", left: LEFT, top: MID_TOP - 6, width: COLW }}>
      <div style={{ borderLeft: `8px solid ${C.sun}`, paddingLeft: 28, ...rise(q) }}>
        <div style={{ fontFamily, fontSize: 24, fontWeight: 600, color: C.muted }}>Spotlight asks</div>
        <div style={{ fontFamily, fontSize: 40, fontWeight: 700, letterSpacing: "-0.025em", color: C.ink, lineHeight: 1.15, marginTop: 4, whiteSpace: "nowrap" }}>
          Which flavour in this box disappears first?
        </div>
      </div>
      <div
        style={{
          marginTop: 28,
          background: C.raised,
          borderRadius: 30,
          padding: "26px 36px 30px",
          height: 226,
          ...rise(card, 26),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily, fontSize: 24, fontWeight: 600, color: "#B9C6C1" }}>
            {writing ? "Writing down what you said" : "The owner answers out loud"}
          </div>
          <Bars t={t} />
        </div>
        <div style={{ fontFamily, fontSize: 42, fontWeight: 700, letterSpacing: "-0.025em", color: C.white, lineHeight: 1.15, marginTop: 12 }}>
          {cue ? (
            <div style={{ opacity: Math.min(tw(t, cue.from, cue.from + 0.2), 1 - tw(t, cue.to - 0.12, cue.to)) }}>
              {"“"}
              {cue.text}
              {"”"}
            </div>
          ) : writing ? (
            <div style={{ opacity: 0.55 * tw(t, E.writing, E.writing + 0.3), fontWeight: 600 }}>Transcribing with Whisper</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

/* ---------- scene 7: filler goes, nothing gets invented ---------- */
const RAW: { s: string; filler?: boolean }[] = [
  { s: "Um, so", filler: true },
  { s: " matcha Oreo. Every single time. I almost didn't make it " },
  { s: "like", filler: true },
  { s: " I thought matcha was too niche, " },
  { s: "you know,", filler: true },
  { s: " and now people message me just to ask if it's in the box this week." },
];
const CLEAN =
  "Matcha Oreo, every single time. I almost didn't make it, I thought matcha was too niche, and now people message me just to ask if it's in the box this week.";

const Words: React.FC = () => {
  const t = useT();
  const o = vis(t, E.transcript - 0.15, S8 + 0.05, 0.5, 0.25);
  if (o <= 0) return null;
  const hlAt = voTime("vo7.wav", 4.45);
  const strikeAt = hlAt + 0.55;
  const cleanAt = voTime("vo7.wav", 5.45) + 0.45;
  const codeAt = voTime("vo7.wav", 7.14);
  const hl = tw(t, hlAt, hlAt + 0.35);
  const strike = tw(t, strikeAt, strikeAt + 0.45, 0, 1, inOut);
  const clean = tw(t, cleanAt, cleanAt + 0.6, 0, 1, inOut);
  const text: React.CSSProperties = {
    fontFamily,
    fontSize: 36,
    lineHeight: 1.4,
    fontWeight: 500,
    letterSpacing: "-0.01em",
    color: C.ink,
  };
  const own = tw(t, cleanAt + 0.3, cleanAt + 0.8);
  const code = tw(t, codeAt, codeAt + 0.55);
  return (
    <div style={{ position: "absolute", left: LEFT, top: MID_TOP - 14, width: COLW, opacity: o }}>
      <div style={{ background: C.white, border: `2px solid ${C.line}`, borderRadius: 28, padding: "24px 34px 30px", position: "relative" }}>
        <div style={{ position: "relative", height: 34 }}>
          <div style={{ position: "absolute", fontFamily, fontSize: 24, fontWeight: 600, color: C.muted, opacity: 1 - clean }}>
            What Spotlight heard
          </div>
          <div style={{ position: "absolute", fontFamily, fontSize: 24, fontWeight: 600, color: C.muted, opacity: clean }}>
            What goes in the post
          </div>
        </div>
        <div style={{ position: "relative", marginTop: 8 }}>
          <div style={{ ...text, opacity: 1 - clean }}>
            {RAW.map((r, i) =>
              r.filler ? (
                <span
                  key={i}
                  style={{
                    position: "relative",
                    display: "inline-block",
                    background: `rgba(255,203,31,${hl})`,
                    borderRadius: 8,
                    padding: "0 6px",
                    margin: "0 -6px",
                    color: `rgba(20,33,31,${1 - strike * 0.45})`,
                  }}
                >
                  {r.s}
                  <span
                    style={{
                      position: "absolute",
                      left: 4,
                      top: "54%",
                      height: 4,
                      borderRadius: 2,
                      background: C.ink,
                      width: `calc(${strike * 100}% - ${strike * 8}px)`,
                    }}
                  />
                </span>
              ) : (
                <span key={i}>{r.s}</span>
              ),
            )}
          </div>
          <div style={{ ...text, position: "absolute", left: 0, top: 0, right: 0, opacity: clean }}>{CLEAN}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
        <div style={rise(own)}>
          <Chip>
            <Check size={30} />
            Every word is yours
          </Chip>
        </div>
        <div style={rise(code)}>
          <Chip dark>
            <span style={{ fontFamily: "ui-monospace, 'DejaVu Sans Mono', monospace", fontSize: 24, fontWeight: 400, color: C.sun }}>keepOwnWords()</span>
            Enforced in code
          </Chip>
        </div>
      </div>
    </div>
  );
};

/* ---------- scene 8: three ways to send ---------- */
const Send: React.FC = () => {
  const t = useT();
  const o = vis(t, S8 + 0.2, END, 0.5, 0.3);
  if (o <= 0) return null;
  const opts = [
    { l: "Save as drafts", at: voTime("vo8.wav", 0.25) },
    { l: "Add to queue", at: voTime("vo8.wav", 1.35) },
    { l: "Pick a time", at: voTime("vo8.wav", 2.7) },
  ];
  const chosen = tw(t, E.sendTap, E.sendTap + 0.4);
  const saved = tw(t, E.saved + 0.1, E.saved + 0.7);
  return (
    <div style={{ position: "absolute", left: LEFT, top: MID_TOP + 6, width: COLW, opacity: o }}>
      <div style={{ display: "flex", gap: 16 }}>
        {opts.map((x, i) => {
          const a = tw(t, x.at, x.at + 0.45);
          const on = i === 0 ? Math.max(a * (1 - tw(t, opts[1].at, opts[1].at + 0.3)), chosen) : a * (1 - tw(t, (opts[i + 1]?.at ?? E.sendTap), (opts[i + 1]?.at ?? E.sendTap) + 0.3));
          return (
            <div
              key={x.l}
              style={{
                fontFamily,
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: "-0.015em",
                color: C.ink,
                background: on > 0.5 ? C.sun : C.white,
                border: `2.5px solid ${on > 0.5 ? C.ink : C.line}`,
                borderRadius: 999,
                padding: "18px 34px 22px",
                whiteSpace: "nowrap",
                opacity: (0.35 + 0.65 * a) * (i === 0 ? 1 : 1 - chosen * 0.6),
                scale: String(1 + 0.04 * on),
              }}
            >
              {x.l}
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 30,
          background: C.raised,
          borderRadius: 28,
          padding: "26px 34px 30px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          width: 700,
          ...rise(saved, 24),
        }}
      >
        <Check size={64} />
        <div>
          <div style={{ ...headline, color: C.white, fontSize: 46 }}>Saved as drafts in Buffer</div>
          <div style={{ fontFamily, fontSize: 28, fontWeight: 500, color: "#B9C6C1", marginTop: 6 }}>LinkedIn and X, through the Buffer API</div>
        </div>
      </div>
    </div>
  );
};

/* ---------- spotlight on the phone screen ---------- */
const PhoneSpots: React.FC = () => {
  const t = useT();
  const k = PHONE_SCALE;
  const qFrom = voTime("vo6.wav", 1.37) - 0.2;
  const q = vis(t, qFrom, E.scrollToMic - 0.15, 0.6, 0.4) * 0.62;
  const b = vis(t, S8 + 0.25, E.sendTap + 0.1, 0.6, 0.35) * 0.6;
  return (
    <>
      <Spot x={195 * k} y={268 * k} rx={300 * k} ry={120 * k} dim={q} warm={0.1} soft={0.52} />
      <Spot x={170 * k} y={410 * k} rx={300 * k} ry={170 * k} dim={b} warm={0.1} soft={0.5} />
    </>
  );
};

export const Product: React.FC = () => {
  const t = useT();
  if (t < T_PRODUCT - 0.1 || t > END) return null;
  const inn = tw(t, T_PRODUCT, T_PRODUCT + 0.9);
  const out = tw(t, T_BUFFER, END, 0, 1, inOut);
  return (
    <AbsoluteFill style={{ background: C.mist, opacity: Math.min(tw(t, T_PRODUCT, T_PRODUCT + 0.45), 1 - out) }}>
      <div style={{ position: "absolute", left: LEFT, top: 70, opacity: tw(t, T_PRODUCT + 0.3, T_PRODUCT + 0.9) }}>
        <Wordmark size={36} />
      </div>
      {/* yellow disc behind the phone, like the landing page */}
      <div
        style={{
          position: "absolute",
          left: PX - 440,
          top: 560 - 440,
          width: 880,
          height: 880,
          borderRadius: 440,
          background: C.sun,
          scale: String(interpolate(inn, [0, 1], [0.7, 1])),
          opacity: inn,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: PX - (SW + 26) / 2,
          top: (1080 - (SH + 26)) / 2,
          translate: `0px ${interpolate(inn, [0, 1], [140, 0])}px`,
          opacity: inn,
        }}
      >
        <Phone>
          <PhoneSpots />
        </Phone>
      </div>
      <div style={{ position: "absolute", right: 1920 - (PX - 262), top: 96 }}>
        <SpeedChip />
      </div>
      <Titles />
      <Noticed />
      <Counts />
      <Voice />
      <Words />
      <Send />
      <Caption from={T_PRODUCT + 0.3} to={END} variant="side" />
      <Stepper />
    </AbsoluteFill>
  );
};
