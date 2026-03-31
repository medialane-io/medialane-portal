import { pool } from "@/src/lib/db";

interface ProvisionInput {
  userId: string;
  email: string;
  name: string;
}

interface ProvisionResult {
  ok: boolean;
  alreadyProvisioned?: boolean;
  error?: string;
}

export async function provisionUser(
  input: ProvisionInput
): Promise<ProvisionResult> {
  // Check if already provisioned
  const existing = await pool.query<{ backendApiKey: string | null }>(
    'SELECT "backendApiKey" FROM "user" WHERE id = $1',
    [input.userId]
  );

  if (existing.rows[0]?.backendApiKey) {
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
    body: JSON.stringify({ name: input.name, email: input.email, plan: "FREE" }),
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
    'UPDATE "user" SET "backendApiKey" = $1, "backendTenantId" = $2 WHERE id = $3',
    [plaintext, tenantId, input.userId]
  );

  return { ok: true };
}
