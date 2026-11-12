import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { getStaticFiles } from "@remotion/studio";
import { C, fontFamily, headline, inOut, tw } from "../theme";
import { BUFFER_CLIP, T_BUFFER, T_STACK } from "../timeline";
import { Caption, Mark, Wordmark, useT } from "../ui/base";

const FW = 1320;
const FH = 742;
// The real recording (public/buffer-clip.mp4) is 2548x1306; the frame takes its shape so nothing is cropped.
const CLIP_H = Math.round(FW / (2548 / 1306));
// A slow push-in keeps a still page alive. It ends with the sidebar just out of frame and the
// "Drafts 2" tab plus both draft cards in view (origin solved from that end crop, in recording pixels).
const PUSH_ORIGIN = "75.4% 47.5%";
const PUSH_SCALE = 1.24;
const gentle = Easing.bezier(0.45, 0, 0.55, 1);

/** Scene 8b. Plays public/buffer-clip.mp4 if it exists, otherwise a labelled placeholder. */
export const BufferClip: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const end = T_STACK + 0.5;
  if (t < T_BUFFER || t > end) return null;
  const hasClip = getStaticFiles().some((f) => f.name === BUFFER_CLIP);
  const inn = tw(t, T_BUFFER + 0.15, T_BUFFER + 0.85);
  const out = tw(t, T_STACK, end, 0, 1, inOut);
  const frameH = hasClip ? CLIP_H : FH;
  const push = tw(t, T_BUFFER + 0.2, end, 1, PUSH_SCALE, gentle);
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
          top: 168 + (FH - frameH) / 2,
          width: FW,
          height: frameH,
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
            <div style={{ width: "100%", height: "100%", transform: `scale(${push})`, transformOrigin: PUSH_ORIGIN }}>
              <Video src={staticFile(BUFFER_CLIP)} muted style={{ width: "100%", height: "100%" }} objectFit="cover" />
            </div>
          </Sequence>
        ) : (
          <>
            <Mark size={110} />
            <div style={{ ...headline, fontSize: 76, marginTop: 34 }}>Buffer drafts clip goes here</div>
            <div style={{ fontFamily, fontSize: 32, fontWeight: 500, color: C.muted, marginTop: 20 }}>
              4 second placeholder. Drop the recording at public/buffer-clip.mp4
            </div>
          </>
        )}
      </div>
      <Caption from={T_BUFFER + 0.3} to={T_STACK + 0.2} variant="pill" style={{ bottom: 36 }} />
    </AbsoluteFill>
  );
};
