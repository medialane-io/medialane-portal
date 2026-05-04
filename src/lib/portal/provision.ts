import { pool } from "@/src/lib/db";

interface ProvisionInput {
  address: string;
}

interface ProvisionResult {
  ok: boolean;
  alreadyProvisioned?: boolean;
  error?: string;
}

export async function provisionWallet(input: ProvisionInput): Promise<ProvisionResult> {
  const existing = await pool.query<{ backend_api_key: string | null }>(
    "SELECT backend_api_key FROM wallet_provisioning WHERE address = $1",
    [input.address]
  );

  if (existing.rows[0]?.backend_api_key) {
    return { ok: true, alreadyProvisioned: true };
  }

  const apiUrl = process.env.MEDIALANE_API_URL;
  const apiSecret = process.env.MEDIALANE_API_SECRET;

  if (!apiUrl || !apiSecret) {
    return { ok: false, error: "Backend not configured" };
  }

  const res = await fetch(`${apiUrl}/admin/tenants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiSecret,
    },
    body: JSON.stringify({
      name: input.address,
      email: `${input.address}@wallet.medialane.io`,
      plan: "FREE",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[provision] Backend error:", res.status, body);
    return { ok: false, error: "Failed to provision tenant" };
  }

  const json = await res.json();
  const { tenant, apiKey } = json?.data ?? {};
  const plaintext = apiKey?.plaintext;
  const tenantId = tenant?.id;

  if (!plaintext || !tenantId) {
    console.error("[provision] Unexpected backend response:", json);
    return { ok: false, error: "Invalid backend response" };
  }

  await pool.query(
    `INSERT INTO wallet_provisioning (address, backend_api_key, backend_tenant_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (address) DO UPDATE SET backend_api_key = $2, backend_tenant_id = $3`,
    [input.address, plaintext, tenantId]
  );

  return { ok: true };
}
