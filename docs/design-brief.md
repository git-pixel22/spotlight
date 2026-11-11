# Spotlight landing page: design brief

## The product

**Spotlight** is a web app built on the Buffer API for Buffer Commit 2026 (Buffer's build contest; judged by Buffer's CEO Joel Gascoigne, a Staff PM and a Staff Engineer, alongside 1000s of other submissions).

One line: **You're already living your content. Spotlight helps you notice it.**

Who it's for: Buffer's core users. Solo creators, early entrepreneurs and one-person small businesses (a potter, a barber, a florist, a yoga teacher, a home baker, a tailor, a tattoo artist, a plant shop, a café owner). Short on time, wearing every hat. Their week is full of post-worthy moments they never post.

How it works (a real sequence, so numbered steps are fine):
1. **Drop the week's photos** (the ones already on your phone, messy ones included).
2. **Spotlight notices the 3 to 5 moments worth sharing and asks one specific question about each** ("Which flavour disappears first?", "Who's this regular?"). You **answer out loud** in 10 seconds.
3. **Your own words land in Buffer**: one post per channel (Instagram, LinkedIn, X, Threads, Bluesky, Facebook...), fitted to each network's limits, saved as a draft, queued, or kept as a Buffer Idea.

The stance (key differentiator): **Spotlight never writes for you.** It notices, asks, and tidies (removes filler like "um", "like", "you know", fits character limits). It never invents facts, prices or claims, never uses a marketing voice. Example pair you can use:
- What you said: "Um so matcha Oreo, every single time. I almost didn't make it like because I thought matcha was too niche, you know, and now people message me just to ask if it's in the box."
- What went to Buffer: "Matcha Oreo, every single time. I almost didn't make it because I thought matcha was too niche, and now people message me just to ask if it's in the box."

Other real features you can show: a 7-day queue strip per channel ("Instagram goes quiet from Thursday"), calendar prompts ("Black Friday in 15 days: are you doing anything, or deliberately skipping it?"), a sample week to try instantly.

It runs entirely on free tiers, a point of pride (not an apology):
- Gemini (Google AI Studio free tier): sees the photos, fits words to each network
- Groq free tier: Whisper voice transcription, and backup model
- Vercel Hobby + Neon Postgres + Vercel Blob: hosting, database, photo storage
- Buffer API: free on every Buffer plan
- Resilience: if one free model is busy, the next takes over (4-model fallback chain); a sample week runs the whole flow even with zero AI quota.
Present this as **"The $0 stack"** in the style of a pricing table where every tier says $0/mo (the owner liked this reference: dark cards, big "$0 /mo", a one-line allowance like "~20 requests/min", a short list of what it does). Proud, honest, specific.

## Feedback from the owner on the previous version (must fix)

1. The logo was a red dot. Red dots read as errors/notifications. **Design a real logo mark for "Spotlight"** (wordmark + symbol). No plain red dot.
2. The hero headline was the word "NOTICED." while the product name sat small in a sentence. **A skimming judge must leave remembering the name "Spotlight".** The product name must be the hero's memorable element.
3. The hero had a blurry enlarged bakery photo inside giant letters. Confusing at first sight, and **Spotlight is not only for bakeries**: show a range of small businesses.
4. "How it works" was liked, but must be easier to follow. Carry ONE example moment through all three steps so the eye can follow it.
5. The free-tier section read like an excuse. Make it confident (see "The $0 stack").
6. It must not look AI-generated or templated.

## Avoid these AI-generated tells

- Warm cream background (#F4F1EA-ish) with a terracotta/clay accent.
- Near-black background with a single acid-green or vermilion accent and nothing else going on.
- The SaaS card kit: everything in identical rounded cards with the same soft shadow; gradient washes as decoration.
- ALL-CAPS tracked eyebrow labels above every heading; meta joined with middle dots "A · B · C"; "→" appended to links; monospace for small labels (unless the concept is genuinely about it).
- Emoji as icons. Generic icon-plus-headline feature grids.
- Accenting one word of a headline in a different color/italic.
- Fade-and-slide-up on every section. Use ONE orchestrated signature motion moment; motion elsewhere only answers user actions. Respect prefers-reduced-motion.
- Em dashes anywhere in the copy (the owner forbids them). Use commas or full stops.
- Stock-y filler sections that do no work.

## Context: Buffer's own look (judges see it daily)

buffer.com (March 2026 refresh, "calmer, lets content take center stage"): background #FEFDFB, ink #213130 (dark teal-black), mint-green CTA (~#A6E3A1), Stolzl headings, Figtree body, faint grid, real platform icons floating in the hero. The Buffer Commit badge is dark with a mint accent. **Spotlight should look distinct from Buffer but sit comfortably next to it** (don't copy Buffer's mint/teal palette; a small nod is fine).

## Assets

Photos (all in `/concepts/img/`, reference them relatively as `../img/<name>.jpg`):
- Owners / portraits: `owner-cafe.jpg` (smiling woman in apron, café), `owner-potter.jpg` (older potter in workshop), `owner-craft.jpg` (woman at craft desk), `owner-restaurant.jpg` (woman in plaid apron)
- Work in progress: `pottery-wheel.jpg`, `pottery-hands.jpg`, `barber.jpg`, `barber-gloves.jpg`, `sewing.jpg`, `threads.jpg`, `tattoo.jpg` (black and white), `florist.jpg`, `flowers-vase.jpg`, `plants.jpg` (man with succulent in greenhouse), `espresso.jpg`, `yoga-class.jpg`, `yoga-pose.jpg` (black and white), `trainer.jpg`, `market.jpg`, `books.jpg`, `candles.jpg`, `bike-workshop.jpg`
- Bakery (sample week): `bakery-croissants.jpg`, `bakery-cookie-box.jpg`, `bakery-muffins.jpg`, `bakery-donuts.jpg`, `bakery-display-case.jpg`, `bakery-brownies.jpg`
- Avoid `barista.jpg` (face mask dates it).

Photos are ~1400px wide; don't scale any above that or they blur.

## Deliverable

A single static landing page concept: `public/concepts/<N>/index.html` (self-contained: inline CSS/JS, or extra files inside `public/concepts/<N>/` only). It is served by the running dev server at `https://localhost:3000/concepts/<N>/` (self-signed cert).

- External resources allowed: Google Fonts; scripts only from cdnjs.cloudflare.com or cdn.jsdelivr.net with an exact pinned version (e.g. gsap@3.12.5). Plain JS is fine.
- Sections, in order: nav (logo + "Connect Buffer" button) → hero → how it works → "Spotlight never writes for you" → demo video slot (a 16:9 placeholder that clearly says the 2-minute demo goes here) → the $0 stack → footer ("Made by Rajat for Buffer Commit 2026. Not affiliated with Buffer." + Privacy link).
- Primary CTA everywhere: "Connect Buffer" (or "Connect Buffer to start"). Secondary: "Try a sample week" / "Watch the demo".
- Responsive down to 390px wide, visible keyboard focus, prefers-reduced-motion respected, readable contrast.
- Copy: sentence case, plain verbs, short. No em dashes.

## Verify your work (required)

Take screenshots and look at them, then fix what's off. Repeat until you'd be proud to show it.

```
cd /tmp/claude-1000/-home-pixel-Hackathon-buffer-commit/05ed93d7-9465-4025-a40b-64f4adff1e6f/scratchpad/shot
node snap.mjs https://localhost:3000/concepts/<N>/ /home/pixel/Hackathon/buffer-commit/public/concepts/shots/<N>-desktop.png 1440 0 3000
node snap.mjs https://localhost:3000/concepts/<N>/ /home/pixel/Hackathon/buffer-commit/public/concepts/shots/<N>-full.png 1440 1 3000
node snap.mjs https://localhost:3000/concepts/<N>/ /home/pixel/Hackathon/buffer-commit/public/concepts/shots/<N>-mobile.png 390 0 3000
```
(args: url, output, width, fullPage 1/0, wait ms). View the PNGs with your image-reading tool.

## Rules

- Only create or edit files inside `public/concepts/<N>/` and `public/concepts/shots/<N>-*.png`. Do not touch anything else in the repo. The dev server is already running on port 3000; don't start or stop servers. Don't install packages into the project.
- Final reply (short): concept name, palette (hex), fonts, logo idea, the signature motion moment, and what makes it memorable. Mention anything you couldn't get right.
