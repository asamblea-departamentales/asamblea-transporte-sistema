import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
}));

vi.mock("../../lib/api", () => ({ api: apiMocks }));

import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  normalizeNotification,
  normalizeNotificationResponse,
} from "../notifications.service";

describe("notifications service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normalizes data.titulo, data.mensaje and Laravel fields", () => {
    expect(normalizeNotification({
      id: "uuid-1",
      data: {
        titulo: "Solicitud aprobada",
        mensaje: "La solicitud fue aprobada.",
        tipo: "aprobada",
        modulo: "solicitudes-transporte",
        url: "/solicitudes-transporte/17",
        solicitud_id: "17",
        solicitud_codigo: "TR-17",
        ticket: null,
      },
      read_at: null,
      created_at: "2026-08-12T10:00:00Z",
    })).toEqual({
      id: "uuid-1",
      reqId: 17,
      tipo: "aprobada",
      modulo: "transporte",
      titulo: "Solicitud aprobada",
      mensaje: "La solicitud fue aprobada.",
      codigo: "TR-17",
      ticket: null,
      url: "/solicitudes-transporte/17",
      leida: false,
      createdAt: "2026-08-12T10:00:00Z",
    });
  });

  it("accepts a Laravel paginator, deduplicates by UUID and limits visible items", () => {
    const data = Array.from({ length: 21 }, (_, index) => ({
      id: `uuid-${index}`,
      data: { titulo: `Título ${index}`, modulo: "transporte", solicitud_id: index + 1 },
      read_at: null,
      created_at: "2026-08-12T10:00:00Z",
    }));
    data.splice(2, 0, { ...data[0], data: { ...data[0].data, titulo: "Duplicada" } });

    const normalized = normalizeNotificationResponse({ current_page: 1, data, last_page: 2 }, 20);
    expect(normalized).toHaveLength(20);
    expect(normalized[0]?.titulo).toBe("Título 0");
    expect(new Set(normalized.map((item) => item.id)).size).toBe(20);
  });

  it("uses the requested API endpoint and pagination", async () => {
    apiMocks.get.mockResolvedValue({ data: { current_page: 1, data: [] } });
    await fetchNotifications();
    expect(apiMocks.get).toHaveBeenCalledWith("/api/me/notificaciones", {
      params: { page: 1, per_page: 20 },
    });
  });

  it("marks one or all notifications through the user endpoints", async () => {
    apiMocks.put.mockResolvedValue({});
    await markNotificationAsRead("uuid-1");
    await markAllNotificationsAsRead();
    expect(apiMocks.put).toHaveBeenNthCalledWith(1, "/api/me/notificaciones/uuid-1/leer");
    expect(apiMocks.put).toHaveBeenNthCalledWith(2, "/api/me/notificaciones/marcar-todas");
  });
});
