#!/usr/bin/env bash
# Render individual frames for review: scripts/frames.sh <outdir> <frame> [frame...]
set -e
cd "$(dirname "$0")/.."
out=$1; shift
mkdir -p "$out"
[ -n "$SKIP_BUNDLE" ] || npx remotion bundle --log=error >/dev/null
for f in "$@"; do
  npx remotion still build SpotlightLaunch "$out/f$(printf %04d $f).png" --frame=$f --log=error ${SCALE:+--scale=$SCALE} >/dev/null
done
ls "$out" | wc -l
