/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { DemoVideo } from "@/components/landing/demo-video";
import { HowItWorks } from "@/components/landing/how-it-works";
import { IconPlay, Mark } from "@/components/landing/icons";
import { NeverWrites } from "@/components/landing/never-writes";
import { PhoneDemo } from "@/components/landing/phone-demo";
import { ZeroStack } from "@/components/landing/zero-stack";
import { getCurrentUser } from "@/lib/session";
import "./landing.css";

/* A range of small businesses, not one trade. */
const RANGE = ["pottery-wheel", "barber", "florist", "threads", "yoga-class", "plants", "bakery-cookie-box"];

export default async function Home({ searchParams }: PageProps<"/">) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const error = typeof params.error === "string" ? params.error : null;
  const notice = params.notice === "deleted" ? "Done. Everything Spotlight stored about you has been deleted." : null;
  const start = user ? "/app" : "/api/auth/login";

  return (
    <div className="landing">
      <header className="nav">
        <div className="wrap">
          <a className="logo" href="#top" aria-label="Spotlight, home">
            <Mark />
            Spotlight
          </a>
          <a className="lp-btn lp-btn-primary lp-btn-sm" href={start}>
            {user ? "Open Spotlight" : "Connect Buffer"}
          </a>
        </div>
      </header>

      <main id="top">
        <div className="hero">
          <div className="wrap">
            <div className="pitch">
              {error && (
                <p className="notice" role="alert">
                  {error}
                </p>
              )}
              {notice && (
                <p className="notice notice-ok" role="status">
                  {notice}
                </p>
              )}
              <h1 className="wordmark">
                <Mark />
                Spotlight
              </h1>
              <p className="hero-line">You&apos;re already living your content. Spotlight helps you notice it.</p>
              <p className="lead">
                Drop this week&apos;s photos. Answer one question out loud. Your own words land in Buffer, one post per
                channel.
              </p>
              <div className="cta">
                <a className="lp-btn lp-btn-primary" href={start}>
                  {user ? "Open Spotlight" : "Connect Buffer to start"}
                </a>
                <a className="lp-btn lp-btn-ghost" href="#demo">
                  <IconPlay />
                  Watch the demo
                </a>
              </div>
              <a className="textlink" href={start}>
                Try a sample week
              </a>
              <div className="range">
                <ul aria-hidden="true">
                  {RANGE.map((name) => (
                    <li key={name}>
                      <img src={`/landing/${name}.jpg`} alt="" width={54} height={54} />
                    </li>
                  ))}
                </ul>
                <p>For the potter, the barber, the florist, the tailor, the yoga teacher, the plant shop and the home baker.</p>
              </div>
            </div>

            <PhoneDemo />
          </div>
        </div>

        <HowItWorks />
        <NeverWrites />

        <section className="demo" id="demo">
          <div className="wrap">
            <DemoVideo />
          </div>
        </section>

        <ZeroStack start={start} startLabel={user ? "Open Spotlight" : "Connect Buffer"} />
      </main>

      <footer className="on-ink">
        <div className="wrap">
          <a className="logo" href="#top">
            <Mark />
            Spotlight
          </a>
          <p>Made by Rajat for Buffer Commit 2026. Not affiliated with Buffer.</p>
          <nav className="foot-links" aria-label="Footer">
            <a href="https://github.com/git-pixel22/spotlight">Source on GitHub</a>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
