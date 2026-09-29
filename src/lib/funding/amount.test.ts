import { describe, expect, test } from "bun:test";
import { topUpUsdcFor } from "./amount";

describe("how many dollars cover a credit shortfall", () => {
  test("one credit is one cent, rounded up to the cent", () => {
    expect(topUpUsdcFor(1)).toBe("0.01");
    expect(topUpUsdcFor(20)).toBe("0.2");
    expect(topUpUsdcFor(250)).toBe("2.5");
    expect(topUpUsdcFor(251)).toBe("2.51");
    expect(topUpUsdcFor(1000)).toBe("10");
    expect(topUpUsdcFor(250.2)).toBe("2.51");
  });
  test("there is no minimum beyond one cent and no maximum", () => {
    expect(topUpUsdcFor(0)).toBe("0.01");
    expect(topUpUsdcFor(10_000_000)).toBe("100000");
  });
});
