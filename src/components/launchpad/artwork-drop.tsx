"use client";

import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function ArtworkDrop({
  preview,
  onChoose,
  disabled,
  className,
  imageClassName,
}: {
  preview: string | null;
  onChoose: (file: File | undefined) => void;
  disabled: boolean;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <label
      className={cn("flex h-32 w-32 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 text-center", className)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onChoose(e.dataTransfer.files?.[0]);
      }}
    >
      <input type="file" accept="image/*" className="hidden" disabled={disabled} onChange={(e) => onChoose(e.target.files?.[0])} />
      {preview ? (
        <img src={preview} alt="" className={cn("h-full w-full object-cover", imageClassName)} />
      ) : (
        <span className="flex flex-col items-center gap-1.5 text-muted-foreground">
          <Upload className="h-5 w-5" />
          Artwork
        </span>
      )}
    </label>
  );
}
