type Tier = { name: string; job: string; allowance: string; does: string[]; featured?: boolean };

/* Allowances stay non-numeric until the real limits are verified. */
const TIERS: Tier[] = [
  {
    name: "Gemini",
    job: "Sees the photos, fits the words",
    allowance: "A small daily allowance per model, so three backups stand behind it",
    does: ["Finds the moments worth sharing", "Writes the one question per photo", "Fits your words to each network's limit"],
  },
  {
    name: "Groq",
    job: "Hears your answer",
    allowance: "2,000 voice notes a day, 20 a minute",
    does: ["Whisper voice transcription", "Backup model when Gemini is busy"],
  },
  {
    name: "Vercel and Neon",
    job: "Hosting, database, photo storage",
    allowance: "1 GB of photos, 1 GB of database",
    does: ["Vercel Hobby runs the app", "Neon Postgres keeps your moments", "Vercel Blob stores the photos"],
  },
  {
    name: "Buffer API",
    job: "Where your words land",
    allowance: "Free on every Buffer plan",
    does: ["Drafts, queue and Ideas", "Every channel you have connected", "A 7-day view of where your queue goes quiet"],
    featured: true,
  },
];

/* The order photos are tried in, from VISION_CHAIN in src/lib/ai/router.ts. */
const CHAIN = ["Gemini Flash", "Flash-Lite", "Gemma", "Qwen on Groq"];

export function ZeroStack({ start, startLabel }: { start: string; startLabel: string }) {
  return (
    <section className="stack on-ink" id="stack">
      <div className="wrap">
        <div className="sec-head">
          <h2>
            The <span>$0</span> stack
          </h2>
          <p className="lead">
            Spotlight runs entirely on free tiers, on purpose. If a one-person shop can run on it, so can the tool that helps
            them.
          </p>
        </div>

        <div className="tiers">
          {TIERS.map((t) => (
            <article className={t.featured ? "tier feat" : "tier"} key={t.name}>
              <h3>{t.name}</h3>
              <p className="job">{t.job}</p>
              <p className="price">
                $0 <small>/mo</small>
              </p>
              <p className="allow">{t.allowance}</p>
              <ul>
                {t.does.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="backup">
          <p>
            <b>Free does not mean fragile.</b> If one free model is busy, the next takes over. The sample week runs the whole
            flow with zero AI quota.
          </p>
          <div>
            <ol className="chain" aria-label="Four-model fallback chain for reading photos">
              {CHAIN.map((model, i) => (
                <li key={model}>
                  <span>{i + 1}</span>
                  <small>{model}</small>
                </li>
              ))}
            </ol>
            <p className="chain-cap">Four models deep. Busy? Next one picks up.</p>
          </div>
          <div className="total">
            <a className="lp-btn lp-btn-sun" href={start}>
              {startLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
