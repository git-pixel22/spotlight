/* eslint-disable @next/next/no-img-element */
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import { firstName, requireUser, type User } from "@/lib/session";
import { db, schema } from "@/lib/db";
import { getQueueStatus } from "@/lib/queue";
import { upcomingCalendarMoments } from "@/lib/calendar";
import { SAMPLE_PHOTO_BASE } from "@/lib/sample";
import { ChannelAvatar } from "@/components/channel-avatar";
import { CalendarPrompt, SampleTile, ThoughtTile } from "./home-actions";

const photo = (name: string) => `${SAMPLE_PHOTO_BASE}/${name}.jpg`;

function greeting(tz: string | null) {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: tz ?? "UTC", hour: "numeric", hour12: false }).format(new Date()));
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AppHome() {
  const user = await requireUser();
  if (!user.profile) redirect("/app/welcome");

  const waiting = await db.query.moments.findMany({
    where: and(eq(schema.moments.userId, user.id), inArray(schema.moments.status, ["new", "answered"])),
    orderBy: desc(schema.moments.createdAt),
    limit: 20,
  });
  const recentPhotos = waiting.flatMap((m) => m.photos.map((p) => p.url)).slice(0, 3);
  const stack = recentPhotos.length === 3 ? recentPhotos : [photo("cookie-box"), photo("muffins"), photo("croissants")];
  const calendar = upcomingCalendarMoments(user.channels[0]?.timezone ?? user.timezone);
  const name = firstName(user);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="font-heading text-4xl sm:text-5xl">
          {greeting(user.timezone)}{name ? `, ${name}` : ""}.
        </h1>
        <p className="mt-2 text-lg text-muted">What happened this week that nobody has seen yet?</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link href="/app/photos" className="group relative flex flex-col overflow-hidden rounded-[20px] bg-stage p-6 text-white sm:col-span-2 sm:row-span-2">
          <div className="relative mb-5 h-28 w-48">
            {stack.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className="absolute left-0 top-1 h-24 w-20 rounded-lg border-2 border-stage object-cover shadow-xl transition duration-300 group-hover:rotate-0"
                style={{ transform: `translateX(${i * 40}px) rotate(${(i - 1) * 7}deg)`, zIndex: 3 - Math.abs(i - 1) }}
              />
            ))}
          </div>
          <span className="font-heading text-3xl">Drop this week&apos;s photos</span>
          <span className="mt-2 max-w-xs text-white/70">Spotlight finds the moments worth sharing and asks you one question about each.</span>
          <span className="btn-accent mt-5 self-start">Choose photos</span>
        </Link>
        <div className="grid gap-3 sm:row-span-2">
          <ThoughtTile />
          <SampleTile photo={photo("croissants")} />
        </div>
      </section>

      {waiting.length > 0 && (
        <Link href="/app/moments" className="flex items-center justify-between gap-4 rounded-[20px] bg-accent-soft p-5 transition hover:brightness-[0.98]">
          <span>
            <span className="font-heading block text-xl">
              {waiting.length} moment{waiting.length === 1 ? "" : "s"} waiting for your take
            </span>
            <span className="text-sm text-muted">{waiting.slice(0, 3).map((m) => m.title).join(", ")}</span>
          </span>
          <span className="btn-accent shrink-0">Answer</span>
        </Link>
      )}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-heading text-2xl">Your week in Buffer</h2>
          <p className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ink" /> Scheduled</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-ink bg-accent" /> Quiet posting day</span>
          </p>
        </div>
        <Suspense fallback={<div className="panel mt-4 h-28 animate-pulse" />}>
          <QueueStrip user={user} />
        </Suspense>
      </section>

      {calendar.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl">Coming up</h2>
          <div className="mt-2 divide-y divide-line">
            {calendar.map((c) => (
              <CalendarPrompt key={c.name} {...c} />
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-sm text-muted">
        <Link href="/app/welcome" className="underline-offset-4 hover:text-ink hover:underline">Edit what Spotlight knows about you</Link>
      </p>
    </div>
  );
}

async function QueueStrip({ user }: { user: User }) {
  let queue;
  try {
    queue = await getQueueStatus(user);
  } catch {
    return <p className="panel mt-4 p-5 text-sm text-muted">Couldn&apos;t reach Buffer just now. Your week will show up here.</p>;
  }
  if (!queue.length) return <p className="panel mt-4 p-5 text-sm text-muted">No channels selected.</p>;
  return (
    <div className="panel mt-4 divide-y divide-line">
      {queue.map((q) => (
        <div key={q.channelId} className="flex flex-wrap items-center gap-4 px-5 py-4">
          <div className="flex min-w-40 flex-1 items-center gap-3">
            <ChannelAvatar avatar={q.avatar} label={q.label} size={32} />
            <div>
              <p className="text-sm font-medium">{q.label}</p>
              <p className="text-xs text-muted">
                {q.paused ? "Queue paused" : q.quietFrom ? `Quiet from ${q.quietFrom}` : "Covered all week"}
              </p>
            </div>
          </div>
          <ol className="flex gap-2" aria-label={`${q.label}, next 7 days`}>
            {q.days.map((d) => (
              <li key={d.label} className="flex flex-col items-center gap-1" title={`${d.label}: ${d.scheduled} scheduled`}>
                <span
                  className={`h-3 w-3 rounded-full ${
                    d.scheduled ? "bg-ink" : d.postingDay ? "border-2 border-ink bg-accent" : "border border-line"
                  }`}
                />
                <span className={`text-[11px] ${d.isToday ? "font-semibold text-ink" : "text-muted"}`}>{d.label}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
