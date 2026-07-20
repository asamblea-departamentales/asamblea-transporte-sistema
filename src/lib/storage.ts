export type StoredEnvelope<T> = {
  version: number;
  expiresAt: number | null;
  value: T;
};

type StorageOptions<T> = {
  version: number;
  ttlMs?: number;
  validate: (value: unknown) => value is T;
  migrateLegacy?: (value: unknown) => T | null;
};

/** Persistencia para datos no autenticados. No debe utilizarse para credenciales o tokens. */
export function createJsonStorage<T>(key: string, options: StorageOptions<T>) {
  const read = (): T | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (isEnvelope(parsed)) {
        if (parsed.version !== options.version || (parsed.expiresAt !== null && parsed.expiresAt <= Date.now())) {
          localStorage.removeItem(key);
          return null;
        }
        return options.validate(parsed.value) ? parsed.value : null;
      }
      return options.migrateLegacy?.(parsed) ?? (options.validate(parsed) ? parsed : null);
    } catch {
      return null;
    }
  };

  const write = (value: T) => {
    const envelope: StoredEnvelope<T> = {
      version: options.version,
      expiresAt: options.ttlMs ? Date.now() + options.ttlMs : null,
      value,
    };
    localStorage.setItem(key, JSON.stringify(envelope));
  };

  return { read, write, remove: () => localStorage.removeItem(key) };
}

function isEnvelope(value: unknown): value is StoredEnvelope<unknown> {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredEnvelope<unknown>>;
  return typeof candidate.version === "number"
    && (candidate.expiresAt === null || typeof candidate.expiresAt === "number")
    && "value" in candidate;
}
