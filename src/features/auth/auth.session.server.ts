import { getZitadelConfiguration } from "./auth.config.server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "./auth.const";
import {
  clearSessionCookieHeaders,
  readRequestCookie,
  sessionCookieHeaders,
} from "./auth.cookies.server";
import { getOidcDiscovery, getUserinfo, refreshTokens } from "./auth.oidc.server";
import type { AuthenticatedUser } from "./auth.types";

/**
 * Résolution de la session côté serveur : userinfo avec le jeton d'accès,
 * rafraîchissement silencieux avec le jeton de rafraîchissement, purge en
 * cas d'échec. Les cookies à réécrire sont retournés à l'appelant.
 */

export interface SessionResolution {
  viewer: AuthenticatedUser | null;
  cookies: string[];
}

export async function resolveSession(request: Request): Promise<SessionResolution> {
  try {
    return await resolveSessionInner(request);
  } catch {
    // Zitadel indisponible ou configuration invalide : échec sûr, la session
    // n'est pas purgée pour se rétablir dès le retour du fournisseur.
    return { viewer: null, cookies: [] };
  }
}

async function resolveSessionInner(request: Request): Promise<SessionResolution> {
  const config = getZitadelConfiguration();
  const discovery = await getOidcDiscovery(config);
  const accessToken = readRequestCookie(request, ACCESS_TOKEN_COOKIE);
  const cookies: string[] = [];

  if (accessToken) {
    const viewer = await getUserinfo(config, discovery, accessToken);
    if (viewer) return { viewer, cookies };
  }

  const refreshToken = readRequestCookie(request, REFRESH_TOKEN_COOKIE);
  if (!refreshToken) {
    if (accessToken) cookies.push(...clearSessionCookieHeaders());
    return { viewer: null, cookies };
  }

  try {
    const tokens = await refreshTokens(config, discovery, refreshToken);
    const viewer = await getUserinfo(config, discovery, tokens.access_token);
    if (!viewer) {
      cookies.push(...clearSessionCookieHeaders());
      return { viewer: null, cookies };
    }
    cookies.push(
      ...sessionCookieHeaders({ ...tokens, refresh_token: tokens.refresh_token || refreshToken }),
    );
    return { viewer, cookies };
  } catch {
    cookies.push(...clearSessionCookieHeaders());
    return { viewer: null, cookies };
  }
}
