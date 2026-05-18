import { pool } from "./db";

let rateLimitsReady: Promise<void> | null = null;
function ensureRateLimitsTable() {
  if (!rateLimitsReady) {
    rateLimitsReady = pool
      .query(
        `CREATE TABLE IF NOT EXISTS rate_limits (
           id           TEXT        PRIMARY KEY,
           count        INTEGER     NOT NULL DEFAULT 1,
           window_start TIMESTAMPTZ NOT NULL DEFAULT now()
         )`
      )
      .then(() => {});
  }
  return rateLimitsReady;
}

/**
 * Returns true if the request is within limits, false if it should be blocked.
 * key       — unique identifier, e.g. "challenge:1.2.3.4"
 * max       — max requests allowed per window
 * windowSec — window length in seconds
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowSec: number
): Promise<boolean> {
  await ensureRateLimitsTable();
  const result = await pool.query<{ count: number }>(
    `INSERT INTO rate_limits (id, count, window_start)
     VALUES ($1, 1, now())
     ON CONFLICT (id) DO UPDATE
       SET count = CASE
             WHEN rate_limits.window_start < now() - ($3 || ' seconds')::interval
             THEN 1
             ELSE rate_limits.count + 1
           END,
           window_start = CASE
             WHEN rate_limits.window_start < now() - ($3 || ' seconds')::interval
             THEN now()
             ELSE rate_limits.window_start
           END
     RETURNING count`,
    [key, max, windowSec]
  );
  return (result.rows[0]?.count ?? 1) <= max;
}
