import "server-only";
import { z } from "zod";
import type { ChannelInfo, Profile } from "@/lib/db/schema";
import { ruleFor } from "@/lib/channels";

// ---------- Profile: "Here's what we noticed about you" ----------

export const profileSchema = z.object({
  summary: z.string(),
  business: z.string(),
  topics: z.array(z.string()).max(8),
  voice: z.object({
    tone: z.string(),
    length: z.string(),
    emoji: z.string(),
    hashtags: z.string(),
    language: z.string(),
  }),
  recentTopics: z.array(z.string()).max(10),
});

export const PROFILE_SYSTEM = `You help a busy small-business owner or creator who posts on social media.
From their recent posts, describe who they are and how they write, so a tool can later help them post in their own voice.
Be specific and concrete, never generic. Write the summary in second person ("You run...") in one or two warm, plain sentences.
If the posts are personal or the person is not a business, describe them as a person (for example "You're a backend engineer who posts about work life").
Respond with JSON only.`;

export function profilePrompt(posts: { service: string; text: string }[], selfDescription?: string) {
  const lines = posts.map((p, i) => `${i + 1}. [${p.service}] ${p.text.replace(/\s+/g, " ").slice(0, 400)}`);
  return `${selfDescription ? `In their own words: "${selfDescription}"\n\n` : ""}Their recent posts (newest first):
${lines.join("\n") || "(no posts yet)"}

Return JSON:
{
  "summary": "1-2 sentences, second person",
  "business": "short noun phrase for what they do, e.g. 'home bakery', 'yoga studio', 'backend engineer'",
  "topics": ["what they usually post about", "..."],
  "voice": {
    "tone": "e.g. warm and playful",
    "length": "e.g. short, 1-3 lines",
    "emoji": "e.g. a few per post / none",
    "hashtags": "e.g. none / 2-3 at the end",
    "language": "main language, e.g. English, Hinglish"
  },
  "recentTopics": ["specific things they posted about recently, to avoid repeats"]
}`;
}

// ---------- Moments: notice the post-worthy bits in a photo dump ----------

export const momentsSchema = z.object({
  moments: z
    .array(
      z.object({
        title: z.string(),
        photoIndexes: z.array(z.number().int().min(0)).min(1).max(4),
        observation: z.string(),
        question: z.string(),
      }),
    )
    .min(1)
    .max(5),
});

export const MOMENTS_SYSTEM = `You are a thoughtful friend helping a busy person notice the content hiding in their week.
You look at their photos and pick the moments genuinely worth sharing: a finished piece of work, a customer, a behind-the-scenes mess, something new, a small win, a seasonal touch.
Skip blurry, duplicate, private-looking (documents, screenshots with personal data, receipts) or meaningless photos.
For each moment, ask ONE short, specific question that pulls out the story only the owner knows: who, why, what happened, what it meant. Never ask generic questions like "Tell me more about this".
You never write the post. You notice and you ask. Respond with JSON only.`;

export function momentsPrompt(profile: Profile | null, photoMeta: { index: number; takenAt?: string }[], each = false) {
  return `About the person: ${profile?.summary ?? "unknown, a small business or creator"}
Things they posted about recently (avoid repeating these): ${profile?.recentTopics.join(", ") || "none"}

There are ${photoMeta.length} photos, in order, indexed from 0.${photoMeta.some((p) => p.takenAt) ? `\nTaken at: ${photoMeta.map((p) => `#${p.index} ${p.takenAt ?? "?"}`).join(", ")}` : ""}

${
    each
      ? "The person chose these photos themselves. Make exactly one moment per photo, in the same order: moment i uses photoIndexes [i]."
      : "Pick 3 to 5 moments (fewer if the photos don't support more). Group photos of the same moment together. If there are 3 photos or fewer, give each photo its own moment unless two show the same thing."
  }
Return JSON:
{
  "moments": [
    {
      "title": "3-6 word label, e.g. 'The cardamom loaf debut'",
      "photoIndexes": [0, 2],
      "observation": "one sentence on what you see, warm and concrete",
      "question": "one specific question, max 15 words"
    }
  ]
}`;
}

// ---------- Shape: their words, fitted to each network ----------

export const shapeSchema = z.object({
  cleanedTake: z.string(),
  posts: z.array(z.object({ channelId: z.string(), text: z.string() })),
  altTexts: z.array(z.string()),
});

export const SHAPE_SYSTEM = `You format a person's own spoken words into social posts. You are an editor, not a writer.
Rules:
- Use their words and phrasing. Keep at least 80% of each post's words from what they said.
- You may remove filler (um, like, you know, so yeah), fix grammar lightly, reorder for clarity, cut to fit, and add line breaks.
- Never invent facts, opinions, prices, names or claims they did not say.
- Never add sentences of your own: no intros, no closing lines, no reflections ("I love...", "Can't wait..."), no questions to the audience, no calls to action. Every sentence must come from what they said.
- Never use marketing clichés ("elevate", "unleash", "game-changer", "dive in", "look no further", "in today's world").
- Never use em dashes. Use commas or full stops.
- Emojis and hashtags only if their voice profile uses them, and only as much as it says.
- Each post must fit its character limit.
- Alt text: one plain, literal description per photo for blind and low-vision readers, under 150 characters.
Respond with JSON only.`;

export function shapePrompt(args: {
  profile: Profile | null;
  momentTitle: string;
  question: string;
  take: string;
  channels: ChannelInfo[];
  photoCount: number;
  photoObservation?: string | null;
}) {
  const targets = args.channels
    .map((c) => {
      const r = ruleFor(c.service);
      return `- channelId "${c.id}": ${r.label}, max ${r.limit} characters, style: ${r.style}`;
    })
    .join("\n");
  const v = args.profile?.voice;
  return `Voice profile: ${v ? `tone ${v.tone}; length ${v.length}; emoji ${v.emoji}; hashtags ${v.hashtags}; language ${v.language}` : "unknown, keep it plain"}

The moment: ${args.momentTitle}${args.photoObservation ? ` (photo: ${args.photoObservation})` : ""}
We asked them: "${args.question}"
They said (transcribed voice note): """${args.take}"""

Write one post per channel:
${targets}

Return JSON:
{
  "cleanedTake": "their answer with filler removed, otherwise unchanged",
  "posts": [{ "channelId": "...", "text": "..." }],
  "altTexts": [${args.photoCount ? `"one per photo, ${args.photoCount} total"` : ""}]
}`;
}
