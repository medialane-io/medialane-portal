import { describe, expect, test } from "bun:test";
import { invalidRecipients, parseRecipients, splitEntries } from "./recipients";
import { repeatsIn } from "./ticketing/event";

describe("splitEntries", () => {
  test("splits on new lines, commas and semicolons", () => {
    expect(splitEntries("a@x.com, b@x.com;c@x.com\nd@x.com")).toEqual(["a@x.com", "b@x.com", "c@x.com", "d@x.com"]);
  });

  test("keeps a quoted display name with a comma whole", () => {
    expect(splitEntries('"Doe, Jane" <j@x.com>, b@x.com')).toEqual(['"Doe, Jane" <j@x.com>', "b@x.com"]);
  });

  test("ignores blank entries", () => {
    expect(splitEntries(" ,\n;\n")).toEqual([]);
  });
});

describe("parseRecipients", () => {
  test("reads the address out of a display-name entry", () => {
    expect(parseRecipients('"Doe, Jane" <j@x.com>\nJohn <john@x.com>').map((r) => r.value)).toEqual(["j@x.com", "john@x.com"]);
  });

  test("drops repeats regardless of case, keeping the first spelling", () => {
    expect(parseRecipients("A@x.com, a@X.com").map((r) => r.value)).toEqual(["A@x.com"]);
  });

  test("flags what is not an email", () => {
    expect(invalidRecipients(parseRecipients("ok@x.com, nope")).map((r) => r.value)).toEqual(["nope"]);
  });

  test("counts repeats against the entries the person typed", () => {
    expect(repeatsIn("a@x.com, A@x.com\nb@x.com")).toBe(1);
  });
});
