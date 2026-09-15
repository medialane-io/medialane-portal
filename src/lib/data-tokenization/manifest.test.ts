import { describe, expect, test } from "bun:test";
import { parseCsv, placementFor, readManifest, MAX_FILE_BYTES } from "./manifest";

const file = (name: string, type: string, size = 10) => new File([new Uint8Array(size)], name, { type });

describe("parseCsv", () => {
  test("quoted fields keep commas, line breaks and escaped quotes", () => {
    const rows = parseCsv('name,description\r\n"Report, Q3","Line one\nline ""two"""\n');
    expect(rows).toEqual([
      ["name", "description"],
      ["Report, Q3", 'Line one\nline "two"'],
    ]);
  });

  test("a byte order mark and blank lines are ignored", () => {
    expect(parseCsv("﻿name\n\nA\n")).toEqual([["name"], ["A"]]);
  });
});

describe("placement follows the IP templates", () => {
  test("types with a document upload keep their file as a document", () => {
    expect(placementFor("Documents")).toBe("document");
    expect(placementFor("Patents")).toBe("document");
  });

  test("audio and video are media, everything else is an image", () => {
    expect(placementFor("Audio")).toBe("animation");
    expect(placementFor("Video")).toBe("animation");
    expect(placementFor("Photography")).toBe("image");
  });
});

describe("readManifest", () => {
  const files = [
    file("report.pdf", "application/pdf"),
    file("cover.png", "image/png"),
    file("song.mp3", "audio/mpeg"),
    file("photo.jpg", "image/jpeg"),
  ];

  test("each row becomes an item with its files, placement and extra columns as details", () => {
    const csv = [
      "name,description,ip_type,file,image,Author,Language",
      "Q3 Report,Quarterly,documents,report.pdf,cover.png,Ana,English",
      "Theme,,Audio,song.mp3,cover.png,,",
      "Street,,Photography,photo.jpg,,Rui,",
    ].join("\n");
    const { items, problems } = readManifest(csv, files);

    expect(problems).toEqual([]);
    expect(items.map((i) => [i.name, i.ipType, i.placement, i.file.name, i.image?.name])).toEqual([
      ["Q3 Report", "Documents", "document", "report.pdf", "cover.png"],
      ["Theme", "Audio", "animation", "song.mp3", "cover.png"],
      ["Street", "Photography", "image", "photo.jpg", undefined],
    ]);
    expect(items[0]!.traits).toEqual([
      { traitType: "Author", value: "Ana" },
      { traitType: "Language", value: "English" },
    ]);
    expect(items[2]!.traits).toEqual([{ traitType: "Author", value: "Rui" }]);
  });

  test("missing required columns and reserved detail columns are reported before any row", () => {
    expect(readManifest("name,file\nA,report.pdf", files).problems[0]!.message).toContain("ip_type");
    expect(readManifest("name,ip_type,file,License\nA,Documents,report.pdf,MIT", files).problems[0]!.message).toContain("License");
  });

  test("row problems name the row and what to fix", () => {
    const csv = [
      "name,ip_type,file,image",
      ",Documents,report.pdf,cover.png",
      "Song,Audio,song.mp3,",
      "Pic,Photography,report.pdf,",
      "Ghost,Documents,missing.pdf,cover.png",
      "Odd,Hologram,photo.jpg,",
    ].join("\n");
    const messages = readManifest(csv, files).problems.map((p) => p.message);
    expect(messages[0]).toContain("Row 1 needs a name");
    expect(messages[1]).toContain("needs a cover image");
    expect(messages[2]).toContain("needs to be a JPG");
    expect(messages[3]).toContain("is missing missing.pdf");
    expect(messages[4]).toContain('unknown type "Hologram"');
  });

  test("two rows cannot share a file, and oversized files are refused", () => {
    const big = file("big.jpg", "image/jpeg", MAX_FILE_BYTES + 1);
    const csv = ["name,ip_type,file", "A,Photography,photo.jpg", "B,Photography,photo.jpg", "C,Photography,big.jpg"].join("\n");
    const { items, problems } = readManifest(csv, [...files, big]);
    expect(items).toHaveLength(1);
    expect(problems.map((p) => p.row)).toEqual([2, 3]);
  });
});
