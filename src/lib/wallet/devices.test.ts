import { test, expect } from "bun:test";
import { describeDevices, canRemoveDevice } from "./devices";
import { computeOwnerGuid } from "@medialane/sdk/starknet";

const MINE = "0x151c1fe8a4c7edba2dab3e168c4ab4638c606b5f6a14bdfdbd68c7f3241ac5";
const OTHER = "0x999";

const owner = (pubkey: string) => ({
  type: "Starknet" as const,
  guid: computeOwnerGuid(pubkey),
  storedValue: pubkey,
});

test("marks exactly one entry as this device", () => {
  const list = describeDevices([owner(MINE), owner(OTHER)], MINE);
  expect(list.filter((d) => d.isThisDevice).length).toBe(1);
  expect(list.find((d) => d.isThisDevice)!.guid).toBe(computeOwnerGuid(MINE));
});

test("marks nothing as this device when the key is not an owner", () => {
  const list = describeDevices([owner(OTHER)], MINE);
  expect(list.some((d) => d.isThisDevice)).toBe(false);
});

test("preserves the on-chain order", () => {
  const list = describeDevices([owner(OTHER), owner(MINE)], MINE);
  expect(list.map((d) => d.guid)).toEqual([computeOwnerGuid(OTHER), computeOwnerGuid(MINE)]);
});

test("refuses to remove the only owner", () => {
  const list = describeDevices([owner(MINE)], MINE);
  expect(canRemoveDevice(list, list[0].guid)).toBe(false);
});

test("allows removing a device when another owner remains", () => {
  const list = describeDevices([owner(MINE), owner(OTHER)], MINE);
  expect(canRemoveDevice(list, computeOwnerGuid(OTHER))).toBe(true);
});

test("allows removing this device when another owner remains", () => {
  const list = describeDevices([owner(MINE), owner(OTHER)], MINE);
  expect(canRemoveDevice(list, computeOwnerGuid(MINE))).toBe(true);
});

test("refuses to remove a guid that is not an owner", () => {
  const list = describeDevices([owner(MINE), owner(OTHER)], MINE);
  expect(canRemoveDevice(list, "0xdeadbeef")).toBe(false);
});
