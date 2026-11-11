import Link from "next/link";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { and, desc, eq, gte, inArray, or } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import { db, schema } from "@/lib/db";
import { daysAgo, targetChannels } from "@/lib/moments";
import { ruleFor } from "@/lib/channels";
import { sampleFor } from "@/lib/sample";
import { MomentCard, type ChannelView } from "./moment-card";

export default async function MomentsPage({ searchParams }: PageProps<"/app/moments">) {
  const user = await requireUser();
  const { focus } = await searchParams;
  const since = daysAgo(3);

  const moments = await db.query.moments.findMany({
    where: and(
      eq(schema.moments.userId, user.id),
      or(inArray(schema.moments.status, ["new", "answered"]), and(eq(schema.moments.status, "sent"), gte(schema.moments.createdAt, since))),
    ),
    orderBy: desc(schema.moments.createdAt),
    limit: 30,
  });
  const drafts = moments.length
    ? await db.query.drafts.findMany({ where: inArray(schema.drafts.momentId, moments.map((m) => m.id)) })
    : [];

  const channels: ChannelView[] = targetChannels(user).map((c) => {
    const rule = ruleFor(c.service);
    return { id: c.id, service: c.service, label: rule.label, name: c.displayName ?? c.name, avatar: c.avatar, limit: rule.limit, requiresImage: Boolean(rule.requiresImage) };
  });

  const open = moments.filter((m) => m.status !== "sent");
  const sent = moments.filter((m) => m.status === "sent");

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl">Your moments</h1>
          <p className="mt-1 text-muted">Answer in your own words. Spotlight fits them to each channel.</p>
        </div>
        <Link href="/app/photos" className="btn-ghost shrink-0">Add photos</Link>
      </div>

      {open.length === 0 && (
        <div className="panel mt-8 p-8 text-center">
          <p className="font-medium">Nothing waiting right now.</p>
          <p className="mt-1 text-sm text-muted">Drop a few photos or record a thought to find your next post.</p>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {open.map((m) => (
          <MomentCard
            key={m.id}
            moment={{ id: m.id, source: m.source, title: m.title, observation: m.observation, question: m.question, photos: m.photos, take: m.take, status: m.status }}
            drafts={drafts.filter((d) => d.momentId === m.id).map((d) => ({ id: d.id, channelId: d.channelId, text: d.text, status: d.status, error: d.error }))}
            channels={channels}
            sampleAnswer={m.source === "sample" ? sampleFor(m.title)?.sampleAnswer ?? null : null}
            focused={m.id === focus}
          />
        ))}
      </div>

      {sent.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-2xl">Sent to Buffer recently</h2>
          <ul className="mt-3 space-y-2">
            {sent.map((m) => (
              <li key={m.id} className="panel flex items-center justify-between px-4 py-3 text-sm">
                <span>{m.title}</span>
                <span className="flex items-center gap-1 text-success"><Check weight="bold" /> In Buffer</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
