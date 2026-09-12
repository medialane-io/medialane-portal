import { Account, type Call } from "starknet";
import { walletProvider } from "./provider";
import { MEDIAWALLET_CLASS_HASH, ownerConstructorCalldata } from "./account";

function accountFor(address: string, privateKeyHex: string): Account {
  return new Account({ provider: walletProvider(), address, signer: privateKeyHex, cairoVersion: "1" });
}

export async function estimateSelfFundedFee(
  address: string,
  calls: Call[],
): Promise<{ feeRaw: bigint; unit: string }> {
  const account = new Account({ provider: walletProvider(), address, signer: "0x1", cairoVersion: "1" });
  const est = await account.estimateInvokeFee(calls);
  return { feeRaw: est.overall_fee, unit: est.unit };
}

export async function deploySelf(
  address: string,
  ownerPubKey: string,
  privateKeyHex: string,
): Promise<{ transactionHash: string }> {
  const account = accountFor(address, privateKeyHex);
  const { transaction_hash } = await account.deployAccount({
    classHash: MEDIAWALLET_CLASS_HASH,
    constructorCalldata: ownerConstructorCalldata(ownerPubKey),
    addressSalt: 0,
    contractAddress: address,
  });
  return { transactionHash: transaction_hash };
}

export async function executeSelfFunded(
  address: string,
  privateKeyHex: string,
  calls: Call[],
): Promise<{ transactionHash: string }> {
  const account = accountFor(address, privateKeyHex);
  const { transaction_hash } = await account.execute(calls);
  return { transactionHash: transaction_hash };
}
