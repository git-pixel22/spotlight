import { test } from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_MOMENTS } from "@/lib/sample";
import { EVENTS } from "@/lib/calendar";
import { keepOwnWords } from "@/lib/ai/own-words";
import { NETWORKS } from "@/lib/channels";

// Followers never see our question, so a yes/no question invites a post that just says "yes".
const YES_NO = /^(is|are|was|were|do|does|did|have|has|had|can|could|will|would|should|any|anything)\b/i;

test("every sample week question is open", () => {
  for (const m of SAMPLE_MOMENTS) assert.doesNotMatch(m.question, YES_NO, m.question);
});

test("every calendar prompt is open", () => {
  for (const e of EVENTS) assert.doesNotMatch(e.question, YES_NO, `${e.name}: ${e.question}`);
});

test("sample posts use only the sample answer's words and fit each network", () => {
  for (const m of SAMPLE_MOMENTS) {
    for (const [service, post] of Object.entries(m.posts)) {
      if (!post) continue;
      const kept = keepOwnWords(post, m.sampleAnswer, { allowHashtags: true });
      assert.equal(kept.replace(/\s+/g, " "), post.replace(/\s+/g, " ").trim(), `${m.title} / ${service}`);
      const limit = NETWORKS[service]?.limit;
      if (limit) assert.ok(post.length <= limit, `${m.title} / ${service}: ${post.length} > ${limit}`);
    }
  }
});
