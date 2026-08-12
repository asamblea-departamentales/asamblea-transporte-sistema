import { describe, expect, it } from "vitest";
import { backendNotificationUrlToPath, getNotificationTargetPath } from "../notification-routing";

describe("notification routing", () => {
  it.each([
    ["/solicitudes-transporte/17", "/solicitudes/transporte/17"],
    ["/solicitudes-mantenimiento/18", "/solicitudes/mantenimiento/18"],
    ["https://api.test/api/solicitudes-combustible/19?foo=bar", "/solicitudes/combustible/19"],
  ])("converts backend URL %s", (url, expected) => {
    expect(backendNotificationUrlToPath(url)).toBe(expected);
  });

  it("prefers the numeric solicitud_id and falls back safely", () => {
    expect(getNotificationTargetPath({ modulo: "mantenimiento", solicitudId: 21, url: "/solicitudes-mantenimiento/old" }))
      .toBe("/solicitudes/mantenimiento/21");
    expect(getNotificationTargetPath({ modulo: "transporte", solicitudId: 21, url: "/api/otra-ruta/1" }))
      .toBe("/notificaciones");
  });
});
