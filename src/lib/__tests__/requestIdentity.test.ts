import { describe, expect, it } from "vitest";
import {
  getRequestDetailPath,
  getRequestKey,
  getRequestRouteIdentifier,
  normalizeRequestStatus,
} from "../requestIdentity";

describe("request identity", () => {
  it.each([
    ["transporte", "TR-2026-001"],
    ["combustible", "COM-2026-001"],
  ] as const)("uses codigo for %s", (modulo, expected) => {
    expect(getRequestRouteIdentifier({ modulo, id: 15, codigo: expected })).toBe(expected);
  });

  it("uses the numeric id for mantenimiento", () => {
    expect(getRequestRouteIdentifier({ modulo: "mantenimiento", id: 15, codigo: "MAN-2026-001" })).toBe("15");
  });

  it("builds collision-free internal keys", () => {
    expect(getRequestKey({ modulo: "transporte", id: 1 })).toBe("transporte:1");
    expect(getRequestKey({ modulo: "combustible", id: 1 })).toBe("combustible:1");
  });

  it("builds and encodes detail paths", () => {
    expect(getRequestDetailPath({ modulo: "transporte", id: 1, codigo: "TR 1" }))
      .toBe("/solicitudes/transporte/TR%201");
  });

  it("keeps compatibility with the historical finalizada alias", () => {
    expect(normalizeRequestStatus("finalizada")).toBe("completada");
    expect(normalizeRequestStatus("LIQUIDADA")).toBe("liquidada");
  });
});
