import { Composition } from "remotion";
import { Launch, Soundtrack } from "./Launch";
import { TOTAL_FRAMES } from "./beats";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="SpotlightLaunch" component={Launch} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      {/* Audio only: lets scripts/render.mjs render the mix without decoding any footage. */}
      <Composition id="SpotlightLaunchAudio" component={Soundtrack} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    </>
  );
};
