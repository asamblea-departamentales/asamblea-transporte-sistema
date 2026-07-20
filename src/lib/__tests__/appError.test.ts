import axios, { AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { AppError, normalizeAppError } from "../appError";

describe("normalizeAppError", () => {
  it("conserva errores normalizados", () => {
    const error = new AppError("Inválido", { code: "validation", status: 422 });
    expect(normalizeAppError(error)).toBe(error);
  });

  it("normaliza respuestas HTTP sin exponer el payload", () => {
    const error = new axios.AxiosError("Request failed", "ERR_BAD_RESPONSE", undefined, undefined, {
      data: { message: "No disponible" }, status: 503, statusText: "Unavailable",
      headers: {}, config: { headers: new AxiosHeaders() },
    });
    expect(normalizeAppError(error)).toMatchObject({ message: "No disponible", code: "server", status: 503 });
  });

  it("usa un mensaje seguro para valores desconocidos", () => {
    expect(normalizeAppError(null, "Error seguro").message).toBe("Error seguro");
  });
});
