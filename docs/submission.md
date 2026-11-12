# Buffer Commit submission: Spotlight

**Live:** https://spotlight.meetrajat.com
**Code:** https://github.com/git-pixel22/spotlight
**Demo:** (2-minute video link)

## What it is

Spotlight helps one-person businesses notice the content already in their week, and gets it into Buffer in their own words.

Drop the week's photos. Spotlight picks the 3 to 5 moments worth sharing and asks one question about each, the kind only the owner can answer ("Which flavour in this box disappears first?"). You answer out loud in about ten seconds. Your answer becomes a post for every connected channel, fitted to each network, and lands in Buffer as a draft, in your queue, at a time you pick, or as an Idea.

## Why

Buffer's core users are creators, early entrepreneurs and small businesses, people wearing every hat. Their problem usually isn't scheduling. It's that the potter, the barber or the home baker has a camera roll full of good moments and no time or energy to turn them into posts. Most AI tools answer that by writing posts for them, which reads like everyone else's AI posts.

Spotlight takes the opposite stance: it never writes for you. It notices, it asks, and it tidies. Filler words go and each network's limits are respected, but every sentence comes from what you actually said. That rule is enforced in code: a guard drops any sentence whose words didn't come from your answer, so it doesn't depend on the model behaving.

## How it uses the Buffer API

- OAuth app client with PKCE and state, least-privilege scopes (`account:read posts:read posts:write ideas:read ideas:write offline_access`).
- Reads your sent posts once to learn what you do and how you write, so there's no onboarding form.
- Reads scheduled posts and each channel's posting schedule to show where your week goes quiet.
- `createPost` for drafts, queue (showing the slot Buffer picked) and custom times, with image assets, alt text, and per-network metadata; `createIdea` with media.
- Tokens are encrypted at rest, and refreshes are serialised so a rotated refresh token is never reused (reuse revokes the whole grant).

## Built on a $0 stack

Gemini and Groq free tiers for vision, writing and Whisper transcription; Vercel, Neon and Vercel Blob free tiers for hosting, database and photos; the Buffer API, free on every plan. Every AI step has a fallback chain across providers (Gemini Flash, Flash-Lite, Gemma, Qwen on Groq), and a sample week runs the full flow, real Buffer drafts included, even with zero AI quota.

## What's next

- **Radar for people in fast-moving fields:** the same notice-and-ask loop, but triggered by news on your beat ("This just broke. You've posted about this six times this year. What's your take?").
- Recurring prompts by email ("Anything worth sharing this week? Just reply with a photo").
- Video moments for Reels, TikTok and Shorts.

Made by Rajat for Buffer Commit 2026.
