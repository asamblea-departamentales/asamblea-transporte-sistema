import { MapPin, FileText, User, Car, RefreshCw, CheckCircle, XCircle, Wrench } from 'lucide-react';

interface AsignacionCardProps {
  isAprobada: boolean;
  isEnEjecucion: boolean;
  isCombustibleView: boolean;
  isMantenimientoView: boolean;
  statusInfo: { bg: string; border: string; text: string; dot: string; label: string };
  decisionFinal: string;
  // Transporte
  motoristaFinal: string;
  vehiculoFinal: string;
  vehiculoMarca: string;
  // Combustible
  montoFinal: number | string | null;
  // Mantenimiento
  vehiculoMantenimientoMarca: string;
  vehiculoMantenimientoPlaca: string;
  tipoMantenimientoNombre: string;
  // Common
  comentarioJefe: string;
  // Actions
  canReasignar: boolean;
  canAddDestino: boolean;
  onReasignar: () => void;
  onAddDestino: () => void;
}

export const AsignacionCard = ({
  isAprobada,
  isEnEjecucion,
  isCombustibleView,
  isMantenimientoView,
  statusInfo,
  decisionFinal,
  motoristaFinal,
  vehiculoFinal,
  vehiculoMarca,
  montoFinal,
  vehiculoMantenimientoMarca,
  vehiculoMantenimientoPlaca,
  tipoMantenimientoNombre,
  comentarioJefe,
  canReasignar,
  canAddDestino,
  onReasignar,
  onAddDestino,
}: AsignacionCardProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-200">
        {isEnEjecucion ? <MapPin className="text-indigo-500" size={18} /> : (isAprobada ? <CheckCircle className="text-emerald-500" size={18} /> : <XCircle className="text-red-500" size={18} />)}
        <h3 className="font-bold text-slate-800 text-lg tracking-tight">
          {isEnEjecucion ? (isMantenimientoView ? 'En Mantenimiento' : 'Viaje en Curso') : (isAprobada ? (isMantenimientoView ? 'Mantenimiento Aprobado' : 'Asignación Aprobada') : 'Decisión Final')}
        </h3>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estado Actual</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
            {decisionFinal}
          </span>
        </div>

        {isCombustibleView ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FileText size={12} /> Cargas Aprobadas
              </p>
              <p className="text-xl font-black text-emerald-600">
                {montoFinal !== null && montoFinal !== undefined ? `$${Number(montoFinal).toFixed(2)}` : 'Sin asignar'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Car size={12} /> Vehículo (Placa)
              </p>
              <p className="text-sm font-bold text-slate-800">
                {vehiculoFinal}
              </p>
              {vehiculoMarca && (
                <p className="text-xs text-slate-500">
                  {vehiculoMarca}
                </p>
              )}
            </div>
          </div>
        ) : isMantenimientoView ? (
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Car size={12} /> Vehículo a Taller
              </p>
              <p className="text-sm font-bold text-slate-800">
                {vehiculoMantenimientoMarca || vehiculoMantenimientoPlaca || 'Sin especificar'}
              </p>
              {vehiculoMantenimientoPlaca && vehiculoMantenimientoMarca && (
                <p className="text-xs text-slate-500">
                  Placa: {vehiculoMantenimientoPlaca}
                </p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Wrench size={12} /> Servicio
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {tipoMantenimientoNombre}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User size={12} /> Motorista Asignado
              </p>
              <p className="text-sm text-slate-800 font-medium">
                {motoristaFinal}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Car size={12} /> Vehículo Asignado
              </p>
              <p className="text-sm text-slate-800 font-medium">
                {vehiculoFinal}
              </p>
              {vehiculoMarca && (
                <p className="text-xs text-slate-500">
                  {vehiculoMarca}
                </p>
              )}
            </div>
          </>
        )}

        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Comentario del Jefe</p>
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
            "{comentarioJefe}"
          </p>
        </div>
      </div>

      {/* Botón de Reasignar */}
      {canReasignar && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={onReasignar}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#3b32c9] text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
          >
            <RefreshCw size={18} />
            Reasignar Motorista / Vehículo
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Puedes cambiar la asignación solo si el viaje aún no está en ejecución.
          </p>
        </div>
      )}

      {/* Botón de Añadir Destino en Ejecución */}
      {canAddDestino && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={onAddDestino}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#859BFF] hover:bg-[#7288f5] text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
          >
            <MapPin size={18} />
            Añadir Destino Adicional
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Modifica la ruta enviando un nuevo destino en tiempo real al motorista.
          </p>
        </div>
      )}
    </div>
  );
};
