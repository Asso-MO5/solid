import { env } from "~/server/env/env.server";

/** Erreur normalisée d'un appel vers l'API Ocelot. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiFetchOptions extends RequestInit {
  /** Jeton d'accès du viewer pour les appels authentifiés vers Ocelot. */
  token?: string;
}

/**
 * Client HTTP de base vers l'API Ocelot, côté serveur uniquement.
 * Chaque feature construit ses appels métier au-dessus de cette fonction :
 * elle transmet le jeton du viewer, sinon la clé d'API serveur si définie.
 */
export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const { token, ...init } = options ?? {};
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else if (env.ocelotApiKey) {
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
