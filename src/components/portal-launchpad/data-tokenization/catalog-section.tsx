"use client";

import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Manifest } from "@/lib/data-tokenization/manifest";

const TEMPLATE = [
  "name,description,ip_type,file,image,Author",
  '"Quarterly report","Findings for the third quarter",Documents,report.pdf,cover.png,Ana',
  '"Street study",,Photography,street.jpg,,Rui',
].join("\n");

function downloadTemplate() {
  const url = URL.createObjectURL(new Blob([TEMPLATE], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "catalog.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function CatalogDrop({ onFiles, disabled }: { onFiles: (files: FileList | null) => void; disabled?: boolean }) {
  return (
    <label
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFiles(e.dataTransfer.files);
      }}
    >
      <input type="file" multiple className="hidden" disabled={disabled} onChange={(e) => onFiles(e.target.files)} />
      <Upload className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Drop your CSV and files here, or click to choose them</span>
    </label>
  );
}

export function CatalogSection({
  manifest,
  csvName,
  fileCount,
  onFiles,
  disabled,
}: {
  manifest: Manifest | null;
  csvName: string | null;
  fileCount: number;
  onFiles: (files: FileList | null) => void;
  disabled?: boolean;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Your catalog</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add a CSV with one row per item, together with the files it names.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Template
        </Button>
      </div>

      <CatalogDrop onFiles={onFiles} disabled={disabled} />

      {csvName ? (
        <p className="text-sm text-muted-foreground">
          {csvName} · {fileCount.toLocaleString()} files attached
        </p>
      ) : null}

      {manifest && manifest.problems.length > 0 ? (
        <ul className="space-y-1 text-sm text-destructive">
          {manifest.problems.slice(0, 10).map((p) => (
            <li key={`${p.row}-${p.message}`}>{p.message}</li>
          ))}
          {manifest.problems.length > 10 ? <li>And {manifest.problems.length - 10} more</li> : null}
        </ul>
      ) : null}

      {manifest && manifest.items.length > 0 ? (
        <div className="overflow-x-auto rounded-xl bg-muted/40">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">File</th>
                <th className="px-4 py-2 font-medium">Cover</th>
              </tr>
            </thead>
            <tbody>
              {manifest.items.slice(0, 50).map((item) => (
                <tr key={item.row} className="border-t border-border">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.ipType}</td>
                  <td className="px-4 py-2">{item.file.name}</td>
                  <td className="px-4 py-2">{item.image?.name ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-2 text-sm text-muted-foreground">
            {manifest.items.length.toLocaleString()} {manifest.items.length === 1 ? "item" : "items"}
          </p>
        </div>
      ) : null}
    </section>
  );
}
