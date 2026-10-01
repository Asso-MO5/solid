import { env } from "~/server/env/env.server";

/** Normalized error for a failed Ocelot API call. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Base HTTP client for the Ocelot API, server-side only.
 * Each feature builds its business calls on top of this function.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (env.ocelotApiKey) {
    headers.set("Authorization", `Bearer ${env.ocelotApiKey}`);
  }

  const response = await fetch(new URL(path, env.ocelotApiUrl), {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Appel API en échec (${response.status}) : ${path}`);
  }

  return (await response.json()) as T;
}
