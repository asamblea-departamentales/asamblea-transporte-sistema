import { describe, it, expect, beforeEach, vi } from "vitest";
import { authStorage } from "../auth.storage";
import type { AuthUser } from "../../services/auth.service";

const MOCK_USER: AuthUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  roles: ["admin"],
};

// Minimal in-memory localStorage mock
const store = new Map<string, string>();

vi.stubGlobal("localStorage", {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
  clear: () => { store.clear(); },
});

vi.stubGlobal("sessionStorage", {
  clear: vi.fn(),
});

describe("authStorage", () => {
  beforeEach(() => {
    store.clear();
  });

  describe("auth flag", () => {
    it("getAuthFlag returns false by default", () => {
      expect(authStorage.getAuthFlag()).toBe(false);
    });

    it("setAuthFlag and getAuthFlag work together", () => {
      authStorage.setAuthFlag(true);
      expect(authStorage.getAuthFlag()).toBe(true);
      authStorage.setAuthFlag(false);
      expect(authStorage.getAuthFlag()).toBe(false);
    });

    it("clearAuthFlag removes the flag", () => {
      authStorage.setAuthFlag(true);
      authStorage.clearAuthFlag();
      expect(authStorage.getAuthFlag()).toBe(false);
    });
  });

  describe("user", () => {
    it("getUser returns null by default", () => {
      expect(authStorage.getUser()).toBeNull();
    });

    it("setUser and getUser round-trip correctly", () => {
      authStorage.setUser(MOCK_USER);
      const stored = authStorage.getUser();
      expect(stored).toEqual(MOCK_USER);
    });

    it("clearUser removes the user", () => {
      authStorage.setUser(MOCK_USER);
      authStorage.clearUser();
      expect(authStorage.getUser()).toBeNull();
    });
  });

  describe("clearAll", () => {
    it("removes all auth-related data", () => {
      authStorage.setAuthFlag(true);
      authStorage.setUser(MOCK_USER);
      store.set("auth_token", "abc123");

      authStorage.clearAll();

      expect(authStorage.getAuthFlag()).toBe(false);
      expect(authStorage.getUser()).toBeNull();
      expect(store.has("auth_token")).toBe(false);
    });
  });
});
