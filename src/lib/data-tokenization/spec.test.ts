import { describe, expect, test } from "bun:test";
import { getService } from "@medialane/sdk";
import { DATA_TOKENIZATION_SERVICE } from "@/lib/portal-launchpad/collection-copy";
import { defaultTerms, filesOf, runSpec, withPreset } from "./spec";
import type { ManifestItem } from "./manifest";

const file = (name: string, type: string, size = 10) => new File([new Uint8Array(size)], name, { type });

describe("terms", () => {
  test("default terms start from the service's registry license, expanded", () => {
    const terms = defaultTerms();
    expect(terms.licenseType).toBe(getService(DATA_TOKENIZATION_SERVICE)!.metadataSchema!.licenseDefault!);
    expect(terms.territory).toBe("Worldwide");
    expect(terms.royalty).toBe(0);
  });

  test("choosing a preset sets its commercial use, derivatives and attribution", () => {
    const terms = withPreset(defaultTerms(), "All Rights Reserved");
    expect([terms.commercialUse, terms.derivatives, terms.attribution]).toEqual(["No", "Not Allowed", "Required"]);
  });
});

describe("run spec", () => {
  const items: ManifestItem[] = [
    {
      row: 1,
      name: "Report",
      description: "",
      ipType: "Documents",
      placement: "document",
      file: file("report.pdf", "application/pdf", 5),
      image: file("cover.png", "image/png", 3),
      traits: [{ traitType: "Author", value: "Ana" }],
    },
    {
      row: 2,
      name: "Street",
      description: "",
      ipType: "Photography",
      placement: "image",
      file: file("photo.jpg", "image/jpeg", 7),
      traits: [],
    },
  ];

  test("the spec names each file by name, size and type, never its bytes", () => {
    const spec = runSpec({ kind: "new", name: "Archive", symbol: "ARC" }, defaultTerms(), items);
    expect(spec.items[0]).toEqual({
      name: "Report",
      description: "",
      ipType: "Documents",
      placement: "document",
      file: { name: "report.pdf", size: 5, type: "application/pdf" },
      image: { name: "cover.png", size: 3, type: "image/png" },
      traits: [{ traitType: "Author", value: "Ana" }],
    });
    expect("image" in spec.items[1]!).toBe(false);
  });

  test("the files to upload are every item file and cover, once each", () => {
    expect([...filesOf(items).keys()]).toEqual(["report.pdf", "cover.png", "photo.jpg"]);
  });
});
