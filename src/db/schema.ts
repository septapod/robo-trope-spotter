import { pgTable, text, timestamp, jsonb, uuid, index } from "drizzle-orm/pg-core";

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  sourceText: text("source_text").notNull(),
  sourceUrl: text("source_url"),
  inputType: text("input_type").notNull(), // 'text' | 'url' | 'screenshot'
  results: jsonb("results").notNull(),
  // Optional foreign key to the user who analyzed this report. Null for
  // anonymous analyses. Used to drive Spotter Credit bylines.
  userId: uuid("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shareEvents = pgTable(
  "share_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportSlug: text("report_slug").notNull(),
    method: text("method").notNull(), // 'clipboard' | 'native'
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("share_events_slug_created_idx").on(table.reportSlug, table.createdAt),
    index("share_events_created_idx").on(table.createdAt),
  ]
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    // Optional public display name. Defaults to the email local-part on
    // first sign-in. Editable via the profile flow (post-launch).
    displayName: text("display_name"),
    // Optional public profile URL the user wants linked from their byline.
    profileUrl: text("profile_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("users_email_idx").on(table.email),
  ]
);

export const magicLinks = pgTable(
  "magic_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    // Random opaque token sent in the email link. Stored as a SHA-256 hash
    // so the database compromise alone cannot reveal usable tokens.
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    consumedAt: timestamp("consumed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("magic_links_token_idx").on(table.tokenHash),
    index("magic_links_email_idx").on(table.email),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    // Hash of the session secret. Cookie holds the raw secret; the database
    // never stores it directly.
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("sessions_token_idx").on(table.tokenHash),
    index("sessions_user_idx").on(table.userId),
  ]
);

// Per-report opt-out for Spotter Credit. Default behavior: if a report has
// userId set, the byline shows. A row in this table hides it. Null userId
// reports never have a byline regardless.
export const bylineOptOuts = pgTable(
  "byline_opt_outs",
  {
    reportId: uuid("report_id").primaryKey(),
    hiddenAt: timestamp("hidden_at").defaultNow().notNull(),
  }
);

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type ShareEvent = typeof shareEvents.$inferSelect;
export type NewShareEvent = typeof shareEvents.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type MagicLink = typeof magicLinks.$inferSelect;
export type NewMagicLink = typeof magicLinks.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
