CREATE TABLE "unlocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"scope_key" text,
	"unlock_type" text NOT NULL,
	"polar_checkout_id" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "unlocks_user_expires_idx" ON "unlocks" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE INDEX "unlocks_scope_expires_idx" ON "unlocks" USING btree ("scope_key","expires_at");