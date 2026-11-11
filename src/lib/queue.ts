import "server-only";
import type { User } from "@/lib/session";
import { fetchChannels, fetchScheduledPosts } from "@/lib/buffer/api";
import { isSupported, ruleFor } from "@/lib/channels";

export type ChannelQueue = {
  channelId: string;
  service: string;
  label: string;
  name: string;
  avatar: string | null;
  scheduledThisWeek: number;
  nextPostAt: string | null;
  quietFrom: string | null; // weekday name of the first posting day with nothing scheduled
  paused: boolean;
  days: { label: string; scheduled: number; postingDay: boolean; isToday: boolean }[];
};

function localParts(date: Date, timeZone: string) {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(date).toLowerCase().slice(0, 3);
  const longDay = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(date);
  return { ymd, weekday, longDay };
}

/** For each channel: what's scheduled in the next 7 days and where it goes quiet. */
export async function getQueueStatus(user: User): Promise<ChannelQueue[]> {
  const [channels, posts] = await Promise.all([
    fetchChannels({ userId: user.id }, user.organizationId),
    fetchScheduledPosts(user.id, user.organizationId),
  ]);
  const now = Date.now();
  const weekEnd = now + 7 * 24 * 60 * 60 * 1000;
  const selected = new Set(user.selectedChannelIds);

  return channels
    .filter((c) => selected.has(c.id) && isSupported(c.service) && !c.isDisconnected)
    .map((c) => {
      const tz = c.timezone ?? user.timezone ?? "UTC";
      const upcoming = posts
        .filter((p) => p.channelId === c.id && p.dueAt && new Date(p.dueAt).getTime() >= now)
        .sort((a, b) => a.dueAt!.localeCompare(b.dueAt!));
      const thisWeek = upcoming.filter((p) => new Date(p.dueAt!).getTime() <= weekEnd);
      const coveredDays = new Set(thisWeek.map((p) => localParts(new Date(p.dueAt!), tz).ymd));
      const postingDays = new Set(
        (c.postingSchedule ?? []).filter((d) => !d.paused && d.times.length).map((d) => d.day),
      );

      const perDay = new Map<string, number>();
      for (const p of thisWeek) {
        const ymd = localParts(new Date(p.dueAt!), tz).ymd;
        perDay.set(ymd, (perDay.get(ymd) ?? 0) + 1);
      }

      let quietFrom: string | null = null;
      const days: ChannelQueue["days"] = [];
      for (let i = 0; i < 7; i++) {
        const day = localParts(new Date(now + i * 24 * 60 * 60 * 1000), tz);
        const isPostingDay = postingDays.size ? postingDays.has(day.weekday) : true;
        days.push({ label: day.longDay.slice(0, 3), scheduled: perDay.get(day.ymd) ?? 0, postingDay: isPostingDay, isToday: i === 0 });
        if (!quietFrom && isPostingDay && !coveredDays.has(day.ymd)) {
          quietFrom = i === 0 ? "today" : i === 1 ? "tomorrow" : day.longDay;
        }
      }

      return {
        channelId: c.id,
        service: c.service,
        label: ruleFor(c.service).label,
        name: c.displayName ?? c.name,
        avatar: c.avatar,
        scheduledThisWeek: thisWeek.length,
        nextPostAt: upcoming[0]?.dueAt ?? null,
        quietFrom,
        paused: Boolean(c.isQueuePaused),
        days,
      };
    });
}

