"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarBlank } from "@phosphor-icons/react";

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Something went wrong");
  return json;
}

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(url: string, body?: unknown) {
    setBusy(true);
    setError(null);
    try {
      const json = await postJson(url, body);
      const id = json.moment?.id ?? json.moments?.[0]?.id;
      router.push(id ? `/app/moments?focus=${id}` : "/app/moments");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return { busy, error, run };
}

/** A small waveform that comes alive on hover, standing in for "say it". */
function Waveform() {
  const bars = [10, 18, 28, 16, 34, 22, 12, 26, 18, 8];
  return (
    <span className="flex h-10 items-center gap-[3px]" aria-hidden>
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[4px] origin-center rounded-full bg-ink transition-transform duration-300 group-hover:animate-[wave_0.9s_ease-in-out_infinite]"
          style={{ height: h, animationDelay: `${i * 70}ms` }}
        />
      ))}
    </span>
  );
}

export function ThoughtTile() {
  const { busy, error, run } = useAction();
  return (
    <button
      onClick={() => run("/api/moments/voice")}
      disabled={busy}
      className="group panel flex flex-col justify-between gap-4 p-5 text-left ring-ink/10 transition hover:ring-2"
    >
      <Waveform />
      <span>
        <span className="font-heading block text-xl">Record a thought</span>
        <span className="mt-1 block text-sm text-muted">{error ?? (busy ? "Opening…" : "Something happened today? Just say it.")}</span>
      </span>
    </button>
  );
}

export function SampleTile({ photo }: { photo: string }) {
  const { busy, error, run } = useAction();
  return (
    <button
      onClick={() => run("/api/sample")}
      disabled={busy}
      className="group panel flex flex-col justify-between gap-4 p-5 text-left ring-ink/10 transition hover:ring-2"
    >
      <img src={photo} alt="" className="h-10 w-10 rounded-lg object-cover transition group-hover:scale-105" />
      <span>
        <span className="font-heading block text-xl">Try a sample week</span>
        <span className="mt-1 block text-sm text-muted">{error ?? (busy ? "Loading…" : "A home bakery's week, ready to answer.")}</span>
      </span>
    </button>
  );
}

export function CalendarPrompt({ name, date, daysAway, question }: { name: string; date: string; daysAway: number; question: string }) {
  const { busy, error, run } = useAction();
  const when = daysAway === 0 ? "Today" : daysAway === 1 ? "Tomorrow" : `In ${daysAway} days`;
  const d = new Date(`${date}T12:00:00`);
  return (
    <button
      onClick={() => run("/api/moments/voice", { source: "calendar", title: name, question })}
      disabled={busy}
      className="flex w-full items-center gap-4 py-4 text-left transition hover:opacity-80"
    >
      <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-surface text-center leading-none">
        <span className="text-[10px] text-muted">{d.toLocaleDateString("en-US", { month: "short" })}</span>
        <span className="font-heading text-lg">{d.getDate()}</span>
      </span>
      <span className="flex-1">
        <span className="font-medium">{name}</span> <span className="text-sm text-muted">{when}</span>
        <span className="block text-sm text-muted">{error ?? question}</span>
      </span>
      <CalendarBlank size={18} className="hidden shrink-0 text-taupe sm:block" />
    </button>
  );
}
