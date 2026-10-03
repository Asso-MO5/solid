import type { APIEvent } from "@solidjs/start/server";
import { applyCookies } from "~/features/auth/auth.cookies.server";
import { museumRolesOf } from "~/features/auth/auth.permissions";
import { resolveSession } from "~/features/auth/auth.session.server";

/** Utilisateur courant et rôles, ou 401. Rafraîchit la session si besoin. */
export async function GET(event: APIEvent) {
  const { viewer, cookies } = await resolveSession(event.request);
  const headers = new Headers({ "Cache-Control": "no-store" });
  applyCookies(headers, cookies);

  if (!viewer) {
    return Response.json({ error: "Non authentifié" }, { status: 401, headers });
  }

  return Response.json(
    {
      id: viewer.id,
      username: viewer.username,
      avatar: viewer.avatar,
      email: viewer.email,
      roles: viewer.roles,
      museumRoles: museumRolesOf(viewer),
    },
    { headers },
  );
}
