import { ZITADEL_ROLES_CLAIM_DEFAULT, ZITADEL_SCOPES_DEFAULT } from "./auth.const";

/**
 * Configuration Zitadel lue côté serveur, miroir d'Ocelot staging.
 * Échoue tôt avec un message français si une variable requise est absente.
 */

export interface ZitadelConfiguration {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  rolesClaim: string;
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} non configuré`);
  return value;
}

function absoluteHttpUrl(value: string, variableName: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("protocole non supporté");
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error(`${variableName} doit être une URL HTTP(S) absolue`);
  }
}

function parseScopes(value: string | undefined, defaults: string[]): string[] {
  const scopes = (value || defaults.join(" "))
    .split(/\s+/)
    .map((scope) => scope.trim())
    .filter(Boolean);

  if (!scopes.includes("openid")) scopes.unshift("openid");
  return [...new Set(scopes)];
}

export function getZitadelConfiguration(): ZitadelConfiguration {
  const port = process.env.PORT || "3000";
  const issuer = absoluteHttpUrl(requiredEnvironment("ZITADEL_ISSUER"), "ZITADEL_ISSUER");
  const redirectUri = absoluteHttpUrl(
    process.env.ZITADEL_REDIRECT_URI || `http://localhost:${port}/api/auth/callback`,
    "ZITADEL_REDIRECT_URI",
  );

  return {
    issuer,
    clientId: requiredEnvironment("ZITADEL_CLIENT_ID"),
    clientSecret: requiredEnvironment("ZITADEL_CLIENT_SECRET"),
    redirectUri,
    scopes: parseScopes(process.env.ZITADEL_SCOPES, ZITADEL_SCOPES_DEFAULT),
    rolesClaim: process.env.ZITADEL_ROLES_CLAIM?.trim() || ZITADEL_ROLES_CLAIM_DEFAULT,
  };
}
