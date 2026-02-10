// src/services/requests.service.ts
import { api } from "../lib/axios";

export type RequestStatus = 
  | "pendiente" 
  | "en_progreso" 
  | "aprobada" 
  | "aceptada"
  | "completada" 
  | "rechazada";

export type Request = {
  id: string;
  code: string;
  date: string;
  type: string;
  status: RequestStatus;
  origin?: string;
  destination?: string;
  passengers?: number;
  description?: string;
  created_at: string;
  updated_at?: string;
};

export type RequestsResponse = {
  data: Request[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export type RequestFilters = {
  status?: RequestStatus;
  type?: string;
  search?: string;
  page?: number;
  per_page?: number;
};

export async function getAllRequests(filters?: RequestFilters): Promise<RequestsResponse> {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append("status", filters.status);
  if (filters?.type) params.append("type", filters.type);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.per_page) params.append("per_page", filters.per_page.toString());

  const { data } = await api.get(`/api/solicitudes?${params.toString()}`);
  return data;
}

export async function getRequestById(id: string): Promise<Request> {
  const { data } = await api.get(`/api/solicitudes/${id}`);
  return data;
}

export async function deleteRequest(id: string): Promise<void> {
  await api.delete(`/api/solicitudes/${id}`);
}