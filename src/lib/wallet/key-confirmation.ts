import { apiKeyConfirmationTypedData, type ApiKeyAction, type ApiKeyConfirmation, type StarknetVenueSigner } from "@medialane/sdk/starknet";

export const CONFIRMATION_SECONDS = 4 * 60;

export async function signKeyConfirmation(
  signer: Pick<StarknetVenueSigner, "signTypedData">,
  account: string,
  change: { action: ApiKeyAction; key: string },
  now: number = Math.floor(Date.now() / 1000),
): Promise<ApiKeyConfirmation> {
  const expiresAt = now + CONFIRMATION_SECONDS;
  return { expiresAt, signature: await signer.signTypedData(apiKeyConfirmationTypedData({ ...change, account, expiresAt })) };
}
