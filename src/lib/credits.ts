import { pool } from "./db";

export async function getBalance(address: string): Promise<number> {
  const result = await pool.query<{ balance: number }>(
    "SELECT balance FROM credits WHERE address = $1",
    [address.toLowerCase()]
  );
  return result.rows[0]?.balance ?? 0;
}

export async function addCredits(address: string, amount: number): Promise<void> {
  await pool.query(
    "UPDATE credits SET balance = balance + $2, updated_at = now() WHERE address = $1",
    [address.toLowerCase(), amount]
  );
}

export async function deductCredit(address: string): Promise<boolean> {
  const result = await pool.query(
    `UPDATE credits SET balance = balance - 1, updated_at = now()
     WHERE address = $1 AND balance > 0
     RETURNING balance`,
    [address.toLowerCase()]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getDepositHistory(address: string) {
  const result = await pool.query(
    `SELECT id, usdc_amount, tx_hash, multiplier, credited, created_at
     FROM deposits WHERE address = $1 ORDER BY created_at DESC LIMIT 20`,
    [address.toLowerCase()]
  );
  return result.rows;
}
