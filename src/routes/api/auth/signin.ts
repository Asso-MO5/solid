import type { APIEvent } from "@solidjs/start/server";
import { getZitadelConfiguration } from "~/features/auth/auth.config.server";
import { temporaryCookieHeaders } from "~/features/auth/auth.cookies.server";
import {
  createAuthorizationTransaction,
  createAuthorizationUrl,
  getOidcDiscovery,
} from "~/features/auth/auth.oidc.server";

/** Démarre le flux OIDC : cookies temporaires puis redirection vers Zitadel. */
export async function GET(event: APIEvent) {
  try {
    const config = getZitadelConfiguration();
    const discovery = await getOidcDiscovery(config);
    const transaction = createAuthorizationTransaction();
    const returnTo = new URL(event.request.url).searchParams.get("returnTo") ?? "/";
    const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";

    const headers = new Headers();
    for (const cookie of temporaryCookieHeaders({
      state: transaction.state,
      nonce: transaction.nonce,
      verifier: transaction.verifier,
      returnTo: safeReturnTo,
    })) {
      headers.append("Set-Cookie", cookie);
    }
    headers.set("Location", createAuthorizationUrl(config, discovery, transaction));
    return new Response(null, { status: 302, headers });
  } catch {
    return Response.json({ error: "Configuration Zitadel invalide" }, { status: 500 });
  }
}
