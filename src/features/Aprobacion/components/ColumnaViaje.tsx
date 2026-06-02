import React from 'react';
import { SolicitudDetalle } from '../types';
import { FileText, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface ColumnaViajeProps {
  solicitud: SolicitudDetalle;
}

export const ColumnaViaje: React.FC<ColumnaViajeProps> = ({ solicitud }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
        <FileText className="text-slate-400" size={20} />
        <h3 className="font-title font-bold text-slate-800 text-lg">Datos del Viaje</h3>
      </div>
      
      <div className="space-y-4 flex-1">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Solicitante</p>
          <p className="text-sm text-slate-800 font-medium">{solicitud.solicitante}</p>
        </div>
        
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1">
            <MapPin size={12} /> Destino
          </p>
          <p className="text-sm text-slate-800 font-medium">{solicitud.destino}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Calendar size={12} /> Salida
            </p>
            <p className="text-xs text-slate-800 font-medium">{new Date(solicitud.fechas.salida).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Calendar size={12} /> Retorno
            </p>
            <p className="text-xs text-slate-800 font-medium">{new Date(solicitud.fechas.retorno).toLocaleString()}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1">
            <Clock size={12} /> Horas Estimadas
          </p>
          <p className="text-sm text-slate-800 font-medium">{solicitud.horas_estimadas || 0} hrs</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Motivo</p>
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
            "{solicitud.motivo}"
          </p>
        </div>

        {solicitud.prioridad === 'Alta' && (
          <div className="mt-auto bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl flex items-start gap-2">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Prioridad Alta</p>
              <p className="text-xs mt-0.5">Esta solicitud requiere atención inmediata.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
