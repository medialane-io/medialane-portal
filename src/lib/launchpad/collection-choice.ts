export interface NewCollectionChoice {
  kind: "new";
  name: string;
  symbol: string;
  description: string;
  externalLink: string;
  image: File | null;
}

const fileRef = (file: File) => ({ name: file.name, size: file.size, type: file.type });

export function newCollectionSpec(choice: NewCollectionChoice) {
  const description = choice.description.trim();
  const externalLink = choice.externalLink.trim();
  return {
    kind: "new" as const,
    name: choice.name,
    symbol: choice.symbol,
    ...(description ? { description } : {}),
    ...(externalLink ? { externalLink } : {}),
    ...(choice.image ? { image: fileRef(choice.image) } : {}),
  };
}

export function collectionFiles(choice: { kind: string; image?: File | null }): [string, File][] {
  return choice.kind === "new" && choice.image ? [[choice.image.name, choice.image]] : [];
}

export function externalLinkProblem(link: string): string | null {
  const value = link.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if ((url.protocol === "https:" || url.protocol === "http:") && url.hostname) return null;
  } catch {}
  return "Use a link that starts with http:// or https://";
}
