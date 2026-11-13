# Spotlight

[![CI](https://github.com/git-pixel22/spotlight/actions/workflows/ci.yml/badge.svg)](https://github.com/git-pixel22/spotlight/actions/workflows/ci.yml)

**You're already living your content. Spotlight helps you notice it.**

Spotlight is built on the [Buffer API](https://developers.buffer.com) for [Buffer Commit 2026](https://buffer.com/api/commit). It's for the one-person business: the potter, the barber, the florist, the home baker. Their week is full of moments worth posting, and they rarely have time to post them.

1. **Drop the week's photos.** The messy ones from your camera roll are fine.
2. **Answer one question out loud.** Spotlight picks the 3 to 5 moments worth sharing and asks what only you know ("Which flavour disappears first?"). Ten seconds each.
3. **Your words land in Buffer.** One post per channel, fitted to each network, saved as a draft, added to your queue, scheduled for a time you pick, or kept as a Buffer Idea.

Spotlight never writes for you. It notices, asks, and tidies (filler words out, character limits respected). It never invents facts, prices or claims.

Live at **[spotlight.meetrajat.com](https://spotlight.meetrajat.com)**. Demo video (1:22): [youtu.be/ifvzMvvgoEc](https://youtu.be/ifvzMvvgoEc).

## How it uses the Buffer API

- **OAuth app client** with PKCE and `state`, asking for least-privilege scopes: `account:read posts:read posts:write ideas:read ideas:write offline_access`.
- **Reads** your sent posts once to learn what you do and how you write, so there's no onboarding form. Reads scheduled posts and each channel's `postingSchedule` to show where your week goes quiet.
- **Writes** with `createPost` (drafts, queue or a custom time, with image assets and alt text, plus the per-network metadata Instagram, Facebook and Google Business need) and `createIdea` (with media).
- **Re-reads channels** when you open your profile, so a channel connected in Buffer after signing in shows up without signing out and back in.

Details that matter when acting on someone else's account:

- Access and refresh tokens are encrypted at rest (AES-256-GCM) and never reach the browser.
- Buffer rotates refresh tokens and revokes the whole grant if an old one is reused, so refreshes are serialised with a short database lease (`src/lib/buffer/tokens.ts`). Two parallel requests can't both refresh.
- Buffer fetches media at publish time, so photos are stored at stable public URLs (Vercel Blob) rather than signed links that expire.
- `429` responses are honoured: short resets are waited out, long ones are surfaced.
- Instagram only auto-publishes images between 4:5 and 1.91:1, and most phone photos are 3:4. Instagram posts get a centre-cropped copy when needed (`src/lib/media.ts`); other networks get the original.

## Guardrails

- **Your words, enforced in code.** After the model fits your answer to each network, `keepOwnWords` (`src/lib/ai/own-words.ts`) drops any sentence whose words didn't come from what you said, so an invented closing line or call to action never reaches you.
- **Questions that make good posts.** Followers see the photo and your answer, never the question, so Spotlight only asks open questions. A bare "yes" or a few words gets one nudge to add a line before posts are made.
- **Fair use of free quotas.** Per-user daily caps (photo checks, shaping, transcription, profile builds) count only successful calls, so one person can't drain the shared free tiers and a provider outage doesn't burn anyone's allowance.
- **Never stuck at the door.** If every free model is busy during onboarding, you get a basic profile built from simple counts over your posts, and can edit it, instead of an error.
- **Delete my data** removes your profile, photos, moments, drafts and Buffer tokens in one step.

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

Stack: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Drizzle ORM on Neon Postgres, Vercel Blob, `@google/genai`, `groq-sdk`, `motion`, `sharp`.

## Checks

```bash
npm test            # own-words guard, short-answer check, Instagram crop, every built-in question and sample post
npm run typecheck   # generates Next.js route types, then tsc
npm run lint
```

Tests use Node's built-in test runner with type stripping, so there's no test framework to install. CI runs all three on every push.

## Where things live

| Path | What it does |
|---|---|
| `src/lib/buffer/` | GraphQL client, token storage and refresh lease, channel sync |
| `src/lib/ai/` | Model fallback chains and daily caps, prompts, the own-words guard |
| `src/app/api/` | OAuth, uploads, transcription, moments, shaping, sending, profile, account deletion |
| `src/app/app/` | The signed-in app: home, photos, moments, profile |
| `tests/` | Unit tests |

## Photo credits

Every photo in the app is from [Unsplash](https://unsplash.com), used under the [Unsplash License](https://unsplash.com/license). Landing page photos live in `public/landing/`; the sample week's photos are on Vercel Blob (Buffer needs stable public URLs to publish them).

| File | Unsplash photo |
|---|---|
| Sample: `croissants` | [photo-1639390150902](https://images.unsplash.com/photo-1639390150902-8f1b3916e14b) |
| Sample: `cookie-box`, landing: `bakery-box` | [photo-1772651392135](https://images.unsplash.com/photo-1772651392135-b891a5e4f8a3) |
| Sample: `cookie-matcha` | [photo-1757345016219](https://images.unsplash.com/photo-1757345016219-7b3b8a1b9fba) |
| Sample: `cupcakes-festive` | [photo-1639098620661](https://images.unsplash.com/photo-1639098620661-3d47712d8a2a) |
| Sample: `display-case` | [photo-1705972018470](https://images.unsplash.com/photo-1705972018470-a89eda1c6ce4) |
| Sample: `display-trays` | [photo-1483695028939](https://images.unsplash.com/photo-1483695028939-5bb13f8648b0) |
| `barber` | [photo-1647140655214](https://images.unsplash.com/photo-1647140655214-e4a2d914971f) |
| `bike-workshop` | [photo-1760310936486](https://images.unsplash.com/photo-1760310936486-4dd450aab2a8) |
| `candles` | [photo-1764822553647](https://images.unsplash.com/photo-1764822553647-b3a680513eaf) |
| `florist` | [photo-1586973698216](https://images.unsplash.com/photo-1586973698216-0c4c285d7afd) |
| `flowers-vase` | [photo-1587317996237](https://images.unsplash.com/photo-1587317996237-eddd7e834d84) |
| `market` | [photo-1649533663539](https://images.unsplash.com/photo-1649533663539-03ac9165d80b) |
| `owner-cafe` | [photo-1753351052363](https://images.unsplash.com/photo-1753351052363-53ce102830eb) |
| `owner-potter` | [photo-1753164726596](https://images.unsplash.com/photo-1753164726596-0018b81ab993) |
| `plants` | [photo-1758524052155](https://images.unsplash.com/photo-1758524052155-f3a6fea3084e) |
| `pottery-hands` | [photo-1589051088132](https://images.unsplash.com/photo-1589051088132-06f36a22012a) |
| `pottery-wheel` | [photo-1595351298020](https://images.unsplash.com/photo-1595351298020-038700609878) |
| `sewing` | [photo-1517840545241](https://images.unsplash.com/photo-1517840545241-b491010a8af4) |
| `tattoo` | [photo-1775135981378](https://images.unsplash.com/photo-1775135981378-4e7c1767436d) |
| `threads` | [photo-1578353022142](https://images.unsplash.com/photo-1578353022142-09264fd64295) |
| `yoga-class` | [photo-1787647090390](https://images.unsplash.com/photo-1787647090390-890c94512cee) |

Made by Rajat for Buffer Commit 2026. Not affiliated with Buffer.
