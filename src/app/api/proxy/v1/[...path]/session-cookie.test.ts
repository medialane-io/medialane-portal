import { test, expect } from "bun:test";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  shouldSetSessionCookie,
  extractAccountToken,
  stripAccountToken,
  shouldInjectSessionCookie,
  injectAccountToken,
} from "./session-cookie";

test("SESSION_COOKIE_NAME and SESSION_COOKIE_MAX_AGE_SECONDS are the expected constants", () => {
  expect(SESSION_COOKIE_NAME).toBe("ml_account_session");
  expect(SESSION_COOKIE_MAX_AGE_SECONDS).toBe(30 * 24 * 60 * 60);
});

test("shouldSetSessionCookie is true for register-account and verify-code POSTs", () => {
  expect(shouldSetSessionCookie("auth/email/register-account", "POST")).toBe(true);
  expect(shouldSetSessionCookie("auth/email/verify-code", "POST")).toBe(true);
});

test("shouldSetSessionCookie is false for anything else", () => {
  expect(shouldSetSessionCookie("auth/email/request-code", "POST")).toBe(false);
  expect(shouldSetSessionCookie("auth/email/register-account", "GET")).toBe(false);
  expect(shouldSetSessionCookie("users/me", "POST")).toBe(false);
});

test("extractAccountToken reads a string accountToken field", () => {
  expect(extractAccountToken(JSON.stringify({ accountToken: "account_session_abc.def" }))).toBe(
    "account_session_abc.def",
  );
});

test("extractAccountToken returns null when the field is missing, non-string, or the body isn't JSON", () => {
  expect(extractAccountToken(JSON.stringify({ token: "x" }))).toBeNull();
  expect(extractAccountToken(JSON.stringify({ accountToken: 123 }))).toBeNull();
  expect(extractAccountToken("not json")).toBeNull();
});

test("stripAccountToken removes only the accountToken field, keeping the rest of the body intact", () => {
  const body = JSON.stringify({ token: "email_verified_abc.def", accountToken: "account_session_abc.def" });
  const stripped = JSON.parse(stripAccountToken(body));
  expect(stripped).toEqual({ token: "email_verified_abc.def" });
});

test("stripAccountToken is a no-op when there's no accountToken field, or the body isn't JSON", () => {
  const body = JSON.stringify({ token: "email_verified_abc.def" });
  expect(JSON.parse(stripAccountToken(body))).toEqual({ token: "email_verified_abc.def" });
  expect(stripAccountToken("not json")).toBe("not json");
});

test("shouldInjectSessionCookie is true only for a users/me POST", () => {
  expect(shouldInjectSessionCookie("users/me", "POST")).toBe(true);
  expect(shouldInjectSessionCookie("users/me", "GET")).toBe(false);
  expect(shouldInjectSessionCookie("users/register", "POST")).toBe(false);
});

test("injectAccountToken sets accountToken on an existing JSON body without disturbing other fields", () => {
  const body = JSON.stringify({ walletType: "MEDIAWALLET", chain: "STARKNET" });
  const injected = JSON.parse(injectAccountToken(body, "account_session_abc.def"));
  expect(injected).toEqual({
    walletType: "MEDIAWALLET",
    chain: "STARKNET",
    accountToken: "account_session_abc.def",
  });
});

test("injectAccountToken overwrites a client-supplied accountToken rather than trusting it", () => {
  const body = JSON.stringify({ accountToken: "client_supplied_forged_value" });
  const injected = JSON.parse(injectAccountToken(body, "account_session_real.value"));
  expect(injected.accountToken).toBe("account_session_real.value");
});

test("injectAccountToken handles an empty or malformed body by starting fresh", () => {
  expect(JSON.parse(injectAccountToken("", "tok"))).toEqual({ accountToken: "tok" });
  expect(JSON.parse(injectAccountToken("not json", "tok"))).toEqual({ accountToken: "tok" });
});
