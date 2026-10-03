import { hasMuseumRole, type MuseumRole } from "./auth.permissions";
import type { AuthenticatedUser } from "./auth.types";

/**
 * Décision de garde d'une page : exactement un rôle musée exigé.
 * Fonction pure, testée unitairement ; le refus renvoie vers la connexion
 * (401) ou vers la page d'accès refusé (403).
 */

export type GuardOutcome =
  | { action: "allow"; viewer: AuthenticatedUser }
  | { action: "redirect"; to: string };

function safeReturnTo(returnTo: string): string {
  return returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
}

export function signinUrl(returnTo: string): string {
  return `/api/auth/signin?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`;
}

export function guardPage(
  viewer: AuthenticatedUser | null,
  role: MuseumRole,
  returnTo = "/",
): GuardOutcome {
  if (!viewer) return { action: "redirect", to: signinUrl(returnTo) };
  if (!hasMuseumRole(viewer, role)) return { action: "redirect", to: "/403" };
  return { action: "allow", viewer };
}
