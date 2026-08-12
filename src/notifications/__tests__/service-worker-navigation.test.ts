import { describe, expect, it, vi } from "vitest";
import { navigateNotificationClick, type NotificationWindowClient } from "../service-worker-navigation";

function client(url: string, focused = false): NotificationWindowClient {
  return {
    url,
    focused,
    focus: vi.fn().mockResolvedValue("focused"),
    navigate: vi.fn().mockResolvedValue(null),
  };
}

describe("service worker notification click", () => {
  it("focuses a matching open window", async () => {
    const openClient = client("https://app.test/solicitudes/transporte/1");
    await navigateNotificationClick(openClient.url, [openClient], vi.fn());
    expect(openClient.focus).toHaveBeenCalledOnce();
  });

  it("navigates the focused window or opens a new one", async () => {
    const openClient = client("https://app.test/dashboard", true);
    await navigateNotificationClick("https://app.test/solicitudes/transporte/2", [openClient], vi.fn());
    expect(openClient.navigate).toHaveBeenCalledWith("https://app.test/solicitudes/transporte/2");

    const openWindow = vi.fn().mockResolvedValue("opened");
    await navigateNotificationClick("https://app.test/notificaciones", [], openWindow);
    expect(openWindow).toHaveBeenCalledOnce();
  });
});
