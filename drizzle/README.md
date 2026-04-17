# Drizzle migrations

This directory holds the authoritative SQL migrations applied to the production
database.

## Bootstrap procedure (one-time, pre-merge of PR 1)

The production DB was seeded by `drizzle-kit push` before migrations were
tracked in git. Before applying any delta migration, the operator must capture
the existing schema as a baseline so `drizzle-kit migrate` does not try to
re-create tables that already exist.

1. Set `DATABASE_URL` in the shell to the production DB connection string.
2. Run `npx drizzle-kit introspect` to generate a baseline snapshot in
   `drizzle/meta/` plus a baseline `.sql` file.
3. Commit the generated baseline files.
4. On production, mark the baseline as applied by inserting its hash into the
   `drizzle.__drizzle_migrations` table (follow Drizzle's bootstrapping guide)
   so `db:migrate` skips it but tracks subsequent deltas.

After bootstrap, the existing `0000_share_events.sql` in this directory is the
first tracked delta. `npm run db:migrate` will apply it on deploy.

## Applying new migrations

1. Edit `src/db/schema.ts`.
2. Run `npm run db:generate` to emit a new numbered `.sql` file here.
3. Review the SQL, commit it, and deploy. `db:migrate` runs in the deploy
   pipeline.

Never run `npm run db:push` against production after this bootstrap is in
place. `push` diverges from the tracked history.
