"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Microphone, Stop } from "@phosphor-icons/react";

const MAX_SECONDS = 90;

function pickMimeType() {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  return types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";
}

/** Tap to talk, tap to stop. Sends the recording for transcription. */
export function Recorder({ onTranscript, disabled }: { onTranscript: (text: string) => void; disabled?: boolean }) {
  const [state, setState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
    recorder.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        transcribe(new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }));
      };
      rec.start();
      recorder.current = rec;
      setSeconds(0);
      setState("recording");
      timer.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Microphone blocked. Allow it in your browser, or type instead.");
    }
  }

  function stop() {
    if (timer.current) clearInterval(timer.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  async function transcribe(blob: Blob) {
    setState("transcribing");
    try {
      const form = new FormData();
      form.append("audio", new File([blob], "take", { type: blob.type }));
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (!json.text) throw new Error("Didn't catch that, try again?");
      onTranscript(json.text);
    } catch (e) {
      setError((e as Error).message || "Couldn't transcribe, try typing instead.");
    } finally {
      setState("idle");
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={disabled || state === "transcribing"}
        onClick={state === "recording" ? stop : start}
        className={`relative flex h-16 w-16 items-center justify-center rounded-full text-2xl transition ${
          state === "recording" ? "bg-ink text-accent" : "bg-accent text-ink ring-2 ring-ink hover:bg-[#f5bd00]"
        } disabled:opacity-50`}
        aria-label={state === "recording" ? "Stop recording" : "Start recording"}
      >
        {state === "recording" && (
          <motion.span
            className="absolute inset-0 rounded-full bg-accent"
            animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
        <span className="relative">{state === "recording" ? <Stop weight="fill" size={22} /> : <Microphone weight="fill" size={26} />}</span>
      </button>
      <p className="text-sm text-muted">
        {state === "recording"
          ? `Listening… ${seconds}s · tap to stop`
          : state === "transcribing"
            ? "Writing down what you said…"
            : "Tap and answer out loud"}
      </p>
      {error && <p className="text-center text-sm text-danger">{error}</p>}
    </div>
  );
}
