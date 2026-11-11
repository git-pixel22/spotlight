"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { IconCheck, IconInstagram, IconLinkedIn, IconMic, IconX, Mark } from "./icons";

const ROLL = [
  "pottery-wheel",
  "barber",
  "flowers-vase",
  "plants",
  "pottery-hands",
  "yoga-class",
  "sewing",
  "bike-workshop",
  "owner-cafe",
  "threads",
  "tattoo",
  "market",
];
/* Which cells of the roll the spotlight stops on. */
const PICKS = [1, 4, 9];

/* The answer, as spoken. `filler` marks what gets tidied away. */
type Word = { t: string; filler?: boolean; tidy?: string };
const SAID: Word[] = [
  { t: "Um, so ", filler: true },
  { t: "this", tidy: "This" },
  { t: " one’s" },
  { t: " for" },
  { t: " a" },
  { t: " regular." },
  { t: " She" },
  { t: ", like,", filler: true },
  { t: " orders" },
  { t: " one" },
  { t: " every" },
  { t: " spring" },
  { t: " for" },
  { t: " her" },
  { t: " daughter’s" },
  { t: " birthday" },
  { t: ", you know", filler: true },
  { t: "," },
  { t: " always" },
  { t: " in" },
  { t: " the" },
  { t: " blue" },
  { t: " glaze." },
];
const TIDY = SAID.filter((w) => !w.filler)
  .map((w) => w.tidy ?? w.t)
  .join("");

const CHANNELS = [
  { name: "Instagram", limit: 2200, Icon: IconInstagram },
  { name: "LinkedIn", limit: 3000, Icon: IconLinkedIn },
  { name: "X", limit: 280, Icon: IconX },
];

const ROLL_SUB = "12 photos from your camera roll";
const BARS_PER_SIDE = 11;
const PAUSE_ICON = "M2 1h3v10H2zM7 1h3v10H7z";
const PLAY_ICON = "M3 1v10l8-5z";

export function PhoneDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const one = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
    const all = <T extends HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

    const screen = one(".screen");
    const s1 = one(".s1");
    const s2 = one(".s2");
    const s3 = one(".s3");
    const screens = [s1, s2, s3];
    const spot = one(".spot");
    const cells = all(".cell");
    const ticks = all(".tick");
    const rollnote = one(".rollnote");
    const rollsub = one(".rollsub");
    const q = one(".q");
    const a = one(".a");
    const words = all(".w");
    const microw = one(".microw");
    const micstate = one(".micstate");
    const bars = all(".wave b");
    const cards = all(".post");
    const toast = one(".toast");
    const segs = all(".ticker li");
    const fills = all(".ticker li i");

    const center = (i: number) => {
      const c = cells[i].getBoundingClientRect();
      const s = screen.getBoundingClientRect();
      return { x: c.left - s.left + c.width / 2, y: c.top - s.top + c.height / 2, w: c.width };
    };
    const moveSpot = (i: number) => {
      const p = center(i);
      spot.style.transform = `translate(${p.x}px,${p.y}px)`;
    };
    const pick = (n: number) => {
      const i = PICKS[n];
      const p = center(i);
      cells[i].classList.add("pick");
      ticks[n].style.left = `${p.x + p.w / 2 - 12}px`;
      ticks[n].style.top = `${p.y - p.w / 2 + 12}px`;
      ticks[n].classList.add("on");
    };
    const show = (scr: HTMLElement) => {
      const at = screens.indexOf(scr);
      screens.forEach((s, i) => {
        s.classList.toggle("on", s === scr);
        s.classList.toggle("past", at > i);
      });
    };
    let listening = false;
    const setMic = (on: boolean, label: string) => {
      listening = on;
      microw.classList.toggle("live", on);
      micstate.textContent = label;
      if (!on) bars.forEach((b) => (b.style.height = "4px"));
    };
    const reset = () => {
      show(s1);
      cells.forEach((c) => (c.className = "cell"));
      ticks.forEach((t) => t.classList.remove("on"));
      spot.classList.remove("on");
      rollnote.classList.remove("on");
      rollsub.textContent = ROLL_SUB;
      q.classList.remove("on");
      a.className = "bubble a";
      words.forEach((w, i) => {
        w.className = "w";
        w.textContent = SAID[i].t;
      });
      setMic(false, "Answer out loud");
      cards.forEach((c) => c.classList.remove("on"));
      toast.classList.remove("on");
    };

    /* Cue sheet, in ms from the top of the loop. */
    const cues: [number, () => void][] = [];
    const at = (t: number, fn: () => void) => cues.push([t, fn]);

    cells.forEach((c, i) => at(200 + i * 55, () => c.classList.add("in")));
    at(1250, () => {
      spot.style.transition = "opacity .4s ease";
      moveSpot(0);
      void spot.offsetWidth;
      spot.style.transition = "";
      spot.classList.add("on");
      rollsub.textContent = "Looking for the moments…";
    });
    at(1500, () => moveSpot(PICKS[0]));
    at(2250, () => pick(0));
    at(2550, () => moveSpot(PICKS[1]));
    at(3300, () => pick(1));
    at(3600, () => moveSpot(PICKS[2]));
    at(4350, () => pick(2));
    at(4800, () => {
      spot.classList.remove("on");
      cells.forEach((c, i) => {
        if (!PICKS.includes(i)) c.classList.add("dim");
      });
      rollnote.classList.add("on");
      rollsub.textContent = "Spotlight noticed 3";
    });

    const ASK = 6300;
    at(ASK, () => {
      ticks.forEach((t) => t.classList.remove("on"));
      show(s2);
    });
    at(ASK + 550, () => q.classList.add("on"));
    at(ASK + 1500, () => {
      setMic(true, "Listening 0:00");
      a.classList.add("on");
    });
    const WORDS = ASK + 1800;
    const WORD_STEP = 185;
    words.forEach((w, i) =>
      at(WORDS + i * WORD_STEP, () => {
        w.classList.add("on");
        const sec = Math.min(10, Math.round((i * 10) / (words.length - 1)));
        micstate.textContent = `Listening 0:${String(sec).padStart(2, "0")}`;
      }),
    );
    const TIDYING = WORDS + words.length * WORD_STEP + 350;
    at(TIDYING, () => {
      setMic(false, "Tidying the ums");
      words.forEach((w, i) => {
        if (SAID[i].filler) w.classList.add("cut");
      });
    });
    at(TIDYING + 1200, () => {
      words.forEach((w, i) => {
        const word = SAID[i];
        if (word.filler) w.classList.add("gone");
        if (word.tidy) w.textContent = word.tidy;
      });
      a.classList.add("tidy");
      micstate.textContent = "Your words. Nothing added.";
    });

    const POSTS = TIDYING + 2700;
    at(POSTS, () => show(s3));
    cards.forEach((c, i) => at(POSTS + 350 + i * 260, () => c.classList.add("on")));
    at(POSTS + 1700, () => toast.classList.add("on"));
    const END = POSTS + 5200;
    const BOUNDS = [0, 1250, ASK, POSTS, END];
    cues.sort((x, y) => x[0] - y[0]);

    const progress = (t: number) => {
      segs.forEach((li, i) => {
        const p = Math.max(0, Math.min(1, (t - BOUNDS[i]) / (BOUNDS[i + 1] - BOUNDS[i])));
        fills[i].style.width = `${p * 100}%`;
        li.className = p >= 1 ? "done" : p > 0 ? "cur" : "";
      });
    };

    reset();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      /* No motion: show where the loop ends up. */
      words.forEach((w) => w.classList.add("on"));
      a.classList.add("on");
      cues.forEach(([t, fn]) => {
        if (t >= TIDYING) fn();
      });
      progress(END);
      return () => {
        reset();
        progress(0);
      };
    }

    let T = 0;
    let idx = 0;
    let last = performance.now();
    let waveAt = 0;
    let visible = true;
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(100, now - last);
      last = now;
      if (pausedRef.current || !visible || document.hidden) return;
      T += dt;
      while (idx < cues.length && cues[idx][0] <= T) {
        cues[idx][1]();
        idx++;
      }
      progress(T);
      if (listening && now - waveAt > 85) {
        waveAt = now;
        bars.forEach((b, i) => {
          /* Taller near the mic, on both sides. */
          const d = (i < BARS_PER_SIDE ? BARS_PER_SIDE - 1 - i : i - BARS_PER_SIDE) / (BARS_PER_SIDE - 1);
          b.style.height = `${4 + Math.random() * 30 * (1 - d * 0.65)}px`;
        });
      }
      if (T >= END) {
        T = 0;
        idx = 0;
        reset();
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
      },
      { threshold: 0.15 },
    );
    io.observe(screen);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      reset();
      progress(0);
    };
  }, []);

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };

  return (
    <div className="stage" ref={rootRef}>
      <div className="disc" aria-hidden="true" />
      <div
        className={paused ? "phone paused" : "phone"}
        role="img"
        aria-label="Spotlight in action. Twelve photos from a week. Spotlight picks three, asks about one of them, Who's this bowl for, the owner answers out loud, and the answer becomes drafts for Instagram, LinkedIn and X, saved in Buffer."
      >
        <div className="screen" aria-hidden="true">
          <div className="island" />
          <div className="sbar">
            <span>9:41</span>
            <i>
              {[5, 7, 9, 11].map((h) => (
                <b key={h} style={{ height: h }} />
              ))}
            </i>
          </div>
          <div className="apphead">
            <span className="logo">
              <Mark />
              Spotlight
            </span>
            <span className="who">Clay &amp; Co.</span>
          </div>

          <div className="scr s1">
            <h3>This week</h3>
            <p className="sub rollsub">{ROLL_SUB}</p>
            <div className="grid">
              {ROLL.map((name) => (
                <div className="cell" key={name}>
                  <img
                    src={`/landing/${name}.jpg`}
                    alt=""
                    width={92}
                    height={92}
                    style={name === "pottery-hands" ? { objectPosition: "50% 78%" } : undefined}
                  />
                </div>
              ))}
            </div>
            <div className="rollnote">
              <IconCheck size={20} />
              <span>
                <b>3 moments</b> worth sharing
              </span>
            </div>
          </div>
          <div className="spot" />
          {PICKS.map((p) => (
            <span className="tick" key={p}>
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path
                  d="M5 12.5l4.6 4.6L19 7.4"
                  fill="none"
                  stroke="#14211F"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          ))}

          <div className="scr s2">
            <div className="shot">
              <img src="/landing/pottery-hands.jpg" alt="" width={282} height={214} />
              <span className="of">Moment 1 of 3</span>
            </div>
            <div className="bubble q">Who&apos;s this bowl for?</div>
            <div className="bubble a">
              {SAID.map((w, i) => (
                <span className="w" key={i}>
                  {w.t}
                </span>
              ))}
            </div>
            <div className="microw">
              <div className="micline">
                <div className="wave l">
                  {Array.from({ length: BARS_PER_SIDE }, (_, i) => (
                    <b key={i} />
                  ))}
                </div>
                <div className="mic">
                  <IconMic size={26} />
                </div>
                <div className="wave r">
                  {Array.from({ length: BARS_PER_SIDE }, (_, i) => (
                    <b key={i} />
                  ))}
                </div>
              </div>
              <div className="micstate">Answer out loud</div>
            </div>
          </div>

          <div className="scr s3">
            <h3>Your words, fitted</h3>
            <p className="sub">One answer, one post per channel</p>
            <div className="posts">
              {CHANNELS.map(({ name, limit, Icon }) => (
                <article className="post" key={name}>
                  <header>
                    <Icon />
                    {name}
                    <em>
                      {TIDY.length} / {limit.toLocaleString("en-US")}
                    </em>
                  </header>
                  <div>
                    <img src="/landing/pottery-hands.jpg" alt="" width={46} height={46} />
                    <p>{TIDY}</p>
                  </div>
                  <div
                    className="meter"
                    style={{ "--fill": `${Math.max(4, Math.round((TIDY.length / limit) * 100))}%` } as CSSProperties}
                  >
                    <i />
                  </div>
                </article>
              ))}
            </div>
            <div className="toast">
              <IconCheck />
              Saved as drafts in Buffer
            </div>
          </div>
        </div>
      </div>

      <div className="ticker">
        <ol aria-hidden="true">
          {["Drop", "Notice", "Answer", "Post"].map((label) => (
            <li key={label}>
              <span>
                <i />
              </span>
              {label}
            </li>
          ))}
        </ol>
        <button type="button" onClick={togglePause} aria-label={paused ? "Play the demo" : "Pause the demo"} aria-pressed={paused}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d={paused ? PLAY_ICON : PAUSE_ICON} fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
