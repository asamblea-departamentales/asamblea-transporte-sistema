import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { finalizarMantenimiento } from "../../../../services/mantenimiento.service";
import { finalizarMantenimientoSchema, type FinalizarMantenimientoFormValues } from "../../../../schemas/requests.schema";
import { Spinner } from "../../Combustible/components/FormUI";
import { FocusTrap } from "../../../../components/ui/FocusTrap";
import { getTodayLocal } from "../../../../lib/format";
import { ALLOWED_FILE_ACCEPT, ALLOWED_FILE_MIME, MAX_FILE_SIZE_BYTES } from "../../../../constants/requests.constants";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  solicitudId: string | number;
  onSuccess: () => void;
}

export default function FinalizarMantenimientoModal({ isOpen, onClose, solicitudId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FinalizarMantenimientoFormValues>({
    resolver: zodResolver(finalizarMantenimientoSchema),
    defaultValues: {
      fechaRealizada: getTodayLocal(),
      costoReal: undefined,
      archivos: [],
    },
  });

  const archivos = watch("archivos") || [];

  if (!isOpen) return null;

  // ── Archivos ──────────────────────────────────────────────────────────────
  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter((f) => {
      const okType = ALLOWED_FILE_MIME.includes(f.type as typeof ALLOWED_FILE_MIME[number]);
      const okSize = f.size <= MAX_FILE_SIZE_BYTES; // 5 MB
      return okType && okSize;
    });

    const currentFiles = watch("archivos") || [];
    const names = new Set(currentFiles.map((f) => f.name));
    const merged = [...currentFiles, ...valid.filter((f) => !names.has(f.name))];
    
    setValue("archivos", merged, { shouldValidate: true });
  };

  const removeFile = (idx: number) => {
    const currentFiles = watch("archivos") || [];
    setValue("archivos", currentFiles.filter((_, i) => i !== idx), { shouldValidate: true });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (data: FinalizarMantenimientoFormValues) => {
    setGlobalError(null);
    setLoading(true);

    try {
      await finalizarMantenimiento(solicitudId, {
        fecha_realizada: data.fechaRealizada,
        costo_real: data.costoReal,
        adjuntos: data.archivos,
      });
      reset();
      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.errors
        ? Object.values(axiosErr.response.data.errors).flat().join(" • ")
        : axiosErr?.response?.data?.message || axiosErr?.message || "Error al finalizar.";
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── UI helpers ────────────────────────────────────────────────────────────
  const fileIcon = (f: File) => (f.type === "application/pdf" ? "📄" : "🖼️");

  return (
    <FocusTrap onEscape={loading ? undefined : onClose}>
      <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={loading ? undefined : onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-lg animate-slide-up overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl" role="dialog" aria-modal="true" aria-label="Finalizar mantenimiento">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 shadow-md shadow-emerald-200">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Finalizar Mantenimiento</h3>
              <p className="text-xs font-medium text-slate-500">Registra el costo de la operación</p>
            </div>
          </div>
          <button
            onClick={loading ? undefined : onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-900"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[80vh] overflow-y-auto p-6">
          {/* Global Error */}
          {globalError && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{globalError}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Fecha de Ejecución */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Fecha de Ejecución
              </label>
              <input
                type="date"
                max={getTodayLocal()}
                {...register("fechaRealizada")}
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm font-bold shadow-sm outline-none transition focus:ring-4 ${
                  errors.fechaRealizada ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                }`}
              />
              {errors.fechaRealizada && <p className="mt-2 text-xs text-red-500">{errors.fechaRealizada.message}</p>}
            </div>

            {/* Costo / Valor Total */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Costo Final
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-sm font-black text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("costoReal", { valueAsNumber: true })}
                  className={`w-full rounded-2xl border bg-white py-3 pl-8 pr-4 text-sm font-bold shadow-sm outline-none transition focus:ring-4 ${
                    errors.costoReal ? "border-red-400 focus:ring-red-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                  }`}
                />
              </div>
              {errors.costoReal && <p className="mt-2 text-xs text-red-500">{errors.costoReal.message}</p>}
            </div>

            {/* Dropzone Archivos */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Comprobantes
                <span className="ml-1 font-medium normal-case text-slate-400">(JPG, PNG o PDF — máx 5 MB c/u)</span>
              </label>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 transition ${
                  dragOver
                    ? "border-emerald-400 bg-emerald-50"
                    : errors.archivos
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/20"
                }`}
              >
                <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-1 transition ${
                  dragOver ? "bg-emerald-100 ring-emerald-200 text-emerald-600" : "bg-white ring-slate-100 text-slate-400"
                }`}>
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">
                  {dragOver ? "Suelta aquí" : "Haz clic o arrastra archivos"}
                </p>
                <p className="mt-1 text-center text-xs text-slate-400">Puedes subir múltiples archivos a la vez</p>
                <input
                  type="file"
                  multiple
                  accept={ALLOWED_FILE_ACCEPT}
                  ref={fileInputRef}
                  onChange={(e) => addFiles(e.target.files)}
                  className="hidden"
                />
              </div>
              {errors.archivos && <p className="mt-2 text-xs text-red-500">{errors.archivos.message}</p>}

              {/* Lista de archivos */}
              {archivos.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {archivos.map((f, i) => (
                    <li key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{fileIcon(f)}</span>
                        <span className="truncate text-xs font-bold text-slate-700">{f.name}</span>
                        <span className="flex-shrink-0 text-[10px] text-slate-400">({(f.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="ml-2 flex-shrink-0 rounded-lg p-1 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Spinner className="mx-auto h-5 w-5 text-white" /> : "Confirmar Finalización"}
            </button>
          </div>
        </form>
      </div>
      </div>
    </FocusTrap>
  );
}
