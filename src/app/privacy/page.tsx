import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = { title: "Privacy · Spotlight" };

const SECTIONS = [
  {
    title: "Your Buffer account",
    body: "When you connect, Buffer asks you to let Spotlight read your account, posts and ideas, and create posts and ideas. Spotlight only creates something in Buffer when you press a send button. Access tokens are encrypted at rest and never reach your browser. You can revoke access at any time in your Buffer settings.",
  },
  {
    title: "Your past posts",
    body: "Spotlight reads your recent sent posts once, to describe what you do and how you write. It keeps that short description, not the posts themselves.",
  },
  {
    title: "Photos and voice notes",
    body: "Photos you add are stored in Vercel Blob at long, unguessable public links, because Buffer needs a public link to publish an image. Voice notes are transcribed and then discarded; only the text you approve is kept.",
  },
  {
    title: "AI providers",
    body: "Photos, voice notes and text are processed by Google Gemini and Groq on their free tiers, which may use inputs to improve their services. Only add photos you'd be happy to post.",
  },
  {
    title: "Deleting your data",
    body: "In Spotlight, open \"Edit what Spotlight knows about you\" and press \"Delete my data\". That removes your profile, photos, moments, drafts and Buffer tokens from Spotlight. Posts you already sent stay in Buffer.",
  },
];

export default function Privacy() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12">
      <Link href="/"><Logo /></Link>
      <h1 className="font-heading mt-12 text-4xl">Privacy</h1>
      <p className="mt-3 text-lg text-muted">
        Spotlight is a project built on the Buffer API for Buffer Commit 2026. Here is exactly what it does with your data.
      </p>
      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="font-heading text-xl">{s.title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-12 border-t border-line pt-6 text-sm text-muted">
        Questions? Open an issue on{" "}
        <a className="font-semibold text-ink underline underline-offset-4" href="https://github.com/git-pixel22/spotlight/issues">
          GitHub
        </a>
        .
      </p>
    </main>
  );
}
