import { describe, expect, test } from "bun:test";
import {
  canResendCode,
  canVerifyCode,
  emailCodeReducer as step,
  initialEmailCodeState,
  RESEND_COOLDOWN_SECONDS,
  type EmailCodeAction,
  type EmailCodeState,
} from "./email-code";

const run = (...actions: EmailCodeAction[]): EmailCodeState => actions.reduce(step, initialEmailCodeState);

describe("sending the code", () => {
  test("starts a resend cooldown once the code is on its way", () => {
    const state = run({ type: "send-started" }, { type: "send-succeeded" });
    expect(state.status).toBe("ready");
    expect(state.cooldown).toBe(RESEND_COOLDOWN_SECONDS);
  });

  test("a failed send says so and lets the person try again straight away", () => {
    const state = run({ type: "send-started" }, { type: "send-failed", message: "Couldn't send" });
    expect(state.error).toBe("Couldn't send");
    expect(state.status).toBe("idle");
    expect(canResendCode(state)).toBe(true);
  });

  test("a new send clears the previous error", () => {
    const state = run({ type: "send-failed", message: "x" }, { type: "send-started" });
    expect(state.error).toBeNull();
  });
});

describe("typing the code", () => {
  test("keeps only digits, at most six", () => {
    expect(run({ type: "code-changed", code: "12a3-45 6789" }).code).toBe("123456");
  });

  test("can be verified only once six digits are in and the code was sent", () => {
    const sent: EmailCodeAction[] = [{ type: "send-started" }, { type: "send-succeeded" }];
    expect(canVerifyCode(run(...sent, { type: "code-changed", code: "12345" }))).toBe(false);
    expect(canVerifyCode(run(...sent, { type: "code-changed", code: "123456" }))).toBe(true);
    expect(canVerifyCode(run({ type: "code-changed", code: "123456" }))).toBe(false);
  });
});

describe("a wrong code", () => {
  test("clears the field and shows why, so the person can type it again", () => {
    const state = run(
      { type: "send-started" },
      { type: "send-succeeded" },
      { type: "code-changed", code: "111111" },
      { type: "verify-started" },
      { type: "verify-failed", message: "Incorrect code" },
    );
    expect(state.code).toBe("");
    expect(state.error).toBe("Incorrect code");
    expect(state.status).toBe("ready");
  });

  test("nothing can be resent or verified while checking", () => {
    const state = run({ type: "send-succeeded" }, { type: "code-changed", code: "123456" }, { type: "verify-started" });
    expect(canVerifyCode(state)).toBe(false);
    expect(canResendCode({ ...state, cooldown: 0 })).toBe(false);
  });
});

describe("the resend cooldown", () => {
  test("counts down to zero and then allows a resend", () => {
    let state = run({ type: "send-started" }, { type: "send-succeeded" });
    expect(canResendCode(state)).toBe(false);
    for (let i = 0; i < RESEND_COOLDOWN_SECONDS; i++) state = step(state, { type: "tick" });
    expect(state.cooldown).toBe(0);
    expect(canResendCode(state)).toBe(true);
  });

  test("never goes below zero", () => {
    expect(run({ type: "tick" }).cooldown).toBe(0);
  });
});
