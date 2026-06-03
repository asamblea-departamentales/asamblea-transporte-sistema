import React from 'react';
import { SolicitudCombustibleDetalle } from '../types';
import { FileText, Fuel, Calendar, Car } from 'lucide-react';

interface ColumnaCombustibleSolicitudProps {
  solicitud: SolicitudCombustibleDetalle;
}

export const ColumnaCombustibleSolicitud: React.FC<ColumnaCombustibleSolicitudProps> = ({ solicitud }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-200">
        <Fuel className="text-slate-400" size={18} />
        <h3 className="font-bold text-slate-800 text-lg tracking-tight">Datos de Combustible</h3>
      </div>
      
      <div className="space-y-5 flex-1">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Solicitante</p>
          <p className="text-sm text-slate-800 font-medium">{solicitud.solicitante}</p>
        </div>
        
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Car size={12} /> Vehículo
          </p>
          <p className="text-sm text-slate-800 font-medium">{solicitud.vehiculo} - {solicitud.placa}</p>
        </div>

        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Calendar size={12} /> Fecha de Solicitud
          </p>
          <p className="text-sm text-slate-800 font-medium">{solicitud.fecha_solicitud ? new Date(solicitud.fecha_solicitud).toLocaleString() : 'N/A'}</p>
        </div>

        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Motivo / Observación</p>
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
            "{solicitud.motivo}"
          </p>
        </div>
      </div>
    </div>
  );
};
