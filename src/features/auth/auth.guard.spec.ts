import { describe, expect, test } from "bun:test";
import { guardPage, signinUrl } from "./auth.guard.server";
import { museumRoleFor } from "./auth.permissions";

const viewer = (roles: string[]) => ({ id: "1", username: "ada", avatar: null, roles });

describe("garde de page par rôle unique", () => {
  test("un visiteur sans session est renvoyé vers la connexion (401)", () => {
    const outcome = guardPage(null, museumRoleFor.ticketScan, "/scan");
    expect(outcome).toEqual({ action: "redirect", to: "/api/auth/signin?returnTo=%2Fscan" });
  });

  test("un utilisateur sans le rôle exigé est renvoyé vers 403", () => {
    const outcome = guardPage(viewer(["membre", "bureau"]), museumRoleFor.ticketScan);
    expect(outcome).toEqual({ action: "redirect", to: "/403" });
  });

  test("un rôle d'organisation seul ne donne aucun droit", () => {
    const outcome = guardPage(viewer(["administrateur", "museum_administrateur"]), museumRoleFor.ticketManage);
    expect(outcome).toEqual({ action: "redirect", to: "/403" });
  });

  test("le rôle exact autorise la page", () => {
    const outcome = guardPage(viewer(["museum_mediateur"]), museumRoleFor.ticketScan);
    expect(outcome).toEqual({ action: "allow", viewer: viewer(["museum_mediateur"]) });
  });

  test("un returnTo non sûr est ramené à l'accueil", () => {
    expect(signinUrl("//evil.example.test")).toBe("/api/auth/signin?returnTo=%2F");
    expect(signinUrl("https://evil.example.test")).toBe("/api/auth/signin?returnTo=%2F");
  });
});
