import { useState, useRef } from "react";
import { finalizarMantenimiento } from "../../../../services/mantenimiento.service";
import { Spinner } from "../../Combustible/components/FormUI";
import { 
  CheckCircle2, X, UploadCloud, FileText, 
  FileImage, CalendarDays, Banknote, AlertTriangle 
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  solicitudId: number;
  onSuccess: () => void;
}

export default function FinalizarMantenimientoModal({ isOpen, onClose, solicitudId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fechaRealizada, setFechaRealizada] = useState("");
  const [costoReal, setCostoReal] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // ── Archivos ──────────────────────────────────────────────────────────────
  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter((f) => {
      const okType = ["image/jpeg", "image/png", "application/pdf"].includes(f.type);
      const okSize = f.size <= 5 * 1024 * 1024;
      return okType && okSize;
    });
    setArchivos((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !names.has(f.name))];
    });
  };

  const removeFile = (idx: number) => setArchivos((prev) => prev.filter((_, i) => i !== idx));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fechaRealizada) { setError("Indique la fecha de ejecución técnica."); return; }
    if (!costoReal || parseFloat(costoReal) < 0) { setError("El monto debe ser válido (0 o superior)."); return; }
    if (archivos.length === 0) { setError("Se requiere al menos un soporte gráfico o documento (PDF/JPG/PNG)."); return; }

    setLoading(true);
    try {
      await finalizarMantenimiento(solicitudId, {
        fecha_realizada: fechaRealizada,
        costo_real: parseFloat(costoReal),
        adjuntos: archivos,
      });
      setFechaRealizada("");
      setCostoReal("");
      setArchivos([]);
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(" • ")
        : err.response?.data?.message || err.message || "Incidencia al certificar el registro.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── UI helpers ────────────────────────────────────────────────────────────
  const fileIcon = (f: File) => f.type === "application/pdf" ? <FileText className="h-5 w-5" /> : <FileImage className="h-5 w-5" />;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4 animate-fade-in font-sans">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={loading ? undefined : onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden animate-slide-up rounded-t-[2rem] border border-white/20 bg-white shadow-2xl sm:rounded-[2rem] flex flex-col max-h-[90vh]">
        
        {/* Header Premium */}
        <div className="flex items-center justify-between border-b border-white/40 bg-gradient-to-br from-violet-50/90 to-fuchsia-50/50 px-6 py-5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-violet-100/50">
               <CheckCircle2 className="h-6 w-6 text-violet-600 drop-shadow-sm" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[17px] font-black tracking-tight text-slate-900">Validar Ejecución</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600/70 mt-0.5">Mantenimiento Concluido</p>
            </div>
          </div>
          <button
            onClick={loading ? undefined : onClose}
            disabled={loading}
            className="rounded-full p-2.5 text-slate-400 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm active:scale-95 disabled:opacity-50"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-7 bg-slate-50/30">

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3.5 rounded-2xl border border-red-200/80 bg-red-50 p-4 shadow-sm animate-shake">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" strokeWidth={2.5} />
              <p className="text-[13px] font-semibold tracking-wide text-red-800 leading-snug">{error}</p>
            </div>
          )}

          {/* Fecha y Costo (Grid on Desktop, Stack on Mobile) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                Fecha de Ejecución
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  value={fechaRealizada}
                  onChange={(e) => setFechaRealizada(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/80 bg-white py-3.5 pl-11 pr-4 text-sm font-bold text-slate-900 shadow-sm transition-all focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/15"
                />
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                Inversión / Costo final
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Banknote className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={costoReal}
                  onChange={(e) => setCostoReal(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/80 bg-white py-3.5 pl-11 pr-12 text-sm font-bold text-slate-900 font-mono shadow-sm transition-all focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/15"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[11px] font-black text-slate-400">
                  USD
                </div>
              </div>
            </div>
          </div>

          {/* Dropzone Archivos */}
          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-500">
              Soportes Documentales
              <span className="ml-1.5 font-semibold normal-case text-slate-400 tracking-normal">
                (Facturas / Evidencias)
              </span>
            </label>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative mt-2 flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed p-8 transition-all duration-300 ${
                dragOver
                  ? "border-violet-400 bg-violet-50/50 scale-[1.02] shadow-inner"
                  : "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30 hover:shadow-sm"
              }`}
            >
              <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-3xl transition-all duration-300 ${
                dragOver 
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30 scale-110 rotate-3" 
                  : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-violet-100 group-hover:text-violet-600 group-hover:scale-110"
              }`}>
                <UploadCloud className="h-7 w-7" strokeWidth={2.5} />
              </div>
              <p className="text-[13px] font-black text-slate-700">
                {dragOver ? "Suelta los archivos ahora" : "Cargar desde el dispositivo"}
              </p>
              <p className="mt-1.5 text-center text-[11px] font-semibold text-slate-400 tracking-wide">
                Toque aquí o arrastre. Límite 5MB por archivo.
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

            {/* File List */}
            {archivos.length > 0 && (
              <ul className="mt-4 space-y-2.5">
                {archivos.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-2xl bg-white p-3 pr-2 ring-1 ring-slate-100 shadow-sm animate-fade-in group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pl-1">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                        f.type === "application/pdf" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                      }`}>
                         {fileIcon(f)}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="truncate text-xs font-bold text-slate-700">{f.name}</p>
                         <p className="text-[10px] font-semibold text-slate-400">{(f.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="ml-2 flex-shrink-0 rounded-xl p-2 text-red-400 opacity-60 transition-all hover:bg-red-50 hover:text-red-700 hover:opacity-100 active:scale-95"
                    >
                      <X className="h-4 w-4" strokeWidth={3} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>
        
        {/* Sticky Actions Footer */}
        <div className="border-t border-slate-100 bg-white p-5 sm:px-8 sm:py-6">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto rounded-2xl border-2 border-slate-200 bg-white py-3.5 sm:px-8 text-[13px] font-black uppercase tracking-wider text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || archivos.length === 0 || !costoReal || !fechaRealizada}
              className="group flex-1 w-full relative flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-[13px] font-black uppercase tracking-wider text-white shadow-lg shadow-violet-200 transition-all hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <Spinner className="h-5 w-5 text-white/70" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 transition-transform group-hover:scale-110" /> 
                  Certificar Finalización
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
