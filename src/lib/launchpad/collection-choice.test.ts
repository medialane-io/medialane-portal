import { describe, expect, test } from "bun:test";
import { collectionFiles, collectionImageProblem, externalLinkProblem, newCollectionSpec } from "./collection-choice";

const image = new File(["x"], "cover.png", { type: "image/png" });

describe("newCollectionSpec", () => {
  test("sends every field the creator filled in", () => {
    expect(newCollectionSpec({ kind: "new", name: "A", symbol: "A", description: " d ", externalLink: "https://x.example", image })).toEqual({
      kind: "new",
      name: "A",
      symbol: "A",
      description: "d",
      externalLink: "https://x.example",
      image: { name: "cover.png", size: 1, type: "image/png" },
    });
  });

  test("leaves out empty fields", () => {
    expect(newCollectionSpec({ kind: "new", name: "A", symbol: "A", description: "", externalLink: " ", image: null })).toEqual({
      kind: "new",
      name: "A",
      symbol: "A",
    });
  });
});

describe("collectionFiles", () => {
  test("is the new collection's image, keyed by name", () => {
    expect(collectionFiles({ kind: "new", image })).toEqual([["cover.png", image]]);
    expect(collectionFiles({ kind: "new", image: null })).toEqual([]);
    expect(collectionFiles({ kind: "existing" })).toEqual([]);
  });
});

describe("externalLinkProblem", () => {
  test("accepts an empty link or a web address", () => {
    expect(externalLinkProblem("")).toBeNull();
    expect(externalLinkProblem("  ")).toBeNull();
    expect(externalLinkProblem("https://me.example/work")).toBeNull();
    expect(externalLinkProblem("http://me.example")).toBeNull();
  });

  test("rejects anything that is not an http or https address", () => {
    expect(externalLinkProblem("me.example")).toBe("Use a link that starts with http:// or https://");
    expect(externalLinkProblem("ftp://me.example")).toBe("Use a link that starts with http:// or https://");
    expect(externalLinkProblem("https://")).toBe("Use a link that starts with http:// or https://");
  });
});

describe("collectionImageProblem", () => {
  const cover = new File(["cover"], "image.png", { type: "image/png", lastModified: 1 });

  test("accepts no image, a uniquely named image, or the very same file chosen twice", () => {
    expect(collectionImageProblem(null, [new File(["a"], "image.png")])).toBeNull();
    expect(collectionImageProblem(cover, [new File(["a"], "art.png")])).toBeNull();
    expect(collectionImageProblem(cover, [new File(["cover"], "image.png", { type: "image/png", lastModified: 1 })])).toBeNull();
  });

  test("rejects a different file that has the same name as another file in the run", () => {
    expect(collectionImageProblem(cover, [new File(["other artwork"], "image.png", { type: "image/png", lastModified: 2 })])).toBe(
      "Another file in this run is also named image.png. Rename the collection image and choose it again.",
    );
  });
});
