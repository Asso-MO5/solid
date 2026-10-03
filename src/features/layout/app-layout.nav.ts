import { type MuseumRole, museumRoleFor } from "~/features/auth/auth.permissions";

export interface NavEntry {
  href: string;
  label: string;
  /** Rôle musée requis : l'entrée est masquée sans ce rôle. */
  role?: MuseumRole;
}

/**
 * Entrées de navigation. Les features protégées s'ajoutent ici avec
 * exactement un rôle (ex. { href: "/scan", label: "Scan", role: museumRoleFor.ticketScan }).
 */
export const navEntries: NavEntry[] = [
  { href: "/", label: "Accueil" },
];

// Référence gardée pour l'écriture des futures entrées protégées.
export const _museumRoleFor = museumRoleFor;
