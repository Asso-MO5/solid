import { roles } from "./auth.const";
import type { AuthenticatedUser } from "./auth.types";

/**
 * Chaque page protégée exige exactement un rôle musée présent dans le claim
 * Zitadel, en miroir des routes Ocelot. Aucun héritage, aucun rôle
 * d'organisation implicite.
 */
export const museumRoleFor = {
  ticketScan: roles.museum_mediateur,
  ticketManage: roles.museum_ticket_manage,
  configuration: roles.museum_configuration,
  memberPresenceManage: roles.museum_member_presence_manage,
  donationProofManage: roles.museum_donation_proof_manage,
} as const;

export type MuseumRole = (typeof museumRoleFor)[keyof typeof museumRoleFor];
export type MuseumCapability = keyof typeof museumRoleFor;

export function hasMuseumRole(user: AuthenticatedUser | undefined | null, role: MuseumRole): boolean {
  return Boolean(user?.roles.includes(role));
}

export function museumRolesOf(user: AuthenticatedUser | undefined | null): MuseumRole[] {
  if (!user) return [];
  const all = Object.values(museumRoleFor) as MuseumRole[];
  return all.filter((role) => user.roles.includes(role));
}

export const museumRoleLabels: Record<MuseumRole, string> = {
  museum_mediateur: "Médiateur",
  museum_ticket_manage: "Billetterie",
  museum_configuration: "Configuration",
  museum_member_presence_manage: "Présences",
  museum_donation_proof_manage: "Dons",
};
