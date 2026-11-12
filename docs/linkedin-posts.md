# #BufferCommit build-in-public posts (drafts)

For the Build-in-Public award, posts must mention Buffer Commit. Schedule them through Buffer itself. Attach a screenshot or short screen recording to each.

## Post 1 (Thursday): the idea, and the bug that defined it

I'm building Spotlight for #BufferCommit, Buffer's build contest.

The idea: a one-person business already has a week full of post-worthy moments. The batch that sold out, the regular who orders the same thing every spring. They just never turn into posts.

So Spotlight looks through the week's photos, asks one question per moment, and you answer out loud. Your answer becomes a post for every channel in Buffer.

The rule I care about most: it never writes for you.

During testing, the AI added a closing line nobody said: "I love these recurring traditions." Harmless, and exactly the kind of fake warmth that makes posts feel AI-written.

So the rule is now enforced in code, not just in the prompt. Any sentence whose words didn't come from your answer gets dropped before you see it.

Live at spotlight.meetrajat.com. Built on the Buffer API.

(Attach: screenshot of a moment card with the question and the mic.)

## Post 2 (Friday): the $0 stack

Spotlight runs on a $0 stack, on purpose. If a one-person shop runs on a shoestring, so can the tool that helps it.

The catch: Gemini's best free model gives you about 20 requests a day. I burned through it in an hour of testing.

So every AI step has an understudy. Gemini Flash, then Flash-Lite, then Gemma, then Qwen on Groq. If one is rate limited, the next one picks it up. Most of my own testing now runs through the backups, and nobody can tell.

And if every free quota is gone, the sample week still runs the whole flow, real Buffer drafts included.

#BufferCommit

(Attach: the $0 stack section from the landing page.)

## Post 3 (Saturday): submitted

Submitted Spotlight to #BufferCommit.

Drop your week's photos, answer one question out loud, and your own words land in Buffer. 2-minute demo below.

Built in a few days with the Buffer API, a lot of free tiers, and one rule: it never writes for you.

(Attach: the demo video.)
