import { describe, it, expect } from "vitest";
import { getStatusStyle, isCompleted, formatFecha, formatFechaCorta, getTodayLocal, formatCurrency } from "../format";

describe("getStatusStyle", () => {
  it("returns correct style for known statuses", () => {
    expect(getStatusStyle("pendiente")).toContain("amber");
    expect(getStatusStyle("aprobada")).toContain("emerald");
    expect(getStatusStyle("rechazada")).toContain("red");
    expect(getStatusStyle("completada")).toContain("slate-800");
    expect(getStatusStyle("cancelada")).toContain("slate-100");
  });

  it("is case-insensitive", () => {
    expect(getStatusStyle("PENDIENTE")).toBe(getStatusStyle("pendiente"));
    expect(getStatusStyle("Aprobada")).toBe(getStatusStyle("aprobada"));
  });

  it("returns fallback for unknown status", () => {
    const fallback = getStatusStyle("xyz_unknown");
    expect(fallback).toContain("gray");
  });
});

describe("isCompleted", () => {
  it("returns true for completada and finalizada", () => {
    expect(isCompleted("completada")).toBe(true);
    expect(isCompleted("finalizada")).toBe(true);
    expect(isCompleted("COMPLETADA")).toBe(true);
  });

  it("returns false for other statuses", () => {
    expect(isCompleted("pendiente")).toBe(false);
    expect(isCompleted("aprobada")).toBe(false);
    expect(isCompleted("")).toBe(false);
  });
});

describe("formatFecha", () => {
  it("formats a valid date string", () => {
    const result = formatFecha("2025-03-15T08:30:00");
    expect(result).toContain("15");
    expect(result).toContain("2025");
    expect(result).toContain(":30");
  });
});

describe("formatFechaCorta", () => {
  it("returns YYYY-MM-DD HH:mm format", () => {
    const result = formatFechaCorta("2025-03-15T08:30:00");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

describe("getTodayLocal", () => {
  it("formats the local calendar date without UTC conversion", () => {
    const localDate = new Date(2025, 5, 15, 19, 0, 0);
    expect(getTodayLocal(localDate)).toBe("2025-06-15");
  });
});

describe("formatCurrency", () => {
  it("formats valid amounts and handles missing values", () => {
    expect(formatCurrency("12.5")).toBe("$12.50");
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency("invalid")).toBe("—");
  });
});