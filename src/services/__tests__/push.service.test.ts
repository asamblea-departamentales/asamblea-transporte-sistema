import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), delete: vi.fn() }));

vi.mock("../../lib/api", () => ({ api: apiMocks }));
vi.mock("../../lib/vapid", () => ({ urlBase64ToUint8Array: () => new Uint8Array([1, 2, 3]) }));

import { getVapidPublicKey, subscribeUserToPush, unsubscribeUserFromPush } from "../push.service";

describe("push service", () => {
  const subscription = {
    endpoint: "https://push.test/subscription",
    toJSON: () => ({ endpoint: "https://push.test/subscription", keys: { p256dh: "p256dh", auth: "auth" } }),
    unsubscribe: vi.fn().mockResolvedValue(true),
  };
  const registration = {
    pushManager: {
      getSubscription: vi.fn().mockResolvedValue(subscription),
      subscribe: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.get.mockResolvedValue({ data: { public_key: "BElocal" } });
    apiMocks.post.mockResolvedValue({});
    apiMocks.delete.mockResolvedValue({});
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: { ready: Promise.resolve(registration) } });
    Object.defineProperty(window, "PushManager", { configurable: true, value: class PushManager {} });
    Object.defineProperty(window, "Notification", { configurable: true, value: { permission: "granted" } });
  });

  it("gets the VAPID key only from the user endpoint", async () => {
    await expect(getVapidPublicKey()).resolves.toBe("BElocal");
    expect(apiMocks.get).toHaveBeenCalledWith("/api/me/push-public-key");
  });

  it("subscribes only through /api/me and never the motorista endpoints", async () => {
    await expect(subscribeUserToPush()).resolves.toBe(true);
    expect(apiMocks.post).toHaveBeenCalledWith("/api/me/push-subscribe", {
      endpoint: "https://push.test/subscription",
      keys: { p256dh: "p256dh", auth: "auth" },
    });
    expect(apiMocks.post.mock.calls.flat().join(" ")).not.toContain("motoristas");
  });

  it("unsubscribes only through the user endpoint", async () => {
    await unsubscribeUserFromPush();
    expect(apiMocks.delete).toHaveBeenCalledWith("/api/me/push-unsubscribe", { data: { endpoint: "https://push.test/subscription" } });
  });
});
