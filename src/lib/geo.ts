// src/lib/geo.ts
// Utilidades de geocodificación y routing
// Usa proxy de Vercel para evitar CORS con Nominatim y OSRM

const NOMINATIM_EMAIL = "app@transporte.institucional.sv";

// ─── NOMINATIM (via proxy Vercel) ─────────────────────────────────────────────

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `/nominatim/search?format=json&q=${encodeURIComponent(address)}&countrycodes=sv&limit=1&email=${NOMINATIM_EMAIL}`,
      { headers: { "Accept-Language": "es" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const res = await fetch(
      `/nominatim/reverse?format=json&lat=${lat}&lon=${lng}&email=${NOMINATIM_EMAIL}`,
      { headers: { "Accept-Language": "es" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.display_name ?? null;
  } catch {
    return null;
  }
}

// ─── OSRM (via proxy Vercel) ──────────────────────────────────────────────────

export async function getOSRMRoute(
  points: { lat: number; lng: number }[]
): Promise<{
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][];
} | null> {
  if (points.length < 2) return null;
  try {
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
    const res = await fetch(
      `/osrm/route/v1/driving/${coords}?overview=full&geometries=geojson`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.code !== "Ok" || !data.routes?.[0]) return null;
    const route = data.routes[0];
    const geometry: [number, number][] = (
      route.geometry?.coordinates ?? []
    ).map(([lng, lat]: [number, number]) => [lat, lng]);
    return {
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
      geometry,
    };
  } catch {
    return null;
  }
}

// ─── HAVERSINE (fallback sin red) ─────────────────────────────────────────────

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}