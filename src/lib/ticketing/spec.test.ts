import { describe, expect, test } from "bun:test";
import { ticketingRunSpec, existingChoice, type TicketingForm } from "./spec";

const form: TicketingForm = {
  collection: { kind: "new", name: "Gala", symbol: "GALA" },
  name: "General admission",
  description: "Doors at 8",
  artwork: new File(["xyz"], "a.png", { type: "image/png" }),
  validFrom: "",
  validUntil: "",
  supply: "",
  guests: ["ana@x.com", "bruno@x.com"],
  terms: { licenseType: "All Rights Reserved", aiPolicy: "Not Allowed", transferable: "Allowed", territory: "Worldwide", royalty: "5" },
};

describe("the run spec for a ticketing run", () => {
  test("carries the collection, the ticket, the artwork's identity and the guests", () => {
    const spec = ticketingRunSpec(form);
    expect(spec.collection).toEqual({ kind: "new", name: "Gala", symbol: "GALA" });
    expect(spec.name).toBe("General admission");
    expect(spec.description).toBe("Doors at 8");
    expect(spec.artwork).toEqual({ name: "a.png", size: 3, type: "image/png" });
    expect(spec.guests).toEqual(["ana@x.com", "bruno@x.com"]);
  });

  test("turns the licensing choices into terms, and whether it can be passed on into what derivatives allow", () => {
    expect(ticketingRunSpec(form).terms).toEqual({
      licenseType: "All Rights Reserved",
      commercialUse: "No",
      derivatives: "Allowed",
      attribution: "Required",
      territory: "Worldwide",
      aiPolicy: "Not Allowed",
      royalty: 5,
      transferable: "Allowed",
    });
    const fixed = ticketingRunSpec({ ...form, terms: { ...form.terms, transferable: "Not Allowed" } }).terms;
    expect(fixed.derivatives).toBe("Not Allowed");
    expect(fixed.transferable).toBe("Not Allowed");
  });

  test("a blank or unreadable royalty is zero", () => {
    expect(ticketingRunSpec({ ...form, terms: { ...form.terms, royalty: "" } }).terms.royalty).toBe(0);
    expect(ticketingRunSpec({ ...form, terms: { ...form.terms, royalty: "abc" } }).terms.royalty).toBe(0);
  });

  test("leaves out what was not entered", () => {
    const spec = ticketingRunSpec({ ...form, artwork: null });
    expect(Object.keys(spec)).not.toContain("artwork");
    expect(Object.keys(spec)).not.toContain("supply");
    expect(Object.keys(spec)).not.toContain("validFrom");
    expect(Object.keys(spec)).not.toContain("validUntil");
  });

  test("includes the supply and the validity window when entered", () => {
    const spec = ticketingRunSpec({ ...form, supply: "100", validFrom: "2026-10-01T20:00", validUntil: "2026-10-02T02:00" });
    expect(spec.supply).toBe(100);
    expect(spec.validFrom).toBe(Math.floor(new Date("2026-10-01T20:00").getTime() / 1000));
    expect(spec.validUntil).toBe(Math.floor(new Date("2026-10-02T02:00").getTime() / 1000));
  });

  test("an existing group is named by its address alone", () => {
    expect(existingChoice({ collectionId: "7", contractAddress: "0xabc" })).toEqual({ kind: "existing", contractAddress: "0xabc" });
    expect(existingChoice({ collectionId: null, contractAddress: "0xabc" })).toEqual({ kind: "existing", contractAddress: "0xabc" });
  });
});
