import { Pool } from "pg";

declare global {
  var __pgPool: Pool | undefined;
}

// Reuse the pool across hot-reloads/invocations instead of opening a new
// one per request — Netlify functions and Next.js dev both re-run this
// module more often than a long-lived server would.
export const pool =
  global.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}
