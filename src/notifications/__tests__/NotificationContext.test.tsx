import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationProvider, useNotifications } from "../NotificationContext";

const serviceMocks = vi.hoisted(() => ({
  fetchNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}));

const authMock = vi.hoisted(() => ({
  user: { id: 7 },
}));

vi.mock("../notifications.service", async () => {
  const actual = await vi.importActual<typeof import("../notifications.service")>("../notifications.service");
  return { ...actual, ...serviceMocks };
});
vi.mock("../useNotificationPolling", () => ({ useNotificationPolling: () => undefined }));
vi.mock("../../services/push.service", () => ({ subscribeUserToPush: vi.fn() }));
vi.mock("../../auth/AuthContext", () => ({ useAuth: () => authMock }));

function Harness() {
  const {
    notifications,
    notificationActionError,
    refreshNotifications,
    markAsRead,
    markAllRead,
    retryNotificationAction,
    dismissNotification,
    dismissAllNotifications,
  } = useNotifications();

  return (
    <div>
      <button onClick={() => void refreshNotifications()}>refresh</button>
      <button onClick={() => void markAsRead(notifications[0]?.id ?? "")}>read</button>
      <button onClick={() => void markAllRead()}>read-all</button>
      <button onClick={() => void retryNotificationAction()}>retry-action</button>
      <button onClick={() => dismissNotification(notifications[0]?.id ?? "")}>dismiss</button>
      <button onClick={dismissAllNotifications}>dismiss-all</button>
      <output data-testid="state">{notifications.map((item) => item.id + ":" + item.leida).join(",")}</output>
      <output data-testid="action-error">{notificationActionError ?? ""}</output>
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
    authMock.user = { id: 7 };
    vi.clearAllMocks();
    serviceMocks.fetchNotifications.mockResolvedValue([notification]);
    serviceMocks.markNotificationAsRead.mockResolvedValue(undefined);
    serviceMocks.markAllNotificationsAsRead.mockResolvedValue(undefined);
  });

  function renderHarness() {
    return render(<NotificationProvider><Harness /></NotificationProvider>);
  }

  it("restores the previous state and exposes a retry when marking one fails", async () => {
    renderHarness();
    fireEvent.click(screen.getByText("refresh"));
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("uuid-1:false"));

    serviceMocks.markNotificationAsRead.mockRejectedValueOnce(new Error("offline"));
    await act(async () => fireEvent.click(screen.getByText("read")));

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("uuid-1:false");
      expect(screen.getByTestId("action-error")).toHaveTextContent("No se pudo marcar");
    });

    fireEvent.click(screen.getByText("retry-action"));
    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("uuid-1:true");
      expect(screen.getByTestId("action-error")).toHaveTextContent("");
    });
  });

  it("restores the previous state when marking all fails", async () => {
    renderHarness();
    fireEvent.click(screen.getByText("refresh"));
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("uuid-1:false"));

    serviceMocks.markAllNotificationsAsRead.mockRejectedValueOnce(new Error("offline"));
    await act(async () => fireEvent.click(screen.getByText("read-all")));

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("uuid-1:false");
      expect(screen.getByTestId("action-error")).toHaveTextContent("No se pudieron marcar todas");
    });
  });

  it("persists individual local dismissal per user", async () => {
    renderHarness();
    fireEvent.click(screen.getByText("refresh"));
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("uuid-1:false"));

    fireEvent.click(screen.getByText("dismiss"));
    expect(screen.getByTestId("state")).toHaveTextContent("");
    expect(window.localStorage.getItem("app_dismissed_notifications_v1_7")).toContain("uuid-1");
    expect(window.localStorage.getItem("app_dismissed_notifications_v1")).toBeNull();
  });

  it("changes storage scope without showing the previous user's history", async () => {
    window.localStorage.setItem("app_notifications_v2_8", JSON.stringify([{ ...notification, id: "uuid-8" }]));
    const view = renderHarness();

    authMock.user = { id: 8 };
    view.rerender(<NotificationProvider><Harness /></NotificationProvider>);

    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("uuid-8:false"));
    expect(screen.getByTestId("state")).not.toHaveTextContent("uuid-1");
  });

  it("clears all visible notifications for the active user", async () => {
    renderHarness();
    fireEvent.click(screen.getByText("refresh"));
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("uuid-1:false"));

    fireEvent.click(screen.getByText("dismiss-all"));
    expect(screen.getByTestId("state")).toHaveTextContent("");
    expect(window.localStorage.getItem("app_dismissed_notifications_v1_7")).toContain("uuid-1");
  });
});
