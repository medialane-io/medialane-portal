import { IP_TYPES, type IPType } from "@medialane/ui/data/ip";
import { IP_TEMPLATES, DOC_UPLOAD } from "@medialane/ui/data/ip-templates";
import { RESERVED_TRAITS } from "@medialane/sdk";

export const MAX_ITEMS = 500;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_TRAITS = 20;

export type Placement = "image" | "animation" | "document";

export interface ManifestItem {
  row: number;
  name: string;
  description: string;
  ipType: IPType;
  placement: Placement;
  file: File;
  image?: File;
  traits: { traitType: string; value: string }[];
}

export interface ManifestProblem {
  row: number | null;
  message: string;
}

export interface Manifest {
  items: ManifestItem[];
  problems: ManifestProblem[];
}

const KNOWN_COLUMNS = new Set(["name", "description", "ip_type", "file", "image"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/avif"]);
const MEDIA_TYPES = /^(audio|video)\//;
const DOCUMENT_EXTENSIONS = DOC_UPLOAD.accept.split(",").map((ext) => ext.trim().toLowerCase());
const RESERVED = new Set([...RESERVED_TRAITS].map((t) => t.toLowerCase()));

export function placementFor(ipType: IPType): Placement {
  if (IP_TEMPLATES[ipType]?.docUpload) return "document";
  if (ipType === "Audio" || ipType === "Video") return "animation";
  return "image";
}

export function parseCsv(text: string): string[][] {
  const source = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i]!;
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && source[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

const extensionOf = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
};

function fileProblem(file: File, placement: Placement): string | null {
  if (file.size > MAX_FILE_BYTES) return `${file.name} is larger than 10 MB`;
  if (placement === "image" && !IMAGE_TYPES.has(file.type)) return `${file.name} needs to be a JPG, PNG, GIF, WebP, SVG or AVIF image`;
  if (placement === "animation" && !MEDIA_TYPES.test(file.type)) return `${file.name} needs to be an audio or video file`;
  if (placement === "document" && !DOCUMENT_EXTENSIONS.includes(extensionOf(file.name))) {
    return `${file.name} needs to be one of ${DOCUMENT_EXTENSIONS.join(", ")}`;
  }
  return null;
}

export function readManifest(csvText: string, files: File[]): Manifest {
  const problems: ManifestProblem[] = [];
  const items: ManifestItem[] = [];
  const rows = parseCsv(csvText);
  if (rows.length === 0) return { items, problems: [{ row: null, message: "The catalog file is empty" }] };

  const header = rows[0]!.map((h) => h.trim());
  const column = (name: string) => header.findIndex((h) => h.toLowerCase() === name);
  for (const required of ["name", "ip_type", "file"]) {
    if (column(required) === -1) problems.push({ row: null, message: `Add a "${required}" column` });
  }
  const traitColumns = header
    .map((h, index) => ({ h, index }))
    .filter(({ h }) => h !== "" && !KNOWN_COLUMNS.has(h.toLowerCase()));
  for (const { h } of traitColumns) {
    if (RESERVED.has(h.toLowerCase())) problems.push({ row: null, message: `"${h}" is set by the terms, remove that column` });
  }
  if (problems.length > 0) return { items, problems };

  const dataRows = rows.slice(1);
  if (dataRows.length > MAX_ITEMS) {
    return { items, problems: [{ row: null, message: `A run holds up to ${MAX_ITEMS} items` }] };
  }

  const byName = new Map(files.map((f) => [f.name, f]));
  const usedFiles = new Set<string>();
  const cell = (values: string[], name: string) => (values[column(name)] ?? "").trim();

  dataRows.forEach((values, i) => {
    const row = i + 1;
    const rowProblems: string[] = [];

    const name = cell(values, "name");
    if (!name) rowProblems.push("needs a name");
    if (name.length > 120) rowProblems.push("has a name longer than 120 characters");

    const typeCell = cell(values, "ip_type");
    const ipType = IP_TYPES.find((t) => t.toLowerCase() === typeCell.toLowerCase());
    if (!ipType) rowProblems.push(`has an unknown type "${typeCell}"`);

    const fileName = cell(values, "file");
    const file = fileName ? byName.get(fileName) : undefined;
    if (!fileName) rowProblems.push("needs a file");
    else if (!file) rowProblems.push(`is missing ${fileName}`);
    else if (usedFiles.has(fileName)) rowProblems.push(`uses ${fileName}, which another row already uses`);

    const imageName = cell(values, "image");
    const image = imageName ? byName.get(imageName) : undefined;
    if (imageName && !image) rowProblems.push(`is missing ${imageName}`);

    const placement = ipType ? placementFor(ipType) : null;
    if (placement && file) {
      const problem = fileProblem(file, placement);
      if (problem) rowProblems.push(problem);
    }
    if (placement && placement !== "image" && !image && !imageName) rowProblems.push("needs a cover image");
    if (image) {
      const problem = fileProblem(image, "image");
      if (problem) rowProblems.push(problem);
    }

    const traits = traitColumns
      .map(({ h, index }) => ({ traitType: h, value: (values[index] ?? "").trim() }))
      .filter((t) => t.value !== "");
    if (traits.length > MAX_TRAITS) rowProblems.push(`has more than ${MAX_TRAITS} details`);

    if (rowProblems.length > 0 || !ipType || !placement || !file) {
      problems.push({ row, message: `Row ${row} ${rowProblems.join(", ")}` });
      return;
    }
    usedFiles.add(fileName);
    items.push({
      row,
      name,
      description: cell(values, "description").slice(0, 2000),
      ipType,
      placement,
      file,
      image,
      traits,
    });
  });

  return { items, problems };
}
