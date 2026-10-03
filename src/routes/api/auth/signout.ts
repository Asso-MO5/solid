import { signoutCookieHeaders } from "~/features/auth/auth.cookies.server";

/** Ferme la session : purge des cookies puis redirection vers l'accueil. */
export async function POST() {
  const headers = new Headers();
  for (const cookie of signoutCookieHeaders()) headers.append("Set-Cookie", cookie);
  headers.set("Location", "/");
  return new Response(null, { status: 303, headers });
}
