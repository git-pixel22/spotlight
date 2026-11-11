"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

export function ChannelAvatar({ avatar, label, size = 28 }: { avatar: string | null; label: string; size?: number }) {
  // Network avatars (X especially) often expire or block hotlinking; fall back to an initial.
  const [broken, setBroken] = useState(false);
  return avatar && !broken ? (
    <img
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
