import { describe, expect, test } from "bun:test";
import { LAUNCHPAD, launchpadServiceFor } from "./services";

describe("launchpadServiceFor", () => {
  test("finds every launchpad service by the id its runs carry", () => {
    for (const service of Object.values(LAUNCHPAD)) {
      expect(launchpadServiceFor(service.run)).toBe(service);
    }
  });

  test("knows certificate runs, which the runs list used to drop", () => {
    expect(launchpadServiceFor("certificate-emission")?.href).toBe("/launchpad/certificate-emission");
  });

  test("ignores a service that is not on the launchpad", () => {
    expect(launchpadServiceFor("pop-protocol")).toBeUndefined();
  });
});
