import { beforeEach, describe, expect, it, vi } from "vitest";
import { transportDraftStorage, validateTransportRoute } from "./useTransportDraft";
import { STORAGE_KEY } from "./transportUtils";

const values = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
  removeItem: (key: string) => values.delete(key),
});

describe("transportDraftStorage", () => {
  beforeEach(() => values.clear());

  it("restaura el formato legacy existente", () => {
    values.set(STORAGE_KEY, JSON.stringify({ origen: "Asamblea", destinos: [] }));
    expect(transportDraftStorage.read()).toMatchObject({ origen: "Asamblea" });
  });

  it("valida origen y al menos un destino", () => {
    expect(validateTransportRoute({ origen: " ", destinos: [{ id: "1", address: "" }] }))
      .toEqual({ origen: "Indique el punto de salida.", destinos: "Indique al menos un destino." });
    expect(validateTransportRoute({ origen: "Asamblea", destinos: [{ id: "1", address: "Santa Ana" }] }))
      .toEqual({ origen: undefined, destinos: undefined });
  });
});
