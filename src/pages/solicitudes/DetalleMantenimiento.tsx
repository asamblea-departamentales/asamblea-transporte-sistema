import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle2, User, Building2, Calendar, Wrench, Clock } from "lucide-react";
import { str, DetailItem, FinalizacionDataSection } from "./components/SharedDetailComponents";
import type { GenericRequest } from "./components/SharedDetailComponents";
import { getStatusStyle, isCompleted } from "../../lib/format";
import FinalizarMantenimientoModal from "./mantenimiento/components/FinalizarMantenimientoModal";

interface Props {
  data: GenericRequest;
  isOwner: boolean;
  onRefresh: () => void;
}

export default function DetalleMantenimiento({ data, isOwner, onRefresh }: Props) {
  const navigate = useNavigate();
  const [isFinalizarModalOpen, setIsFinalizarModalOpen] = useState(false);

  const canFinalizar = ["aprobada", "programada", "en_ejecucion"].includes(data.estado) && isOwner;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition group-hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Volver
        </button>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusStyle(data.estado)}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {data.estado.replace("_", " ")}
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="h-2 w-full bg-emerald-500" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600">mantenimiento</span>
                <span className="text-sm font-bold text-slate-400">#{data.codigo}</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{str(data.descripcion)}</h1>
              <p className="mt-2 text-slate-500">{str(data.tipo_mantenimiento)}</p>
            </div>

            {canFinalizar && (
              <button onClick={() => setIsFinalizarModalOpen(true)} className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 active:translate-y-0">
                <CheckCircle2 className="h-5 w-5" />
                Finalizar Mantenimiento
              </button>
            )}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DetailItem icon={<User className="h-4 w-4" />} label="Solicitante" value={str(data.solicitante?.name ?? data.solicitante)} />
            <DetailItem icon={<Building2 className="h-4 w-4" />} label="Unidad" value={str(data.unidad?.nombre ?? data.unidad)} />
            <DetailItem icon={<Calendar className="h-4 w-4" />} label="Fecha Sugerida" value={data.fecha_sugerida ? new Date(data.fecha_sugerida).toLocaleDateString() : "Sin fecha"} />
            <DetailItem icon={<Wrench className="h-4 w-4" />} label="Tipo de Mantenimiento" value={str(data.tipo_mantenimiento)} />
            <DetailItem icon={<Clock className="h-4 w-4" />} label="Prioridad" value={str(data.prioridad)} />
          </div>

          {data.observaciones && (
            <div className="mt-10 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100">
              <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Observaciones</h3>
              <p className="text-sm leading-relaxed text-slate-600">{str(data.observaciones)}</p>
            </div>
          )}
        </div>
      </div>

      {isCompleted(data.estado) && <FinalizacionDataSection data={data} modulo="mantenimiento" />}

      <FinalizarMantenimientoModal
        isOpen={isFinalizarModalOpen}
        onClose={() => setIsFinalizarModalOpen(false)}
        solicitudId={data.codigo}
        onSuccess={() => {
          setIsFinalizarModalOpen(false);
          onRefresh();
        }}
      />
    </div>
  );
}
