import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export type Profile = {
  summary: string; // "You run a home bakery in Pune..."
  business: string; // short noun phrase: "home bakery"
  topics: string[];
  voice: {
    tone: string;
    length: string;
    emoji: string;
    hashtags: string;
    language: string;
  };
  recentTopics: string[];
  basedOnPosts: number;
};

export type ChannelInfo = {
  id: string;
  service: string;
  name: string;
  displayName: string | null;
  avatar: string | null;
  timezone: string | null;
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  bufferAccountId: text("buffer_account_id").notNull().unique(),
  name: text("name"),
  email: text("email"),
  organizationId: text("organization_id").notNull(),
  timezone: text("timezone"),
  channels: jsonb("channels").$type<ChannelInfo[]>().notNull().default([]),
  selectedChannelIds: jsonb("selected_channel_ids").$type<string[]>().notNull().default([]),
  profile: jsonb("profile").$type<Profile | null>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bufferTokens = pgTable("buffer_tokens", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  accessTokenEnc: text("access_token_enc").notNull(),
  refreshTokenEnc: text("refresh_token_enc"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  scope: text("scope"),
  // Lease that serialises refreshes: rotating refresh tokens revoke the whole
  // grant if one is reused, so only one request may refresh at a time.
  refreshLeaseUntil: timestamp("refresh_lease_until", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MomentSource = "photo_dump" | "voice" | "calendar" | "sample";
export type MomentStatus = "new" | "answered" | "sent" | "dismissed";

export type MomentPhoto = { url: string; alt?: string };

export const moments = pgTable("moments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  source: text("source").$type<MomentSource>().notNull(),
  photos: jsonb("photos").$type<MomentPhoto[]>().notNull().default([]),
  title: text("title").notNull(),
  observation: text("observation"),
  question: text("question").notNull(),
  take: text("take"),
  status: text("status").$type<MomentStatus>().notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DraftStatus = "draft" | "sent" | "failed";
export type SendMode = "draft" | "queue" | "idea";

export const drafts = pgTable("drafts", {
  id: uuid("id").primaryKey().defaultRandom(),
  momentId: uuid("moment_id")
    .notNull()
    .references(() => moments.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  channelId: text("channel_id").notNull(),
  service: text("service").notNull(),
  text: text("text").notNull(),
  sendMode: text("send_mode").$type<SendMode>(),
  bufferPostId: text("buffer_post_id"),
  bufferIdeaId: text("buffer_idea_id"),
  error: text("error"),
  status: text("status").$type<DraftStatus>().notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiCalls = pgTable("ai_calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  task: text("task").notNull(),
  model: text("model").notNull(),
  ok: boolean("ok").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
