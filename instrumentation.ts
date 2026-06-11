export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { pool } = await import("@/src/lib/db");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nonces (
        nonce      TEXT        PRIMARY KEY,
        address    TEXT        NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      )
    `);
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_nonces_expires ON nonces(expires_at)"
    );
    await pool.query(
      "ALTER TABLE IF EXISTS accounts ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false"
    );
  }
}
