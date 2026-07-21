import { useState } from "react";
import { Receipt, CreditCard, DollarSign, Ticket, FileText, CalendarCheck, Hash } from "lucide-react";
import Lightbox from "../../../components/ui/Lightbox";
import { getStorageUrl } from "../../../lib/api";
import { formatCurrency } from "../../../lib/format";

export type GenericRequest = {
  id: number;
  codigo: string;
  estado: string;
  solicitante_id?: number | string;
  created_at?: string;
  updated_at?: string;
  solicitante?: { id?: number | string; name?: string; nombre?: string };
  unidad?: { id?: number | string; nombre?: string };
  vehiculo?: { id?: number; placa?: string; marca?: unknown; modelo?: unknown } | null;
  motorista?: { id?: number; nombre?: string } | null;
  observaciones?: string | null;
  prioridad?: string;
  motivo_actividad?: string;
  origen?: string;
  punto_salida?: string;
  origen_lat?: number | null;
  origen_lng?: number | null;
  destino?: string;
  destino_principal?: string;
  destino_lat?: number | null;
  destino_lng?: number | null;
  destino_adicional_lat?: number | null;
  destino_adicional_lng?: number | null;
  fecha_salida?: string;
  cantidad_personas?: number;
  descripcion?: string;
  tipo_mantenimiento?: string | { id?: number; nombre?: string } | null;
  fecha_sugerida?: string;
  fecha_realizada?: string | null;
  costo_real?: number | string | null;
  adjuntos?: string[] | null;
  destino_actividad?: string;
  fecha_solicitud?: string;
  cantidad_combustible?: number;
  cantidad_vales?: number | null;
  correlativo_inicio?: number | null;
  correlativo_fin?: number | null;
  forma_pago?: string | null;
  valor_total?: number | string | null;
  numero_vale_ticket?: string | null;
  comprobantes?: string[] | null;
  destino_adicional?: string | null;
};

export function str(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const n = obj.nombre ?? obj.name;
    return typeof n === "string" ? n : String(value);
  }
  return String(value);
}

export function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: unknown }) {
  return (
    <div className="group relative flex items-start gap-3 rounded-2xl bg-slate-50/60 p-4 transition hover:bg-slate-100/80">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/60">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-[13px] font-bold leading-snug text-slate-800">{str(value)}</p>
      </div>
    </div>
  );
}

export function InfoChip({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-4 py-3.5 ring-1 ring-slate-100">
      {icon && <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/50">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

const FORMA_PAGO_MAP: Record<string, { label: string; Icon: typeof Receipt }> = {
  carga: { label: "Carga", Icon: Receipt },
  ticket: { label: "Ticket", Icon: Ticket },
  tarjeta: { label: "Tarjeta", Icon: CreditCard },
  efectivo: { label: "Efectivo", Icon: DollarSign },
  otro: { label: "Otro", Icon: FileText },
};



function isImage(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path);
}

export function FinalizacionDataSection({ data, modulo }: { data: GenericRequest; modulo: string }) {
  const isCombustible = modulo === "combustible";
  const isMantenimiento = modulo === "mantenimiento";
  const isTransporte = modulo === "transporte";

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const hasData =
    (isCombustible && (data.forma_pago || data.valor_total || data.comprobantes?.length)) ||
    (isMantenimiento && (data.fecha_realizada || data.costo_real != null || data.adjuntos?.length)) ||
    isTransporte;

  const archivos: string[] = isCombustible ? (data.comprobantes ?? []) : isMantenimiento ? (data.adjuntos ?? []) : [];

  const lightboxFiles = archivos.map((path) => ({
    url: getStorageUrl(path),
    name: path.split("/").pop() ?? "archivo",
    isImage: isImage(path),
  }));

  if (!hasData) return null;

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  const accentColor = isCombustible ? "bg-amber-500" : isMantenimiento ? "bg-emerald-500" : "bg-blue-500";

  return (
    <section className="animate-fade-in-up">
      <h2 className="mb-4 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-widest text-slate-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Datos de Finalización
      </h2>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className={`h-1.5 w-full ${accentColor}`} />
        <div className="p-6 md:p-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {isCombustible && (
              <>
                {data.forma_pago && (() => {
                  const key = String(data.forma_pago) as keyof typeof FORMA_PAGO_MAP;
                  const PayIcon = FORMA_PAGO_MAP[key]?.Icon ?? Receipt;
                  return <InfoChip label="Forma de Pago" value={FORMA_PAGO_MAP[key]?.label ?? String(data.forma_pago)} icon={<PayIcon className="h-4 w-4" />} />;
                })()}
                {data.valor_total != null && <InfoChip label="Valor Total" value={formatCurrency(data.valor_total)} icon={<DollarSign className="h-4 w-4" />} />}
                {data.numero_vale_ticket && <InfoChip label="Nº Vale / Ticket" value={data.numero_vale_ticket} icon={<Hash className="h-4 w-4" />} />}
              </>
            )}
            {isMantenimiento && (
              <>
                {data.fecha_realizada && <InfoChip label="Fecha Realizada" value={new Date(data.fecha_realizada).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })} icon={<CalendarCheck className="h-4 w-4" />} />}
                {data.costo_real != null && <InfoChip label="Costo Real" value={formatCurrency(data.costo_real)} icon={<DollarSign className="h-4 w-4" />} />}
              </>
            )}
            {isTransporte && data.updated_at && <InfoChip label="Fecha Finalización" value={new Date(data.updated_at).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} icon={<CalendarCheck className="h-4 w-4" />} />}
          </div>

          {archivos.length > 0 && (
            <div className="mt-8">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {isCombustible ? "Comprobantes adjuntos" : "Archivos adjuntos"}
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-500">{archivos.length}</span>
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {archivos.map((path: string, i: number) => {
                  const url = getStorageUrl(path);
                  const name = path.split("/").pop() ?? `archivo-${i + 1}`;
                  if (isImage(path)) {
                    return (
                      <button key={i} type="button" onClick={() => openLightbox(i)} className="group relative overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200/80 transition-all hover:shadow-lg hover:ring-slate-300 text-left cursor-pointer">
                        <div className="aspect-square bg-slate-100">
                          <img src={url} alt={name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        </div>
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex w-full items-center justify-between p-3">
                            <span className="truncate text-xs font-semibold text-white/90">{name}</span>
                            <svg className="h-4 w-4 flex-shrink-0 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    );
                  }
                  return (
                    <button key={i} type="button" onClick={() => openLightbox(i)} className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 ring-1 ring-slate-200/80 transition-all hover:bg-slate-100 hover:shadow-md hover:ring-slate-300 cursor-pointer">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/60 transition group-hover:shadow-md">
                        <FileText className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="w-full px-3 text-center">
                        <p className="truncate text-xs font-bold text-slate-600 group-hover:text-slate-800">{name}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">Clic para ver</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {lightboxOpen && lightboxFiles.length > 0 && <Lightbox files={lightboxFiles} initialIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}
    </section>
  );
}
