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

  it("accepts absolute and relative backend URLs", () => {
    expect(backendNotificationUrlToPath("https://api.test/solicitudes-transporte/22")).toBe("/solicitudes/transporte/22");
    expect(backendNotificationUrlToPath("/api/solicitudes-mantenimiento/23")).toBe("/solicitudes/mantenimiento/23");
  });

  it("prefers the numeric solicitud_id from a recognized URL", () => {
    expect(getNotificationTargetPath({ modulo: "mantenimiento", solicitudId: 21, url: "/solicitudes-mantenimiento/old" }))
      .toBe("/solicitudes/mantenimiento/21");
  });

  it("builds a route from modulo and solicitud_id when the URL is missing or unknown", () => {
    expect(getNotificationTargetPath({ modulo: "transporte", solicitudId: 24, url: null }))
      .toBe("/solicitudes/transporte/24");
    expect(getNotificationTargetPath({ modulo: "combustible", solicitudId: 25, url: "/api/otra-ruta/1" }))
      .toBe("/solicitudes/combustible/25");
    expect(getNotificationTargetPath({ modulo: "solicitudes-mantenimiento", solicitudId: 26 }))
      .toBe("/solicitudes/mantenimiento/26");
  });

  it("falls back to the notification center when both route sources are unusable", () => {
    expect(getNotificationTargetPath({ modulo: "desconocido", solicitudId: null, url: "not-a-url" }))
      .toBe("/notificaciones");
    expect(getNotificationTargetPath({ solicitudId: null, url: null }))
      .toBe("/notificaciones");
  });
});
