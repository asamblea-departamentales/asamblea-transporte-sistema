import { api } from "../lib/axios";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type RequestStatus =
  | "borrador"
  | "pendiente"
  | "observada"
  | "aprobada"
  | "rechazada"
  | "programada"
  | "en_ejecucion"  // ← corregido: estado real del backend
  | "completada"
  | "finalizada";

export type Unidad = {
  id: number;
  nombre: string;
};

export type Solicitante = {
  id: number;
  name: string;
  email: string;
};

export type Request = {
  id: number;
  codigo: string;
  unidad_solicitante_id: number;
  solicitante_id: number;
  motivo_actividad: string;
  origen: string;
  destino: string;
  fecha_salida: string;
  fecha_retorno: string | null;
  cantidad_personas: number;
  prioridad: string;
  estado: RequestStatus;
  created_at: string;
  updated_at: string;
  unidad?: Unidad;
  solicitante?: Solicitante;
};

export type LaravelPaginatedResponse = {
  current_page: number;
  data: Request[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
};

export type RequestsResponse = {
  data: Request[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export type RequestFilters = {
  estado?: RequestStatus;
  search?: string;
  page?: number;
  per_page?: number;
};

// ─── FUNCIONES API ────────────────────────────────────────────────────────────

export async function getAllRequests(filters?: RequestFilters): Promise<RequestsResponse> {
  const params = new URLSearchParams();

  if (filters?.estado)   params.append("estado",    filters.estado);
  if (filters?.search)   params.append("search",    filters.search);
  if (filters?.page)     params.append("page",      filters.page.toString());
  if (filters?.per_page) params.append("per_page",  filters.per_page.toString());

  const { data } = await api.get<LaravelPaginatedResponse>(
    `/api/transport-requests?${params.toString()}`
  );

  return {
    data:        data.data,
    total:       data.total,
    page:        data.current_page,
    per_page:    data.per_page,
    total_pages: data.last_page,
  };
}

export async function getRequestById(id: string | number): Promise<Request> {
  const { data } = await api.get<Request>(`/api/transport-requests/${id}`);
  return data;
}

export async function deleteRequest(id: string | number): Promise<void> {
  await api.delete(`/api/transport-requests/${id}`);
}

export async function completeRequest(id: number): Promise<Request> {
  const { data } = await api.post(`/api/transport-requests/${id}/finalizar`);
  return data.data;
}