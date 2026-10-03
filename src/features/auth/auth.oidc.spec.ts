import { describe, expect, test } from "bun:test";
import {
  createAuthorizationTransaction,
  createAuthorizationUrl,
  userFromClaims,
} from "./auth.oidc.server";

const config = {
  issuer: "https://zitadel.example.test",
  clientId: "client-id",
  clientSecret: "client-secret",
  redirectUri: "http://localhost:3000/api/auth/callback",
  scopes: ["openid", "profile", "email", "offline_access", "urn:zitadel:iam:org:project:roles"],
  rolesClaim: "urn:zitadel:iam:org:project:roles",
};

const discovery = {
  issuer: config.issuer,
  authorization_endpoint: "https://zitadel.example.test/oauth/v2/authorize",
  token_endpoint: "https://zitadel.example.test/oauth/v2/token",
  userinfo_endpoint: "https://zitadel.example.test/oidc/v1/userinfo",
  jwks_uri: "https://zitadel.example.test/oauth/v2/keys",
};

describe("flux OIDC", () => {
  test("la transaction contient state, nonce, verifier et challenge distincts", () => {
    const transaction = createAuthorizationTransaction();
    expect(transaction.state).toBeTruthy();
    expect(transaction.nonce).toBeTruthy();
    expect(transaction.verifier).toBeTruthy();
    expect(transaction.challenge).toBeTruthy();
    expect(transaction.verifier).not.toBe(transaction.challenge);
  });

  test("l'URL d'autorisation porte les paramètres PKCE et les scopes", () => {
    const transaction = createAuthorizationTransaction();
    const url = new URL(createAuthorizationUrl(config, discovery, transaction));
    expect(url.origin + url.pathname).toBe(discovery.authorization_endpoint);
    expect(url.searchParams.get("client_id")).toBe("client-id");
    expect(url.searchParams.get("redirect_uri")).toBe(config.redirectUri);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("scope")).toContain("urn:zitadel:iam:org:project:roles");
  });

  test("userFromClaims lit le claim de rôles objet de Zitadel", () => {
    const user = userFromClaims(
      {
        sub: "sub-1",
        preferred_username: "ada",
        email: "ada@example.test",
        "urn:zitadel:iam:org:project:roles": { museum_mediateur: {}, membre: {} },
      },
      "urn:zitadel:iam:org:project:roles",
    );
    expect(user.id).toBe("sub-1");
    expect(user.username).toBe("ada");
    expect(user.email).toBe("ada@example.test");
    expect(user.roles).toEqual(["museum_mediateur", "membre"]);
  });

  test("userFromClaims accepte un claim de rôles chaîne ou tableau", () => {
    const fromString = userFromClaims(
      { sub: "s", "urn:zitadel:iam:org:project:roles": "museum_mediateur" },
      "urn:zitadel:iam:org:project:roles",
    );
    expect(fromString.roles).toEqual(["museum_mediateur"]);

    const fromArray = userFromClaims(
      { sub: "s", "urn:zitadel:iam:org:project:roles": ["museum_mediateur", "bureau"] },
      "urn:zitadel:iam:org:project:roles",
    );
    expect(fromArray.roles).toEqual(["museum_mediateur", "bureau"]);
  });

  test("userFromClaims déduplique et normalise en minuscules", () => {
    const user = userFromClaims(
      { sub: "s", "urn:zitadel:iam:org:project:roles": { Museum_Mediateur: {}, museum_mediateur: {} } },
      "urn:zitadel:iam:org:project:roles",
    );
    expect(user.roles).toEqual(["museum_mediateur"]);
  });

  test("userFromClaims échoue sans sub", () => {
    expect(() => userFromClaims({}, "urn:zitadel:iam:org:project:roles")).toThrow("Claim sub absent");
  });
});
