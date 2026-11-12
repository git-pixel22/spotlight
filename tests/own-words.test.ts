import { test } from "node:test";
import assert from "node:assert/strict";
import { keepOwnWords } from "@/lib/ai/own-words";

// The owner's spoken answer from the demo, filler and all.
const take =
  "Um, so, matcha Oreo. Every single time. I almost didn't make it, like, I thought matcha was too niche, you know? And now people message me just to ask if it's in the box this week.";

test("keeps a post built from the owner's own sentences", () => {
  const post =
    "Matcha Oreo, every single time. I almost didn't make it because I thought matcha was too niche. Now people message me just to ask if it's in the box this week.";
  assert.equal(keepOwnWords(post, take, { allowHashtags: false }), post);
});

test("drops a closing line the owner never said", () => {
  const post = "Matcha Oreo, every single time. I love these little traditions with my customers.";
  assert.equal(keepOwnWords(post, take, { allowHashtags: false }), "Matcha Oreo, every single time.");
});

test("drops a call to action the owner never said", () => {
  const post = "Matcha Oreo, every single time.\n\nOrder yours today before they sell out!";
  assert.equal(keepOwnWords(post, take, { allowHashtags: false }), "Matcha Oreo, every single time.");
});

test("keeps hashtag lines only when the owner's voice uses hashtags", () => {
  const post = "Matcha Oreo, every single time.\n\n#cookiebox #matcha";
  assert.equal(keepOwnWords(post, take, { allowHashtags: false }), "Matcha Oreo, every single time.");
  assert.equal(keepOwnWords(post, take, { allowHashtags: true }), post);
});

test("keeps line breaks the editor added between the owner's sentences", () => {
  const post = "Matcha Oreo. Every single time.\n\nNow people message me just to ask if it's in the box this week.";
  assert.equal(keepOwnWords(post, take, { allowHashtags: false }), post);
});
