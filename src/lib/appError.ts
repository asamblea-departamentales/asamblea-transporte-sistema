import axios from "axios";

export type AppErrorCode =
  | "network"
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "server"
  | "unknown";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(message: string, options: { code?: AppErrorCode; status?: number; cause?: unknown } = {}) {
    super(message);
    this.name = "AppError";
    this.code = options.code ?? "unknown";
    this.status = options.status;
    this.cause = options.cause;
  }
}

function codeFromStatus(status?: number): AppErrorCode {
  if (!status) return "network";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 422) return "validation";
  if (status >= 500) return "server";
  return "unknown";
}

export function normalizeAppError(error: unknown, fallback = "Ocurrió un error inesperado."): AppError {
  if (error instanceof AppError) return error;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { error?: unknown; message?: unknown } | undefined;
    const detail = typeof data?.error === "string"
      ? data.error
      : typeof data?.message === "string"
        ? data.message
        : error.message || fallback;
    return new AppError(detail, { code: codeFromStatus(status), status, cause: error });
  }
  if (error instanceof Error) {
    return new AppError(error.message || fallback, { cause: error });
  }
  return new AppError(fallback, { cause: error });
}
