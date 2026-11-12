import { test } from "node:test";
import assert from "node:assert/strict";
import { isThin } from "@/lib/answers";

test("a bare yes or no is too short to post on its own", () => {
  for (const answer of ["Yes", "yes.", "No", "Nope!", "Yeah, first time.", "Every single time."]) {
    assert.equal(isThin(answer), true, answer);
  }
});

test("a short yes/no answer still needs a line of context", () => {
  assert.equal(isThin("Yeah, made them for the first time."), true);
  assert.equal(isThin("Not really, we just had extra berries."), true);
});

test("an answer that tells a story is fine", () => {
  for (const answer of [
    "Matcha Oreo, every single time.",
    "These berry croissants started as leftovers from a cake order.",
    "Yes, and all eight sold before lunch, so they're back on Saturday.",
  ]) {
    assert.equal(isThin(answer), false, answer);
  }
});
