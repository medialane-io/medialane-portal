export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { pool } = await import("@/src/lib/db");
    // Connect-only auth (no SIWS challenge) — the nonces table is no longer used.
    await pool.query(
      "ALTER TABLE IF EXISTS accounts ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false"
    );
  }
}
