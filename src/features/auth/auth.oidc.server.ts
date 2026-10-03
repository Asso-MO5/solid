import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";
import type { ZitadelConfiguration } from "./auth.config.server";
import type { AuthenticatedUser, OidcTokenResponse } from "./auth.types";

/**
 * Flux OIDC Zitadel, miroir d'Ocelot staging : découverte, transaction
 * PKCE, échange de code, rafraîchissement, vérification du id_token et
 * userinfo. Aucun jeton n'est exposé côté client.
 */

export interface OidcDiscovery {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
}

export interface AuthorizationTransaction {
  state: string;
  nonce: string;
  verifier: string;
  challenge: string;
}

const discoveryCache = new Map<string, Promise<OidcDiscovery>>();

function requiredDiscoveryUrl(value: unknown, name: string): string {
  if (typeof value !== "string")
    throw new Error(`Découverte OIDC invalide : ${name} absent`);
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error(`Découverte OIDC invalide : ${name}`);
  return url.toString();
}

export function resetOidcDiscoveryCache(): void {
  discoveryCache.clear();
}

export async function getOidcDiscovery(
  config: ZitadelConfiguration,
): Promise<OidcDiscovery> {
  const cached = discoveryCache.get(config.issuer);
  if (cached) return cached;

  const discovery = (async () => {
    const response = await fetch(
      `${config.issuer}/.well-known/openid-configuration`,
    );
    if (!response.ok) throw new Error("Découverte OIDC indisponible");
    const body = (await response.json()) as Record<string, unknown>;
    if (body.issuer !== config.issuer)
      throw new Error("Découverte OIDC : issuer inattendu");
    return {
      issuer: config.issuer,
      authorization_endpoint: requiredDiscoveryUrl(
        body.authorization_endpoint,
        "authorization_endpoint",
      ),
      token_endpoint: requiredDiscoveryUrl(
        body.token_endpoint,
        "token_endpoint",
      ),
      userinfo_endpoint: requiredDiscoveryUrl(
        body.userinfo_endpoint,
        "userinfo_endpoint",
      ),
      jwks_uri: requiredDiscoveryUrl(body.jwks_uri, "jwks_uri"),
    };
  })();

  discoveryCache.set(config.issuer, discovery);
  try {
    return await discovery;
  } catch (error) {
    discoveryCache.delete(config.issuer);
    throw error;
  }
}

function randomUrlSafeValue(): string {
  return randomBytes(32).toString("base64url");
}

export function createAuthorizationTransaction(): AuthorizationTransaction {
  const verifier = randomUrlSafeValue();
  return {
    state: randomUrlSafeValue(),
    nonce: randomUrlSafeValue(),
    verifier,
    challenge: createHash("sha256").update(verifier).digest("base64url"),
  };
}

export function createAuthorizationUrl(
  config: ZitadelConfiguration,
  discovery: OidcDiscovery,
  transaction: AuthorizationTransaction,
): string {
  const url = new URL(discovery.authorization_endpoint);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("state", transaction.state);
  url.searchParams.set("nonce", transaction.nonce);
  url.searchParams.set("code_challenge", transaction.challenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

async function tokenRequest(
  config: ZitadelConfiguration,
  discovery: OidcDiscovery,
  parameters: URLSearchParams,
): Promise<OidcTokenResponse> {
  const credentials = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString("base64");
  const response = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: parameters.toString(),
  });
  if (!response.ok) throw new Error("Échange de jeton OIDC refusé");
  const tokens = (await response.json()) as OidcTokenResponse;
  if (!tokens.access_token || !tokens.token_type)
    throw new Error("Réponse de jeton OIDC invalide");
  return tokens;
}

export async function exchangeAuthorizationCode(
  config: ZitadelConfiguration,
  discovery: OidcDiscovery,
  code: string,
  verifier: string,
): Promise<OidcTokenResponse> {
  return tokenRequest(
    config,
    discovery,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
      code_verifier: verifier,
    }),
  );
}

export async function refreshTokens(
  config: ZitadelConfiguration,
  discovery: OidcDiscovery,
  refreshToken: string,
): Promise<OidcTokenResponse> {
  return tokenRequest(
    config,
    discovery,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  );
}

function rolesFromClaim(value: unknown): string[] {
  if (typeof value === "string") return [value.toLowerCase()];
  if (Array.isArray(value)) return value.flatMap(rolesFromClaim);
  if (!value || typeof value !== "object") return [];
  return Object.keys(value as Record<string, unknown>).map((role) =>
    role.toLowerCase(),
  );
}

export function userFromClaims(
  claims: JWTPayload | Record<string, unknown>,
  rolesClaim: string,
): AuthenticatedUser {
  const subject = claims.sub;
  if (typeof subject !== "string" || !subject)
    throw new Error("Claim sub absent");
  const username = [
    claims.preferred_username,
    claims.name,
    claims.email,
    subject,
  ].find(
    (value): value is string =>
      typeof value === "string" && Boolean(value.trim()),
  )!;
  return {
    id: subject,
    username,
    avatar: typeof claims.picture === "string" ? claims.picture : null,
    email: typeof claims.email === "string" ? claims.email : undefined,
    roles: [...new Set(rolesFromClaim(claims[rolesClaim]))],
  };
}

export async function verifyIdToken(
  config: ZitadelConfiguration,
  discovery: OidcDiscovery,
  idToken: string,
  nonce: string,
): Promise<AuthenticatedUser> {
  const jwks = createRemoteJWKSet(new URL(discovery.jwks_uri));
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: config.issuer,
    audience: config.clientId,
  });
  if (payload.nonce !== nonce) throw new Error("Nonce OIDC invalide");
  return userFromClaims(payload, config.rolesClaim);
}

export async function getUserinfo(
  config: ZitadelConfiguration,
  discovery: OidcDiscovery,
  accessToken: string,
): Promise<AuthenticatedUser | null> {
  const response = await fetch(discovery.userinfo_endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  return userFromClaims(
    (await response.json()) as Record<string, unknown>,
    config.rolesClaim,
  );
}
