// src/pages/transport/paso-2.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LocationInput from "../../components/transport/LocationInput";
import TransportWizard from "../../components/ui/TransportWizard";
import { reverseGeocode } from "@/lib/geo";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

type DestinationPoint = {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
};

type WizardData = {
  fecha?: string;
  hora?: string;
  encargado?: string;
  subencargado?: string;
  pasajeros?: string;
  origen?: string;
  origenLat?: number;
  origenLng?: number;
  destinos?: DestinationPoint[];
};

// ─── Constantes ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "solicitud_transporte";

const WIZARD_STEPS = [
  { id: 1, label: "Datos" },
  { id: 2, label: "Ruta" },
  { id: 3, label: "Confirmar" },
];

const ICON_ORIGIN = L.icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0f2548" width="32" height="32">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>`
    ),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const ICON_DEST = L.icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="32" height="32">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>`
    ),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Límites geográficos de El Salvador
const SV_BOUNDS: L.LatLngBoundsExpression = [
  [12.97, -90.2],
  [14.55, -87.6],
];

// ─── Utilidades ────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

const safeParse = (json: string | null): WizardData => {
  try {
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
};

const hasValidCoords = (lat?: number, lng?: number) => {
  return Number.isFinite(lat) && Number.isFinite(lng);
};

// ─── Micro-componentes ────────────────────────────────────────────────────────

function SectionTitle({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
        style={{ background: "rgba(15,37,72,0.07)", color: "#0f2548" }}
      >
        {icon}
      </div>
      <span className="text-[14px] font-bold text-slate-800">{label}</span>
    </div>
  );
}

function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
      {children}
      {required && (
        <span className="text-red-500 font-black normal-case tracking-normal">
          *
        </span>
      )}
    </label>
  );
}

// ─── Página ────────────────────────────────────────────────────────────────────

export default function TransportStep2Page() {
  const navigate = useNavigate();

  const [origen, setOrigen] = useState("");
  const [origenCoords, setOrigenCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [destinos, setDestinos] = useState<DestinationPoint[]>([
    { id: uid(), address: "" },
  ]);

  const [submitted, setSubmitted] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const fitBoundsTimeoutRef = useRef<number | null>(null);

  const edenRef = useRef({
    o: "",
    oc: null as { lat: number; lng: number } | null,
  });

  useEffect(() => {
    edenRef.current = {
      o: origen,
      oc: origenCoords,
    };
  }, [origen, origenCoords]);

  // Cargar datos iniciales y escuchar clics del mapa
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));

    if (saved.origen) {
      setOrigen(saved.origen);

      if (hasValidCoords(saved.origenLat, saved.origenLng)) {
        setOrigenCoords({
          lat: saved.origenLat!,
          lng: saved.origenLng!,
        });
      }
    }

    if (saved.destinos?.length) {
      setDestinos(saved.destinos);
    }

    const onMapClick = (e: Event) => {
      const customEvent = e as CustomEvent<{ lat: number; lng: number }>;
      const { lat, lng } = customEvent.detail;

      if (!hasValidCoords(lat, lng)) return;

      reverseGeocode(lat, lng)
  .then((display_name) => {
    const addr = display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    if (!edenRef.current.oc) {
      setOrigen(addr);
      setOrigenCoords({ lat, lng });
    } else {
      setDestinos((ds) => {
        const idxValue = ds.findIndex((d) => !d.address.trim());

        if (idxValue !== -1) {
          return ds.map((d, i) =>
            i === idxValue ? { ...d, address: addr, lat, lng } : d
          );
        }

        return [...ds, { id: uid(), address: addr, lat, lng }];
      });
    }
  })
  .catch(() => {
    const addr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    if (!edenRef.current.oc) {
      setOrigen(addr);
      setOrigenCoords({ lat, lng });
    } else {
      setDestinos((ds) => {
        const idxValue = ds.findIndex((d) => !d.address.trim());

        if (idxValue !== -1) {
          return ds.map((d, i) =>
            i === idxValue ? { ...d, address: addr, lat, lng } : d
          );
        }

        return [...ds, { id: uid(), address: addr, lat, lng }];
      });
    }
  });
    };

    window.addEventListener("map:click", onMapClick);

    return () => {
      window.removeEventListener("map:click", onMapClick);
    };
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,

      // Importante para evitar error _leaflet_pos
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,

      maxBounds: SV_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 8,
    }).setView([13.7942, -88.8965], 9);

    mapRef.current = map;

    L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      window.dispatchEvent(
        new CustomEvent("map:click", {
          detail: {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          },
        })
      );
    });

    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      if (fitBoundsTimeoutRef.current) {
        window.clearTimeout(fitBoundsTimeoutRef.current);
        fitBoundsTimeoutRef.current = null;
      }

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      routeLayerRef.current?.remove();
      routeLayerRef.current = null;

      map.off();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Actualizar marcadores y ruta
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (fitBoundsTimeoutRef.current) {
      window.clearTimeout(fitBoundsTimeoutRef.current);
      fitBoundsTimeoutRef.current = null;
    }

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    routeLayerRef.current?.remove();
    routeLayerRef.current = null;

    const bounds: [number, number][] = [];

    if (
      origenCoords &&
      hasValidCoords(origenCoords.lat, origenCoords.lng)
    ) {
      const m = L.marker([origenCoords.lat, origenCoords.lng], {
        icon: ICON_ORIGIN,
      })
        .addTo(map)
        .bindPopup(`<b>Origen:</b><br>${origen}`);

      markersRef.current.push(m);
      bounds.push([origenCoords.lat, origenCoords.lng]);
    }

    destinos.forEach((d, i) => {
      if (hasValidCoords(d.lat, d.lng)) {
        const m = L.marker([d.lat!, d.lng!], {
          icon: ICON_DEST,
        })
          .addTo(map)
          .bindPopup(`<b>Destino ${i + 1}:</b><br>${d.address}`);

        markersRef.current.push(m);
        bounds.push([d.lat!, d.lng!]);
      }
    });

    const withCoords = destinos.filter((d) =>
      hasValidCoords(d.lat, d.lng)
    );

    if (
      origenCoords &&
      hasValidCoords(origenCoords.lat, origenCoords.lng) &&
      withCoords.length > 0
    ) {
      const pts: L.LatLngExpression[] = [
        [origenCoords.lat, origenCoords.lng],
        ...withCoords.map(
          (d) => [d.lat!, d.lng!] as L.LatLngExpression
        ),
      ];

      routeLayerRef.current = L.polyline(pts, {
        color: "#3b82f6",
        weight: 5,
        opacity: 0.85,
        dashArray: "8, 8",
        lineCap: "round",
      }).addTo(map);
    }

    if (bounds.length > 0) {
      const leafletBounds = L.latLngBounds(bounds);

      if (leafletBounds.isValid()) {
        fitBoundsTimeoutRef.current = window.setTimeout(() => {
          if (!mapRef.current) return;

          mapRef.current.invalidateSize();

          mapRef.current.fitBounds(leafletBounds, {
            padding: [50, 50],
            animate: false,
          });
        }, 200);
      }
    }
  }, [origenCoords, origen, destinos]);

  const save = () => {
    const curr = safeParse(localStorage.getItem(STORAGE_KEY));

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...curr,
        origen,
        origenLat: origenCoords?.lat,
        origenLng: origenCoords?.lng,
        destinos,
      })
    );
  };

  const handleContinue = () => {
    setSubmitted(true);

    if (!origen.trim() || !destinos[0]?.address.trim()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    save();
    navigate("/solicitudes/transporte/paso-3");
  };

  const hasErrors =
    submitted && (!origen.trim() || !destinos[0]?.address.trim());

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 pb-8 sm:px-0">
      <TransportWizard steps={WIZARD_STEPS} currentStep={2} />

      <div className="px-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block h-[2px] w-5 rounded-full bg-blue-700" />
          <span className="text-[10px] font-black uppercase tracking-[.18em] text-blue-700">
            Ruta del Viaje
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none sm:text-[28px]">
          Ubicaciones
        </h1>

        <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">
          Define el punto de salida y los destinos. Puedes usar el mapa para
          fijar puntos exactos.
        </p>
      </div>

      {hasErrors && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 mt-0.5">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          <div>
            <p className="text-[12px] font-bold text-red-900">
              Campos requeridos
            </p>
            <p className="text-[11px] text-red-700 mt-0.5">
              Indique al menos el origen y un destino.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100 mx-0">
        <div className="p-4 sm:p-6">
          <SectionTitle
            label="Punto de Salida"
            icon={
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            }
          />

          <div className="space-y-4">
            <div>
              <Label required>Origen</Label>

              <LocationInput
                id="origen"
                label=""
                value={origen}
                onChange={(v, la, ln) => {
                  setOrigen(v);

                  if (hasValidCoords(la, ln)) {
                    setOrigenCoords({ lat: la!, lng: ln! });
                  } else {
                    setOrigenCoords(null);
                  }
                }}
                placeholder="Punto de inicio..."
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <SectionTitle
            label="Destinos de la Ruta"
            icon={
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            }
          />

          <div className="space-y-6">
            {destinos.map((dest, i) => (
              <div key={dest.id} className="relative group">
                <div className="mb-2 flex items-center justify-between px-1">
                  <Label required={i === 0}>Parada {i + 1}</Label>

                  {destinos.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setDestinos((ds) =>
                          ds.filter((d) => d.id !== dest.id)
                        )
                      }
                      className="text-[10px] font-bold text-red-400 transition hover:text-red-600"
                    >
                      Remover
                    </button>
                  )}
                </div>

                <LocationInput
                  id={`dest-${dest.id}`}
                  value={dest.address}
                  onChange={(v, la, ln) => {
                    setDestinos((ds) =>
                      ds.map((d) =>
                        d.id === dest.id
                          ? {
                              ...d,
                              address: v,
                              lat: hasValidCoords(la, ln)
                                ? la
                                : undefined,
                              lng: hasValidCoords(la, ln)
                                ? ln
                                : undefined,
                            }
                          : d
                      )
                    );
                  }}
                  placeholder="Escriba el destino..."
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setDestinos((ds) => [...ds, { id: uid(), address: "" }])
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-100 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-500"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
              Añadir otra parada
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <SectionTitle
            label="Vista Previa de Ruta"
            icon={
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
          />

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
            <div ref={mapContainerRef} className="h-[340px] sm:h-[420px] w-full" />
          </div>

          <p className="mt-3 text-center text-[11px] text-slate-400 italic">
            Puedes hacer clic en el mapa para fijar el origen y los destinos
            automáticamente.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-4 bg-slate-50/50">
          <button
            type="button"
            onClick={() => {
              save();
              navigate("/solicitudes/transporte/paso-1");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700 border border-transparent hover:border-slate-200 hover:shadow-sm focus:outline-none"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Anterior
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-2.5 text-[13px] font-bold text-white transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            style={{
              background: "linear-gradient(135deg, #0f2548 0%, #2354b4 100%)",
              boxShadow:
                "0 4px 16px rgba(15,37,72,0.22), 0 1px 4px rgba(15,37,72,0.1)",
            }}
          >
            Continuar
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}