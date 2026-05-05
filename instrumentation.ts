export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { pool } = await import("@/src/lib/db");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id           TEXT        PRIMARY KEY,
        count        INTEGER     NOT NULL DEFAULT 1,
        window_start TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }
}
