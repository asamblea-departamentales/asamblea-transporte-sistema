// Interfaces basadas en la respuesta de /comparativa

export interface SolicitudDetalle {
  id: string;
  horas_estimadas: number | null;
  solicitante: string;
  origen?: string;
  origen_lat?: number | null;
  origen_lng?: number | null;
  destino: string;
  destino_lat?: number | null;
  destino_lng?: number | null;
  prioridad: string;
  fechas: {
    salida: string;
    retorno: string;
  };
  motivo: string;
  decision_final?: 'operativo' | 'sistema' | null;
  comentario_jefe?: string | null;
  estado?: any;
  codigo?: string;
}

export interface VehiculoSugerido {
  id: number;
  placa: string;
  modelo: string;
  nivel_combustible?: { valor: number; label: string };
}

export interface MotoristaSugerido {
  id: number;
  nombre: string;
  horas_periodo_7d?: number;
}

export interface AsignacionOperativo {
  autor: string;
  vehiculo: VehiculoSugerido;
  motorista: MotoristaSugerido;
  justificacion: string;
  cambio_detectado: string;
}

export interface SugerenciaSistema {
  score_confianza: number;
  vehiculo_sugerido: VehiculoSugerido;
  motorista_sugerido: MotoristaSugerido;
  horas_motorista_periodo?: number;
  bullets_tecnicos: string[];
}

export interface ComparativaResponse {
  solicitud: SolicitudDetalle;
  operativo: AsignacionOperativo | null;
  sistema: SugerenciaSistema | null;
}

export type DecisionType = 'operativo' | 'sistema' | 'ninguna';

export interface AprobacionState {
  decision: DecisionType;
  comentario: string;
}

// === TIPOS PARA COMBUSTIBLE ===

export interface SolicitudCombustibleDetalle {
  id: string;
  codigo?: string;
  solicitante: string;
  vehiculo: string;
  placa: string;
  motivo: string;
  fecha_solicitud: string;
  estado?: any;
  decision_final?: 'mantener' | 'manual' | null;
  comentario_jefe?: string | null;
}

export interface AsignacionOperativoCombustible {
  autor: string;
  monto_aprobado: number;
  justificacion: string;
}

export interface ComparativaCombustibleResponse {
  solicitud: SolicitudCombustibleDetalle;
  operativo: AsignacionOperativoCombustible | null;
}

export type DecisionCombustibleType = 'mantener' | 'manual' | 'ninguna';

// === TIPOS PARA MANTENIMIENTO ===

export interface SolicitudMantenimientoDetalle {
  id: string;
  codigo?: string;
  solicitante: string;
  vehiculo: string;
  placa: string;
  motivo: string;
  fecha_sugerida?: string;
  kilometraje_actual?: number;
  tipo_mantenimiento?: string;
  estado?: any;
  decision_final?: string | null;
  comentario_jefe?: string | null;
}
