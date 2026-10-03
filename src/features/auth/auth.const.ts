/**
 * Constantes d'authentification Zitadel, miroir d'Ocelot staging.
 * Les rôles d'organisation ne donnent aucun droit implicite : chaque page
 * protégée vérifie exactement un rôle musée.
 */

export const ZITADEL_ROLES_CLAIM_DEFAULT = "urn:zitadel:iam:org:project:roles";

export const ZITADEL_SCOPES_DEFAULT = [
  "openid",
  "profile",
  "email",
  "offline_access",
  ZITADEL_ROLES_CLAIM_DEFAULT,
];

export const ACCESS_TOKEN_COOKIE = "zitadel_access_token";
export const REFRESH_TOKEN_COOKIE = "zitadel_refresh_token";
export const STATE_COOKIE = "zitadel_oauth_state";
export const NONCE_COOKIE = "zitadel_oauth_nonce";
export const VERIFIER_COOKIE = "zitadel_oauth_verifier";
export const RETURN_TO_COOKIE = "zitadel_oauth_return_to";

export const TEMPORARY_COOKIE_MAX_AGE = 600;
export const ACCESS_TOKEN_MAX_AGE_DEFAULT = 3600;
export const REFRESH_TOKEN_MAX_AGE_DAYS_DEFAULT = 90;

export const roles = {
  // Rôles d'organisation. Ils ne donnent aucun droit API implicite.
  administrateur: "administrateur",
  bureau: "bureau",
  membre: "membre",
  museum_administrateur: "museum_administrateur",

  // Rôles musée attribués dans Zitadel, vérifiés un par un par page.
  museum_mediateur: "museum_mediateur",
  museum_configuration: "museum_configuration",
  museum_ticket_manage: "museum_ticket_manage",
  museum_member_presence_manage: "museum_member_presence_manage",
  museum_donation_proof_manage: "museum_donation_proof_manage",
} as const;
