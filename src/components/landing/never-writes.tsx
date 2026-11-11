import { IconCheck, IconMic } from "./icons";

const RULES = [
  { verb: "Notices", text: "the moments in your week that are worth sharing." },
  { verb: "Asks", text: "one specific question about each." },
  { verb: "Tidies", text: "the filler, and fits each network's character limit." },
  { verb: "Invents", text: "Never. No made-up facts, prices or claims.", never: true },
  { verb: "Sells", text: "Never. No marketing voice.", never: true },
];

const QUESTIONS = [
  "Which flavour disappears first?",
  "Who's this regular?",
  "Black Friday in 15 days: are you doing anything, or deliberately skipping it?",
];

export function NeverWrites() {
  return (
    <section className="never" id="never">
      <div className="wrap">
        <div>
          <h2>Spotlight never writes for you.</h2>
          <p className="lead">It notices, it asks and it tidies. The post is what you said, without the ums.</p>
          <ul className="rules">
            {RULES.map((r) => (
              <li key={r.verb} className={r.never ? "no" : undefined}>
                <b>{r.verb}</b>
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
          <div className="asks">
            <p>The kind of thing it asks</p>
            <ul>
              {QUESTIONS.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pair">
          <div className="said-card">
            <h3>
              <IconMic />
              What you said
            </h3>
            <blockquote>
              <s>Um so</s> matcha Oreo, every single time. I almost didn&apos;t make it <s>like</s> because I thought matcha
              was too niche, <s>you know,</s> and now people message me just to ask if it&apos;s in the box.
            </blockquote>
          </div>
          <div className="sent-card">
            <IconCheck className="snip" size={44} />
            <h3>What went to Buffer</h3>
            <blockquote>
              Matcha Oreo, every single time. I almost didn&apos;t make it because I thought matcha was too niche, and now
              people message me just to ask if it&apos;s in the box.
            </blockquote>
            <p className="foot">Three fillers out. Every other word is yours.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
