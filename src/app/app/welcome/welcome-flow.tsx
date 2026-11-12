"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { Profile } from "@/lib/db/schema";
import { ChannelAvatar } from "@/components/channel-avatar";

type Channel = { id: string; service: string; label: string; name: string; avatar: string | null; supported: boolean };

export function WelcomeFlow(props: {
  firstName: string | null;
  existingProfile: Profile | null;
  channels: Channel[];
  selectedIds: string[];
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(props.existingProfile);
  const [summary, setSummary] = useState(props.existingProfile?.summary ?? "");
  const [needsDescription, setNeedsDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(!props.existingProfile);
  const [error, setError] = useState<string | null>(null);
  // Toggles the user made here, on top of the server's selection, so a refresh that brings
  // in newly connected channels (already selected server-side) shows them ticked.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const started = useRef(false);
  const supported = props.channels.filter((c) => c.supported);
  const isSelected = (id: string) => toggled[id] ?? props.selectedIds.includes(id);
  const selected = supported.filter((c) => isSelected(c.id)).map((c) => c.id);

  async function build(selfDescription?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selfDescription ? { selfDescription } : {}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      if (json.needsDescription) {
        setNeedsDescription(true);
      } else {
        setNeedsDescription(false);
        setProfile(json.profile);
        setSummary(json.profile.summary);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (started.current || props.existingProfile) return;
    started.current = true;
    build();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function finish() {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary, selectedChannelIds: selected }),
    });
    if (res.ok) router.push("/app");
    else {
      setSaving(false);
      setError("Couldn't save, please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-heading text-4xl">
        {props.firstName ? `Hi ${props.firstName}.` : "Hi."} Let&apos;s get to know you.
      </h1>
      <p className="mt-2 text-muted">
        {needsDescription || (profile && !profile.basedOnPosts)
          ? "No posts to read yet, so Spotlight goes by what you tell it."
          : "Spotlight reads your recent Buffer posts, so there's no form to fill in."}
      </p>

      <div className="mt-8">
        {loading && (
          <div className="panel flex items-center gap-4 p-6">
            <motion.span
              className="block h-3 w-3 rounded-full bg-accent"
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <p className="text-muted">Reading your last posts and noticing how you write…</p>
          </div>
        )}

        {!loading && needsDescription && (
          <div className="panel p-6">
            <p className="font-medium">You haven&apos;t posted through Buffer yet. What do you do?</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="I run a home bakery in Pune and sell at the Saturday market."
              className="mt-3 w-full rounded-xl border border-line bg-paper p-3 text-sm outline-none focus:border-ink"
              rows={3}
            />
            <button className="btn-primary mt-3" disabled={description.trim().length < 5} onClick={() => build(description)}>
              Continue
            </button>
          </div>
        )}

        {!loading && profile && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-6">
            <p className="text-sm font-semibold text-accent-text">Here&apos;s what we noticed</p>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="mt-2 w-full resize-none rounded-xl border border-transparent bg-transparent p-0 text-lg outline-none focus:border-line"
              rows={Math.min(8, Math.max(3, Math.ceil(summary.length / 50)))}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.topics.map((t) => (
                <span key={t} className="rounded-full bg-surface-2 px-3 py-1 text-xs text-muted">{t}</span>
              ))}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted">Tone</dt><dd>{profile.voice.tone}</dd></div>
              <div><dt className="text-muted">Length</dt><dd>{profile.voice.length}</dd></div>
              <div><dt className="text-muted">Emoji</dt><dd>{profile.voice.emoji}</dd></div>
              <div><dt className="text-muted">Hashtags</dt><dd>{profile.voice.hashtags}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-muted">
              {profile.basic
                ? "Spotlight's free AI is busy right now, so this is a basic profile. Edit the summary to say what you do."
                : `${profile.basedOnPosts ? `Based on your last ${profile.basedOnPosts} posts.` : "Based on your description."} Edit the summary if we got anything wrong.`}
            </p>
          </motion.div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-accent-soft p-4 text-sm">
            {error}{" "}
            <button className="underline" onClick={() => build(description || undefined)}>Try again</button>
          </div>
        )}
      </div>

      {!loading && profile && (
        <div className="mt-8">
          <p className="font-medium">Which channels should Spotlight write for?</p>
          <div className="mt-3 grid gap-2">
            {props.channels.map((c) => (
              <label
                key={c.id}
                className={`panel flex items-center gap-3 px-4 py-3 ${c.supported ? "cursor-pointer" : "opacity-50"}`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#14211f]"
                  disabled={!c.supported}
                  checked={c.supported && isSelected(c.id)}
                  onChange={(e) => setToggled((t) => ({ ...t, [c.id]: e.target.checked }))}
                />
                <ChannelAvatar avatar={c.avatar} label={c.label} />
                <span className="flex-1">{c.name}</span>
                <span className="text-sm text-muted">{c.supported ? c.label : `${c.label} (not supported yet)`}</span>
              </label>
            ))}
          </div>

          {supported.length === 0 ? (
            <div className="panel mt-3 p-5">
              <p className="font-medium">
                {props.channels.length ? "None of your Buffer channels can take a Spotlight post yet." : "Your Buffer account has no channels yet."}
              </p>
              <p className="mt-1 text-sm text-muted">
                Connect one in Buffer first. Spotlight writes for LinkedIn, X, Instagram, Threads, Bluesky, Mastodon, Facebook and
                Google Business.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href="https://publish.buffer.com" target="_blank" rel="noreferrer" className="btn-primary">
                  Connect a channel in Buffer
                </a>
                <button
                  className="btn-ghost"
                  disabled={checking}
                  onClick={() => {
                    setChecking(true);
                    router.refresh();
                    setTimeout(() => setChecking(false), 2500);
                  }}
                >
                  {checking ? "Checking…" : "I've connected one"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button className="btn-accent mt-6 w-full py-3" disabled={saving || selected.length === 0} onClick={finish}>
                {saving ? "Saving…" : "Looks right, let's go"}
              </button>
              {selected.length === 0 && <p className="mt-2 text-center text-sm text-muted">Pick at least one channel.</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
