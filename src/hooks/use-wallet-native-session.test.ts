import { test, expect, beforeEach, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { renderHook, waitFor } from "@testing-library/react";

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register();

const realAccountOps = await import("@/lib/wallet/account-ops");
mock.module("@/lib/wallet/account-ops", () => ({
  ...realAccountOps,
  isDeployed: async () => false,
}));

const { useWalletNativeSession } = await import("./use-wallet-native-session");
const { saveSealedOwner, clearSealedOwner } = await import("@/lib/wallet/store");

const FAKE = {
  credentialId: "cred1", ownerPubKey: "0xabc", address: "0xdeadbeef", iv: "iv1", ciphertext: "ct1",
};

beforeEach(() => {
  localStorage.clear();
});

test("returns no wallet when nothing is stored", async () => {
  const { result } = renderHook(() => useWalletNativeSession());
  expect(result.current.address).toBeNull();
  expect(result.current.hasWallet).toBe(false);
  expect(result.current.signer).toBeNull();

  await waitFor(() => expect(result.current.isDeployed).toBeNull());
});

test("returns the stored wallet's address and a signer once one exists", async () => {
  saveSealedOwner(FAKE);
  const { result } = renderHook(() => useWalletNativeSession());
  expect(result.current.address).toBe("0xdeadbeef");
  expect(result.current.hasWallet).toBe(true);
  expect(result.current.signer?.address).toBe("0xdeadbeef");

  await waitFor(() => expect(result.current.isDeployed).toBe(false));
  clearSealedOwner();
});
