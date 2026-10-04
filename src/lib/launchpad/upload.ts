export async function putFileToSignedUrl(url: string, file: File, fetchImpl: typeof fetch = fetch): Promise<string> {
  const form = new FormData();
  form.append("file", file, file.name);
  form.append("network", "public");
  form.append("name", file.name);
  const res = await fetchImpl(url, { method: "POST", body: form });
  const body = (await res.json().catch(() => ({}))) as { data?: { cid?: string } };
  const cid = body.data?.cid;
  if (!res.ok || !cid) throw new Error(`Could not upload ${file.name}. Try again.`);
  return cid;
}
