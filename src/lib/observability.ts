export type ClientErrorContext = Record<string, string | number | boolean | undefined>;

export function reportError(error: unknown, context: ClientErrorContext = {}) {
  const message = error instanceof Error ? error.message : String(error);
  if (import.meta.env.DEV) {
    console.error("Client error", { message, ...context });
  }
  // Keep this transport-free: a future monitoring provider can subscribe here.
}