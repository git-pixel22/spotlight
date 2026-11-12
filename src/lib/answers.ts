/**
 * Followers see the photo and the answer, never our question, so a bare "yes" or a few
 * words won't make sense as a post. Such answers get one nudge to add a line first.
 */
export function isThin(text: string) {
  const words = text.match(/[\p{L}\p{N}']+/gu) ?? [];
  if (words.length <= 4) return true;
  return words.length <= 8 && /^(yes|yeah|yep|yup|no|nope|nah|sure|maybe|definitely|absolutely|exactly|correct|not really)\b/i.test(text.trim());
}
