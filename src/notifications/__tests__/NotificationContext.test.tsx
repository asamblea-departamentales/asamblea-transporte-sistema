import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationProvider, useNotifications } from "../NotificationContext";

const serviceMocks = vi.hoisted(() => ({
  fetchNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}));

vi.mock("../notifications.service", async () => {
  const actual = await vi.importActual<typeof import("../notifications.service")>("../notifications.service");
  return { ...actual, ...serviceMocks };
});
vi.mock("../useNotificationPolling", () => ({ useNotificationPolling: () => undefined }));
vi.mock("../../services/push.service", () => ({ subscribeUserToPush: vi.fn() }));

function Harness() {
  const { notifications, refreshNotifications, markAsRead, markAllRead, dismissNotification, dismissAllNotifications } = useNotifications();
  return (
    <div>
      <button onClick={() => void refreshNotifications()}>refresh</button>
      <button onClick={() => void markAsRead(notifications[0]?.id ?? "")}>read</button>
      <button onClick={() => void markAllRead()}>read-all</button>
      <button onClick={() => dismissNotification(notifications[0]?.id ?? "")}>dismiss</button>
      <button onClick={dismissAllNotifications}>dismiss-all</button>
      <output data-testid="state">{notifications.map((item) => `${item.id}:${item.leida}`).join(",")}</output>
    </div>
  );
}

const notification = {
  id: "uuid-1",
  reqId: 1,
  tipo: "info" as const,
  modulo: "transporte" as const,
  titulo: "Aviso",
  mensaje: "Mensaje",
  codigo: "TR-1",
  ticket: null,
  url: "/solicitudes-transporte/1",
  leida: false,
  createdAt: "2026-08-12T10:00:00Z",
};

describe("NotificationProvider", () => {
  beforeEach(() => {
    const storage: Record<string, string> = {};
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => storage[key] ?? null,
        setItem: (key: string, value: string) => { storage[key] = value; },
        removeItem: (key: string) => { delete storage[key]; },
        clear: () => { for (const key of Object.keys(storage)) delete storage[key]; },
      },
    });
    vi.clearAllMocks();
    serviceMocks.fetchNotifications.mockResolvedValue([notification]);
    serviceMocks.markNotificationAsRead.mockResolvedValue(undefined);
    serviceMocks.markAllNotificationsAsRead.mockResolvedValue(undefined);
  });

  function renderHarness() {
    return render(<NotificationProvider><Harness /></NotificationProvider>);
  }

  it("restores the previous state when marking one notification fails", async () => {
    renderHarness();
    fireEvent.click(screen.getByText("refresh"));
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("uuid-1:false"));
    serviceMocks.markNotificationAsRead.mockRejectedValueOnce(new Error("offline"));
    await act(async () => fireEvent.click(screen.getByText("read")));
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("uuid-1:false"));
  });

  it("restores the previous state when marking all fails", async () => {
    renderHarness();
    fireEvent.click(screen.getByText("refresh"));
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("uuid-1:false"));
    serviceMocks.markAllNotificationsAsRead.mockRejectedValueOnce(new Error("offline"));
    await act(async () => fireEvent.click(screen.getByText("read-all")));
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("uuid-1:false"));
  });

  it("persists individual local dismissal", async () => {
    renderHarness();
    fireEvent.click(screen.getByText("refresh"));
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("uuid-1:false"));
    fireEvent.click(screen.getByText("dismiss"));
    expect(screen.getByTestId("state")).toHaveTextContent("");
    expect(window.localStorage.getItem("app_dismissed_notifications_v1")).toContain("uuid-1");
  });
});
