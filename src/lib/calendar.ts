// Calendar moments: upcoming dates a small business might want to say something about.
// Each comes with a question, because Spotlight asks and you answer.

type Region = "global" | "US" | "UK" | "IN" | "CA" | "AU";

type CalendarEvent = {
  date: string; // YYYY-MM-DD
  name: string;
  regions: Region[];
  question: string;
};

const EVENTS: CalendarEvent[] = [
  { date: "2026-11-26", name: "Thanksgiving", regions: ["US"], question: "Who or what are you most thankful for in your business this year?" },
  { date: "2026-11-27", name: "Black Friday", regions: ["global"], question: "Are you doing anything for Black Friday, or deliberately skipping it? Why?" },
  { date: "2026-11-28", name: "Small Business Saturday", regions: ["US"], question: "What's one thing only a small business like yours can offer?" },
  { date: "2026-11-30", name: "Cyber Monday", regions: ["global"], question: "Anything new you can point people to this Cyber Monday?" },
  { date: "2026-12-01", name: "Giving Tuesday", regions: ["global"], question: "Is there a cause or a neighbour you'd like to shout out this Giving Tuesday?" },
  { date: "2026-12-05", name: "Small Business Saturday UK", regions: ["UK"], question: "What's one thing only a small business like yours can offer?" },
  { date: "2026-12-21", name: "The shortest day", regions: ["US", "UK", "CA"], question: "What gets you through the darkest week of the year?" },
  { date: "2026-12-24", name: "Christmas Eve", regions: ["global"], question: "What does Christmas Eve look like for you and your work?" },
  { date: "2026-12-25", name: "Christmas", regions: ["global"], question: "Any festive orders, traditions or moments from this week worth sharing?" },
  { date: "2026-12-26", name: "Boxing Day", regions: ["UK", "CA", "AU"], question: "Are you open on Boxing Day, or finally taking a breather?" },
  { date: "2026-12-29", name: "Your year in review", regions: ["global"], question: "Looking back at this year, what's the moment you're proudest of?" },
  { date: "2026-12-31", name: "New Year's Eve", regions: ["global"], question: "What's one thing you want to do differently next year?" },
  { date: "2027-01-01", name: "New Year's Day", regions: ["global"], question: "What are you most excited to make or offer this year?" },
  { date: "2027-01-13", name: "Lohri", regions: ["IN"], question: "Any Lohri plans, orders or memories to share?" },
  { date: "2027-01-18", name: "Martin Luther King Jr. Day", regions: ["US"], question: "Is there someone in your community you'd like to recognise today?" },
  { date: "2027-01-26", name: "Republic Day", regions: ["IN"], question: "Anything special you're doing for Republic Day?" },
  { date: "2027-01-26", name: "Australia Day", regions: ["AU"], question: "Are you open on Australia Day? Anything planned?" },
];

export function regionForTimezone(tz: string | null | undefined): Region {
  if (!tz) return "global";
  if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "IN";
  if (tz.startsWith("Australia/")) return "AU";
  if (tz === "Europe/London") return "UK";
  if (["America/Toronto", "America/Vancouver", "America/Edmonton", "America/Winnipeg", "America/Halifax"].includes(tz)) return "CA";
  if (tz.startsWith("America/")) return "US";
  return "global";
}

export type CalendarMoment = { name: string; date: string; daysAway: number; question: string };

export function upcomingCalendarMoments(tz: string | null | undefined, limit = 3): CalendarMoment[] {
  const region = regionForTimezone(tz);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz ?? "UTC", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const dayMs = 24 * 60 * 60 * 1000;
  return EVENTS.filter((e) => e.regions.includes("global") || e.regions.includes(region))
    .map((e) => ({ ...e, daysAway: Math.round((Date.parse(e.date) - Date.parse(today)) / dayMs) }))
    .filter((e) => e.daysAway >= 0 && e.daysAway <= 45)
    .slice(0, limit)
    .map(({ name, date, daysAway, question }) => ({ name, date, daysAway, question }));
}
