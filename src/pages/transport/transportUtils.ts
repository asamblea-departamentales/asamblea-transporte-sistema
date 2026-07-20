// src/pages/transport/transportUtils.ts

export const STORAGE_KEY = "solicitud_transporte";

export const WIZARD_STEPS = [
  { id: 1, label: "Datos" },
  { id: 2, label: "Ruta" },
  { id: 3, label: "Confirmar" },
];

export type VehiculoId = "sedan" | "microbus" | "camion";

export type DestinationPoint = {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
};

export type WizardData = {
  tipoVehiculo?: VehiculoId;
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

export const VEHICULO_LABELS: Record<VehiculoId, string> = {
  sedan: "Sedán",
  microbus: "Microbús",
  camion: "Camión (Carga)",
};

export const uid = () =>
  Math.random().toString(16).slice(2) + Date.now().toString(16);

export const safeParse = (json: string | null): WizardData => {
  try {
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
};

export const hasValidCoords = (lat?: number, lng?: number) =>
  Number.isFinite(lat) && Number.isFinite(lng);
