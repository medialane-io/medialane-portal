export function safeRelativePath(path: string | null | undefined): string | null {
  if (!path) return null;
  if (!path.startsWith("/")) return null;
  if (path.includes("\\")) return null;
  if (path.includes("\t") || path.includes("\n") || path.includes("\r")) return null;
  if (path.startsWith("//")) return null;
  return path;
}
