import { afterEach, describe, expect, test } from "bun:test";
import { env } from "./env.server";

describe("env", () => {
  afterEach(() => {
    delete process.env.OCLOT_API_URL;
    delete process.env.OCLOT_API_KEY;
  });

  test("ocelotApiUrl renvoie la variable présente", () => {
    process.env.OCLOT_API_URL = "http://127.0.0.1:5999";
    expect(env.ocelotApiUrl).toBe("http://127.0.0.1:5999");
  });

  test("ocelotApiUrl échoue avec un message français si la variable est absente", () => {
    delete process.env.OCLOT_API_URL;
    expect(() => env.ocelotApiUrl).toThrow("Variable d'environnement manquante : OCLOT_API_URL");
  });

  test("ocelotApiKey vaut undefined si la variable est absente", () => {
    delete process.env.OCLOT_API_KEY;
    expect(env.ocelotApiKey).toBeUndefined();
  });

  test("ocelotApiKey renvoie la variable présente", () => {
    process.env.OCLOT_API_KEY = "secret-test";
    expect(env.ocelotApiKey).toBe("secret-test");
  });
});
