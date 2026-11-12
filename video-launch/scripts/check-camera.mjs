// Camera report: zoom range, smoothness (no jitter), bounds, and whether the cursor stays in frame while zoomed.
import { build } from "esbuild";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = path.join(os.tmpdir(), `spotlight-edit-${process.pid}.mjs`);
await build({
  entryPoints: [path.join(root, "src/edit.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: tmp,
  logLevel: "error",
  plugins: [
    {
      name: "stub-theme", // theme.ts loads a font, which needs a browser
      setup(b) {
        b.onResolve({ filter: /\/theme$/ }, () => ({ path: "theme", namespace: "stub" }));
        b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "export const FPS = 30;", loader: "js" }));
      },
    },
  ],
});
const { PLACED, VW, VH } = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);
const tracks = Object.fromEntries(["landing", "home", "photos", "voice"].map((c) => [c, JSON.parse(fs.readFileSync(path.join(root, `src/data/${c}.cursor.json`), "utf8"))]));
const g = JSON.parse(fs.readFileSync(path.join(root, "src/data/grid.json"), "utf8"));
const F = (b) => Math.round((g.lead + b * g.period) * 30);

for (const s of Object.values(PLACED)) {
  const n = s.cam.length;
  let zmin = 9, zmax = 0, vmax = 0, amax = 0, flips = 0, oob = 0, curOut = 0, curChecked = 0;
  const snaps = new Set(s.def.cam.filter((k) => k.snap).map((k) => F(k.at) - s.f0));
  let prevV = null;
  for (let i = 0; i < n; i++) {
    const c = s.cam[i];
    zmin = Math.min(zmin, c.z);
    zmax = Math.max(zmax, c.z);
    const hw = VW / 2 / c.z, hh = VH / 2 / c.z;
    if (c.x - hw < -0.01 || c.x + hw > VW + 0.01 || c.y - hh < -0.01 || c.y + hh > VH + 0.01) oob++;
    if (i > 0 && !snaps.has(i) && !snaps.has(i - 1) && !snaps.has(i + 1)) {
      const p = s.cam[i - 1];
      // screen-space speed of the picture, in output px per frame for a 1184 px wide window
      const k = (1184 / VW) * c.z;
      const v = [(c.x - p.x) * k, (c.y - p.y) * k, Math.log(c.z / p.z) * 1000];
      vmax = Math.max(vmax, Math.hypot(v[0], v[1]));
      if (prevV) {
        const a = Math.hypot(v[0] - prevV[0], v[1] - prevV[1]);
        amax = Math.max(amax, a);
        // jitter = direction reversal with real amplitude on consecutive frames
        if ((v[0] * prevV[0] < -0.04 || v[1] * prevV[1] < -0.04) && a > 0.6) flips++;
      }
      prevV = v;
    } else prevV = null;
    // cursor visibility while zoomed in
    const frame = s.f0 + i;
    const seg = s.segs.find((x) => frame >= x.from && frame < x.from + x.frames);
    if (seg && c.z > 1.5) {
      const t = seg.trim / 30 + ((frame - seg.from) / 30) * seg.rate;
      const tr = tracks[seg.clip];
      const cur = tr[Math.min(tr.length - 1, Math.max(0, Math.round(t * 30)))];
      curChecked++;
      if (Math.abs(cur[0] - c.x) > hw - 8 || Math.abs(cur[1] - c.y) > hh - 8) curOut++;
    }
  }
  const clicks = s.def.clicks.map((cl) => {
    const i = F(cl.at) - s.f0;
    const c = s.cam[i];
    const hw = VW / 2 / c.z, hh = VH / 2 / c.z;
    const inside = Math.abs(cl.x - c.x) < hw - 20 && Math.abs(cl.y - c.y) < hh - 20;
    return `b${cl.at}:z${c.z.toFixed(2)}${inside ? "" : " OUT OF FRAME"}`;
  });
  console.log(
    `${s.def.id.padEnd(8)} frames ${s.f0}-${s.f1}  zoom ${zmin.toFixed(2)}-${zmax.toFixed(2)}  max pan ${vmax.toFixed(1)} px/f  max accel ${amax.toFixed(2)} px/f2  reversals ${flips}  out-of-bounds ${oob}  cursor off-frame while zoomed ${curOut}/${curChecked}  clicks ${clicks.join(", ")}`,
  );
  console.log("         segments: " + s.segs.map((x) => (x.still ? `still(${x.frames}f)` : `${x.a}-${x.b}s@${x.rate.toFixed(2)}x`)).join("  "));
}
