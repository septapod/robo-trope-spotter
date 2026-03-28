import { pgTable, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  sourceText: text("source_text").notNull(),
  sourceUrl: text("source_url"),
  inputType: text("input_type").notNull(), // 'text' | 'url' | 'screenshot'
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
