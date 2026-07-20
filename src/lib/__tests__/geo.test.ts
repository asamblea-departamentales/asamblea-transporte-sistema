import { describe, it, expect, vi, beforeEach } from "vitest";
import { haversineKm, geocodeAddress, reverseGeocode, getOSRMRoute } from "../geo";

describe("haversineKm", () => {
  it("returns 0 for same point", () => {
    expect(haversineKm(13.79, -88.9, 13.79, -88.9)).toBe(0);
  });

  it("calculates distance between San Salvador and Santa Ana (~50 km)", () => {
    const km = haversineKm(13.6929, -89.2182, 13.9939, -89.5597);
    expect(km).toBeGreaterThan(40);
    expect(km).toBeLessThan(70);
  });

  it("calculates distance between two distant points", () => {
    const km = haversineKm(0, 0, 0, 1);
    expect(km).toBeGreaterThan(100);
  });
});

describe("geocodeAddress", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns coordinates for valid response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ lat: "13.69", lon: "-89.21" }]),
    }));

    const result = await geocodeAddress("San Salvador");
    expect(result).toEqual({ lat: 13.69, lng: -89.21 });
  });

  it("returns null for empty response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }));

    const result = await geocodeAddress("NonexistentPlace");
    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const result = await geocodeAddress("test");
    expect(result).toBeNull();
  });

  it("returns null on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    }));

    const result = await geocodeAddress("test");
    expect(result).toBeNull();
  });
});

describe("reverseGeocode", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns display_name for valid response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ display_name: "San Salvador, El Salvador" }),
    }));

    const result = await reverseGeocode(13.69, -89.21);
    expect(result).toBe("San Salvador, El Salvador");
  });

  it("returns null on error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
    expect(await reverseGeocode(0, 0)).toBeNull();
  });
});

describe("getOSRMRoute", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null for fewer than 2 points", async () => {
    expect(await getOSRMRoute([{ lat: 0, lng: 0 }])).toBeNull();
  });

  it("returns parsed route data for valid response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        code: "Ok",
        routes: [{
          distance: 50000,
          duration: 3600,
          geometry: { coordinates: [[-89.21, 13.69], [-89.55, 13.99]] },
        }],
      }),
    }));

    const result = await getOSRMRoute([
      { lat: 13.69, lng: -89.21 },
      { lat: 13.99, lng: -89.55 },
    ]);

    expect(result).not.toBeNull();
    expect(result!.distanceKm).toBe(50);
    expect(result!.durationMin).toBe(60);
    expect(result!.geometry).toHaveLength(2);
  });

  it("returns null when OSRM returns error code", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: "NoRoute" }),
    }));

    const result = await getOSRMRoute([
      { lat: 0, lng: 0 },
      { lat: 1, lng: 1 },
    ]);
    expect(result).toBeNull();
  });
});
