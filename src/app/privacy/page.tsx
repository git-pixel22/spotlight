import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = { title: "Privacy · Spotlight" };

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/"><Logo /></Link>
      <h1 className="mt-10 text-3xl font-semibold">Privacy</h1>
      <div className="mt-6 space-y-4 text-muted">
        <p>Spotlight is a hackathon project built on the Buffer API. Here is exactly what it does with your data.</p>
        <p><strong className="text-ink">Buffer access.</strong> When you connect, Buffer asks you to approve read access to your account, posts and ideas, and permission to create posts and ideas. Spotlight only creates content when you press a send button. Access tokens are encrypted at rest and never reach your browser. You can revoke access at any time in your Buffer settings.</p>
        <p><strong className="text-ink">Your posts.</strong> Spotlight reads your recent sent posts once, to describe your business and writing voice. That description is stored; your post texts are not.</p>
        <p><strong className="text-ink">Photos and voice notes.</strong> Photos you upload are stored in Vercel Blob at unguessable public URLs, because Buffer needs a public URL to publish an image. Voice notes are transcribed and not stored.</p>
        <p><strong className="text-ink">AI providers.</strong> Photos, voice notes and text are processed by Google Gemini and Groq on their free tiers. Free-tier inputs may be used by those providers to improve their services. Don&apos;t upload anything you wouldn&apos;t post.</p>
        <p><strong className="text-ink">Deletion.</strong> Ask and everything Spotlight stores about you will be deleted.</p>
      </div>
    </main>
  );
}
