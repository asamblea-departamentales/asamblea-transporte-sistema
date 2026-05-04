import { useState, useEffect } from "react";
import {
  getDisponibilidad,
  reportarDisponibilidad,
} from "../services/disponibilidad.service";

export default function IncapacidadPage() {
  const [activo, setActivo] = useState<boolean>(true);
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDisponibilidad()
      .then((d) => {
        setActivo(d.activo);
        setMotivo(d.motivo ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!activo && !motivo.trim()) {
      setError("Debes ingresar un motivo para reportar incapacidad.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await reportarDisponibilidad(activo, motivo.trim());
      setSuccess(true);
    } catch {
      setError("No se pudo guardar el estado. Intente de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Cargando estado...
        </div>
      </div>
    );
  }

  const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; }`}</style>
      <div className="p-4 md:p-8 w-full max-w-lg mx-auto" style={{ fontFamily: FONT }}>
        
        <div className="flex items-end justify-between mb-7 gap-4 flex-wrap">
          <div>
            <p className="m-0 text-[11px] font-bold text-slate-400 tracking-[0.08em] uppercase">Asamblea Legislativa · Transporte</p>
            <h1 className="m-0 mt-1 mb-1 text-2xl md:text-3xl font-extrabold text-[#0f172a] tracking-tight leading-tight">Disponibilidad</h1>
            <p className="m-0 text-[13.5px] text-slate-500 font-medium">Informa tu estado para la asignación de viajes</p>
          </div>
        </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-6">

        {/* Toggle de estado */}
        <div>
          <p className="text-sm font-bold text-slate-700 mb-3">Estado de disponibilidad</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Disponible */}
            <button
              onClick={() => { setActivo(true); setError(null); setSuccess(false); }}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 py-5 px-3 transition-all ${
                activo
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300"
              }`}
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-bold">Disponible</span>
              <span className="text-xs opacity-70 text-center">Puedo trabajar con normalidad</span>
            </button>

            {/* No disponible */}
            <button
              onClick={() => { setActivo(false); setError(null); setSuccess(false); }}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 py-5 px-3 transition-all ${
                !activo
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300"
              }`}
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span className="text-sm font-bold">No disponible</span>
              <span className="text-xs opacity-70 text-center">Enfermedad u otro motivo</span>
            </button>
          </div>
        </div>

        {/* Campo de motivo */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Motivo
            {!activo && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            rows={3}
            value={motivo}
            onChange={(e) => { setMotivo(e.target.value); setError(null); setSuccess(false); }}
            placeholder={activo ? "Opcional — cualquier nota adicional" : "Describe brevemente el motivo..."}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-[#0f2548]/30 focus:border-[#0f2548] transition resize-none"
          />
        </div>

        {/* Mensajes de feedback */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Estado guardado correctamente.
          </div>
        )}

        {/* Botón guardar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-[#0f2548] px-5 py-3.5 text-sm font-extrabold tracking-widest text-white
            shadow-lg shadow-[#0f2548]/20 transition hover:brightness-110 active:scale-[0.99]
            disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "GUARDANDO..." : "GUARDAR ESTADO"}
        </button>
      </div>
    </div>
    </>
  );
}
