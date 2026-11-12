# Spotlight

**Live:** https://spotlight.meetrajat.com
**Demo video (1:22):** https://youtu.be/ifvzMvvgoEc
**Code:** https://github.com/git-pixel22/spotlight

**The problem.** A one-person business is full of moments worth posting: the batch that sold out by noon, the regular who orders the same thing every week. They end up in the camera roll instead of on social, because turning them into posts takes time and energy the owner doesn't have. AI tools that write the posts for them produce posts that sound like everyone else's.

**Who it's for.** Buffer's core users who wear every hat: the potter, the barber, the florist, the home baker.

**How it works.** Drop the week's photos. Spotlight picks the moments worth sharing and asks one open question about each, the kind only the owner can answer. They answer out loud in about ten seconds, and their answer becomes a post for every channel, fitted to each network, landing in Buffer as drafts, in the queue, at a picked time, or as an Idea. Spotlight never writes for you: a guard in code drops any sentence whose words didn't come from the owner's answer.

**Buffer API surface.** OAuth with PKCE and state, refresh tokens encrypted and refreshed under a database lease so a rotated token is never reused. It reads sent posts to learn what you do and how you write, so there's no onboarding form, and reads scheduled posts and each channel's posting schedule to show where your week goes quiet. `createPost` handles drafts, queue and custom times, with images, alt text and per-network metadata (Instagram photos get a 4:5 crop). `createIdea` saves Ideas with media.

**Built on a $0 stack.** Free tiers of Gemini, Groq, Vercel and Neon, with a backup model for every AI step and a sample week that works even with no AI quota left.

**Next.** A news "radar" for people in fast-moving fields, weekly email nudges you can answer with a photo, and video moments for Reels and Shorts.
