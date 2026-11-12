"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";

export function ChannelAvatar({ avatar, label, size = 28 }: { avatar: string | null; label: string; size?: number }) {
  // Network avatars (X especially) are often stale links in Buffer; fall back to an initial.
  const [broken, setBroken] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  // A server-rendered <img> can fail before React hydrates, so onError never fires.
  // Check once on mount as well.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setBroken(true);
  }, []);

  return avatar && !broken ? (
    <img
      ref={img}
      src={avatar}
      alt=""
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className="rounded-full border border-line object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="inline-flex items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-muted"
      style={{ width: size, height: size }}
    >
      {label.slice(0, 1)}
    </span>
  );
}
