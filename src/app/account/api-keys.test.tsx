import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MedialaneApiError } from "@medialane/sdk";

type Key = { id: string; prefix: string; lastUsedAt: string | null };

let keys: Key[] = [];
const mutate = mock(async () => undefined);
const signIn = mock<() => Promise<string | null>>(async () => "siws-token");
const api = {
  createApiKey: mock<(body: object, token: string) => Promise<{ data: { plaintext: string } }>>(async () => ({ data: { plaintext: "ml_live_secret" } })),
  deleteApiKey: mock<(id: string, token: string) => Promise<object>>(async () => ({})),
};

const real = {
  account: await import("@/hooks/use-portal-account"),
  siws: await import("@/hooks/use-siws-token"),
};

mock.module("@/hooks/use-portal-account", () => ({ ...real.account, usePortalKeys: () => ({ data: keys, mutate }) }));
mock.module("@/hooks/use-siws-token", () => ({ ...real.siws, useSiwsToken: () => ({ signIn }) }));
mock.module("@/lib/medialane-client", () => ({ getMedialaneClient: () => ({ api }) }));

const { ApiKeys, MAX_API_KEYS } = await import("./api-keys");

const key = (n: number): Key => ({ id: `id-${n}`, prefix: `ml_${n}`, lastUsedAt: null });

beforeEach(() => {
  keys = [];
  mutate.mockClear();
  signIn.mockClear();
  signIn.mockImplementation(async () => "siws-token");
  api.createApiKey.mockClear();
  api.deleteApiKey.mockClear();
});
afterEach(cleanup);

describe("creating a key", () => {
  test("confirms with the passkey first, then shows the secret once", async () => {
    render(<ApiKeys />);
    fireEvent.click(screen.getByRole("button", { name: "New key" }));
    await waitFor(() => expect(screen.getByText("ml_live_secret")).toBeTruthy());
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(api.createApiKey.mock.calls[0]![1]).toBe("siws-token");
    expect(screen.getByText(/It is not shown again/)).toBeTruthy();
    expect(mutate).toHaveBeenCalled();
  });

  test("makes no key when the passkey confirmation fails", async () => {
    signIn.mockImplementation(async () => null);
    render(<ApiKeys />);
    fireEvent.click(screen.getByRole("button", { name: "New key" }));
    await waitFor(() => expect(signIn).toHaveBeenCalled());
    expect(api.createApiKey).not.toHaveBeenCalled();
    expect(screen.queryByText("ml_live_secret")).toBeNull();
  });

  test("a rejected confirmation is reported without leaking the secret", async () => {
    api.createApiKey.mockImplementationOnce(async () => {
      throw new MedialaneApiError(401, "unauthorized");
    });
    render(<ApiKeys />);
    fireEvent.click(screen.getByRole("button", { name: "New key" }));
    await waitFor(() => expect(api.createApiKey).toHaveBeenCalled());
    expect(screen.queryByText("ml_live_secret")).toBeNull();
  });
});

describe("the key limit", () => {
  test("allows a new key below the limit", () => {
    keys = Array.from({ length: MAX_API_KEYS - 1 }, (_, i) => key(i));
    render(<ApiKeys />);
    expect((screen.getByRole("button", { name: "New key" }) as HTMLButtonElement).disabled).toBe(false);
  });

  test("disables a new key at the limit", () => {
    keys = Array.from({ length: MAX_API_KEYS }, (_, i) => key(i));
    render(<ApiKeys />);
    expect((screen.getByRole("button", { name: "New key" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("revoking a key", () => {
  test("confirms with the passkey, then deletes that key", async () => {
    keys = [key(1), key(2)];
    render(<ApiKeys />);
    fireEvent.click(screen.getByRole("button", { name: "Revoke key ml_2" }));
    await waitFor(() => expect(api.deleteApiKey).toHaveBeenCalledTimes(1));
    expect(api.deleteApiKey.mock.calls[0]).toEqual(["id-2", "siws-token"]);
    expect(signIn).toHaveBeenCalledTimes(1);
  });
});
