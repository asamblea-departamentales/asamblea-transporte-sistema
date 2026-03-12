import { useState, useRef } from "react";
import { finalizarSolicitud, type FormaPago } from "../../../../services/combustible.service";
import { Spinner } from "./FormUI";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  solicitudId: number;
  onSuccess: () => void;
}

export default function FinalizarCombustibleModal({ isOpen, onClose, solicitudId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formaPago, setFormaPago] = useState<FormaPago>("vale");
  const [valorTotal, setValorTotal] = useState("");
  const [numVale, setNumVale] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valorTotal || archivos.length === 0) {
      setError("Por favor completa el monto y adjunta al menos un comprobante.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await finalizarSolicitud(solicitudId, {
        forma_pago: formaPago,
        valor_total: parseFloat(valorTotal),
        comprobantes: archivos,
        numero_vale_ticket: numVale || undefined
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Error al finalizar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg animate-slide-up overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Finalizar Carga</h3>
            <p className="text-xs font-medium text-slate-500">Registra los datos del comprobante</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Monto y Forma de Pago */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Valor Total ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Forma de Pago</label>
                <select 
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value as FormaPago)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="vale">Vale</option>
                  <option value="ticket">Ticket</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Número de Vale/Ticket */}
            {(formaPago === "vale" || formaPago === "ticket") && (
              <div className="animate-fade-in">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Número de {formaPago}</label>
                <input 
                  type="text"
                  placeholder={`Ej: ${formaPago === 'vale' ? 'V-2024-001' : 'T-98765'}`}
                  value={numVale}
                  onChange={(e) => setNumVale(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            )}

            {/* Subida de Comprobantes */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Comprobantes (Fotos/PDF)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 transition hover:border-emerald-400 hover:bg-emerald-50/10"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg>
                </div>
                <p className="text-sm font-bold text-slate-700">
                  {archivos.length > 0 ? `${archivos.length} archivos seleccionados` : "Haz clic para subir comprobantes"}
                </p>
                <p className="mt-1 text-xs text-slate-400 text-center">Formato JPG, PNG o PDF (Max 5MB)</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,.pdf" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>
              {archivos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {archivos.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600">
                      <span className="truncate max-w-[120px]">{f.name}</span>
                      <button type="button" onClick={() => setArchivos(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? <Spinner className="mx-auto h-5 w-5 text-white" /> : "Confirmar Finalización"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
