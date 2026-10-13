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

const sameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.type === b.type && a.lastModified === b.lastModified;

export function collectionImageProblem(image: File | null, others: File[]): string | null {
  if (!image) return null;
  const clash = others.some((other) => other.name === image.name && !sameFile(other, image));
  return clash ? `Another file in this run is also named ${image.name}. Rename the collection image and choose it again.` : null;
}
