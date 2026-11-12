// Tracks the drawn cursor in each recording, frame by frame, and writes src/data/<clip>.cursor.json ([x, y] in CSS px).
// The events.json move durations are shorter than the real glides, so the follow-cam uses this track instead.
// Method: the cursor is a dark arrow with a white outline; score = mean(outline pixels) - mean(fill pixels),
// searched around the previous position. Usage: node scripts/track-cursor.mjs landing home photos voice
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const A = path.join(root, "public/clips") + "/";
const W=1440,H=900,TW=30,TH=34,OX=4,OY=4; // template box starts at hot-4
const grab=(clip,t,x,y)=>{ const raw=execFileSync("ffmpeg",["-loglevel","error","-ss",String(t),"-i",A+clip+".mp4","-frames:v","1","-vf",`scale=${W}:${H},crop=${TW}:${TH}:${x-OX}:${y-OY}`,"-pix_fmt","gray","-f","rawvideo","-"]); return raw; };
const tDark=grab("home",1,720,450), tLight=grab("landing",1,720,450);
const white=[],dark=[];
for(let i=0;i<TW*TH;i++){ if(tDark[i]>190) white.push(i); if(tLight[i]<70) dark.push(i);} 
console.error("mask sizes",white.length,dark.length);
const wOff=white.map(i=>[i%TW,Math.floor(i/TW)]), dOff=dark.map(i=>[i%TW,Math.floor(i/TW)]);
const score=(fr,px,py)=>{ let a=0,b=0; for(const [dx,dy] of wOff){ a+=fr[(py+dy)*W+px+dx]; } for(const [dx,dy] of dOff){ b+=fr[(py+dy)*W+px+dx]; } return a/wOff.length-b/dOff.length; };
async function track(clip){
  const p=spawn("ffmpeg",["-loglevel","error","-i",A+clip+".mp4","-vf",`scale=${W}:${H}`,"-pix_fmt","gray","-f","rawvideo","-"]);
  let buf=Buffer.alloc(0); const out=[]; let cx=720,cy=450; let lost=0;
  const proc=(fr)=>{ const R=lost>3?400:70; let best=-1e9,bx=cx,by=cy; const step=lost>3?2:1;
    for(let y=Math.max(OY,cy-R);y<=Math.min(H-TH+OY-1,cy+R);y+=step) for(let x=Math.max(OX,cx-R);x<=Math.min(W-TW+OX-1,cx+R);x+=step){ const s=score(fr,x-OX,y-OY); if(s>best){best=s;bx=x;by=y;} }
    if(best>120){cx=bx;cy=by;lost=0;} else lost++;
    out.push([cx,cy,Math.round(best)]); };
  for await (const chunk of p.stdout){ buf=Buffer.concat([buf,chunk]); while(buf.length>=W*H){ proc(buf.subarray(0,W*H)); buf=buf.subarray(W*H);} }
  return out;
}
const res={};
for(const clip of process.argv.slice(2)){ const o=await track(clip); res[clip]=o; const low=o.filter(r=>r[2]<=120).length; console.error(clip,o.length,"frames; low-score frames",low, "min score", Math.min(...o.map(r=>r[2]))); fs.writeFileSync(path.join(root, `src/data/${clip}.cursor.json`), JSON.stringify(o.map((r) => [r[0], r[1]]))); }
