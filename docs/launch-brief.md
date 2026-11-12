# Spotlight "launch" cut: editor brief

A second demo video, in the style of a premium product launch film (think Linear, Arc, Raycast or Apple feature reels): **no voiceover**, upbeat music, the camera following the cursor and zooming into what it clicks, and short kinetic on-screen text doing the explaining. It must still show the real product working end to end.

## Output

- New standalone Remotion project: `/home/pixel/Hackathon/buffer-commit/video-launch/` (own package.json). Do not modify `video/` (another editor is working there); you may read and copy components from `video/src/` for brand consistency (fonts, logo, phone frame, colors).
- 1920x1080, 30 fps, **60 to 90 seconds** (hard max 120).
- Render to `video-launch/out/spotlight-launch.mp4` (H.264 + AAC) and a 720p preview.
- Read Remotion's official skills first: `/tmp/claude-1000/-home-pixel-Hackathon-buffer-commit/05ed93d7-9465-4025-a40b-64f4adff1e6f/scratchpad/remotion-skills/skills/` (remotion-best-practices, remotion-create, remotion-render, remotion-multimedia).

## Brand

Same as the narrated video and the live site: mist `#EFF3EE`, ink `#14211F`, sun yellow `#FFCB1F` (fill only), white, muted `#4B5B57`; Schibsted Grotesk (weight 800, tight tracking for headlines); the viewfinder logo (`public/brand/spotlight-mark.svg` in the app repo). Sentence case. No em dashes in any on-screen text.

## Music

`video/public/music/what-about-action.mp3` ("What About Action?", Mixkit Stock Music Free License, no attribution required). About 120.5 bpm, dance-pop. Copy it into your project. **Cut on the beat**: find the beat grid (a rough onset/tempo analyzer is at `/tmp/claude-1000/-home-pixel-Hackathon-buffer-commit/05ed93d7-9465-4025-a40b-64f4adff1e6f/scratchpad/music/analyze.mjs`; refine with ffmpeg if needed) and land scene changes, text hits and the logo reveal on beats/downbeats. Choose a section of the track with a clear build and drop for the logo reveal; end on a natural phrase end or a quick fade on a downbeat. Final mix about -14 LUFS.

Optional product sound: a 3 to 4 s snippet of the owner's real spoken answer (`video-assets/audio/answer.wav`, e.g. "matcha Oreo, every single time") may play over the mic moment with the music ducked, as diegetic product audio. That is the only voice allowed.

## Footage (real recordings of https://spotlight.meetrajat.com)

All in `/home/pixel/Hackathon/buffer-commit/video-assets/launch/`, recorded at **2880x1800** (a 1440x900 viewport at 2x pixels, so zooming in up to about 2x stays crisp) with a drawn cursor and a yellow click ripple.

Each clip has `<clip>.events.json`: `{ width:1440, height:900, dpr:2, events:[...] }`. Event times `t` are seconds from the start of the clip; coordinates are in **CSS pixels of the 1440x900 viewport** (multiply by 2 for video pixels). Types: `move` (`from`, `to`, `ms` duration), `click` (`x`, `y`, `box` of the clicked element, `label`), `scroll` (`dy`, `ms`), `marker` (`label`).

- `landing.mp4` (13.8 s): logged-out landing; the cursor drifts over the phone demo (about 1.5 to 8 s), visits the wordmark, clicks "Connect Buffer to start" at about 12.2 s.
- `home.mp4` (21.6 s): signed-in home; hovers "Record a thought" and "Try a sample week", scrolls to "Your week in Buffer" (the 7-day queue strip) and "Coming up" (calendar prompts), scrolls back, clicks "Drop this week's photos".
- `photos.mp4` (30.7 s): clicks "Choose photos" (3.2 s), 7 bakery photos appear, clicks "Find my moments" (8.2 s), uploading, then the spotlight sweep over the dimmed grid, **marker "found" at 21.6 s** (5 photos light up, "Spotlight picked 5 photos and skipped 2"), clicks a skipped photo to rescue it (26.2 s, "Added"), clicks "Add 1 and answer my moments" (30.0 s).
- `voice.mp4` (44.8 s): the cookie box moment ("Which flavour in this box disappears first?"); clicks the mic at 3.8 s; listening until the Stop click at 17.0 s; transcript with the filler words visible at about 21.7 s; clicks "Make my posts" at 25.9 s; per-channel posts at about 32 s; scrolls; clicks "Save as drafts in Buffer" at 40.8 s; **"Saved as drafts in Buffer" at about 44.2 s**.
- Also available, phone-size (390x844): `video-assets/clips/welcome.mp4` ("Here's what we noticed" profile card appears at 13.5 s). Use it in a phone frame if you want a "learns how you write" beat.

Speed-ramp the slow AI waits (upload, sweep, transcription, fitting) so they feel instant but still visible: the sweep is the product's signature visual, keep about 2 to 3 s of it.

## Camera (the core of this style)

- Present the 16:10 recordings inside a clean floating browser window (rounded corners, thin top bar with the URL `spotlight.meetrajat.com`, soft shadow) on the mist background.
- Screen Studio style auto-zoom driven by the events: about 0.4 to 0.6 s before a click, ease the camera in to 1.6x to 2.2x centered near the click target (use `box`), hold through the click and the UI's response, then ease back out. Between clicks, follow the cursor with a smooth spring so the camera leads naturally; never jitter. Clamp so the camera never shows outside the recording.
- Use `move` events (from, to, ms) to interpolate the cursor position over time for the follow-cam.

## Story (on-screen text, short, punchy; about 3 to 6 words per card)

1. Cold open on beats: "Your week is full of posts." then "You just never post them." over a dimmed camera-roll grid of small-business photos (`public/landing/*.jpg` in the app repo); a spotlight lights three.
2. Logo reveal on the drop: logo + "Spotlight", then "You're already living your content."
3. Landing (cursor glides, zoom on click "Connect Buffer").
4. Optional: welcome profile in a phone frame, "It learns how you write."
5. Home: zoom on the 7-day queue strip ("See where your week goes quiet"), then the click on "Drop this week's photos".
6. Photos: "Drop the week's photos." "It notices the moments." "5 picked. 2 skipped." "Bring one back." (zoom on the rescue tap)
7. Voice: zoom on the mic click, "One question. Answer out loud." (optional answer snippet), transcript appears; overlay the filler words "Um, so", "like", "you know" being struck out: "Filler goes. Nothing invented."
8. Posts: "Your words. Every channel." (zoom on the per-channel posts with character counts)
9. Send: zoom on "Save as drafts in Buffer", then the confirmation: "Straight into Buffer."
10. A 4 s slot for the real Buffer clip: same swap mechanism as the narrated video (a `BUFFER_CLIP` constant pointing to `public/buffer-clip.mp4`; placeholder card "Buffer drafts clip goes here" until the file exists).
11. "Built on a $0 stack." with four quick cards (Gemini, Groq Whisper, Vercel + Neon, Buffer API, each "$0/mo") and the fallback chain lighting in order.
12. End card on the final beat: logo, "You're already living your content.", "spotlight.meetrajat.com", "Built on the Buffer API for Buffer Commit 2026".

## Verify

Render, extract frames every ~1.5 s and around every zoom; check crispness at max zoom, no camera jitter, the cursor stays in frame during zooms, text readable for its duration, cuts land on beats (compare cut times to your beat grid and report the offsets), total duration in range, loudness about -14 LUFS. Fix and re-render until it's excellent.

## Rules

Only create/modify files inside `/home/pixel/Hackathon/buffer-commit/video-launch/`. Don't commit to git. Report: structure with timings, duration, outputs, beat-sync offsets, and anything you couldn't get right.
