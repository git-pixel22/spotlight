# Spotlight

**You're already living your content. Spotlight helps you notice it.**

Spotlight is built on the [Buffer API](https://developers.buffer.com) for [Buffer Commit 2026](https://buffer.com/api/commit). It's for the one-person business: the potter, the barber, the florist, the home baker. Their week is full of moments worth posting, and they rarely have time to post them.

1. **Drop the week's photos.** The messy ones from your camera roll are fine.
2. **Answer one question out loud.** Spotlight picks the 3 to 5 moments worth sharing and asks what only you know ("Which flavour disappears first?"). Ten seconds each.
3. **Your words land in Buffer.** One post per channel, fitted to each network, saved as a draft, queued, or kept as a Buffer Idea.

Spotlight never writes for you. It notices, asks, and tidies (filler words out, character limits respected). It never invents facts, prices or claims.

Live at **[spotlight.meetrajat.com](https://spotlight.meetrajat.com)**.

## How it uses the Buffer API

- **OAuth app client** with PKCE and `state`, asking for least-privilege scopes: `account:read posts:read posts:write ideas:read ideas:write offline_access`.
- **Reads** your sent posts once to learn what you do and how you write, so there's no onboarding form. Reads scheduled posts and each channel's `postingSchedule` to show where your week goes quiet.
- **Writes** with `createPost` (drafts or queue, with image assets and alt text, plus the per-network metadata Instagram, Facebook and Google Business need) and `createIdea` (with media).

Details that matter when acting on someone else's account:

- Access and refresh tokens are encrypted at rest (AES-256-GCM) and never reach the browser.
- Buffer rotates refresh tokens and revokes the whole grant if an old one is reused, so refreshes are serialised with a short database lease (`src/lib/buffer/tokens.ts`). Two parallel requests can't both refresh.
- Buffer fetches media at publish time, so photos are stored at stable public URLs (Vercel Blob) rather than signed links that expire.
- `429` responses are honoured: short resets are waited out, long ones are surfaced.

## The $0 stack

Spotlight runs entirely on free tiers:

| Piece | Free tier | Used for |
|---|---|---|
| Gemini (Google AI Studio) | Small per-model daily allowance | Finding moments in photos, fitting words to each network |
| Groq | Whisper: 2,000 requests a day | Voice transcription, backup models |
| Vercel Hobby, Neon, Vercel Blob | 1 GB database, 1 GB photos | Hosting, Postgres, photo storage |
| Buffer API | Free on every Buffer plan | Drafts, queue, Ideas |

Every AI task has a fallback chain across providers (`src/lib/ai/router.ts`). Vision tries Gemini 3.5 Flash, then Flash-Lite, then Gemma 4, then Qwen on Groq. A rate limit, outage or malformed answer moves on to the next model. A precomputed sample week runs the whole flow, real Buffer drafts included, even when every AI quota is used up.

## Running it locally

```bash
npm install
cp .env.example .env.local   # fill in the values
npx drizzle-kit push         # create tables
npm run dev -- --experimental-https   # Buffer requires an HTTPS redirect URI, even on localhost
```

Stack: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Drizzle ORM on Neon Postgres, Vercel Blob, `@google/genai`, `groq-sdk`, `motion`.

Made by Rajat for Buffer Commit 2026. Not affiliated with Buffer.
