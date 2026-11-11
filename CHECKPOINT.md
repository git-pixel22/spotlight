# Buffer Commit: checkpoint (Sun, Nov 8 2026)

Deadline: Nov 13, 11:59 PM PT (Nov 14, 1:29 PM IST). Submit: public app with Buffer OAuth, demo video of 2 minutes or less, short write-up.
Plan: research Mon Nov 9, build from Tue Nov 10, demo video last.

## The idea (working, unnamed)

"You're already living your content. We help you notice it."

For Buffer's core user, per Joel's "Down and Wide" strategy: creators, early entrepreneurs and small businesses, short on time and money, wearing every hat.

One loop: **notice a moment, capture your take (voice), send to Buffer.** Posts keep the user's own words. No ghostwriting.

Moment sources:
- **Your day:** voice notes, photos, links dropped in anytime (the hero)
- **Photo dump:** upload the week's photos; it picks 4 to 5 post-worthy moments and asks one question each
- **Calendar:** festivals, seasons, weekends, local events
- **Queue gaps:** e.g. "Instagram is empty after Wednesday"
- **Radar (optional):** breaking news on your beat; on by default for tech, research and business users

Onboarding asks what you do and switches sources on. Reading the user's sent posts via OAuth gives their beat, voice and past topics with zero setup.

Demo hero: a solo small business (baker or yoga instructor). The radar gets a short second act and is the first thing cut if time runs short.

## Rejected (and why)

- Tipline, contributors emailing tips to a manager: sensible but unexciting
- Live-data tokens in scheduled posts: use case too small
- Notion to Buffer sync: Zapier already does it
- Slack wins to posts: Posting Machine AI and others exist
- Tracking what "mutuals" post: needs scraping (terms of service), off-thesis
- GitHub to posts: Launch Crew already does it

## Verified API facts

- Endpoint `https://api.buffer.com` (GraphQL), introspection works
- OAuth scopes: account, posts, ideas, snippets (read/write). **No metrics for app clients.**
- `createIdea` accepts media (url, alt, type), date, tags, group
- `posts` filter: status (draft, needs_approval, scheduled, sending, sent, error), channelIds, dueAt, tags
- `editPost` replaces the whole post (send back text, assets, metadata)
- No upload endpoint: media must be stable public HTTPS URLs (fetched at publish time)
- Channel exposes `postingSchedule`, `postingGoal`, `isQueuePaused`
- Rajat's account: one org, LinkedIn + X connected

## Next step

Write the full spec: onboarding flow, each source's mechanics, Buffer API calls (Ideas vs drafts vs queue), data model, build checklist and cut list, demo script. Domain: subdomain of meetrajat.com.
