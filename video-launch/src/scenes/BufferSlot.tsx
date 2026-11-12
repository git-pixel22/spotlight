import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { getStaticFiles } from "@remotion/studio";
import { F, S } from "../beats";
import { BUFFER_CLIP } from "../config";
import { C, fontFamily, headline, outExpo, tw } from "../theme";
import { Mark, useT } from "../ui/base";
import { WindowFrame } from "../ui/Browser";
import { Lines, Slot, TextColumn, winRect } from "../ui/Kinetic";

/** Scene 10 (beats 128 to 136, 3.97 s): the real Buffer drafts clip, or a labelled placeholder until it exists. */
export const BufferSlot: React.FC = () => {
  const start = F(S.buffer);
  const t = useT(start);
  const l = t - start / 30;
  const hasClip = getStaticFiles().some((f) => f.name === BUFFER_CLIP);
  const rect = winRect("right");
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <WindowFrame rect={rect} url="publish.buffer.com" enter={tw(l + 1 / 30, 0, 0.5, 0, 1, outExpo)} from="right">
        {hasClip ? (
          <Video src={staticFile(BUFFER_CLIP)} muted objectFit="contain" style={{ width: "100%", height: "100%", background: C.white }} />
        ) : (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: C.white }}>
            <div
              style={{
                position: "absolute",
                inset: 36,
                border: `4px dashed ${C.line}`,
                borderRadius: 30,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mark size={96} />
              <div style={{ ...headline, fontSize: 72, marginTop: 30 }}>Buffer drafts clip goes here</div>
              <div style={{ fontFamily, fontSize: 30, fontWeight: 500, color: C.muted, marginTop: 18 }}>4 second placeholder. Drop the recording at public/buffer-clip.mp4</div>
            </div>
          </AbsoluteFill>
        )}
      </WindowFrame>
      <TextColumn window="right">
        <Slot>
          <Lines start={start} at={S.buffer} lines={[["Your drafts,"], ["waiting"], ["in ", { t: "Buffer.", hl: true }]]} lineBeats={[S.buffer, S.buffer + 1, S.buffer + 1.14]} />
        </Slot>
      </TextColumn>
    </AbsoluteFill>
  );
};
