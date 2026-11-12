# Spotlight demo video: editor brief

Build the 2-minute submission video for Spotlight (Buffer Commit 2026) in **Remotion**, render it to MP4, and verify it frame by frame.

Read first:
- `docs/demo-script.md` (storyboard and narration; follow it)
- Remotion's official agent skills, cloned at `/tmp/claude-1000/-home-pixel-Hackathon-buffer-commit/05ed93d7-9465-4025-a40b-64f4adff1e6f/scratchpad/remotion-skills/skills/` (start with `remotion-best-practices/SKILL.md`, then `remotion-create`, `remotion-render`, `remotion-captions` as needed). Follow them; don't guess Remotion APIs.

## Output

- Project: `/home/pixel/Hackathon/buffer-commit/video/` (its own package.json; do not touch the app's package.json or src/).
- Composition: 1920x1080, 30 fps, **at most 120 seconds** (aim for 1:55).
- Render to `/home/pixel/Hackathon/buffer-commit/video/out/spotlight-demo.mp4` (H.264, AAC audio).
- Also render a 1280x720 preview if it's fast.

## Brand (match the live site at https://spotlight.meetrajat.com)

- Colors: paper/mist `#EFF3EE`, ink `#14211F`, sun yellow `#FFCB1F` (fill only, never text on light), white `#FFFFFF`, muted `#4B5B57`, line `#D5DCD6`, raised dark `#1C2C29`.
- Font: **Schibsted Grotesk** (Google Fonts; load it properly in Remotion, e.g. `@remotion/google-fonts/SchibstedGrotesk`). Headlines weight 800, tight tracking (about -0.035em).
- Logo: `public/brand/spotlight-mark.svg` in the app repo (viewfinder brackets + yellow disc). Wordmark "Spotlight" next to it.
- Calm, confident motion: spring-based eases, no gimmicky transitions, no stock "whoosh" effects. One signature device: a **spotlight** (a soft circular light that dims everything else) used to transition attention, matching the product.
- No em dashes in any on-screen text. Sentence case.

## Assets (copy what you use into `video/public/`)

Audio, all verified clean with Whisper (`video-assets/audio/`):

| File | Duration | Text |
|---|---|---|
| vo1.wav | 4.76 s | Every small business has a camera roll full of posts that never got posted. |
| vo2.wav | 7.44 s | The potter, the barber, the home baker. They're living their content. They just don't have time to turn it into posts. |
| vo3.wav | 4.00 s | Spotlight helps them notice it. It's built on the Buffer API. |
| vo4.wav | 6.64 s | Connect Buffer, and Spotlight reads your recent posts to learn what you do and how you write. No forms. |
| vo5.wav | 7.00 s | Drop the week's photos. Spotlight picks the moments worth sharing, and skips the rest. You can always bring one back. |
| vo6.wav | 7.24 s | For each moment, it asks one question only you can answer. You answer out loud, in about ten seconds. |
| answer.wav | 11.16 s | (the owner, a different voice) "Um, so, matcha Oreo. Every single time. I almost didn't make it, like, I thought matcha was too niche, you know? And now people message me just to ask if it's in the box this week." |
| vo7.wav | 9.64 s | Your answer becomes a post for every channel, in your own words. Filler goes, nothing gets invented, and that rule is enforced in code. |
| vo8.wav | 5.28 s | Save them as drafts, add them to your queue, or pick a time. They land straight in Buffer. |
| vo9.wav | 6.80 s | It all runs on free tiers, with a backup model for every step. Spotlight. You're already living your content. |

Real screen recordings of the live site (`video-assets/clips/`, use the .mp4 files):

- `landing.mp4` 1920x1080, 22.7 s: logged-out landing hero; the phone demo loop plays on the right. Good throughout.
- `welcome.mp4` 390x844 (phone), 22.7 s: "Hi Rajat. Let's get to know you." 0 to 13.5 s is the loading state "Reading your last posts and noticing how you write" (speed it up or cut most of it); the "Here's what we noticed" profile card appears at **13.5 s**; a slow scroll to the channel list runs about 17 to 21 s.
- `photos.mp4` 390x844, 57.3 s: 0 to 2 s empty; photos appear about 2.5 s; "Find my moments" tapped about 4 s; uploading about 4 to 14 s; **the spotlight sweep over the dimmed grid about 14 to 40 s** (the AI takes this long; speed this up heavily, e.g. 4x to 6x); **at about 40 s the 5 picked photos light up and "Spotlight picked 5 photos and skipped 2" appears**; about 43 s a skipped photo is tapped ("Added"); "Adding your picks" about 45 to 54 s; then it navigates to the moments page (cut before that: the rescued moment is titled "office donut box", which doesn't fit the bakery story).
- `voice.mp4` 390x844, 43.7 s: the cookie box moment, question "Which flavour in this box disappears first?". Mic tapped and recording starts at **2.9 s**; "Listening" 2.9 to 15.5 s; "Writing down what you said" 16 to 20.5 s; **raw transcript with the filler words visible 21 to 23 s** ("Um, so matcha Oreo... like... you know..."); "Fitting your words to each channel" 24 to 28.5 s; **per-channel posts (LinkedIn, X) about 29 to 34 s**; "Sending to Buffer" 35 to 38.5 s; **"Saved as drafts in Buffer" confirmation 39 to 43.7 s**.
- Sync `answer.wav` so it starts at the 2.9 s mark of voice.mp4 (the owner speaks while the mic is listening). You may trim dead time inside the listening span, but keep the voice and the visible recording state in sync.

The real outputs, for overlays (verbatim from the database):
- Transcript Whisper heard: "Um, so matcha Oreo. Every single time. I almost didn't make it like I thought matcha was too niche, you know, and now people message me just to ask if it's in the box this week."
- Cleaned answer: "Matcha Oreo, every single time. I almost didn't make it, I thought matcha was too niche, and now people message me just to ask if it's in the box this week."
- X post: "Matcha Oreo, every single time. I almost didn't make it because I thought matcha was too niche, and now people message me just to ask if it's in the box this week. 🍪"

Photos for the opening montage and scenes 1 and 2 (`public/landing/` in the app repo): pottery-wheel, pottery-hands, barber, florist, flowers-vase, sewing, threads, tattoo, plants, candles, market, bike-workshop, yoga-class, owner-cafe, owner-potter, bakery-cookie-box. Bakery sample photos: `/tmp/claude-1000/-home-pixel-Hackathon-buffer-commit/05ed93d7-9465-4025-a40b-64f4adff1e6f/scratchpad/sample/*.jpg` (croissants, cookie-box, cookies-assorted, muffins, donuts, display-case, brownies).

The $0 stack facts for scene 9 (see `docs/free-tier-facts.md`): Gemini (sees photos, fits words; small daily allowance, three backups behind it), Groq (Whisper, 2,000 voice notes a day), Vercel + Neon (1 GB photos, 1 GB database), Buffer API (free on every plan). Fallback chain: Gemini Flash, Flash-Lite, Gemma, Qwen on Groq.

## Presentation

- Show phone recordings inside a clean phone frame (rounded rectangle bezel in ink, like the landing page's phone) at native 1:1 scale or smaller (they are 390x844; do not upscale more than ~1.25x), on the mist background, often with a yellow disc behind the phone like the landing page. Put the narration caption and a short scene title beside the phone.
- On-screen captions for every narration line (sentence case, Schibsted Grotesk, readable size, never covering the important UI).
- Scene 7 overlay: show the raw transcript with the filler words ("Um, so", "like", "you know") highlighted then struck through, transforming into the clean post. This is the stance of the product.
- Scene 8: after the confirmation, leave a **6-second placeholder** labeled "Buffer drafts clip goes here" (a clean card on the mist background); Rajat will record the real Buffer screen and it will be dropped in. Make it trivial to swap: a single `BUFFER_CLIP` constant pointing to `public/buffer-clip.mp4` that, if the file exists, plays instead of the placeholder.
- Background music: none (keep it clean) unless you can generate a subtle royalty-free pad yourself; narration must stay clearly audible.
- End card: logo, "You're already living your content.", "spotlight.meetrajat.com", "Built on the Buffer API for Buffer Commit 2026".

## Verify (required)

Render, then extract frames at least every 2 seconds and look at them; check: no text overflow, captions in sync with narration, no blank frames, phone recordings crisp, total duration at most 120 s, audio levels consistent (normalize narration). Fix and re-render until it is something you'd proudly submit.

## Rules

- Work only inside `/home/pixel/Hackathon/buffer-commit/video/` (create it) and its `out/`. Read anything else; don't modify the app.
- Don't commit to git; the coordinator will.
- Final reply: what you built, composition structure, the final duration, the output paths, and anything you couldn't get right.
