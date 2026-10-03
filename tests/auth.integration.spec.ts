import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("l'API me renvoie 401 sans session", async ({ request }) => {
  const response = await request.get("/api/auth/me");
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error).toBe("Non authentifié");
});

test("la page 401 est sobre, en français et accessible", async ({ page }) => {
  await page.goto("/401");
  await expect(page.getByRole("heading", { name: "Connexion requise" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Se connecter" })).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test("la page 403 est sobre, en français et accessible", async ({ page }) => {
  await page.goto("/403");
  await expect(page.getByRole("heading", { name: "Accès refusé" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Retour à l'accueil" })).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test("la navigation propose la connexion et pas de déconnexion sans session", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Connexion" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Déconnexion" })).toHaveCount(0);
});

test("le lien Connexion déclenche une navigation pleine page vers la route API", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Connexion" }).click();

  // Le routeur ne doit pas intercepter le clic : le navigateur charge la
  // route API et le serveur répond (ici l'issuer factice des tests est
  // injoignable, la route renvoie son erreur 500 en français).
  await expect(page).toHaveURL(/\/api\/auth\/signin$/);
  await expect(page.getByText("Configuration Zitadel invalide")).toBeVisible();
});
