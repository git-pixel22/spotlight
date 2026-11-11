"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Recorder } from "@/components/recorder";
import { ChannelAvatar } from "@/components/channel-avatar";
import { ArrowSquareOut, Check, X } from "@phosphor-icons/react";

export type ChannelView = {
  id: string;
  service: string;
  label: string;
  name: string;
  avatar: string | null;
  limit: number;
  requiresImage: boolean;
};

type Photo = { url: string; alt?: string };
type Draft = { id: string; channelId: string; text: string; status: string; error?: string | null };
type SendResult = { draftId?: string; channelId?: string; ok: boolean; error?: string; postId?: string; ideaId?: string; dueAt?: string | null };
type SendMode = "draft" | "queue" | "scheduled" | "idea";

const whenLabel = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** Default for the time picker: tomorrow at 9:00 in the browser's timezone, formatted for datetime-local. */
function tomorrowAtNine() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  moment: {
    id: string;
    source: string;
    title: string;
    observation: string | null;
    question: string;
    photos: Photo[];
    take: string | null;
    status: string;
  };
  drafts: Draft[];
  channels: ChannelView[];
  sampleAnswer: string | null;
  focused: boolean;
};

type Stage = "ask" | "confirm" | "shaping" | "review" | "sending" | "sent";

export function MomentCard({ moment, drafts: initialDrafts, channels, sampleAnswer, focused }: Props) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>(initialDrafts.length ? "review" : "ask");
  const [answer, setAnswer] = useState(moment.take ?? "");
  const [usedSample, setUsedSample] = useState(false);
  const [take, setTake] = useState(moment.take ?? "");
  const [photos, setPhotos] = useState<Photo[]>(moment.photos);
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);
  const [texts, setTexts] = useState<Record<string, string>>(Object.fromEntries(initialDrafts.map((d) => [d.id, d.text])));
  const [results, setResults] = useState<SendResult[]>([]);
  const [sentMode, setSentMode] = useState<SendMode>("draft");
  const [picking, setPicking] = useState(false);
  const [when, setWhen] = useState(tomorrowAtNine);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focused]);

  const channelById = new Map(channels.map((c) => [c.id, c]));

  async function shape(text: string, useSample = false) {
    setStage("shaping");
    setError(null);
    try {
      const res = await fetch(`/api/moments/${moment.id}/shape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ take: text, useSampleAnswer: useSample }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setTake(json.take);
      setPhotos(json.photos);
      setDrafts(json.drafts);
      setTexts(Object.fromEntries(json.drafts.map((d: Draft) => [d.id, d.text])));
      setStage("review");
    } catch (e) {
      setError((e as Error).message || "Something went wrong");
      setStage("confirm");
    }
  }

  async function send(mode: SendMode) {
    setStage("sending");
    setSentMode(mode);
    setError(null);
    try {
      const res = await fetch(`/api/moments/${moment.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          dueAt: mode === "scheduled" ? new Date(when).toISOString() : undefined,
          posts: drafts.map((d) => ({ draftId: d.id, text: texts[d.id] ?? d.text })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResults(json.results);
      setStage(json.results.some((r: SendResult) => r.ok) ? "sent" : "review");
      if (!json.results.some((r: SendResult) => r.ok)) setError("Buffer didn't accept these posts. See the errors below.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message || "Something went wrong");
      setStage("review");
    }
  }

  async function dismiss() {
    setHidden(true);
    await fetch(`/api/moments/${moment.id}/send`, { method: "DELETE" });
    router.refresh();
  }

  if (hidden) return null;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`panel overflow-hidden ${focused ? "ring-2 ring-ink/15" : ""}`}
    >
      {photos.length > 0 && (
        <div className={`grid gap-0.5 ${photos.length > 1 ? "grid-cols-2" : ""}`}>
          {photos.slice(0, 4).map((p) => (
            <img key={p.url} src={p.url} alt={p.alt ?? ""} className={`w-full object-cover ${photos.length > 1 ? "aspect-[4/3]" : "aspect-[16/9]"}`} />
          ))}
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-accent-text">
              {moment.source === "calendar" ? "Coming up" : moment.source === "sample" ? "Sample week" : moment.source === "voice" ? "Your thought" : "Spotted in your photos"}
            </p>
            <h3 className="font-heading mt-1 text-2xl">{moment.title}</h3>
            {moment.observation && <p className="mt-1 text-sm text-muted">{moment.observation}</p>}
          </div>
          {stage === "ask" && (
            <button onClick={dismiss} className="text-sm text-muted hover:text-ink" aria-label="Skip this moment">Skip</button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {(stage === "ask" || stage === "confirm" || stage === "shaping") && (
            <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5">
              <p className="border-l-4 border-accent pl-4 text-xl font-medium leading-snug sm:text-2xl">{moment.question}</p>

              {stage === "ask" && (
                <div className="mt-5 flex flex-col items-center gap-4">
                  <Recorder
                    onTranscript={(t) => {
                      setAnswer(t);
                      setStage("confirm");
                    }}
                  />
                  <div className="flex flex-wrap justify-center gap-2 text-sm">
                    <button className="text-muted underline-offset-4 hover:text-ink hover:underline" onClick={() => setStage("confirm")}>
                      Type instead
                    </button>
                    {sampleAnswer && (
                      <>
                        <span className="text-muted">·</span>
                        <button
                          className="text-muted underline-offset-4 hover:text-ink hover:underline"
                          onClick={() => {
                            setAnswer(sampleAnswer);
                            setUsedSample(true);
                            setStage("confirm");
                          }}
                        >
                          Use the sample answer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {(stage === "confirm" || stage === "shaping") && (
                <div className="mt-4">
                  <label className="text-sm text-muted">Your answer, in your words. Fix anything we misheard.</label>
                  <textarea
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      setUsedSample(false);
                    }}
                    rows={4}
                    autoFocus={!answer}
                    placeholder="Say it like you'd tell a regular…"
                    className="mt-2 w-full rounded-xl border border-line bg-paper p-3 outline-none focus:border-ink"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="btn-accent"
                      disabled={answer.trim().length < 2 || stage === "shaping"}
                      onClick={() => shape(answer, usedSample)}
                    >
                      {stage === "shaping" ? "Fitting your words to each channel…" : "Make my posts"}
                    </button>
                    {stage === "confirm" && (
                      <button className="btn-ghost" onClick={() => setStage("ask")}>Record again</button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {(stage === "review" || stage === "sending") && (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 space-y-4">
              {take && (
                <div className="rounded-2xl border border-line bg-paper p-4">
                  <p className="text-xs font-medium text-muted">Your words</p>
                  <p className="mt-1">&ldquo;{take}&rdquo;</p>
                </div>
              )}

              {drafts.map((d) => {
                const c = channelById.get(d.channelId);
                if (!c) return null;
                const text = texts[d.id] ?? d.text;
                const failed = results.find((r) => r.draftId === d.id && !r.ok);
                return (
                  <div key={d.id} className="rounded-2xl border border-line p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <ChannelAvatar avatar={c.avatar} label={c.label} size={24} />
                      <span className="text-sm font-medium">{c.label}</span>
                      <span className="text-sm text-muted">{c.name}</span>
                      <span className={`ml-auto text-xs ${text.length > c.limit ? "text-danger" : "text-muted"}`}>
                        {text.length}/{c.limit}
                      </span>
                    </div>
                    <textarea
                      value={text}
                      onChange={(e) => setTexts((t) => ({ ...t, [d.id]: e.target.value }))}
                      rows={Math.min(10, Math.max(3, Math.ceil(text.length / 60)))}
                      className="w-full resize-y rounded-xl bg-paper p-3 text-sm outline-none focus:ring-1 focus:ring-ink"
                    />
                    {failed && <p className="mt-2 text-sm text-danger">Buffer said: {failed.error}</p>}
                  </div>
                );
              })}

              <div className="flex flex-wrap gap-2 pt-2">
                <button className="btn-primary" disabled={stage === "sending"} onClick={() => send("draft")}>
                  {stage === "sending" ? "Sending to Buffer…" : "Save as drafts in Buffer"}
                </button>
                <button className="btn-ghost" disabled={stage === "sending"} onClick={() => send("queue")}>Add to queue</button>
                <button className="btn-ghost" disabled={stage === "sending"} onClick={() => setPicking((p) => !p)} aria-expanded={picking}>
                  Pick a time
                </button>
                <button className="btn-ghost" disabled={stage === "sending"} onClick={() => send("idea")}>Save as an Idea</button>
              </div>
              <p className="text-xs text-muted">Add to queue uses the next free slot in each channel&apos;s posting schedule in Buffer.</p>
              {picking && (
                <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-line p-4">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted">Post on every channel at</span>
                    <input
                      type="datetime-local"
                      value={when}
                      onChange={(e) => setWhen(e.target.value)}
                      className="rounded-xl border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                    />
                  </label>
                  <button className="btn-accent" disabled={stage === "sending" || !when} onClick={() => send("scheduled")}>
                    Schedule
                  </button>
                </div>
              )}
              <button className="text-sm text-muted hover:text-ink" onClick={() => setStage("confirm")}>
                Change my answer
              </button>
            </motion.div>
          )}

          {stage === "sent" && (
            <motion.div key="sent" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-5 rounded-2xl bg-stage p-5 text-paper">
              <p className="font-heading text-2xl">
                {sentMode === "draft" ? "Saved as drafts in Buffer." : sentMode === "idea" ? "Saved as an Idea in Buffer." : "Scheduled in Buffer."}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {results.map((r, i) => {
                  const c = r.channelId ? channelById.get(r.channelId) : null;
                  return (
                    <li key={i} className={r.ok ? "text-accent" : "text-[#ff9b80]"}>
                      {r.ok ? <Check weight="bold" className="inline" /> : <X weight="bold" className="inline" />} {r.ideaId ? "Saved as an Idea" : c?.label ?? "Post"}
                      {r.ok && r.dueAt && sentMode !== "draft" ? `, goes out ${whenLabel(r.dueAt)}` : ""}
                      {!r.ok && r.error ? `: ${r.error}` : ""}
                    </li>
                  );
                })}
              </ul>
              <a href="https://publish.buffer.com" target="_blank" rel="noreferrer" className="btn mt-4 border border-white/20 text-paper hover:bg-white/10">Open Buffer <ArrowSquareOut /></a>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="mt-4 rounded-xl bg-accent-soft p-3 text-sm">{error}</p>}
      </div>
    </motion.div>
  );
}
