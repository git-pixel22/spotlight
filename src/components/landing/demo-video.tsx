"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { IconPlay } from "./icons";

/** The demo on YouTube. Nothing loads from YouTube until someone presses play. */
const YOUTUBE_ID = "ifvzMvvgoEc";
const LENGTH = "1:22";

export function DemoVideo() {
  const [playing, setPlaying] = useState(false);

  // "Watch the demo" in the hero links to #demo: scroll there and start playing.
  useEffect(() => {
    const onHash = () => {
      if (location.hash === "#demo") setPlaying(true);
    };
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  if (playing) {
    return (
      <div className="video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0&playsinline=1`}
          title="Spotlight demo video"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button type="button" className="video video-poster" onClick={() => setPlaying(true)} aria-label={`Play the demo video, ${LENGTH}`}>
      <img src="/landing/demo-poster.jpg" alt="" width={1920} height={1080} loading="lazy" />
      <span className="len">{LENGTH}</span>
      <span className="play">
        <IconPlay size={30} fill="#14211F" />
      </span>
    </button>
  );
}
