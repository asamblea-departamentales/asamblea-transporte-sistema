import { beforeEach, describe, expect, it, vi } from "vitest";
import { createJsonStorage } from "../storage";

const values = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
  removeItem: (key: string) => values.delete(key),
});

const isNamed = (value: unknown): value is { name: string } =>
  !!value && typeof value === "object" && typeof (value as { name?: unknown }).name === "string";

describe("createJsonStorage", () => {
  beforeEach(() => values.clear());

  it("guarda y restaura un valor versionado", () => {
    const storage = createJsonStorage<{ name: string }>("draft", { version: 1, validate: isNamed });
    storage.write({ name: "Ruta" });
    expect(storage.read()).toEqual({ name: "Ruta" });
  });

  it("migra datos legacy sin sobre", () => {
    values.set("draft", JSON.stringify({ name: "Anterior" }));
    const storage = createJsonStorage<{ name: string }>("draft", {
      version: 1, validate: isNamed, migrateLegacy: (value) => isNamed(value) ? value : null,
    });
    expect(storage.read()).toEqual({ name: "Anterior" });
  });

  it("elimina datos expirados", () => {
    vi.spyOn(Date, "now").mockReturnValue(10_000);
    values.set("draft", JSON.stringify({ version: 1, expiresAt: 9_999, value: { name: "Viejo" } }));
    const storage = createJsonStorage<{ name: string }>("draft", { version: 1, validate: isNamed });
    expect(storage.read()).toBeNull();
    expect(values.has("draft")).toBe(false);
    vi.restoreAllMocks();
  });
});
