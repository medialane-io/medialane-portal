// Grant (or revoke) admin on a portal account:
//   DATABASE_URL=... bun run scripts/set-admin.ts 0x...          # grant
//   DATABASE_URL=... bun run scripts/set-admin.ts 0x... --revoke # revoke
import { Pool } from "pg";

function normalizeStarknetAddress(address: string): string {
  if (!/^0x[0-9a-fA-F]{1,64}$/.test(address)) {
    throw new Error(`Invalid Starknet address: ${address}`);
  }
  return `0x${BigInt(address).toString(16).padStart(64, "0")}`;
}

const [, , rawAddress, flag] = process.argv;
if (!rawAddress) {
  console.error("Usage: bun run scripts/set-admin.ts <address> [--revoke]");
  process.exit(1);
}

const address = normalizeStarknetAddress(rawAddress);
const isAdmin = flag !== "--revoke";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  await pool.query(
    "ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false"
  );
  await pool.query(
    `INSERT INTO accounts (address, is_admin) VALUES ($1, $2)
     ON CONFLICT (address) DO UPDATE SET is_admin = $2, updated_at = now()`,
    [address, isAdmin]
  );
  console.log(`✓ ${address} is_admin=${isAdmin}`);
  console.log("Note: existing sessions keep their old JWT claims — sign out and back in.");
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
