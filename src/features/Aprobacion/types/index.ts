// Interfaces basadas en la respuesta de /comparativa

export interface SolicitudDetalle {
  id: string;
  horas_estimadas: number | null;
  solicitante: string;
  destino: string;
  prioridad: string;
  fechas: {
    salida: string;
    retorno: string;
  };
  motivo: string;
}

export interface VehiculoSugerido {
  id: number;
  placa: string;
  modelo: string;
  combustible_porcentaje: number;
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
