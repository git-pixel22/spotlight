import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { getStaticFiles } from "@remotion/studio";
import { C, fontFamily, headline, inOut, tw } from "../theme";
import { BUFFER_CLIP, T_BUFFER, T_STACK } from "../timeline";
import { Mark, Wordmark, useT } from "../ui/base";

const FW = 1320;
const FH = 742;

/** Scene 8b. Plays public/buffer-clip.mp4 if it exists, otherwise a labelled placeholder. */
export const BufferClip: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const end = T_STACK + 0.5;
  if (t < T_BUFFER || t > end) return null;
  const hasClip = getStaticFiles().some((f) => f.name === BUFFER_CLIP);
  const inn = tw(t, T_BUFFER + 0.15, T_BUFFER + 0.85);
  const out = tw(t, T_STACK, end, 0, 1, inOut);
  return (
    <AbsoluteFill style={{ background: C.mist, opacity: Math.min(tw(t, T_BUFFER, T_BUFFER + 0.5), 1 - out) }}>
      <div style={{ position: "absolute", left: 130, top: 70 }}>
        <Wordmark size={36} />
      </div>
      <div style={{ position: "absolute", right: 130, top: 66, ...headline, fontSize: 44, opacity: inn }}>The drafts, inside Buffer</div>
      <div
        style={{
          position: "absolute",
          left: (1920 - FW) / 2,
          top: 190,
          width: FW,
          height: FH,
          borderRadius: 30,
          overflow: "hidden",
          opacity: inn,
          scale: String(interpolate(inn, [0, 1], [0.97, 1])),
          background: hasClip ? C.ink : C.white,
          border: hasClip ? "none" : `4px dashed ${C.line}`,
          boxShadow: hasClip ? "0 40px 90px rgba(20,33,31,0.18)" : "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {hasClip ? (
          <Sequence from={Math.round(T_BUFFER * fps)} layout="none">
            <Video src={staticFile(BUFFER_CLIP)} muted style={{ width: "100%", height: "100%" }} objectFit="contain" />
          </Sequence>
        ) : (
          <>
            <Mark size={110} />
            <div style={{ ...headline, fontSize: 76, marginTop: 34 }}>Buffer drafts clip goes here</div>
            <div style={{ fontFamily, fontSize: 32, fontWeight: 500, color: C.muted, marginTop: 20 }}>
              6 second placeholder. Drop the recording at public/buffer-clip.mp4
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
