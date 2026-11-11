// Per-network rules Spotlight needs when shaping a take into posts.

export type NetworkRule = {
  label: string;
  limit: number;
  maxImages: number;
  requiresImage?: boolean;
  style: string;
};

export const NETWORKS: Record<string, NetworkRule> = {
  twitter: { label: "X", limit: 280, maxImages: 4, style: "one punchy thought, no hashtag spam" },
  threads: { label: "Threads", limit: 500, maxImages: 10, style: "conversational, casual" },
  bluesky: { label: "Bluesky", limit: 300, maxImages: 4, style: "conversational, casual" },
  mastodon: { label: "Mastodon", limit: 500, maxImages: 4, style: "plain and friendly" },
  linkedin: { label: "LinkedIn", limit: 3000, maxImages: 9, style: "a short story with a takeaway, line breaks for readability" },
  instagram: { label: "Instagram", limit: 2200, maxImages: 10, requiresImage: true, style: "warm caption, a few relevant hashtags at the end" },
  facebook: { label: "Facebook", limit: 2000, maxImages: 10, style: "friendly, like talking to regulars" },
  googlebusiness: { label: "Google Business", limit: 1500, maxImages: 1, style: "clear and local, what a nearby customer needs to know" },
};

/** Networks Spotlight can post a text/photo post to. Video-only networks are skipped. */
export function isSupported(service: string) {
  return service in NETWORKS;
}

export function ruleFor(service: string): NetworkRule {
  return NETWORKS[service] ?? { label: service, limit: 500, maxImages: 4, style: "plain" };
}
