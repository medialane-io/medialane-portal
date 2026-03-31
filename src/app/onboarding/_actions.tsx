"use server";

import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

interface WalletData {
  publicKey: string;
  encryptedPrivateKey: string;
}

export const completeOnboarding = async (walletData: WalletData) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return { error: "No Logged In User" };
    }

    await auth.api.updateUser({
      headers: await headers(),
      body: {
        walletPublicKey: walletData.publicKey,
        walletEncryptedPrivateKey: walletData.encryptedPrivateKey,
      } as Record<string, unknown>,
    });

    return { success: true };
  } catch (err) {
    console.error("Server: Error in completeOnboarding:", err);
    return {
      error: err instanceof Error ? err.message : "Error updating user.",
    };
  }
};

export const getWalletData = async (): Promise<{
  publicKey: string;
  encryptedPrivateKey: string;
} | null> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) return null;

    const user = session.user as typeof session.user & {
      walletPublicKey?: string | null;
      walletEncryptedPrivateKey?: string | null;
    };

    if (!user.walletPublicKey || !user.walletEncryptedPrivateKey) return null;

    return {
      publicKey: user.walletPublicKey,
      encryptedPrivateKey: user.walletEncryptedPrivateKey,
    };
  } catch (err) {
    console.error("Error fetching wallet data:", err);
    return null;
  }
};