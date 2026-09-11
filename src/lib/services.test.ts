import { test, expect } from "bun:test";
import { launchpadServices, launchpadService, isLaunchpadService } from "./services";
import { getService } from "@medialane/sdk";

test("the Launchpad offers Data Tokenization and IP Tickets", () => {
  expect(launchpadServices().map((s) => s.id).sort()).toEqual(["data-tokenization-erc721", "ip-tickets"]);
});

test("it is presented under its business name", () => {
  expect(launchpadServices()[0]!.displayName).toBe("Data Tokenization");
});

test("it runs on its own factory, separate from IP Collection", () => {
  const data = launchpadServices()[0]!;
  expect(data.onchain?.STARKNET?.factoryAddress).toBe(
    "0x07421b4442f7f2052c65408fb3561484154cf8175a0bbb41e3cd38d9087af6d2",
  );
  expect(data.onchain?.STARKNET?.factoryAddress).not.toBe(
    getService("mip-erc721")!.onchain?.STARKNET?.factoryAddress,
  );
});

test("services built for the other apps stay out of the portal", () => {
  for (const id of ["mip-erc721", "ip-erc721", "ip-club", "pop-protocol"]) {
    expect(launchpadService(id)).toBeUndefined();
  }
});

test("marketplaces and external services are never offered", () => {
  for (const id of ["medialane-marketplace-erc721", "external-erc721", "unruggable-erc20"]) {
    expect(launchpadService(id)).toBeUndefined();
  }
});

test("an offered service can always be rendered", () => {
  for (const service of launchpadServices()) {
    expect(service.displayName.length).toBeGreaterThan(0);
  }
});

test("an unknown id resolves to nothing", () => {
  expect(launchpadService("nonsense")).toBeUndefined();
});

test("a service must be able to mint to be offered", () => {
  expect(isLaunchpadService(getService("medialane-marketplace-erc721")!)).toBe(false);
});
