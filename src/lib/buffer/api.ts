import "server-only";
import { bufferGql, gqlWithToken } from "./client";
import type { ChannelInfo } from "@/lib/db/schema";

export type BufferAccount = {
  id: string;
  name: string | null;
  email: string | null;
  timezone: string | null;
  organizations: { id: string; name: string }[];
};

export async function fetchAccount(accessToken: string) {
  const data = await gqlWithToken<{ account: BufferAccount }>(
    accessToken,
    `query { account { id name email timezone organizations { id name } } }`,
  );
  return data.account;
}

export type BufferChannel = ChannelInfo & {
  postingSchedule: { day: string; times: string[]; paused: boolean }[] | null;
  isQueuePaused: boolean | null;
  isDisconnected: boolean | null;
};

export async function fetchChannels(userIdOrToken: { userId: string } | { token: string }, organizationId: string) {
  const query = `query Channels($org: OrganizationId!) {
    channels(input: { organizationId: $org }) {
      id service name displayName avatar timezone isQueuePaused isDisconnected
      postingSchedule { day times paused }
    }
  }`;
  const vars = { org: organizationId };
  const data =
    "token" in userIdOrToken
      ? await gqlWithToken<{ channels: BufferChannel[] }>(userIdOrToken.token, query, vars)
      : await bufferGql<{ channels: BufferChannel[] }>(userIdOrToken.userId, query, vars);
  return data.channels;
}

export type BufferPost = {
  id: string;
  text: string | null;
  status: string;
  dueAt: string | null;
  sentAt: string | null;
  channelId: string;
  channelService: string;
};

const POST_FIELDS = "id text status dueAt sentAt channelId channelService";

export async function fetchSentPosts(userId: string, organizationId: string, limit = 50) {
  const data = await bufferGql<{ posts: { edges: { node: BufferPost }[] } }>(
    userId,
    `query Sent($org: OrganizationId!, $first: Int) {
      posts(first: $first, input: { organizationId: $org, filter: { status: [sent] }, sort: { field: dueAt, direction: desc } }) {
        edges { node { ${POST_FIELDS} } }
      }
    }`,
    { org: organizationId, first: limit },
  );
  return data.posts.edges.map((e) => e.node);
}

export async function fetchScheduledPosts(userId: string, organizationId: string) {
  const data = await bufferGql<{ posts: { edges: { node: BufferPost }[] } }>(
    userId,
    `query Scheduled($org: OrganizationId!) {
      posts(first: 100, input: { organizationId: $org, filter: { status: [scheduled] }, sort: { field: dueAt, direction: asc } }) {
        edges { node { ${POST_FIELDS} } }
      }
    }`,
    { org: organizationId },
  );
  return data.posts.edges.map((e) => e.node);
}

type MutationResult = { __typename: string; message?: string; post?: { id: string; dueAt: string | null } };

/** Per-network metadata Buffer requires for a plain photo/text post. */
function metadataFor(service: string) {
  switch (service) {
    case "instagram":
      return { instagram: { type: "post", shouldShareToFeed: true } };
    case "facebook":
      return { facebook: { type: "post" } };
    case "googlebusiness":
      return { google: { type: "whats_new" } };
    default:
      return undefined;
  }
}

export async function createPost(
  userId: string,
  args: {
    channelId: string;
    service: string;
    text: string;
    images: { url: string; alt?: string }[];
    mode: "draft" | "queue" | "scheduled";
    dueAt?: string; // ISO, required for "scheduled"
  },
) {
  const input = {
    channelId: args.channelId,
    text: args.text,
    assets: args.images.map((img) => ({
      image: { url: img.url, metadata: { altText: img.alt ?? "" } },
    })),
    mode: args.mode === "scheduled" ? "customScheduled" : "addToQueue",
    ...(args.mode === "scheduled" ? { dueAt: args.dueAt } : {}),
    schedulingType: "automatic",
    needsApproval: false,
    saveToDraft: args.mode === "draft",
    source: "spotlight",
    metadata: metadataFor(args.service),
  };
  const data = await bufferGql<{ createPost: MutationResult }>(
    userId,
    `mutation Create($input: CreatePostInput!) {
      createPost(input: $input) {
        __typename
        ... on PostActionSuccess { post { id dueAt } }
        ... on MutationError { message }
      }
    }`,
    { input },
  );
  const r = data.createPost;
  if (r.__typename !== "PostActionSuccess" || !r.post) {
    throw new Error(r.message ?? `Buffer returned ${r.__typename}`);
  }
  return r.post;
}

export async function createIdea(
  userId: string,
  args: { organizationId: string; title: string; text: string; images: { url: string; alt?: string }[] },
) {
  const input = {
    organizationId: args.organizationId,
    content: {
      title: args.title,
      text: args.text,
      media: args.images.map((img) => ({ url: img.url, alt: img.alt ?? "", type: "image" })),
    },
  };
  const data = await bufferGql<{
    createIdea: { __typename: string; id?: string; idea?: { id: string }; message?: string };
  }>(
    userId,
    `mutation CreateIdea($input: CreateIdeaInput!) {
      createIdea(input: $input) {
        __typename
        ... on Idea { id }
        ... on IdeaResponse { idea { id } }
        ... on InvalidInputError { message }
        ... on UnauthorizedError { message }
        ... on UnexpectedError { message }
        ... on LimitReachedError { message }
      }
    }`,
    { input },
  );
  const r = data.createIdea;
  const id = r.id ?? r.idea?.id;
  if (!id) throw new Error(r.message ?? `Buffer returned ${r.__typename}`);
  return id;
}
