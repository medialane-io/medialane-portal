export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { pool } = await import("@/src/lib/db");
    await pool.query(
      "ALTER TABLE IF EXISTS accounts ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false"
    );
    // Sign-in challenge nonces (5-min TTL) — the portal verifies a wallet
    // signature before resolving its Account and issuing a session.
    await pool.query(
      `CREATE TABLE IF NOT EXISTS nonces (
         nonce TEXT PRIMARY KEY,
         address TEXT NOT NULL,
         expires_at TIMESTAMPTZ NOT NULL
       )`
    );
  }
}
