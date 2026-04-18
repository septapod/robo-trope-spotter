import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

function loadEnv(path) {
  try {
    const contents = readFileSync(path, 'utf8');
    for (const line of contents.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) {
        let value = m[2];
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[m[1]] = value;
      }
    }
  } catch {
    // file absent, ignore
  }
}

loadEnv('.env.local');
loadEnv('.env');

const connectionUrl = process.env.DATABASE_URL || '';

if (!connectionUrl) {
  console.error('DATABASE_URL not set and not found in .env.local or .env');
  process.exit(1);
}

const sql = neon(connectionUrl);
const migration = readFileSync('drizzle/0000_share_events.sql', 'utf8');

const statements = migration
  .split('--> statement-breakpoint')
  .map((s) => s.trim())
  .filter((s) => s && !s.split('\n').every((l) => l.trim().startsWith('--')));

console.log(`Applying ${statements.length} statement(s)...`);
for (const stmt of statements) {
  console.log('---\n' + stmt.split('\n').slice(0, 3).join('\n') + '\n...');
  await sql.query(stmt);
}
console.log('\nDone.');
