import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MedialaneApiError } from "@medialane/sdk";

type Key = { id: string; prefix: string; lastUsedAt: string | null };

let keys: Key[] = [];
const mutate = mock(async () => undefined);
const CONFIRMATION = { expiresAt: 1_700_000_300, signature: ["0x1", "0x2"] };
const signIn = mock<(change: { action: string; key: string }) => Promise<typeof CONFIRMATION | null>>(async () => CONFIRMATION);
const portal = {
  createApiKey: mock<(body: object, confirmation: object) => Promise<{ plaintext: string }>>(async () => ({ plaintext: "ml_live_secret" })),
  deleteApiKey: mock<(id: string, confirmation: object) => Promise<object>>(async () => ({})),
};
const api = { portal };
const confirmReplace = mock((message?: unknown) => typeof message === "string");

const real = {
  account: await import("@/hooks/use-portal-account"),
};

mock.module("@/hooks/use-portal-account", () => ({ ...real.account, usePortalKeys: () => ({ data: keys, mutate }) }));
mock.module("@/hooks/use-key-confirmation", () => ({ useKeyConfirmation: () => signIn }));
mock.module("@/lib/medialane-client", () => ({ getMedialaneClient: () => ({ api }) }));

const { ApiKeys } = await import("./api-keys");

const key = (n: number): Key => ({ id: `id-${n}`, prefix: `ml_${n}`, lastUsedAt: null });

beforeEach(() => {
  keys = [];
  mutate.mockClear();
  signIn.mockClear();
  signIn.mockImplementation(async () => CONFIRMATION);
  portal.createApiKey.mockClear();
  portal.deleteApiKey.mockClear();
  confirmReplace.mockClear();
  confirmReplace.mockImplementation((message?: unknown) => typeof message === "string");
  globalThis.confirm = confirmReplace as unknown as typeof globalThis.confirm;
});
afterEach(cleanup);

describe("creating the key", () => {
  test("an account with no key creates one without a warning, after confirming with the passkey", async () => {
    render(<ApiKeys />);
    fireEvent.click(screen.getByRole("button", { name: "Create key" }));
    await waitFor(() => expect(screen.getByText("ml_live_secret")).toBeTruthy());
    expect(confirmReplace).not.toHaveBeenCalled();
    expect(signIn.mock.calls).toEqual([[{ action: "replace_api_key", key: "none" }]]);
    expect(portal.createApiKey.mock.calls[0]![1]).toEqual(CONFIRMATION);
    expect(screen.getByText(/It is not shown again/)).toBeTruthy();
    expect(mutate).toHaveBeenCalled();
  });

  test("makes no key when the passkey confirmation fails", async () => {
    signIn.mockImplementation(async () => null);
    render(<ApiKeys />);
    fireEvent.click(screen.getByRole("button", { name: "Create key" }));
    await waitFor(() => expect(signIn).toHaveBeenCalled());
    expect(portal.createApiKey).not.toHaveBeenCalled();
    expect(screen.queryByText("ml_live_secret")).toBeNull();
  });

  test("a rejected confirmation is reported without leaking the secret", async () => {
    portal.createApiKey.mockImplementationOnce(async () => {
      throw new MedialaneApiError(403, "confirmation_required");
    });
    render(<ApiKeys />);
    fireEvent.click(screen.getByRole("button", { name: "Create key" }));
    await waitFor(() => expect(portal.createApiKey).toHaveBeenCalled());
    expect(screen.queryByText("ml_live_secret")).toBeNull();
  });
});

describe("replacing the key", () => {
  test("an account with a key sees Replace, not Create, and one key", () => {
    keys = [key(1)];
    render(<ApiKeys />);
    expect(screen.getByRole("button", { name: "Replace key" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Create key" })).toBeNull();
    expect(screen.getByText("ml_1…")).toBeTruthy();
  });

  test("warns that the current key stops working, and replaces it when confirmed", async () => {
    keys = [key(1)];
    render(<ApiKeys />);
    fireEvent.click(screen.getByRole("button", { name: "Replace key" }));
    await waitFor(() => expect(portal.createApiKey).toHaveBeenCalledTimes(1));
    expect(confirmReplace).toHaveBeenCalledTimes(1);
    expect(String(confirmReplace.mock.calls[0]![0])).toMatch(/stops the current key working/i);
    expect(signIn.mock.calls).toEqual([[{ action: "replace_api_key", key: "id-1" }]]);
    expect(await screen.findByText("ml_live_secret")).toBeTruthy();
  });

  test("changes nothing when the warning is declined", async () => {
    keys = [key(1)];
    confirmReplace.mockImplementation((message?: unknown) => typeof message !== "string");
    render(<ApiKeys />);
    fireEvent.click(screen.getByRole("button", { name: "Replace key" }));
    await waitFor(() => expect(confirmReplace).toHaveBeenCalled());
    expect(signIn).not.toHaveBeenCalled();
    expect(portal.createApiKey).not.toHaveBeenCalled();
  });
});

describe("deleting the key", () => {
  test("confirms with the passkey, then deletes it", async () => {
    keys = [key(2)];
    render(<ApiKeys />);
    fireEvent.click(screen.getByRole("button", { name: "Delete key" }));
    await waitFor(() => expect(portal.deleteApiKey).toHaveBeenCalledTimes(1));
    expect(portal.deleteApiKey.mock.calls[0]).toEqual(["id-2", CONFIRMATION]);
    expect(signIn.mock.calls).toEqual([[{ action: "delete_api_key", key: "id-2" }]]);
  });
});
