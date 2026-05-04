// Run once before first deploy: DATABASE_URL=... bun run scripts/migrate.ts
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        address           TEXT PRIMARY KEY,
        mdln_tier         INT NOT NULL DEFAULT 0,
        balance           INT NOT NULL DEFAULT 0,
        backend_tenant_id TEXT,
        backend_api_key   TEXT,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS deposits (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        address      TEXT NOT NULL REFERENCES accounts(address),
        usdc_amount  INT NOT NULL,
        tx_hash      TEXT UNIQUE NOT NULL,
        multiplier   NUMERIC(4,2) NOT NULL,
        credited     INT NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS nonces (
        nonce       TEXT PRIMARY KEY,
        address     TEXT NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        address      TEXT NOT NULL REFERENCES accounts(address),
        token_hash   TEXT NOT NULL,
        expires_at   TIMESTAMPTZ NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS poll_meta (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    await client.query("CREATE INDEX IF NOT EXISTS idx_nonces_expires ON nonces(expires_at)");
    await client.query("CREATE INDEX IF NOT EXISTS idx_sessions_address ON sessions(address)");
    await client.query("CREATE INDEX IF NOT EXISTS idx_deposits_address ON deposits(address)");

    await client.query("COMMIT");
    console.log("✓ Migration complete");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
