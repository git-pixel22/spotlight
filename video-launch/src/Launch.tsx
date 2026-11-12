import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { F, S, T, TOTAL_FRAMES } from "./beats";
import { C, FPS } from "./theme";
import { BufferSlot } from "./scenes/BufferSlot";
import { ColdOpen } from "./scenes/ColdOpen";
import { End } from "./scenes/End";
import { Logo } from "./scenes/Logo";
import { Home, Landing, Photos, Posts, Voice } from "./scenes/Product";
import { Stack } from "./scenes/Stack";
import { Welcome } from "./scenes/Welcome";

const ANSWER_AT = S.voice + 5; // the owner starts speaking one beat after the mic tap
const ANSWER_SECONDS = 3.49;

/** Music under the owner's answer: the breakdown is already quiet, this only clears a little more room. */
const musicVolume = (frame: number) => {
  const t = frame / FPS;
  const a = T(ANSWER_AT);
  return interpolate(t, [a - 0.3, a, a + ANSWER_SECONDS, a + ANSWER_SECONDS + 0.5], [1, 0.62, 0.62, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const SCENES: [string, number, number, React.FC][] = [
  ["1 Cold open", S.cold, S.logo, ColdOpen],
  ["2 Logo (drop)", S.logo, S.landing, Logo],
  ["3 Landing", S.landing, S.welcome, Landing],
  ["4 Welcome", S.welcome, S.home, Welcome],
  ["5 Home", S.home, S.photos, Home],
  ["6 Photos", S.photos, S.voice, Photos],
  ["7 Voice (breakdown)", S.voice, S.posts, Voice],
  ["8-9 Posts and send (drop 2)", S.posts, S.buffer, Posts],
  ["10 Buffer clip slot", S.buffer, S.stack, BufferSlot],
  ["11 $0 stack", S.stack, S.end, Stack],
  ["12 End card (outro)", S.end, S.fin, End],
];

/** Music plus the owner's answer. Also registered on its own (SpotlightLaunchAudio) so the mix can be rendered without the picture. */
export const Soundtrack: React.FC = () => (
  <>
    <Audio name="Music: What About Action? (beat-aligned edit)" src={staticFile("audio/music.wav")} volume={musicVolume} />
    <Sequence name="Owner's answer (product audio)" from={F(ANSWER_AT)} layout="none">
      <Audio src={staticFile("audio/answer-snippet.wav")} volume={0.9} />
    </Sequence>
  </>
);

export const Launch: React.FC = () => (
  <AbsoluteFill style={{ background: C.mist }}>
    {SCENES.map(([name, a, b, Scene], i) => {
      const from = i === 0 ? 0 : F(a);
      const to = i === SCENES.length - 1 ? TOTAL_FRAMES : F(b);
      return (
        <Sequence key={name} name={name} from={from} durationInFrames={to - from}>
          <Scene />
        </Sequence>
      );
    })}
    <Soundtrack />
  </AbsoluteFill>
);
