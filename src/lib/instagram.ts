// Instagram only auto-publishes images between 4:5 (portrait) and 1.91:1 (landscape).
// Most phone photos are 3:4, which is taller than that.
export const IG_MIN = 4 / 5;
export const IG_MAX = 1.91;

/** Centre crop that brings a width x height image inside Instagram's range, or null if it already fits. */
export function instagramCrop(width: number, height: number) {
  const ratio = width / height;
  if (ratio >= IG_MIN - 0.005 && ratio <= IG_MAX + 0.005) return null;
  const cropW = ratio > IG_MAX ? Math.round(height * IG_MAX) : width;
  const cropH = ratio < IG_MIN ? Math.round(width / IG_MIN) : height;
  return { left: Math.round((width - cropW) / 2), top: Math.round((height - cropH) / 2), width: cropW, height: cropH };
}
