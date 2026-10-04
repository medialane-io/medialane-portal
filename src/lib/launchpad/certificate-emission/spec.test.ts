import { describe, expect, test } from "bun:test";
import { certificateEmissionRunSpec, defaultTerms, existingChoice, withPreset } from "./spec";

describe("certificateEmissionRunSpec", () => {
  test("omits artwork when none was chosen", () => {
    const spec = certificateEmissionRunSpec({
      collection: existingChoice({ collectionId: "1", contractAddress: "0x1" }),
      name: "Course completion",
      description: "",
      artwork: null,
      guests: ["a@x.com"],
      terms: defaultTerms(),
    });
    expect(spec).not.toHaveProperty("artwork");
    expect(spec.guests).toEqual(["a@x.com"]);
    expect(spec.collection).toEqual({ kind: "existing", collectionId: "1", contractAddress: "0x1" });
  });

  test("includes artwork when one was chosen", () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    const spec = certificateEmissionRunSpec({
      collection: { kind: "new", name: "Cohort 1", symbol: "C1" },
      name: "Course completion",
      description: "",
      artwork: file,
      guests: ["a@x.com"],
      terms: defaultTerms(),
    });
    expect(spec).toMatchObject({ artwork: { name: "a.png", type: "image/png" } });
  });

  test("royalty is always 0 — there is no transfer, so nothing to set a royalty on", () => {
    const spec = certificateEmissionRunSpec({
      collection: existingChoice({ collectionId: "1", contractAddress: "0x1" }),
      name: "Course completion",
      description: "",
      artwork: null,
      guests: ["a@x.com"],
      terms: defaultTerms(),
    });
    expect(spec.terms.royalty).toBe(0);
  });
});

describe("withPreset", () => {
  test("choosing a license fills in commercialUse, derivatives and attribution from its preset", () => {
    const terms = withPreset(defaultTerms(), "All Rights Reserved");
    const preset = terms;
    expect(preset.licenseType).toBe("All Rights Reserved");
    expect(preset.commercialUse).toBe("No");
  });
});
