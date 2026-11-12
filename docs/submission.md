# Buffer Commit submission: Spotlight

**Live:** https://spotlight.meetrajat.com
**Code:** https://github.com/git-pixel22/spotlight
**Demo video (1:22):** https://youtu.be/ifvzMvvgoEc

## What it is

Spotlight helps one-person businesses notice the content already in their week, and gets it into Buffer in their own words.

Drop the week's photos. Spotlight picks the 3 to 5 moments worth sharing (you can bring back any photo it skipped) and asks one question about each, the kind only the owner can answer: "Which flavour in this box disappears first?" You answer out loud in about ten seconds. Your answer becomes a post for every connected channel, fitted to each network, and lands in Buffer as a draft, in your queue, at a time you pick, or as an Idea.

## Why

Buffer's core users are creators, early entrepreneurs and small businesses, people wearing every hat. For them, scheduling is the easy part. The potter, the barber or the home baker has a camera roll full of good moments and no time or energy to turn them into posts. Most AI tools respond by writing the posts for them, and those posts read like everyone else's.

Spotlight never writes for you. It finds the moments and asks the questions; you supply the words. It removes filler and respects each network's limits, but every sentence comes from what you actually said. That rule is enforced in code, not just in the prompt: a guard drops any sentence whose words didn't come from your answer.

## How it uses the Buffer API

- OAuth app client with PKCE and state, least-privilege scopes (`account:read posts:read posts:write ideas:read ideas:write offline_access`).
- Reads your sent posts once to learn what you do and how you write, so there's no onboarding form.
- Reads scheduled posts and each channel's posting schedule to show where your week goes quiet.
- `createPost` for drafts, queue (showing the slot Buffer picked) and custom times, with image assets, alt text and per-network metadata; `createIdea` with media.
- Tokens are encrypted at rest, and refreshes are serialised with a database lease, so a rotated refresh token is never reused (reuse revokes the whole grant).
- "Delete my data" removes your photos, moments and tokens in one step.

## Built on a $0 stack

Gemini and Groq free tiers for vision, writing and Whisper transcription; Vercel, Neon and Vercel Blob free tiers for hosting, database and photos; the Buffer API, free on every plan. Every AI step falls back across providers (Gemini Flash, Flash-Lite, Gemma, Qwen on Groq), per-user daily caps stop one person from draining the shared quota, and a sample week runs the full flow, real Buffer drafts included, even with zero AI quota left.

## Notes for the API team

Small things I ran into, in case they're useful:

- There's no media upload endpoint, so every app has to host images somewhere public first. A short-lived upload URL from Buffer would remove a whole service from small apps like this one.
- There's no `deleteIdea` mutation, so an app can create Ideas it can never clean up.
- App clients can't read post metrics (only personal keys can), so an app can't learn which of your posts did well.

## What's next

- **Radar for people in fast-moving fields:** the same notice-and-ask loop, triggered by news on your beat ("This just broke. You've posted about this six times this year. What's your take?").
- Recurring prompts by email ("Anything worth sharing this week? Just reply with a photo").
- Video moments for Reels, TikTok and Shorts.

Made by Rajat for Buffer Commit 2026.
