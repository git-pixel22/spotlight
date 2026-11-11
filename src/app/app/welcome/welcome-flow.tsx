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
  const [selected, setSelected] = useState<Set<string>>(new Set(props.selectedIds));
  const [saving, setSaving] = useState(false);
  const started = useRef(false);

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
      body: JSON.stringify({ summary, selectedChannelIds: [...selected] }),
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
      <p className="mt-2 text-muted">Spotlight read your recent Buffer posts so you don&apos;t have to fill in a form.</p>

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
              rows={3}
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
              {profile.basedOnPosts ? `Based on your last ${profile.basedOnPosts} posts.` : "Based on your description."} Edit the summary if we got anything wrong.
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
                  checked={selected.has(c.id)}
                  onChange={(e) => {
                    const next = new Set(selected);
                    if (e.target.checked) next.add(c.id);
                    else next.delete(c.id);
                    setSelected(next);
                  }}
                />
                <ChannelAvatar avatar={c.avatar} label={c.label} />
                <span className="flex-1">{c.name}</span>
                <span className="text-sm text-muted">{c.supported ? c.label : `${c.label} (video only, not yet)`}</span>
              </label>
            ))}
          </div>
          <button className="btn-accent mt-6 w-full py-3" disabled={saving || selected.size === 0} onClick={finish}>
            {saving ? "Saving…" : "Looks right, let's go"}
          </button>
        </div>
      )}
    </div>
  );
}
