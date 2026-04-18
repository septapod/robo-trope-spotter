import { pgTable, text, timestamp, jsonb, uuid, index } from "drizzle-orm/pg-core";

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  sourceText: text("source_text").notNull(),
  sourceUrl: text("source_url"),
  inputType: text("input_type").notNull(), // 'text' | 'url' | 'screenshot'
  results: jsonb("results").notNull(),
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

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type ShareEvent = typeof shareEvents.$inferSelect;
export type NewShareEvent = typeof shareEvents.$inferInsert;
