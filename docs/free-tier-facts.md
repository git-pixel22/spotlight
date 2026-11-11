# Free-tier facts (checked 2026-11-12)

Use these for "The $0 stack" copy. Prefer the official numbers; label measured ones as approximate.

| Service | What Spotlight uses it for | Free allowance | Source |
|---|---|---|---|
| Vercel Blob (Hobby) | Photo storage at public URLs | 1 GB storage/month, 2,000 advanced ops (uploads)/month, 10,000 simple ops, 10 GB data transfer | Official: vercel.com/docs/vercel-blob/usage-and-pricing |
| Neon (Free) | Postgres | 1 GB storage per project, 100 CU-hours compute per project per month | Official: neon.com/faqs/free-plan-limits-and-quotas (updated 2026-10-01) |
| Groq (free) Whisper large v3 turbo | Voice transcription | 20 requests/min, 2,000/day, 7,200 audio seconds/hour | console.groq.com/docs/rate-limits (page shows these as base limits) + third-party guides |
| Groq qwen/qwen3.8-27b, openai/gpt-oss-120b | Backup vision and text models | 30 requests/min, 1,000/day | console.groq.com/docs/rate-limits |
| Gemini API (Google AI Studio free tier) | First-choice vision and writing | Google no longer publishes free-tier tables; limits are per project and change. Measured: gemini-3.5-flash about 5/min and 20/day; 3.5 Flash-Lite about 15/min and 500/day | aiplug.work, imisofts.com, scriptbyai.com (third-party) |
| Vercel Hobby | Hosting and API routes | Free for personal, non-commercial projects | vercel.com/docs/plans/hobby |
| Buffer API | Publishing | Free on every Buffer plan, including Free | Joel Gascoigne, joel.is (2026-05-26) |

Implication: gemini-3.5-flash's daily allowance is small, so most traffic will use the fallback chain (Flash, Flash-Lite, Gemma 4, Qwen on Groq for vision; Flash, 3.1 Flash-Lite, gpt-oss-120b on Groq, Gemma 4 for text). That is the point of the chain.
