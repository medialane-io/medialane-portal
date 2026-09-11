import { test, expect } from "bun:test";
import { collectionCopy } from "./collection-copy";

test("tickets are organised, not collected", () => {
  const copy = collectionCopy("ip-tickets");
  expect(copy.label).toBe("Group");
  expect(copy.create).toBe("New group");
});

test("the hint leaves the structure to the business", () => {
  expect(collectionCopy("ip-tickets").hint).toBe("One per event, or one for everything.");
});

test("counts read as what has been issued", () => {
  const copy = collectionCopy("ip-tickets");
  expect(copy.countOf(120)).toBe("120 issued");
  expect(copy.countOf(0)).toBe("Nothing issued yet");
});

test("other services keep their own wording", () => {
  const copy = collectionCopy("data-tokenization-erc721");
  expect(copy.label).toBe("Collection");
  expect(copy.countOf(1)).toBe("1 item");
  expect(copy.countOf(3)).toBe("3 items");
});

test("nothing claims a structure the contract does not enforce", () => {
  for (const id of ["ip-tickets", "data-tokenization-erc721"]) {
    const copy = collectionCopy(id);
    expect(copy.hint.toLowerCase()).not.toContain("must");
    expect(copy.label.toLowerCase()).not.toContain("event");
  }
});
