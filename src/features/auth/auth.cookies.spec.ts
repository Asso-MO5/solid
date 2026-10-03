import { describe, expect, test } from "bun:test";
import {
  clearSessionCookieHeaders,
  parseCookies,
  sessionCookieHeaders,
  signoutCookieHeaders,
  temporaryCookieHeaders,
} from "./auth.cookies.server";

describe("cookies de session", () => {
  test("parseCookies lit un en-tête Cookie", () => {
    const cookies = parseCookies("a=1; zitadel_access_token=abc; b=%20x");
    expect(cookies.a).toBe("1");
    expect(cookies.zitadel_access_token).toBe("abc");
    expect(cookies.b).toBe(" x");
  });

  test("parseCookies tolère un en-tête absent", () => {
    expect(parseCookies(null)).toEqual({});
  });

  test("les cookies de session sont HttpOnly, SameSite Lax et bornés", () => {
    const [access] = sessionCookieHeaders({ access_token: "tok", token_type: "Bearer" });
    expect(access).toContain("zitadel_access_token=tok");
    expect(access).toContain("HttpOnly");
    expect(access).toContain("SameSite=Lax");
    expect(access).toContain("Max-Age=3600");
  });

  test("le jeton de rafraîchissement est posé quand présent", () => {
    const headers = sessionCookieHeaders({
      access_token: "tok",
      token_type: "Bearer",
      refresh_token: "ref",
    });
    expect(headers).toHaveLength(2);
    expect(headers[1]).toContain("zitadel_refresh_token=ref");
  });

  test("la purge pose Max-Age=0", () => {
    for (const header of clearSessionCookieHeaders()) {
      expect(header).toContain("Max-Age=0");
    }
  });

  test("les cookies temporaires portent state, nonce, verifier et returnTo", () => {
    const joined = temporaryCookieHeaders({
      state: "s",
      nonce: "n",
      verifier: "v",
      returnTo: "/scan",
    }).join("\n");
    expect(joined).toContain("zitadel_oauth_state=s");
    expect(joined).toContain("zitadel_oauth_nonce=n");
    expect(joined).toContain("zitadel_oauth_verifier=v");
    expect(joined).toContain("zitadel_oauth_return_to=%2Fscan");
  });

  test("la déconnexion purge la session et les cookies temporaires", () => {
    expect(signoutCookieHeaders()).toHaveLength(6);
  });
});
