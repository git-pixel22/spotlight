# Spotlight: build spec

> You're already living your content. Spotlight helps you notice it.

Built for Buffer Commit 2026. Deadline: Nov 13, 11:59 PM PT (Sat Nov 14, 1:29 PM IST). Target submit: Sat Nov 14, ~10 AM IST.

## Who it's for

Buffer's core user: solo creators, early entrepreneurs, small businesses (Joel's "Down and Wide"). One person, little time, every hat. The content already exists in their day (photos on their phone, things customers said, the batch that sold out). The friction is noticing it and shaping it.

## The loop

**Notice** a moment → **capture your take** (voice, 10 seconds) → **posts in your own words** land in Buffer.

Stance: Spotlight does not ghostwrite. The AI notices, asks, and formats. The opinion and the words are yours.

## User flows

### 1. Landing page (public, `/`)
- Hero with the one-liner and "Connect Buffer" button
- **Demo video section**, prominent (placeholder until the video exists)
- How it works: 3 steps
- "Try it with a sample week" (sample mode, see 6)
- **Running on free tiers** section: names each provider and its real limits, explains the fallback chain and sample mode
- Footer: privacy page, GitHub link, "Built for Buffer Commit"

### 2. Connect (OAuth)
- `GET /api/auth/login`: create PKCE verifier + challenge (S256) and `state`, keep both in a signed HttpOnly cookie, redirect to `https://auth.buffer.com/auth` with scopes `account:read posts:read posts:write ideas:read ideas:write offline_access`
- `GET /api/auth/callback`: verify `state`, exchange code at `https://auth.buffer.com/token` (form-encoded, client_secret in body), store tokens **encrypted** (AES-256-GCM) in Postgres, set session cookie, go to onboarding
- Token refresh in one place (`getAccessToken(userId)`): refresh ~2 min before expiry, under a Postgres row lock (`SELECT ... FOR UPDATE`) so parallel requests can't double-refresh. Refresh tokens rotate and reuse revokes the grant, so the new token is saved before it's used.

### 3. Onboarding: "Here's what we noticed about you" (the first magic moment)
- Fetch account, organizations, channels (service, name, avatar, timezone, postingSchedule)
- Fetch the last ~50 **sent** posts across channels
- One AI call builds a profile: what the business is, what they post about, voice (tone, length, emoji and hashtag habits, language), topics already covered
- Show it as an editable card ("You run a home bakery in Pune. You post about weekend batches and custom cakes, warm and short, a few emojis."). One text box to correct it.
- If no sent posts: ask "What do you do?" in one line instead
- Pick which channels Spotlight drafts for (default: all)

### 4. Home: "Today" (`/app`)
- Three big capture actions: **Drop this week's photos** · **Record a thought** · **Paste a link** (link = stretch)
- **Queue strip**: per channel, when it next posts and where it goes quiet ("Instagram: nothing after Wed"). Data: `posts` filtered by `status: scheduled`, plus channel `postingSchedule`.
- **Calendar moments**: 2 to 3 upcoming dates that fit this business (static curated list for Nov to Jan, filtered by AI for business type and channel timezone/region). Each is a prompt card: "Thanksgiving is in 2 weeks. Got a photo of your festive bake?"
- **Moments inbox**: cards waiting for your take, and recent sends

### 5. Photo dump (the hero flow)
1. Pick up to 20 photos. Resize in the browser to ~1280px JPEG (saves upload time and AI tokens), read EXIF date where present.
2. Upload to Vercel Blob (public, stable URLs, which Buffer needs since it fetches media at publish time).
3. **One** vision call with all photos + the profile: returns 3 to 5 moments. Each moment: photo IDs (grouped), what it sees, why it's post-worthy, and **one specific question** ("Is this the new cardamom loaf? What made you try it?").
4. Moment cards appear one by one. For each: **hold to talk** (MediaRecorder) or type.
5. Transcribe (Groq Whisper) → **shape** call: clean filler words, keep the user's phrasing, produce one version per selected channel within its character limit, plus alt text per image. A visible "your words" indicator shows what's verbatim.
6. Review screen: per-channel previews (editable), photos attached.

### 6. Send to Buffer
Per moment, one choice (default **Save as draft**, the safe option for judges):
- **Save as draft**: `createPost` with `saveToDraft: true`, `assets` (images with alt text)
- **Add to queue**: `createPost` with `mode: addToQueue`, `schedulingType: automatic`
- **Save as Idea**: `createIdea` with `content { title, text, media, date }`
Show success with a link to open Buffer. Store returned post/idea IDs.

### 7. Record a thought (drop-in)
Voice note anytime → transcribe → AI decides if it's a post (or several) → same shape + review + send flow. Optional photo attach.

### 8. Sample mode ("Try it with a sample week")
- A bundled sample bakery week (rehosted royalty-free photos) with **precomputed** profile and moments
- Judges can record their own answer (1 transcription call) or use the sample answer (0 calls)
- Sending to Buffer is **real** (requires Buffer login). So the end-to-end proof works even if every AI quota is exhausted.

## AI: free tiers with a fallback chain

One router: try models in order, move to the next on 429 / 503 / timeout / invalid JSON. Structured output validated with zod. Log the model used per call.

| Task | Order |
|---|---|
| Vision (photo dump) | gemini-3.5-flash → gemini-3.5-flash-lite → gemma-4-31b-it → groq qwen/qwen3.8-27b |
| Text (profile, shape, calendar) | gemini-3.5-flash → gemini-3.1-flash-lite → groq openai/gpt-oss-120b → gemma-4-31b-it |
| Transcription | groq whisper-large-v3-turbo → whisper-large-v3 → gemini-3.5-flash (audio input) |

Quota protection: one batched vision call per dump, images downscaled, per-user daily caps (e.g. 5 dumps, 30 voice takes), cached profile.

Verified working with our keys on Nov 12: gemini-3.5-flash, gemini-3.5-flash-lite, gemini-3.1-flash-lite, gemma-4-31b-it, groq qwen3.8-27b (vision), groq whisper. Not available: gemini-2.5-* (closed to new users); gemini-3.8-flash was overloaded.

## Stack (all free)

- Next.js (App Router, TypeScript) on Vercel Hobby: route handlers are the backend
- Neon Postgres (via Vercel Marketplace) + Drizzle ORM
- Vercel Blob for photos
- `iron-session` for the session cookie; AES-256-GCM for tokens at rest
- Tailwind CSS, hand-designed UI (Delight award: warm, small-business feel, mobile-first)
- Domain: `spotlight.meetrajat.com` (Namecheap CNAME → Vercel)

## Data model

- `users`: id, buffer_account_id, name, email, organization_id, profile (jsonb), selected_channel_ids, created_at
- `buffer_tokens`: user_id (pk), access_token_enc, refresh_token_enc, expires_at, scope, updated_at
- `media`: id, user_id, blob_url, width, height, taken_at, created_at
- `moments`: id, user_id, source (photo_dump | voice | calendar | link | sample), media_ids, title, observation, question, take_transcript, status (new | answered | sent | dismissed), created_at
- `drafts`: id, moment_id, channel_id, service, text, alt_texts (jsonb), buffer_post_id, buffer_idea_id, send_mode, status, created_at
- `ai_calls`: id, user_id, task, model, ok, latency_ms, created_at (powers daily caps and the "free tier" transparency)

## Craft details judges can notice

- Least-privilege scopes (5 + offline_access)
- Race-safe token refresh, encrypted tokens, PKCE + state even on a private client
- `editPost` replaces the whole post, so any edit sends text, assets and metadata back
- Character limits per network; images with alt text
- Rate-limit headers from Buffer respected (`RateLimit`, `Retry-After`)
- Channel list and org ID cached (Buffer's "efficient usage" guidance)
- Honest free-tier section, and sample mode that still does real Buffer calls

## Cut list (in order, if time runs short)

1. Paste a link drop-in
2. Calendar moments (fall back to a static card)
3. Record a thought as a standalone flow (keep voice inside the photo dump)
4. Queue strip details (keep a simple "next post" line)

Already out of v1, mentioned as "what's next" in the write-up: the news radar for experts, email nudges, multi-account support, analytics.

## Schedule (IST)

| When | What |
|---|---|
| Thu Nov 12, morning | Infra (Vercel, Neon, Blob, DNS). Scaffold, OAuth, onboarding |
| Thu Nov 12, afternoon | Photo dump, voice, shape, send to Buffer |
| Thu Nov 12, evening | Queue strip, calendar, sample mode, landing page. Deploy. First #BufferCommit LinkedIn post |
| Fri Nov 13 | Test on real Buffer, fix, polish, logo, privacy page. Demo video (Remotion + Fable). Second LinkedIn post |
| Sat Nov 14, by 10 AM | Write-up, final checks, submit |
