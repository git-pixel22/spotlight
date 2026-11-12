import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { C } from "./theme";
import { MUSIC, MUSIC_OFFSET, VO, musicGain } from "./timeline";
import { BufferClip } from "./scenes/BufferClip";
import { EndCard } from "./scenes/EndCard";
import { Landing } from "./scenes/Landing";
import { LogoScene } from "./scenes/LogoScene";
import { Opening } from "./scenes/Opening";
import { Product } from "./scenes/Product";
import { Stack } from "./scenes/Stack";

const Narration: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {VO.map((v, i) => (
        <Sequence
          key={i}
          name={`${v.file} ${v.s0}-${v.s1}`}
          from={Math.round(v.at * fps)}
          durationInFrames={Math.round((v.s1 - v.s0) * fps)}
          layout="none"
        >
          <Audio src={staticFile(`audio/${v.file}`)} trimBefore={Math.round(v.s0 * fps)} />
        </Sequence>
      ))}
    </>
  );
};

/** Music bed: ducked under every spoken line, lifted in the gaps, ends on the track's own last chord. */
const Music: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <Audio
      name="Music bed"
      src={staticFile(MUSIC.file)}
      trimBefore={Math.round(MUSIC_OFFSET * fps)}
      volume={(f) => musicGain(f / fps)}
    />
  );
};

export type Stem = "mix" | "narration" | "music";

export const Main: React.FC<{ stem?: Stem }> = ({ stem = "mix" }) => (
  <AbsoluteFill style={{ background: C.mist }}>
    <Opening />
    <Landing />
    <Product />
    <BufferClip />
    <Stack />
    <LogoScene />
    <EndCard />
    {stem !== "music" ? <Narration /> : null}
    {stem !== "narration" ? <Music /> : null}
  </AbsoluteFill>
);
