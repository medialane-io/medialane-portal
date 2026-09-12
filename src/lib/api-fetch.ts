import { apiFetch as apiFetchBase, ApiError, type ApiFetchOptions } from "@medialane/ui";
import { MEDIALANE_BACKEND_URL, MEDIALANE_API_KEY } from "./constants";

export { ApiError };
export type { ApiFetchOptions };

export function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return apiFetchBase<T>({ baseUrl: MEDIALANE_BACKEND_URL, apiKey: MEDIALANE_API_KEY }, path, options);
}
