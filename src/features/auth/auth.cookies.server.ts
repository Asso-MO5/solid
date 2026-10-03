import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_DEFAULT,
  NONCE_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_DAYS_DEFAULT,
  RETURN_TO_COOKIE,
  STATE_COOKIE,
  TEMPORARY_COOKIE_MAX_AGE,
  VERIFIER_COOKIE,
} from "./auth.const";
import type { OidcTokenResponse } from "./auth.types";

/**
 * Cookies de session Zitadel, sans dépendance : lecture depuis l'en-tête
 * Cookie et fabrication d'en-têtes Set-Cookie appliqués à la réponse.
 */

export function parseCookies(header: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 1) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name) cookies[name] = decodeURIComponent(value);
  }
  return cookies;
}

export function readRequestCookie(request: Request, name: string): string | null {
  return parseCookies(request.headers.get("cookie"))[name] ?? null;
}

function baseOptions(): string {
  const parts = ["Path=/", "HttpOnly", "SameSite=Lax"];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  const domain = process.env.COOKIE_DOMAIN?.trim();
  if (process.env.NODE_ENV === "production" && domain) parts.push(`Domain=${domain}`);
  return parts.join("; ");
}

function serialize(name: string, value: string, maxAge?: number): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, baseOptions()];
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  return parts.join("; ");
}

export function applyCookies(headers: Headers, cookies: string[]): void {
  for (const cookie of cookies) headers.append("Set-Cookie", cookie);
}

export function sessionCookieHeaders(tokens: OidcTokenResponse): string[] {
  const headers = [
    serialize(ACCESS_TOKEN_COOKIE, tokens.access_token, tokens.expires_in || ACCESS_TOKEN_MAX_AGE_DEFAULT),
  ];
  if (tokens.refresh_token) {
    const days = Number(process.env.REFRESH_TOKEN_MAX_AGE_DAYS) || REFRESH_TOKEN_MAX_AGE_DAYS_DEFAULT;
    headers.push(serialize(REFRESH_TOKEN_COOKIE, tokens.refresh_token, 60 * 60 * 24 * days));
  }
  return headers;
}

export function clearSessionCookieHeaders(): string[] {
  return [serialize(ACCESS_TOKEN_COOKIE, "", 0), serialize(REFRESH_TOKEN_COOKIE, "", 0)];
}

export function temporaryCookieHeaders(values: {
  state: string;
  nonce: string;
  verifier: string;
  returnTo?: string;
}): string[] {
  const headers = [
    serialize(STATE_COOKIE, values.state, TEMPORARY_COOKIE_MAX_AGE),
    serialize(NONCE_COOKIE, values.nonce, TEMPORARY_COOKIE_MAX_AGE),
    serialize(VERIFIER_COOKIE, values.verifier, TEMPORARY_COOKIE_MAX_AGE),
  ];
  if (values.returnTo) {
    headers.push(serialize(RETURN_TO_COOKIE, values.returnTo, TEMPORARY_COOKIE_MAX_AGE));
  }
  return headers;
}

export function clearTemporaryCookieHeaders(): string[] {
  return [STATE_COOKIE, NONCE_COOKIE, VERIFIER_COOKIE, RETURN_TO_COOKIE].map((name) =>
    serialize(name, "", 0),
  );
}

export function signoutCookieHeaders(): string[] {
  return [...clearSessionCookieHeaders(), ...clearTemporaryCookieHeaders()];
}
