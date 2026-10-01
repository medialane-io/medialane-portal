import { describe, expect, test } from "bun:test";
import { certificateEmissionRunSpec, existingChoice } from "./spec.js";

describe("certificateEmissionRunSpec", () => {
  test("omits artwork when none was chosen", () => {
    const spec = certificateEmissionRunSpec({
      collection: existingChoice({ collectionId: "1", contractAddress: "0x1" }),
      name: "Course completion",
      description: "",
      artwork: null,
      guests: ["a@x.com"],
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
    });
    expect(spec).toMatchObject({ artwork: { name: "a.png", type: "image/png" } });
  });
});
