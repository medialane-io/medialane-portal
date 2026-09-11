import { test, expect } from "bun:test";
import { billTo } from "./billing";

test("reading to draw the interface is on the portal", () => {
  expect(billTo("/v1/collections?owner=0x1", "GET")).toBe("portal");
  expect(billTo("/v1/business/provisioning", "GET")).toBe("portal");
  expect(billTo("/v1/prices", "GET")).toBe("portal");
  expect(billTo("/.well-known/x402", "GET")).toBe("portal");
});

test("a service the customer is buying is on the customer", () => {
  expect(billTo("/v1/business/provisioning", "POST")).toBe("customer");
  expect(billTo("/v1/intents/build", "POST")).toBe("customer");
  expect(billTo("/v1/business/issuance/mint-calls", "POST")).toBe("customer");
  expect(billTo("/v1/metadata/upload", "POST")).toBe("customer");
  expect(billTo("/v1/paymaster/deploy/build", "POST")).toBe("customer");
});

test("the customer's own account is always read as themselves", () => {
  expect(billTo("/v1/portal/me", "GET")).toBe("customer");
  expect(billTo("/v1/portal/keys", "GET")).toBe("customer");
  expect(billTo("/v1/portal/credits/history", "GET")).toBe("customer");
  expect(billTo("/v1/portal/keys", "POST")).toBe("customer");
});

test("the method decides, whatever its case", () => {
  expect(billTo("/v1/collections", "get")).toBe("portal");
});

test("anything that changes state is on the customer", () => {
  for (const method of ["POST", "PATCH", "DELETE", "PUT"]) {
    expect(billTo("/v1/anything", method)).toBe("customer");
  }
});
