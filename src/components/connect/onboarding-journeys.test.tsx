import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { loadAccountEmail } from "@/lib/wallet/account-wallet";

const WALLET = "0x01575d29b83d7828cd1d833ef785083b809adeb187b6ac14aab21db568f2bf02";

const api = {
  checkEmail: mock<(email: string) => Promise<{ exists: boolean }>>(async () => ({ exists: false })),
  requestEmailCode: mock<(email: string) => Promise<object>>(async () => ({})),
  verifyEmailCode: mock<(email: string, code: string) => Promise<object>>(async () => ({})),
  upsertMyWallet: mock<(token: string, body: object) => Promise<object>>(async () => ({})),
};
const completeDeployment = mock<(onStep: (s: string) => void) => Promise<{ siwsToken: string }>>(async () => ({ siwsToken: "siws" }));
const adoptSessionWallet = mock<() => Promise<{ walletAddress: string; needsKeySetup: boolean } | null>>(async () => null);
let localAddress: string | null = null;

const real = {
  client: await import("@/lib/wallet/client"),
  store: await import("@/lib/wallet/store"),
  confetti: await import("@/lib/confetti"),
  session: await import("@/hooks/use-wallet-native-session"),
  emailStatus: await import("@/hooks/use-email-verification-required"),
  siws: await import("@/hooks/use-siws-token"),
  starknet: await import("@medialane/sdk/starknet"),
};

mock.module("@/lib/medialane-client", () => ({ getMedialaneClient: () => ({ api }) }));
mock.module("@/lib/wallet/client", () => ({ ...real.client, mediaWallet: { ...real.client.mediaWallet, completeDeployment } }));
mock.module("@medialane/sdk/starknet", () => ({ ...real.starknet, adoptSessionWallet }));
mock.module("@/lib/wallet/store", () => ({ ...real.store, loadWalletAddress: () => localAddress }));
mock.module("@/lib/confetti", () => ({ ...real.confetti, fireConfetti: () => {} }));
mock.module("@/hooks/use-wallet-native-session", () => ({ ...real.session, useWalletNativeSession: () => ({ hasWallet: false }) }));
mock.module("@/hooks/use-email-verification-required", () => ({ ...real.emailStatus, useEmailVerificationStatus: () => null }));
mock.module("@/hooks/use-siws-token", () => ({ ...real.siws, useSiwsToken: () => ({ getValidToken: () => null, signIn: async () => null }) }));

const { OnboardingFlow } = await import("./onboarding-flow");

const done: Array<{ celebrated: boolean }> = [];
const onDone = (result: { celebrated: boolean }) => void done.push(result);

beforeEach(() => {
  done.length = 0;
  localAddress = null;
  for (const m of [api.checkEmail, api.requestEmailCode, api.verifyEmailCode, api.upsertMyWallet]) m.mockClear();
  completeDeployment.mockClear();
  adoptSessionWallet.mockClear();
  localStorage.clear();
  api.checkEmail.mockImplementation(async () => ({ exists: false }));
  api.verifyEmailCode.mockImplementation(async () => ({}));
  completeDeployment.mockImplementation(async () => ({ siwsToken: "siws" }));
  adoptSessionWallet.mockImplementation(async () => null);
});
afterEach(cleanup);

async function enterEmail(email: string, redirectTo?: string) {
  render(<OnboardingFlow onDone={onDone} redirectTo={redirectTo} />);
  fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: email } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

async function enterCode(code = "123456") {
  const input = await waitFor(() => {
    const el = document.querySelector("input[data-input-otp]");
    if (!el) throw new Error("code input not shown");
    return el as HTMLInputElement;
  });
  fireEvent.change(input, { target: { value: code } });
}

describe("a new account", () => {
  test("proves the email with a code first, then makes a wallet, links it and celebrates", async () => {
    await enterEmail("new@example.com");
    await enterCode();
    await waitFor(() => expect(done).toEqual([{ celebrated: true }]));
    expect(api.checkEmail).toHaveBeenCalledWith("new@example.com");
    expect(api.requestEmailCode).toHaveBeenCalledWith("new@example.com");
    expect(api.verifyEmailCode).toHaveBeenCalledWith("new@example.com", "123456");
    expect(adoptSessionWallet).not.toHaveBeenCalled();
    expect(completeDeployment).toHaveBeenCalledTimes(1);
    expect(api.upsertMyWallet).toHaveBeenCalledTimes(1);
    expect(loadAccountEmail()).toBe("new@example.com");
  });

  test("never makes a wallet before the code is verified", async () => {
    await enterEmail("early@example.com");
    await waitFor(() => expect(screen.getByText(/Enter the 6-digit code/)).toBeTruthy());
    expect(completeDeployment).not.toHaveBeenCalled();
  });
});

describe("an address that already has an account", () => {
  beforeEach(() => {
    api.checkEmail.mockImplementation(async () => ({ exists: true }));
  });

  test("on the device holding the key, signs in and finishes with no new wallet and no celebration", async () => {
    localAddress = WALLET;
    adoptSessionWallet.mockImplementation(async () => ({ walletAddress: WALLET, needsKeySetup: false }));
    await enterEmail("back@example.com");
    await enterCode();
    await waitFor(() => expect(done).toEqual([{ celebrated: false }]));
    expect(completeDeployment).not.toHaveBeenCalled();
  });

  test("on a device with no key, offers pairing and recovery and keeps the return path", async () => {
    adoptSessionWallet.mockImplementation(async () => ({ walletAddress: WALLET, needsKeySetup: false }));
    await enterEmail("newdevice@example.com", "/launchpad");
    await enterCode();
    const pair = await screen.findByRole("link", { name: "Approve this device from another one" });
    expect(pair.getAttribute("href")).toBe("/link-device?redirect_url=%2Flaunchpad");
    expect(screen.getByRole("link", { name: "Restore with a recovery key" }).getAttribute("href")).toBe("/recover");
    expect(done).toEqual([]);
    expect(completeDeployment).not.toHaveBeenCalled();
  });

  test("an account that never got a wallet is given one", async () => {
    await enterEmail("retry@example.com");
    await enterCode();
    await waitFor(() => expect(done).toEqual([{ celebrated: true }]));
    expect(completeDeployment).toHaveBeenCalledTimes(1);
  });

  test("a wallet still holding the platform's provisioning key is sent to medialane.io", async () => {
    adoptSessionWallet.mockImplementation(async () => ({ walletAddress: WALLET, needsKeySetup: true }));
    await enterEmail("consumer@example.com");
    await enterCode();
    const link = await screen.findByRole("link", { name: "Open medialane.io" });
    expect(link.getAttribute("href")).toBe("https://medialane.io");
    expect(done).toEqual([]);
    expect(completeDeployment).not.toHaveBeenCalled();
  });

  test("a wrong code shows a message and lets them try again", async () => {
    api.verifyEmailCode.mockImplementationOnce(async () => {
      throw new Error("Incorrect code");
    });
    await enterEmail("typo@example.com");
    await enterCode("000000");
    await waitFor(() => expect(screen.getByText(/Incorrect code|Something went wrong/)).toBeTruthy());
    expect(done).toEqual([]);
    expect(adoptSessionWallet).not.toHaveBeenCalled();
  });
});

describe("when the passkey step fails", () => {
  test("a closed prompt says so, and Try again resumes and finishes", async () => {
    const cancelled = Object.assign(new Error("Passkey prompt was cancelled."), { name: "PasskeyCancelledError" });
    completeDeployment.mockImplementationOnce(async () => {
      throw cancelled;
    });
    await enterEmail("closed@example.com");
    await enterCode();
    await waitFor(() => expect(screen.getByText(/The passkey prompt was closed|Passkeys aren't available/)).toBeTruthy());
    expect(done).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(done).toEqual([{ celebrated: true }]));
    expect(completeDeployment).toHaveBeenCalledTimes(2);
  });
});

describe("resuming wallet setup for an account that is already signed in", () => {
  test("starts on the wallet step with no email prompt and finishes", async () => {
    render(<OnboardingFlow start="wallet" onDone={onDone} />);
    expect(screen.queryByPlaceholderText("you@example.com")).toBeNull();
    await waitFor(() => expect(done).toEqual([{ celebrated: true }]));
    expect(completeDeployment).toHaveBeenCalledTimes(1);
    expect(api.upsertMyWallet).toHaveBeenCalledTimes(1);
  });
});
