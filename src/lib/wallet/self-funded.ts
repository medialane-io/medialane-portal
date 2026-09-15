import { Account, type Call } from "starknet";
import { walletProvider } from "./provider";
import { MEDIAWALLET_CLASS_HASH, ownerConstructorCalldata } from "./account";

function accountFor(address: string, privateKeyHex: string): Account {
  return new Account({ provider: walletProvider(), address, signer: privateKeyHex, cairoVersion: "1" });
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

