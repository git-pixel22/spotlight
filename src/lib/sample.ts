import "server-only";
import type { ChannelInfo } from "@/lib/db/schema";
import { ruleFor } from "@/lib/channels";

// A sample week for a one-person home bakery. Moments, questions, answers and
// posts are precomputed so the whole flow (including real Buffer calls) works
// even when every free AI quota is used up.

// Photos from Unsplash (Unsplash License), stored at stable public URLs because Buffer
// fetches media when it publishes. Credits in the README.
export const SAMPLE_PHOTO_BASE = "https://i1ikllg7y8rxw8mn.public.blob.vercel-storage.com/sample-v2";
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
    observation: "Two seeded croissants split open and filled with cream, raspberries and blueberries.",
    question: "What gave you the idea for these berry croissants?",
    photos: [{ url: photo("croissants"), alt: "Two seeded croissants split open and filled with whipped cream, raspberries and blueberries on a white plate" }],
    sampleAnswer:
      "These berry croissants started as leftovers. I had blueberries and raspberries from a cake order and a tray of croissants from the morning, so I split them, piped in vanilla cream and just piled the berries on top. First batch ever, and all eight sold before lunch. Three people asked if they'd be back on Saturday. So I guess they're back on Saturday.",
    posts: {
      twitter:
        "These berry croissants started as leftovers: blueberries and raspberries from a cake order, croissants from the morning, vanilla cream. First batch ever, all eight sold before lunch. So I guess they're back on Saturday.",
      linkedin:
        "These berry croissants started as leftovers.\n\nI had blueberries and raspberries from a cake order and a tray of croissants from the morning, so I split them, piped in vanilla cream and piled the berries on top.\n\nFirst batch ever, and all eight sold before lunch. Three people asked if they'd be back on Saturday.\n\nSo I guess they're back on Saturday.",
      instagram:
        "These berry croissants started as leftovers 🫐 Blueberries and raspberries from a cake order, croissants from the morning, vanilla cream piped in. First batch ever, and all eight sold before lunch. Three people asked if they'd be back on Saturday. So I guess they're back on Saturday 🥐\n\n#homebakery #croissants #smallbatch",
      default:
        "These berry croissants started as leftovers. Blueberries and raspberries from a cake order, a tray of croissants from the morning, vanilla cream piped in. First batch ever, and all eight sold before lunch. Three people asked if they'd be back on Saturday. So I guess they're back on Saturday.",
    },
  },
  {
    title: "The cookie box favourite",
    observation: "A box of loaded cookies, one topped with an Oreo, and a bright green matcha cookie with white chocolate chunks.",
    question: "Which flavour in this box disappears first?",
    photos: [
      { url: photo("cookie-box"), alt: "An open gift box of six loaded cookies with almonds, chocolate drizzle, a caramel biscuit and an Oreo on top" },
      { url: photo("cookie-matcha"), alt: "A green matcha cookie with white chocolate chunks on a wooden board" },
    ],
    sampleAnswer:
      "The matcha one, every single time. I almost didn't make it because I thought matcha was too niche, and now people message me just to ask if it's in the box this week. The Oreo one is for the kids. And honestly for me.",
    posts: {
      twitter: "The matcha one, every single time. I almost didn't make it because I thought matcha was too niche. Now people message me just to ask if it's in the box this week.",
      linkedin:
        "The matcha one. Every single time.\n\nI almost didn't make it because I thought matcha was too niche. Now people message me just to ask if it's in the box this week.\n\nThe Oreo one is for the kids. And honestly, for me.",
      instagram:
        "The matcha one, every single time 💚 I almost didn't make it because I thought matcha was too niche, and now people message me just to ask if it's in the box this week.\n\nThe Oreo one is for the kids. And honestly for me 🍪\n\n#cookiebox #matcha",
      default:
        "The matcha one, every single time. I almost didn't make it because I thought matcha was too niche, and now people message me just to ask if it's in the box this week. The Oreo one is for the kids. And honestly for me.",
    },
  },
  {
    title: "The first festive batch",
    observation: "Chocolate cupcakes in shiny green cases with sprinkles and a glittery Christmas tree on top.",
    question: "What's the story behind the little trees on top?",
    photos: [{ url: photo("cupcakes-festive"), alt: "A chocolate cupcake in a green foil case topped with sprinkles and a glitter Christmas tree pick" }],
    sampleAnswer:
      "The glitter trees came out on Monday and went straight onto the chocolate cupcakes, green cases and all. It's still November, I know, but the kitchen feels like December already. And honestly so do I.",
    posts: {
      twitter: "The glitter trees came out on Monday and went straight onto the chocolate cupcakes, green cases and all. It's still November, I know. The kitchen feels like December already. So do I.",
      linkedin:
        "The glitter trees came out on Monday and went straight onto the chocolate cupcakes, green cases and all.\n\nIt's still November, I know. But the kitchen feels like December already.\n\nAnd honestly, so do I.",
      instagram:
        "The glitter trees came out on Monday 🎄 and went straight onto the chocolate cupcakes, green cases and all. It's still November, I know, but the kitchen feels like December already. And honestly so do I.\n\n#festivebaking #cupcakes",
      default:
        "The glitter trees came out on Monday and went straight onto the chocolate cupcakes, green cases and all. It's still November, I know, but the kitchen feels like December already. And honestly so do I.",
    },
  },
  {
    title: "Ten minutes before opening",
    observation: "A full counter of labelled croissants and pastries, and trays of pain au chocolat and custard tarts.",
    question: "What does the counter look like ten minutes before you open?",
    photos: [
      { url: photo("display-case"), alt: "A bakery counter with rows of labelled croissants and pastries under warm lights" },
      { url: photo("display-trays"), alt: "Trays of pain au chocolat and custard tarts lined up on a counter" },
    ],
    sampleAnswer:
      "Ten minutes before we open, it's full. Every tray filled, labels straight, coffee on. Ten minutes later it's chaos and by noon the top shelf is empty. Those ten minutes are my favourite part of the week.",
    posts: {
      twitter: "Ten minutes before we open: every tray filled, labels straight, coffee on. Ten minutes later it's chaos, and by noon the top shelf is empty. Those ten minutes are my favourite part of the week.",
      linkedin:
        "Ten minutes before we open, it's full.\n\nEvery tray filled, labels straight, coffee on.\n\nTen minutes later it's chaos, and by noon the top shelf is empty.\n\nThose ten minutes are my favourite part of the week.",
      instagram:
        "Ten minutes before we open ☕️ Every tray filled, labels straight, coffee on. Ten minutes later it's chaos and by noon the top shelf is empty. Those ten minutes are my favourite part of the week.\n\n#bakerylife #behindthecounter",
      default:
        "Ten minutes before we open, it's full. Every tray filled, labels straight, coffee on. Ten minutes later it's chaos and by noon the top shelf is empty. Those ten minutes are my favourite part of the week.",
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
