export function readStringEnv(value: string | undefined, fallback = ""): string {
  return value || fallback;
}
