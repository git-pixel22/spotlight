import "server-only";
import type { ChannelInfo } from "@/lib/db/schema";
import { ruleFor } from "@/lib/channels";

// A sample week for a one-person home bakery. Moments, questions, answers and
// posts are precomputed so the whole flow (including real Buffer calls) works
// even when every free AI quota is used up.

export const SAMPLE_PHOTO_BASE = "https://i1ikllg7y8rxw8mn.public.blob.vercel-storage.com/sample";
const photo = (name: string) => `${SAMPLE_PHOTO_BASE}/${name}.jpg`;

type SampleMoment = {
  title: string;
  observation: string;
  question: string;
  photos: { url: string; alt: string }[];
  sampleAnswer: string;
  posts: Partial<Record<string, string>> & { default: string };
};

export const SAMPLE_MOMENTS: SampleMoment[] = [
  {
    title: "The berry croissant debut",
    observation: "Two croissants split and filled with vanilla cream, piled with raspberries and blueberries.",
    question: "Is this the first time you've made these berry croissants?",
    photos: [{ url: photo("croissants"), alt: "Two croissants filled with vanilla cream and topped with raspberries and blueberries in a box" }],
    sampleAnswer:
      "Yeah, first batch ever. I had leftover blueberries and raspberries from a cake order and a tray of croissants from the morning, so I split them, piped in vanilla cream and just piled the berries on top. Sold all eight before lunch and three people asked if they'd be back on Saturday. So I guess they're back on Saturday.",
    posts: {
      twitter: "First batch ever: leftover berries from a cake order, morning croissants, vanilla cream. All eight gone before lunch and three people asked if they'd be back on Saturday. So they're back on Saturday.",
      linkedin:
        "First batch ever.\n\nI had leftover blueberries and raspberries from a cake order and a tray of croissants from the morning. So I split them, piped in vanilla cream and piled the berries on top.\n\nAll eight sold before lunch, and three people asked if they'd be back on Saturday.\n\nSo I guess they're back on Saturday.",
      instagram:
        "First batch ever 🫐 Leftover berries from a cake order + this morning's croissants + vanilla cream. All eight gone before lunch, and three of you asked if they'd be back on Saturday. So I guess they're back on Saturday 🥐\n\n#homebakery #croissants #smallbatch",
      default:
        "First batch ever. Leftover blueberries and raspberries from a cake order, a tray of morning croissants, vanilla cream piped in. All eight sold before lunch and three people asked if they'd be back on Saturday. So I guess they're back on Saturday.",
    },
  },
  {
    title: "The cookie box favourite",
    observation: "A box of stuffed cookies: matcha with an Oreo, red velvet, a bright blue one and a caramel crunch.",
    question: "Which flavour in this box disappears first?",
    photos: [
      { url: photo("cookie-box"), alt: "A box of six stuffed cookies including matcha, red velvet and a bright blue cookie" },
      { url: photo("cookies-assorted"), alt: "A box of assorted cookies on parchment paper" },
    ],
    sampleAnswer:
      "Matcha Oreo, every single time. I almost didn't make it because I thought matcha was too niche, and now people message me just to ask if it's in the box this week. The blue one is cookie monster. That's for the kids. And honestly for me.",
    posts: {
      twitter: "Matcha Oreo goes first, every single time. I almost didn't make it because I thought matcha was too niche. Now people message just to ask if it's in the box this week.",
      linkedin:
        "Matcha Oreo. Every single time.\n\nI almost didn't make it because I thought matcha was too niche. Now people message me just to ask if it's in the box this week.\n\nThe blue one is cookie monster. That's for the kids. And honestly, for me.",
      instagram:
        "Which one goes first? Matcha Oreo, every single time 💚 I almost didn't make it because I thought matcha was too niche, and now you message me just to ask if it's in the box this week.\n\nThe blue one is cookie monster. That's for the kids. And honestly for me 💙\n\n#cookiebox #matcha",
      default:
        "Matcha Oreo, every single time. I almost didn't make it because I thought matcha was too niche, and now people message me just to ask if it's in the box this week. The blue one is cookie monster. That's for the kids. And honestly for me.",
    },
  },
  {
    title: "The first festive batch",
    observation: "Chocolate chip muffins in brown tulip cases, with a tiny Christmas tree in the background.",
    question: "The little tree in the back: is this your first festive bake of the year?",
    photos: [{ url: photo("muffins"), alt: "Chocolate chip muffins in brown paper cases with a small Christmas tree behind them" }],
    sampleAnswer:
      "It is. The mini tree went up on Monday and the chocolate chip muffins got the brown tulip cases. It's still November, I know, but the kitchen feels like December already. And honestly so do I.",
    posts: {
      twitter: "The mini tree went up on Monday and the chocolate chip muffins got the brown tulip cases. It's still November, I know. The kitchen feels like December already. So do I.",
      linkedin:
        "The mini tree went up on Monday, and the chocolate chip muffins got the brown tulip cases.\n\nIt's still November, I know. But the kitchen feels like December already.\n\nAnd honestly, so do I.",
      instagram:
        "The mini tree went up on Monday 🎄 and the chocolate chip muffins got their brown tulip cases. It's still November, I know, but the kitchen feels like December already. And honestly so do I.\n\n#festivebaking #muffins",
      default:
        "The mini tree went up on Monday and the chocolate chip muffins got the brown tulip cases. It's still November, I know, but the kitchen feels like December already. And honestly so do I.",
    },
  },
  {
    title: "Ten minutes before opening",
    observation: "A full display case: rows of pastries, labels in place, every shelf stocked.",
    question: "What does the counter look like ten minutes before you open?",
    photos: [
      { url: photo("display-case"), alt: "A glass display case full of pastries on labelled trays" },
      { url: photo("display-trays"), alt: "Trays of doughnuts and cinnamon rolls on a bakery rack" },
    ],
    sampleAnswer:
      "Full. Every tray filled, labels straight, coffee on. Ten minutes later it's chaos and by noon the top shelf is empty. Those ten minutes are my favourite part of the week.",
    posts: {
      twitter: "Ten minutes before opening: every tray full, labels straight, coffee on. Ten minutes later it's chaos, and by noon the top shelf is empty. Those ten minutes are my favourite part of the week.",
      linkedin:
        "Ten minutes before opening.\n\nEvery tray filled, labels straight, coffee on.\n\nTen minutes later it's chaos, and by noon the top shelf is empty.\n\nThose ten minutes are my favourite part of the week.",
      instagram:
        "Ten minutes before opening ☕️ Every tray filled, labels straight, coffee on. Ten minutes later it's chaos and by noon the top shelf is empty. Those ten minutes are my favourite part of the week.\n\n#bakerylife #behindthecounter",
      default:
        "Full. Every tray filled, labels straight, coffee on. Ten minutes later it's chaos and by noon the top shelf is empty. Those ten minutes are my favourite part of the week.",
    },
  },
];

export function sampleFor(title: string) {
  return SAMPLE_MOMENTS.find((m) => m.title === title) ?? null;
}

export function samplePostsFor(title: string, channels: ChannelInfo[]) {
  const sample = sampleFor(title);
  if (!sample) return null;
  return {
    posts: channels.map((c) => ({
      channelId: c.id,
      text: (sample.posts[c.service] ?? sample.posts.default).slice(0, ruleFor(c.service).limit),
    })),
    altTexts: sample.photos.map((p) => p.alt),
  };
}
