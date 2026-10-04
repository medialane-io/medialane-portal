import { describe, expect, test } from "bun:test";
import { flowReducer, initialFlow, type FlowEvent, type FlowState } from "./flow";

const run = (state: FlowState, ...events: FlowEvent[]): FlowState => events.reduce(flowReducer, state);
const fresh = initialFlow("email");

describe("where the flow starts", () => {
  test("on the email step, or straight on the wallet step when resuming", () => {
    expect(initialFlow("email").step).toBe("email");
    expect(initialFlow("wallet").step).toBe("creating-passkey");
  });

  test("with no error, a retry available, no account known and no wallet to pair", () => {
    expect(fresh).toEqual({ step: "email", error: null, canRetry: true, accountExisted: false, walletAddress: null });
  });
});

describe("a new user's journey", () => {
  test("email, code, then wallet steps, then done", () => {
    let s = run(fresh, { type: "email-submitted" });
    expect(s.step).toBe("checking-email");
    s = run(s, { type: "account-found", exists: false }, { type: "code-sent" });
    expect(s).toMatchObject({ step: "code", accountExisted: false });
    s = run(s, { type: "code-submitted" });
    expect(s.step).toBe("verifying-code");
    s = run(s, { type: "wallet-setup-started" }, { type: "wallet-progress", step: "deploying" }, { type: "wallet-progress", step: "signing-in" });
    expect(s.step).toBe("signing-in");
    expect(run(s, { type: "finished" }).step).toBe("done");
  });
});

describe("an address that already has an account", () => {
  test("remembers that and moves through the code steps", () => {
    let s = run(fresh, { type: "email-submitted" }, { type: "account-found", exists: true }, { type: "code-sent" });
    expect(s).toMatchObject({ step: "code", accountExisted: true });
    s = run(s, { type: "code-submitted" });
    expect(s.step).toBe("verifying-code");
  });

  test("a wrong code goes back to the code step with the message, and clears when they try again", () => {
    let s = run(fresh, { type: "code-submitted" }, { type: "code-failed", message: "Incorrect code" });
    expect(s).toMatchObject({ step: "code", error: "Incorrect code" });
    s = run(s, { type: "code-submitted" });
    expect(s).toMatchObject({ step: "verifying-code", error: null });
  });

  test("a failure sending the code stays on the email step with the message", () => {
    expect(run(fresh, { type: "email-submitted" }, { type: "email-step-failed", message: "Couldn't send" })).toMatchObject({
      step: "email",
      error: "Couldn't send",
    });
  });
});

describe("a returning user on a device with no key", () => {
  test("is asked to pair or recover, and the wallet being paired is remembered", () => {
    const s = run(fresh, { type: "code-submitted" }, { type: "needs-pairing", walletAddress: "0xabc" });
    expect(s).toMatchObject({ step: "pair-or-recover", walletAddress: "0xabc", error: null });
  });

  test("a wallet that must be finished on medialane.io has its own step", () => {
    expect(run(fresh, { type: "needs-setup-elsewhere" }).step).toBe("setup-elsewhere");
  });
});

describe("when the wallet step fails", () => {
  test("it stays on the wallet step with the message and says whether a retry can work", () => {
    const s = run(fresh, { type: "wallet-setup-started" }, { type: "wallet-failed", message: "Closed", canRetry: true });
    expect(s).toMatchObject({ step: "creating-passkey", error: "Closed", canRetry: true });
    expect(run(s, { type: "wallet-failed", message: "Unsupported", canRetry: false }).canRetry).toBe(false);
  });

  test("starting again clears the message and allows a retry", () => {
    const s = run(fresh, { type: "wallet-failed", message: "x", canRetry: false }, { type: "wallet-setup-started" });
    expect(s).toMatchObject({ error: null, canRetry: true, step: "creating-passkey" });
  });

  test("a wallet that needs linking to an email account goes back to the email step", () => {
    expect(run(fresh, { type: "wallet-setup-started" }, { type: "link-required" }).step).toBe("email");
  });
});

describe("adding an email to an account that has none", () => {
  test("a failure shows the message and stays on the step, and trying again clears it", () => {
    let s = run(fresh, { type: "needs-email" }, { type: "add-email-failed", message: "Couldn't save your email." });
    expect(s).toMatchObject({ step: "add-email", error: "Couldn't save your email." });
    s = run(s, { type: "add-email-submitted" });
    expect(s).toMatchObject({ step: "add-email", error: null });
  });
});
