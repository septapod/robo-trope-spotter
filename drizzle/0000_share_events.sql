-- Migration: create share_events table + indexes.
--
-- Precondition: the `reports` table already exists in production (seeded by
-- an earlier `drizzle-kit push` before migrations were tracked in git). Run
-- `drizzle-kit introspect` against the target DB before applying this file
-- to establish the baseline; then apply this migration as the first new
-- delta. See drizzle/README.md for the full deploy procedure.

CREATE TABLE "share_events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "report_slug" text NOT NULL,
    "method" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "share_events_slug_created_idx" ON "share_events" USING btree ("report_slug", "created_at");
--> statement-breakpoint
CREATE INDEX "share_events_created_idx" ON "share_events" USING btree ("created_at");
