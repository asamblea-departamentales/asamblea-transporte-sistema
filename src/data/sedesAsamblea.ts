// src/data/sedesAsamblea.ts
// Sede central + Oficinas Departamentales de la Asamblea Legislativa de El Salvador
// Coordenadas basadas en las cabeceras departamentales donde operan las oficinas

export type SedeAsamblea = {
  id: string;
  nombre: string;         // Nombre corto para mostrar en sugerencias
  nombreCompleto: string; // Para el input
  departamento: string;
  lat: number;
  lng: number;
  direccion: string;
  tipo: "central" | "departamental";
};

export const SEDES_ASAMBLEA: SedeAsamblea[] = [
  // ── Sede Central ────────────────────────────────────────────────
  {
    id: "central",
    nombre: "Sede Central – Palacio Legislativo",
    nombreCompleto: "Asamblea Legislativa – Palacio Legislativo, San Salvador",
    departamento: "San Salvador",
    lat: 13.6994,
    lng: -89.1913,
    direccion: "Centro de Gobierno, San Salvador",
    tipo: "central",
  },

  // ── Departamentales (cabeceras) ──────────────────────────────────
  {
    id: "ahuachapan",
    nombre: "Departamental Ahuachapán",
    nombreCompleto: "Departamental Asamblea Legislativa – Ahuachapán",
    departamento: "Ahuachapán",
    lat: 13.9214,
    lng: -89.8450,
    direccion: "Ahuachapán, Ahuachapán",
    tipo: "departamental",
  },
  {
    id: "santa-ana",
    nombre: "Departamental Santa Ana",
    nombreCompleto: "Departamental Asamblea Legislativa – Santa Ana",
    departamento: "Santa Ana",
    lat: 13.9946,
    lng: -89.5597,
    direccion: "Santa Ana, Santa Ana",
    tipo: "departamental",
  },
  {
    id: "sonsonate",
    nombre: "Departamental Sonsonate",
    nombreCompleto: "Departamental Asamblea Legislativa – Sonsonate",
    departamento: "Sonsonate",
    lat: 13.7193,
    lng: -89.7247,
    direccion: "Sonsonate, Sonsonate",
    tipo: "departamental",
  },
  {
    id: "chalatenango",
    nombre: "Departamental Chalatenango",
    nombreCompleto: "Departamental Asamblea Legislativa – Chalatenango",
    departamento: "Chalatenango",
    lat: 14.0354,
    lng: -88.9326,
    direccion: "Chalatenango, Chalatenango",
    tipo: "departamental",
  },
  {
    id: "la-libertad",
    nombre: "Departamental La Libertad",
    nombreCompleto: "Departamental Asamblea Legislativa – La Libertad",
    departamento: "La Libertad",
    lat: 13.6698,
    lng: -89.3069,
    direccion: "Santa Tecla, La Libertad",
    tipo: "departamental",
  },
  {
    id: "cuscatlan",
    nombre: "Departamental Cuscatlán",
    nombreCompleto: "Departamental Asamblea Legislativa – Cuscatlán",
    departamento: "Cuscatlán",
    lat: 13.7269,
    lng: -89.0279,
    direccion: "Cojutepeque, Cuscatlán",
    tipo: "departamental",
  },
  {
    id: "la-paz",
    nombre: "Departamental La Paz",
    nombreCompleto: "Departamental Asamblea Legislativa – La Paz",
    departamento: "La Paz",
    lat: 13.4993,
    lng: -88.8696,
    direccion: "Zacatecoluca, La Paz",
    tipo: "departamental",
  },
  {
    id: "cabanas",
    nombre: "Departamental Cabañas",
    nombreCompleto: "Departamental Asamblea Legislativa – Cabañas",
    departamento: "Cabañas",
    lat: 13.8717,
    lng: -88.7432,
    direccion: "Sensuntepeque, Cabañas",
    tipo: "departamental",
  },
  {
    id: "san-vicente",
    nombre: "Departamental San Vicente",
    nombreCompleto: "Departamental Asamblea Legislativa – San Vicente",
    departamento: "San Vicente",
    lat: 13.6432,
    lng: -88.7854,
    direccion: "San Vicente, San Vicente",
    tipo: "departamental",
  },
  {
    id: "usulutan",
    nombre: "Departamental Usulután",
    nombreCompleto: "Departamental Asamblea Legislativa – Usulután",
    departamento: "Usulután",
    lat: 13.3500,
    lng: -88.4422,
    direccion: "Usulután, Usulután",
    tipo: "departamental",
  },
  {
    id: "san-miguel",
    nombre: "Departamental San Miguel",
    nombreCompleto: "Departamental Asamblea Legislativa – San Miguel",
    departamento: "San Miguel",
    lat: 13.4833,
    lng: -88.1833,
    direccion: "San Miguel, San Miguel",
    tipo: "departamental",
  },
  {
    id: "morazan",
    nombre: "Departamental Morazán",
    nombreCompleto: "Departamental Asamblea Legislativa – Morazán",
    departamento: "Morazán",
    lat: 13.7701,
    lng: -88.0282,
    direccion: "San Francisco Gotera, Morazán",
    tipo: "departamental",
  },
  {
    id: "la-union",
    nombre: "Departamental La Unión",
    nombreCompleto: "Departamental Asamblea Legislativa – La Unión",
    departamento: "La Unión",
    lat: 13.3369,
    lng: -87.8437,
    direccion: "La Unión, La Unión",
    tipo: "departamental",
  },
];

// Función para buscar sedes por texto
export function buscarSedes(query: string): SedeAsamblea[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return SEDES_ASAMBLEA.filter((s) => {
    const nombre = s.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const depto  = s.departamento.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return nombre.includes(q) || depto.includes(q) || "departamental".includes(q) || "asamblea".includes(q);
  }).slice(0, 6);
}