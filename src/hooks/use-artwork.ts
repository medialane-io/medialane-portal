"use client";

import { useCallback, useEffect, useState } from "react";
import { imageRejectionReason } from "@/lib/launchpad/issuance-form";

export function useArtwork() {
  const [artwork, setArtwork] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const choose = useCallback((file: File | undefined): boolean => {
    if (!file) return false;
    const reason = imageRejectionReason(file);
    setError(reason);
    if (reason) return false;
    setArtwork(file);
    setPreview(URL.createObjectURL(file));
    return true;
  }, []);

  return { artwork, preview, error, choose };
}
