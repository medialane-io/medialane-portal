import { NextRequest, NextResponse } from "next/server";
import { RpcProvider } from "starknet";
import { pool } from "@/src/lib/db";
import { getMdlnBalance, getTier, getMultiplier } from "@/src/lib/mdln";
import { addCredits } from "@/src/lib/credits";

const USDC_CONTRACT = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
// keccak256("Transfer") selector on Starknet
const TRANSFER_KEY = "0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rpcUrl = process.env.STARKNET_RPC_URL;
  const treasury = process.env.TREASURY_ADDRESS?.toLowerCase();

  if (!rpcUrl || !treasury) {
    return NextResponse.json({ error: "STARKNET_RPC_URL or TREASURY_ADDRESS not set" }, { status: 500 });
  }

  const provider = new RpcProvider({ nodeUrl: rpcUrl });
  const latestBlock = await provider.getBlockNumber();

  const meta = await pool
    .query<{ last_block: number }>(
      "SELECT value::int AS last_block FROM poll_meta WHERE key = 'last_usdc_block'"
    )
    .catch(() => ({ rows: [] as { last_block: number }[] }));

  const fromBlock = meta.rows[0]?.last_block ?? Math.max(0, latestBlock - 100);
  const toBlock = latestBlock;

  if (fromBlock >= toBlock) {
    return NextResponse.json({ ok: true, message: "No new blocks" });
  }

  const events = await provider.getEvents({
    address: USDC_CONTRACT,
    keys: [[TRANSFER_KEY]],
    from_block: { block_number: fromBlock + 1 },
    to_block: { block_number: toBlock },
    chunk_size: 1000,
  });

  let credited = 0;

  for (const event of events.events) {
    const toAddress = event.data[0]?.toLowerCase();
    if (toAddress !== treasury) continue;

    const fromAddress = event.keys[1]?.toLowerCase();
    const txHash = event.transaction_hash;
    if (!fromAddress || !txHash) continue;

    const existing = await pool.query("SELECT id FROM deposits WHERE tx_hash = $1", [txHash]);
    if ((existing.rowCount ?? 0) > 0) continue;

    // USDC has 6 decimals; amount is uint256 (low + high)
    const low = BigInt(event.data[1] ?? "0");
    const high = BigInt(event.data[2] ?? "0");
    const usdcRaw = low + high * 2n ** 128n;
    const usdcCents = Number(usdcRaw / 10_000n);

    const mdlnBalance = await getMdlnBalance(fromAddress);
    const tier = getTier(mdlnBalance);
    const multiplier = getMultiplier(tier);
    const creditsToAdd = Math.floor((usdcCents / 100) * CREDITS_PER_USDC * multiplier);

    const walletRow = await pool.query(
      "SELECT address FROM wallets WHERE address = $1",
      [fromAddress]
    );
    if ((walletRow.rowCount ?? 0) === 0) continue;

    await pool.query("UPDATE wallets SET mdln_tier = $2 WHERE address = $1", [fromAddress, tier]);
    await addCredits(fromAddress, creditsToAdd);
    await pool.query(
      `INSERT INTO deposits (address, usdc_amount, tx_hash, multiplier, credited)
       VALUES ($1, $2, $3, $4, $5)`,
      [fromAddress, usdcCents, txHash, multiplier.toFixed(2), creditsToAdd]
    );

    credited++;
  }

  await pool.query(
    `INSERT INTO poll_meta (key, value) VALUES ('last_usdc_block', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1`,
    [toBlock.toString()]
  );

  return NextResponse.json({ ok: true, credited, fromBlock, toBlock });
}

const CREDITS_PER_USDC = 100;
