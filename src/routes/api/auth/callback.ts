import type { APIEvent } from "@solidjs/start/server";
import { getZitadelConfiguration } from "~/features/auth/auth.config.server";
import {
  NONCE_COOKIE,
  RETURN_TO_COOKIE,
  STATE_COOKIE,
  VERIFIER_COOKIE,
} from "~/features/auth/auth.const";
import {
  clearTemporaryCookieHeaders,
  readRequestCookie,
  sessionCookieHeaders,
} from "~/features/auth/auth.cookies.server";
import {
  exchangeAuthorizationCode,
  getOidcDiscovery,
  verifyIdToken,
} from "~/features/auth/auth.oidc.server";

function failure(headers: Headers): Response {
  headers.set("Location", "/401");
  return new Response(null, { status: 302, headers });
}

/** Termine le flux OIDC : vérifications puis cookies de session. */
export async function GET(event: APIEvent) {
  const url = new URL(event.request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");
  const expectedState = readRequestCookie(event.request, STATE_COOKIE);
  const nonce = readRequestCookie(event.request, NONCE_COOKIE);
  const verifier = readRequestCookie(event.request, VERIFIER_COOKIE);
  const returnToCookie = readRequestCookie(event.request, RETURN_TO_COOKIE);

  const headers = new Headers();
  for (const cookie of clearTemporaryCookieHeaders()) headers.append("Set-Cookie", cookie);

  if (!state || !expectedState || state !== expectedState || !nonce || !verifier) {
    return failure(headers);
  }
  if (error) return failure(headers);
  if (!code) return failure(headers);

  try {
    const config = getZitadelConfiguration();
    const discovery = await getOidcDiscovery(config);
    const tokens = await exchangeAuthorizationCode(config, discovery, code, verifier);
    if (!tokens.id_token) throw new Error("ID token absent");
    await verifyIdToken(config, discovery, tokens.id_token, nonce);

    for (const cookie of sessionCookieHeaders(tokens)) headers.append("Set-Cookie", cookie);
    const returnTo =
      returnToCookie && returnToCookie.startsWith("/") && !returnToCookie.startsWith("//")
        ? returnToCookie
        : "/";
    headers.set("Location", returnTo);
    return new Response(null, { status: 302, headers });
  } catch {
    return failure(headers);
  }
}
