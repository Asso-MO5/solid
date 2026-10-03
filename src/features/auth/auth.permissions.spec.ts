import { describe, expect, test } from "bun:test";
import { hasMuseumRole, museumRoleFor, museumRolesOf } from "./auth.permissions";

const viewer = (roles: string[]) => ({ id: "1", username: "ada", avatar: null, roles });

describe("permissions musée", () => {
  test("hasMuseumRole accepte le rôle exact", () => {
    expect(hasMuseumRole(viewer(["museum_mediateur"]), museumRoleFor.ticketScan)).toBe(true);
  });

  test("hasMuseumRole refuse un rôle d'organisation seul", () => {
    expect(hasMuseumRole(viewer(["administrateur"]), museumRoleFor.ticketManage)).toBe(false);
  });

  test("hasMuseumRole refuse un utilisateur absent", () => {
    expect(hasMuseumRole(null, museumRoleFor.configuration)).toBe(false);
  });

  test("museumRolesOf liste les rôles musée présents", () => {
    expect(museumRolesOf(viewer(["membre", "museum_mediateur", "museum_ticket_manage"]))).toEqual([
      "museum_mediateur",
      "museum_ticket_manage",
    ]);
  });

  test("museumRolesOf ignore les rôles inconnus ou obsolètes", () => {
    expect(museumRolesOf(viewer(["dev", "museum", "museum_ticket_scan"]))).toEqual([]);
  });
});
