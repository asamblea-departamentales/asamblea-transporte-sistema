import { FileText, MapPin, Calendar, Clock, Car, Wrench } from 'lucide-react';

interface DatosSolicitudCardProps {
  isTransporteView: boolean;
  isCombustibleView: boolean;
  isMantenimientoView: boolean;
  solicitanteName: string;
  prioridadRaw: string;
  prioridad: string;
  destino: string;
  fechaSalidaVal: string | undefined;
  fechaRetornoVal: string | undefined;
  horasEstimadas: number;
  motivo: string;
  // Combustible
  rawCreatedAt?: string;
  compFechaSolicitud?: string;
  // Mantenimiento
  vehiculoMantenimientoMarca: string;
  vehiculoMantenimientoPlaca: string;
  tipoMantenimientoNombre: string;
  kilometrajeVal: number | null;
  rawFechaSugerida?: string;
}

export const DatosSolicitudCard = ({
  isTransporteView,
  isCombustibleView,
  isMantenimientoView,
  solicitanteName,
  prioridadRaw,
  prioridad,
  destino,
  fechaSalidaVal,
  fechaRetornoVal,
  horasEstimadas,
  motivo,
  rawCreatedAt,
  compFechaSolicitud,
  vehiculoMantenimientoMarca,
  vehiculoMantenimientoPlaca,
  tipoMantenimientoNombre,
  kilometrajeVal,
  rawFechaSugerida,
}: DatosSolicitudCardProps) => {
  const getPrioridadColor = (p: string) => {
    if (p.includes('alta') || p.includes('urgente')) return 'bg-red-50 text-red-700 border-red-200';
    if (p.includes('media')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (p === 'n/a') return 'bg-slate-50 text-slate-700 border-slate-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-200">
        <FileText className="text-slate-400" size={18} />
        <h3 className="font-bold text-slate-800 text-lg tracking-tight">
          {isCombustibleView ? 'Datos de Combustible' : isMantenimientoView ? 'Datos de Mantenimiento' : 'Datos del Viaje'}
        </h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Solicitante</p>
            <p className="text-sm text-slate-800 font-medium">{solicitanteName}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prioridad</p>
            <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold capitalize border ${getPrioridadColor(prioridad)}`}>
              {prioridadRaw}
            </span>
          </div>
        </div>
        
        {isTransporteView && (
          <>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin size={12} /> Destino
              </p>
              <p className="text-sm text-slate-800 font-medium">{destino}</p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 overflow-hidden rounded-lg">
              <div className="bg-slate-50 p-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Salida
                </p>
                <p className="text-xs text-slate-800 font-medium">
                  {fechaSalidaVal ? new Date(fechaSalidaVal).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 p-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Retorno
                </p>
                <p className="text-xs text-slate-800 font-medium">
                  {fechaRetornoVal ? new Date(fechaRetornoVal).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock size={12} /> Horas Estimadas
              </p>
              <p className="text-sm text-slate-800 font-medium">{horasEstimadas} hrs</p>
            </div>
          </>
        )}

        {isCombustibleView && (
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar size={12} /> Fecha de Solicitud
            </p>
            <p className="text-sm text-slate-800 font-medium">
              {rawCreatedAt ? new Date(rawCreatedAt).toLocaleString() : (compFechaSolicitud ? new Date(compFechaSolicitud).toLocaleString() : 'N/A')}
            </p>
          </div>
        )}

        {isMantenimientoView && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Car size={12} /> Vehículo
                </p>
                <p className="text-sm text-slate-800 font-medium">
                  {vehiculoMantenimientoMarca || vehiculoMantenimientoPlaca || 'N/A'}
                  {vehiculoMantenimientoPlaca && vehiculoMantenimientoMarca && (
                    <span className="text-slate-500 font-normal ml-1">({vehiculoMantenimientoPlaca})</span>
                  )}
                </p>
                {kilometrajeVal && (
                  <p className="text-xs text-slate-500 mt-0.5">Km: {kilometrajeVal} km</p>
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Wrench size={12} /> Tipo Mantenimiento
                </p>
                <p className="text-sm text-slate-800 font-medium">
                  {tipoMantenimientoNombre}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar size={12} /> Fecha Sugerida
              </p>
              <p className="text-sm text-slate-800 font-medium">
                {rawFechaSugerida ? new Date(rawFechaSugerida).toLocaleString() : 'N/A'}
              </p>
            </div>
          </>
        )}

        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Motivo / Observación</p>
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
            "{motivo}"
          </p>
        </div>
      </div>
    </div>
  );
};
