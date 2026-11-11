// "Spotlight never writes for you" is enforced here, not just requested in a
// prompt: any sentence whose words didn't come from the person's own answer
// is removed before the post reaches them.

const STOPWORDS = new Set(
  "a an and are as at be been but by for from had has have he her his i i'm in is it it's its just me my of on or our she so that the their them then there they this to us was we were what when which who will with you your".split(" "),
);

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .match(/[a-z0-9']+/g) ?? [];

function contentWords(s: string) {
  return words(s).filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/** A word counts as theirs if it, or its stem, appears in what they said. */
function stem(w: string) {
  return w.replace(/(ing|ed|es|s|'s)$/, "");
}

const isHashtagLine = (line: string) => /^\s*(#[\p{L}\p{N}_]+\s*)+$/u.test(line);

export function keepOwnWords(post: string, take: string, opts: { allowHashtags: boolean }): string {
  const said = new Set(contentWords(take).flatMap((w) => [w, stem(w)]));
  const owned = (sentence: string) => {
    const cw = contentWords(sentence);
    if (cw.length === 0) return true; // emoji or very short fragments
    const mine = cw.filter((w) => said.has(w) || said.has(stem(w))).length;
    return mine / cw.length >= 0.6;
  };

  const lines = post.split("\n").map((line) => {
    if (isHashtagLine(line)) return opts.allowHashtags ? line : "";
    // Split into sentences but keep their punctuation and trailing emoji.
    const sentences = line.match(/[^.!?]+[.!?]*[\s\p{Extended_Pictographic}️]*/gu) ?? [line];
    return sentences.filter(owned).join("").trimEnd();
  });

  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
