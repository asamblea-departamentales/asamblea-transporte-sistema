// src/auth/auth.storage.ts
const AUTH_FLAG_KEY = "auth_ok";
const USER_KEY = "auth_user";
const ALERT_KEY = "has_seen_profile_alert";

export const authStorage = {
  getAuthFlag(): boolean {
    return localStorage.getItem(AUTH_FLAG_KEY) === "1";
  },
  setAuthFlag(v: boolean) {
    localStorage.setItem(AUTH_FLAG_KEY, v ? "1" : "0");
  },
  clearAuthFlag() {
    localStorage.removeItem(AUTH_FLAG_KEY);
  },

  getUser<T = any>(): T | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  setUser(user: any) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearUser() {
    localStorage.removeItem(USER_KEY);
  },

  clearAll() {
    this.clearAuthFlag();
    this.clearUser();
    localStorage.removeItem("auth_token");
    localStorage.removeItem(ALERT_KEY);
    sessionStorage.clear();
  },
};
