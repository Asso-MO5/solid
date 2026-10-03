import { query, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { guardPage } from "./auth.guard.server";
import type { MuseumRole } from "./auth.permissions";
import { resolveSession } from "./auth.session.server";
import type { AuthenticatedUser } from "./auth.types";

/**
 * Gardes d'accès serveur, à la manière de milpatt : chaque page protégée
 * appelle exactement une de ces fonctions avec exactement un rôle musée.
 */

async function currentViewer(): Promise<AuthenticatedUser | null> {
  const event = getRequestEvent();
  if (!event) return null;
  const { viewer, cookies } = await resolveSession(event.request);
  for (const cookie of cookies) event.response.headers.append("Set-Cookie", cookie);
  return viewer;
}

export const getCurrentViewer = query(async () => {
  "use server";
  return currentViewer();
}, "auth.current-viewer");

export const requireViewer = query(async (returnTo = "/") => {
  "use server";
  const viewer = await currentViewer();
  if (!viewer) throw redirect(signinUrlFor(returnTo));
  return viewer;
}, "auth.require-viewer");

/** Vérifie exactement un rôle musée pour la page appelante. */
export const requirePageRole = query(async (role: MuseumRole, returnTo = "/") => {
  "use server";
  const viewer = await currentViewer();
  const outcome = guardPage(viewer, role, returnTo);
  if (outcome.action === "redirect") throw redirect(outcome.to);
  return outcome.viewer;
}, "auth.require-page-role");

function signinUrlFor(returnTo: string): string {
  const safe = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
  return `/api/auth/signin?returnTo=${encodeURIComponent(safe)}`;
}
