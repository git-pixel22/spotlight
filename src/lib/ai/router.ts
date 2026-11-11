import "server-only";
import { GoogleGenAI } from "@google/genai";
import Groq, { toFile } from "groq-sdk";
import type { z } from "zod";
import { and, count, eq, gte } from "drizzle-orm";
import { db, schema } from "@/lib/db";

// Spotlight runs entirely on free tiers. Every task has an ordered chain of
// models across two providers; a rate limit, outage or bad JSON on one moves
// to the next, so a single provider hitting its cap doesn't break the app.

type Provider = "gemini" | "groq";
type ModelRef = { provider: Provider; model: string };

const VISION_CHAIN: ModelRef[] = [
  { provider: "gemini", model: "gemini-3.5-flash" },
  { provider: "gemini", model: "gemini-3.5-flash-lite" },
  { provider: "gemini", model: "gemma-4-31b-it" },
  { provider: "groq", model: "qwen/qwen3.8-27b" },
];

const TEXT_CHAIN: ModelRef[] = [
  { provider: "gemini", model: "gemini-3.5-flash" },
  { provider: "gemini", model: "gemini-3.1-flash-lite" },
  { provider: "groq", model: "openai/gpt-oss-120b" },
  { provider: "gemini", model: "gemma-4-31b-it" },
];

const TIMEOUT_MS = 45_000;

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export type ImageInput = { mimeType: string; data: string }; // base64

export class AllModelsFailedError extends Error {}

async function logCall(userId: string | null, task: string, model: string, ok: boolean, started: number, error?: string) {
  await db
    .insert(schema.aiCalls)
    .values({ userId, task, model, ok, latencyMs: Date.now() - started, error: error?.slice(0, 500) })
    .catch(() => {});
}

export function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/```(?:json)?/g, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  if (start === -1 || end === -1) throw new Error("No JSON in model output");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callGemini(ref: ModelRef, system: string, prompt: string, images: ImageInput[]) {
  // Gemma on the Gemini API takes neither system instructions nor JSON mode.
  const isGemma = ref.model.startsWith("gemma");
  const parts = [
    ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
    { text: isGemma ? `${system}\n\n${prompt}` : prompt },
  ];
  const res = await gemini.models.generateContent({
    model: ref.model,
    contents: [{ role: "user", parts }],
    config: {
      ...(isGemma ? {} : { systemInstruction: system, responseMimeType: "application/json" }),
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    },
  });
  return res.text ?? "";
}

async function callGroq(ref: ModelRef, system: string, prompt: string, images: ImageInput[]) {
  const userContent = images.length
    ? [
        { type: "text" as const, text: prompt },
        // Groq's vision models accept a handful of images per request.
        ...images.slice(0, 5).map((img) => ({
          type: "image_url" as const,
          image_url: { url: `data:${img.mimeType};base64,${img.data}` },
        })),
      ]
    : prompt;
  const res = await groq.chat.completions.create(
    {
      model: ref.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    },
    { signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  return res.choices[0]?.message?.content ?? "";
}

export async function generateJson<T>(opts: {
  task: string;
  userId: string | null;
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  images?: ImageInput[];
}): Promise<{ data: T; model: string }> {
  const images = opts.images ?? [];
  const chain = images.length ? VISION_CHAIN : TEXT_CHAIN;
  const failures: string[] = [];

  for (const ref of chain) {
    const started = Date.now();
    try {
      const text =
        ref.provider === "gemini"
          ? await callGemini(ref, opts.system, opts.prompt, images)
          : await callGroq(ref, opts.system, opts.prompt, images);
      const parsed = opts.schema.safeParse(extractJson(text));
      if (!parsed.success) throw new Error(`Invalid shape: ${parsed.error.message.slice(0, 200)}`);
      await logCall(opts.userId, opts.task, ref.model, true, started);
      return { data: parsed.data, model: ref.model };
    } catch (err) {
      const msg = (err as Error).message ?? String(err);
      failures.push(`${ref.model}: ${msg.slice(0, 160)}`);
      await logCall(opts.userId, opts.task, ref.model, false, started, msg);
    }
  }
  throw new AllModelsFailedError(`All models are busy right now. ${failures.join(" | ")}`);
}

export async function transcribe(userId: string | null, audio: Buffer, mimeType: string): Promise<string> {
  const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
  const failures: string[] = [];

  for (const model of ["whisper-large-v3-turbo", "whisper-large-v3"]) {
    const started = Date.now();
    try {
      const res = await groq.audio.transcriptions.create(
        { file: await toFile(audio, `take.${ext}`, { type: mimeType }), model, response_format: "json" },
        { signal: AbortSignal.timeout(TIMEOUT_MS) },
      );
      await logCall(userId, "transcribe", model, true, started);
      return res.text.trim();
    } catch (err) {
      failures.push(`${model}: ${(err as Error).message}`);
      await logCall(userId, "transcribe", model, false, started, (err as Error).message);
    }
  }

  // Last resort: Gemini listens to the audio directly.
  const started = Date.now();
  try {
    const res = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: audio.toString("base64") } },
            { text: "Transcribe this voice note verbatim. Output only the transcript." },
          ],
        },
      ],
      config: { abortSignal: AbortSignal.timeout(TIMEOUT_MS) },
    });
    await logCall(userId, "transcribe", "gemini-3.5-flash", true, started);
    return (res.text ?? "").trim();
  } catch (err) {
    failures.push(`gemini: ${(err as Error).message}`);
    await logCall(userId, "transcribe", "gemini-3.5-flash", false, started, (err as Error).message);
  }
  throw new AllModelsFailedError(`Transcription is busy right now. ${failures.join(" | ")}`);
}

// Per-user daily caps protect the shared free-tier quota during judging.
export const DAILY_CAPS: Record<string, number> = {
  moments: 8,
  shape: 40,
  transcribe: 40,
  profile: 6,
};

export async function underDailyCap(userId: string, task: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [row] = await db
    .select({ n: count() })
    .from(schema.aiCalls)
    .where(and(eq(schema.aiCalls.userId, userId), eq(schema.aiCalls.task, task), eq(schema.aiCalls.ok, true), gte(schema.aiCalls.createdAt, since)));
  return (row?.n ?? 0) < (DAILY_CAPS[task] ?? 20);
}
