export async function throwOnErrorResponse(res: Response, fallback: string): Promise<never> {
  const body = await res.json().catch(() => null) as { error?: string } | null;
  throw new Error(body?.error || fallback);
}
