/* eslint-disable @next/next/no-img-element */
import { IconInstagram, IconLinkedIn, IconMic, IconX } from "./icons";

const BOWL = "/landing/pottery-hands.jpg";
const PILE = ["pottery-wheel", "owner-potter", "candles", "market"];
const VOICE_BARS = [8, 18, 26, 12, 22, 9, 16, 24, 10, 6];
const DRAFTS = [
  { name: "Instagram", count: "108 / 2,200", Icon: IconInstagram },
  { name: "LinkedIn", count: "108 / 3,000", Icon: IconLinkedIn },
  { name: "X", count: "108 / 280", Icon: IconX },
];

/* One photo, the half-finished bowl, carried through all three steps. */
export function HowItWorks() {
  return (
    <section className="how" id="how">
      <div className="wrap">
        <div className="sec-head">
          <h2>How it works</h2>
          <p className="lead">Follow one photo, a half-finished bowl, from the camera roll to Buffer.</p>
        </div>
        <ol className="flow">
          <li className="step">
            <div className="vis pile" aria-hidden="true">
              {PILE.map((name) => (
                <img key={name} src={`/landing/${name}.jpg`} alt="" width={112} height={140} loading="lazy" />
              ))}
              <img className="hero-photo" src={BOWL} alt="" width={128} height={160} loading="lazy" />
              <span className="tag">12 photos, Monday to Sunday</span>
            </div>
            <h3>
              <span className="num">1</span>Drop the week&apos;s photos
            </h3>
            <p>The ones already on your phone. Messy ones included. The bowl is in there somewhere.</p>
          </li>

          <li className="step">
            <div className="vis" aria-hidden="true">
              <div className="ask-photo">
                <img src={BOWL} alt="" width={128} height={160} loading="lazy" />
                <svg viewBox="0 0 152 184" fill="none" stroke="#14211F" strokeWidth="4" strokeLinecap="round">
                  <path d="M3 34V14A11 11 0 0 1 14 3h20M149 150v20a11 11 0 0 1-11 11h-20" />
                </svg>
              </div>
              <div className="q2">Who&apos;s this bowl for?</div>
              <div className="said">
                <span className="m">
                  <IconMic size={18} />
                </span>
                <span className="bars">
                  {VOICE_BARS.map((h, i) => (
                    <b key={i} style={{ height: h }} />
                  ))}
                </span>
                <small>0:10</small>
              </div>
            </div>
            <h3>
              <span className="num">2</span>Answer out loud
            </h3>
            <p>
              Spotlight notices the 3 to 5 moments worth sharing and asks one specific question about each. You talk for ten
              seconds.
            </p>
          </li>

          <li className="step">
            <div className="vis" aria-hidden="true">
              <ul className="chan">
                {DRAFTS.map(({ name, count, Icon }) => (
                  <li key={name}>
                    <img src={BOWL} alt="" width={38} height={38} loading="lazy" />
                    <Icon />
                    {name}
                    <em>{count}</em>
                    <span className="st">Draft</span>
                  </li>
                ))}
              </ul>
            </div>
            <h3>
              <span className="num">3</span>Your words land in Buffer
            </h3>
            <p>
              One post per channel, fitted to each network&apos;s limits. Save it as a draft, queue it, or keep it as a Buffer
              Idea.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}
