import { useState, useRef } from "react";
import { finalizarSolicitud, type FormaPago } from "../../../../services/combustible.service";
import { Spinner } from "./FormUI";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  solicitudId: number;
  onSuccess: () => void;
}

const FORMAS_PAGO: { value: FormaPago; label: string; icon: string }[] = [
  { value: "vale", label: "Vale", icon: "🧾" },
  { value: "ticket", label: "Ticket", icon: "🎫" },
  { value: "tarjeta", label: "Tarjeta", icon: "💳" },
  { value: "efectivo", label: "Efectivo", icon: "💵" },
  { value: "otro", label: "Otro", icon: "📄" },
];

export default function FinalizarCombustibleModal({ isOpen, onClose, solicitudId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formaPago, setFormaPago] = useState<FormaPago>("vale");
  const [valorTotal, setValorTotal] = useState("");
  const [numVale, setNumVale] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  //Probando

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // ── Archivos ──────────────────────────────────────────────────────────────

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const MAX_FILES = 5;
    const valid = Array.from(newFiles).filter((f) => {
      const okType = ["image/jpeg", "image/png", "application/pdf"].includes(f.type);
      const okSize = f.size <= 5 * 1024 * 1024; // 5 MB
      return okType && okSize;
    });
    setArchivos((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const merged = [...prev, ...valid.filter((f) => !names.has(f.name))];
      if (merged.length > MAX_FILES) {
        setError(`Máximo ${MAX_FILES} comprobantes por solicitud.`);
        return prev;
      }
      return merged;
    });
  };

  const removeFile = (idx: number) =>
    setArchivos((prev) => prev.filter((_, i) => i !== idx));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!valorTotal || parseFloat(valorTotal) <= 0) {
      setError("Ingresa un monto válido mayor a $0.00");
      return;
    }
    if (archivos.length === 0) {
      setError("Adjunta al menos un comprobante (JPG, PNG o PDF, máx 5 MB).");
      return;
    }

    setLoading(true);
    try {
      await finalizarSolicitud(solicitudId, {
        forma_pago: formaPago,
        valor_total: parseFloat(valorTotal),
        comprobantes: archivos,
        numero_vale_ticket: numVale || undefined,
      });
      // Reset
      setValorTotal("");
      setNumVale("");
      setArchivos([]);
      setFormaPago("vale");
      onSuccess();
    } catch (err: any) {
      const msg =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(" • ")
          : err.response?.data?.message || err.message || "Error al finalizar.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── UI helpers ────────────────────────────────────────────────────────────

  const fileIcon = (f: File) => {
    if (f.type === "application/pdf") return "📄";
    return "🖼️";
  };

  const showNumeroField = formaPago === "vale" || formaPago === "ticket";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-slide-up overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 shadow-md shadow-emerald-200">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Finalizar Carga de Combustible</h3>
              <p className="text-xs font-medium text-slate-500">Registra el comprobante de pago</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-900"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6">

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">

            {/* Forma de Pago — selector visual */}
            <div>
              <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Forma de Pago
              </label>
              <div className="grid grid-cols-5 gap-2">
                {FORMAS_PAGO.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormaPago(value)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition ${formaPago === value
                      ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    <span className="text-xl">{icon}</span>
                    <span className={`text-[10px] font-black ${formaPago === value ? "text-emerald-700" : "text-slate-500"}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Número de Vale/Ticket — condicional */}
            {showNumeroField && (
              <div className="animate-fade-in">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Número de {formaPago === "vale" ? "Vale" : "Ticket"}
                  <span className="ml-1 font-medium normal-case text-slate-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder={formaPago === "vale" ? "Ej: V-2024-001" : "Ej: T-98765"}
                  value={numVale}
                  onChange={(e) => setNumVale(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            )}

            {/* Valor Total */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Valor Total
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-sm font-black text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-8 pr-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            {/* Zona de subida de comprobantes */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Comprobantes
                <span className="ml-1 font-medium normal-case text-slate-400">
                  (JPG, PNG o PDF — máx 5 MB c/u)
                </span>
              </label>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 transition ${dragOver
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-slate-200 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/20"
                  }`}
              >
                <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-1 transition ${dragOver ? "bg-emerald-100 ring-emerald-200 text-emerald-600" : "bg-white ring-slate-100 text-slate-400"}`}>
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">
                  {dragOver ? "Suelta aquí" : "Haz clic o arrastra archivos"}
                </p>
                <p className="mt-1 text-center text-xs text-slate-400">
                  Puedes subir múltiples archivos a la vez
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf"
                  ref={fileInputRef}
                  onChange={(e) => addFiles(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Lista de archivos seleccionados */}
              {archivos.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {archivos.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{fileIcon(f)}</span>
                        <span className="truncate text-xs font-bold text-slate-700">{f.name}</span>
                        <span className="flex-shrink-0 text-[10px] text-slate-400">
                          ({(f.size / 1024).toFixed(0)} KB)
                        </span>
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
              disabled={loading || archivos.length === 0 || !valorTotal}
              className="flex-1 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? <Spinner className="mx-auto h-5 w-5 text-white" />
                : "Confirmar Finalización"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}