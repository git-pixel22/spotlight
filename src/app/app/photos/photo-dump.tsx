"use client";
 

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import exifr from "exifr";
import { Images, Plus, X } from "@phosphor-icons/react";

const MAX_PHOTOS = 20;
const MAX_EDGE = 1600;

type Item = { id: string; file: File; preview: string; takenAt?: string; url?: string; failed?: boolean };

async function resize(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't read photo"))), "image/jpeg", 0.85),
  );
}

async function readTakenAt(file: File) {
  try {
    const exif = await exifr.parse(file, ["DateTimeOriginal"]);
    const d = exif?.DateTimeOriginal;
    return d instanceof Date ? d.toISOString() : undefined;
  } catch {
    return undefined;
  }
}

export function PhotoDump() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [stage, setStage] = useState<"pick" | "uploading" | "thinking" | "found">("pick");
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [uploaded, setUploaded] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function addFiles(list: FileList | null) {
    if (!list) return;
    const files = [...list].filter((f) => f.type.startsWith("image/")).slice(0, MAX_PHOTOS - items.length);
    const next = await Promise.all(
      files.map(async (file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        takenAt: await readTakenAt(file),
      })),
    );
    setItems((prev) => [...prev, ...next]);
  }

  async function uploadOne(item: Item): Promise<Item> {
    try {
      const blob = await resize(item.file);
      const form = new FormData();
      form.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return { ...item, url: json.url };
    } catch {
      return { ...item, failed: true };
    } finally {
      setUploaded((n) => n + 1);
    }
  }

  async function findMoments() {
    setError(null);
    setStage("uploading");
    setUploaded(0);
    // Upload three at a time: fast, without flooding a phone's connection.
    const done: Item[] = [];
    const queue = [...items];
    await Promise.all(
      Array.from({ length: 3 }, async () => {
        while (queue.length) done.push(await uploadOne(queue.shift()!));
      }),
    );
    const ordered = items.map((i) => done.find((d) => d.id === i.id)!).filter((i) => i.url);
    if (!ordered.length) {
      setError("Couldn't upload those photos. Try JPEG or PNG.");
      setStage("pick");
      return;
    }

    setStage("thinking");
    const res = await fetch("/api/moments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos: ordered.map((i) => ({ url: i.url, takenAt: i.takenAt })) }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Something went wrong");
      setStage("pick");
      return;
    }
    // Light up the photos Spotlight picked, hold the moment, then move on.
    const picked = new Set<string>(
      (json.moments ?? []).flatMap((m: { photos: { url: string }[] }) => m.photos.map((p) => p.url)),
    );
    setChosen(new Set(ordered.filter((i) => picked.has(i.url!)).map((i) => i.id)));
    setStage("found");
    await new Promise((r) => setTimeout(r, 1600));
    router.push(json.moments?.[0] ? `/app/moments?focus=${json.moments[0].id}` : "/app/moments");
  }

  const busy = stage !== "pick";
  const onStage = stage === "thinking" || stage === "found";

  return (
    <div className="mt-8">
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {items.length === 0 ? (
        <button
          onClick={() => input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-surface px-6 py-16 text-center transition hover:border-ink"
        >
          <Images size={40} weight="duotone" className="text-ink" aria-hidden />
          <span className="font-medium">Choose photos</span>
          <span className="text-sm text-muted">Up to {MAX_PHOTOS}. Or drag them here.</span>
        </button>
      ) : (
        <>
          <div
            className={`relative grid grid-cols-3 gap-2 overflow-hidden rounded-[20px] transition-colors duration-700 sm:grid-cols-5 ${
              onStage ? "bg-stage p-3" : ""
            }`}
          >
            {stage === "thinking" && <SpotlightSweep />}
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`group relative aspect-square overflow-hidden rounded-xl bg-surface-2 ${
                    stage === "found" && chosen.has(item.id) ? "z-10 ring-4 ring-accent outline outline-2 outline-ink" : ""
                  }`}
                >
                  <motion.img
                    src={item.preview}
                    alt=""
                    className="h-full w-full object-cover"
                    animate={{
                      filter: !onStage ? "brightness(1)" : stage === "found" && chosen.has(item.id) ? "brightness(1.05)" : "brightness(0.32)",
                      scale: stage === "found" && chosen.has(item.id) ? 1.04 : 1,
                    }}
                    transition={{ duration: 0.6 }}
                  />
                  {!busy && (
                    <button
                      onClick={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
                      className="absolute right-1 top-1 hidden h-6 w-6 rounded-full bg-black/60 text-xs text-white group-hover:block"
                      aria-label="Remove photo"
                    >
                      <X size={14} weight="bold" className="mx-auto" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {!busy && items.length < MAX_PHOTOS && (
              <button
                onClick={() => input.current?.click()}
                className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-line text-muted hover:border-ink"
                aria-label="Add more photos"
              >
                <Plus size={24} />
              </button>
            )}
          </div>

          <div className="mt-6">
            {stage === "pick" && (
              <button onClick={findMoments} className="btn-accent w-full py-3 text-base">
                Find my moments
              </button>
            )}
            {stage !== "pick" && (
              <div className="panel flex items-center gap-4 p-5">
                <motion.span
                  className="block h-3 w-3 shrink-0 rounded-full bg-accent"
                  animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
                <p className="text-muted">
                  {stage === "uploading"
                    ? `Uploading ${Math.min(uploaded + 1, items.length)} of ${items.length}…`
                    : stage === "thinking"
                      ? "Looking through your week for the moments worth sharing…"
                      : `Found ${chosen.size} photo${chosen.size === 1 ? "" : "s"} worth a post.`}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {error && <p className="mt-4 rounded-xl bg-accent-soft p-4 text-sm">{error}</p>}
    </div>
  );
}

/** A warm pool of light that wanders over the dimmed photos while the AI looks. */
function SpotlightSweep() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
      style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--glow) 55%, transparent) 0%, transparent 70%)" }}
      initial={{ left: "15%", top: "30%" }}
      animate={{ left: ["15%", "80%", "45%", "85%", "20%", "60%"], top: ["30%", "25%", "70%", "65%", "75%", "35%"] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
