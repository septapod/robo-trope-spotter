-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"source_text" text NOT NULL,
	"source_url" text,
	"input_type" text NOT NULL,
	"results" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reports_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "share_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_slug" text NOT NULL,
	"method" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "share_events_created_idx" ON "share_events" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "share_events_slug_created_idx" ON "share_events" USING btree ("report_slug" text_ops,"created_at" text_ops);
*/