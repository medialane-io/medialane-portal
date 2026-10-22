import { describe, expect, test } from "bun:test";
import { MAX_UPLOAD_BYTES } from "@medialane/sdk";
import { imageRejectionReason, maxSupplyFor, validityError } from "./issuance-form";

describe("maxSupplyFor", () => {
  test("defaults to the number of recipients", () => {
    expect(maxSupplyFor(3, "")).toBe("3");
    expect(maxSupplyFor(0, "")).toBeNull();
  });

  test("accepts a supply that covers the recipients and normalises it", () => {
    expect(maxSupplyFor(3, " 0010 ")).toBe("10");
  });

  test("refuses a supply below the recipients or not a whole number", () => {
    expect(maxSupplyFor(3, "2")).toBeNull();
    expect(maxSupplyFor(3, "1.5")).toBeNull();
    expect(maxSupplyFor(3, "-4")).toBeNull();
  });

  test("refuses a supply too large to send exactly", () => {
    expect(maxSupplyFor(1, "9007199254740993")).toBeNull();
    expect(maxSupplyFor(1, "9007199254740991")).toBe("9007199254740991");
  });
});

describe("validityError", () => {
  test("requires the end after the start", () => {
    expect(validityError("2030-01-02T10:00", "2030-01-01T10:00")).toBe("It has to end after it starts.");
    expect(validityError("2030-01-01T10:00", "2030-01-02T10:00")).toBeNull();
    expect(validityError("", "")).toBeNull();
  });
});

describe("imageRejectionReason", () => {
  const image = (size: number) => ({ type: "image/png", size }) as File;

  test("an image of the upload size is accepted", () => {
    expect(imageRejectionReason(image(MAX_UPLOAD_BYTES))).toBeNull();
  });

  test("a larger image names both sizes", () => {
    expect(imageRejectionReason(image(95 * 1024 * 1024))).toBe("That image is 95 MB. Please choose one under 90 MB.");
  });
});
