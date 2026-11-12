import { Composition } from "remotion";
import { Main } from "./Main";
import { TOTAL_FRAMES } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition id="SpotlightDemo" component={Main} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
  );
};
