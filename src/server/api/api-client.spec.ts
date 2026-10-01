import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { ApiError, apiFetch } from "./api-client.server";

describe("apiFetch", () => {
  afterEach(() => {
    delete process.env.OCLOT_API_KEY;
  });

  test("renvoie le JSON décodé quand la réponse est 200", async () => {
    process.env.OCLOT_API_URL = "http://127.0.0.1:5999";
    const fetchMock = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    const data = await apiFetch<{ ok: boolean }>("/test");

    expect(data.ok).toBe(true);
    fetchMock.mockRestore();
  });

  test("lève une ApiError avec le statut et un message français quand la réponse est en échec", async () => {
    process.env.OCLOT_API_URL = "http://127.0.0.1:5999";
    const fetchMock = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}", { status: 404 }),
    );

    try {
      await apiFetch("/test");
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(404);
      expect((error as ApiError).message).toContain("Appel API en échec (404)");
    }
    fetchMock.mockRestore();
  });

  test("ajoute l'en-tête Authorization quand OCLOT_API_KEY est définie", async () => {
    process.env.OCLOT_API_URL = "http://127.0.0.1:5999";
    process.env.OCLOT_API_KEY = "secret-test";
    let capturedHeaders: Headers | undefined;
    const fetchMock = spyOn(globalThis, "fetch").mockImplementation((async (
      _url: URL | RequestInfo,
      init?: RequestInit,
    ) => {
      capturedHeaders = new Headers(init?.headers);
      return new Response("{}", { status: 200 });
    }) as unknown as typeof fetch);

    await apiFetch("/test");

    expect(capturedHeaders?.get("Authorization")).toBe("Bearer secret-test");
    expect(capturedHeaders?.get("Accept")).toBe("application/json");
    fetchMock.mockRestore();
  });
});
