import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRequestById } from "../../services/requests.service";
import { getMantenimientoById } from "../../services/mantenimiento.service";
import { getSolicitudCombustible } from "../../services/combustible.service";
import { Spinner } from "./Combustible/components/FormUI";
import { useAuth } from "../../auth/AuthContext";

import DetalleCombustible from "./DetalleCombustible";
import DetalleMantenimiento from "./DetalleMantenimiento";
import DetalleTransporte from "./DetalleTransporte";
import type { GenericRequest } from "./components/SharedDetailComponents";
export default function RequestDetailPage() {
  const { modulo, id } = useParams<{ modulo: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GenericRequest | null>(null);

  const fetchData = async () => {
    if (!modulo || !id) return;
    setLoading(true);
    setError(null);
    try {
      let res;
      if (modulo === "transporte") res = await getRequestById(id);
      else if (modulo === "mantenimiento") res = await getMantenimientoById(id);
      else if (modulo === "combustible") res = await getSolicitudCombustible(id);

      if (!res) throw new Error("No se encontró la solicitud");
      
      const raw = res as any;
      const normalized: GenericRequest = {
        ...raw,
        origen: raw.origen || raw.punto_salida,
        destino: raw.destino || raw.destino_principal || raw.destino_actividad,
      };
      
      setData(normalized);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar el detalle";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [modulo, id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Spinner className="h-10 w-10 text-slate-400" />
        <p className="animate-pulse text-sm font-medium text-slate-500">Cargando información...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center animate-fade-in-up">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">¡Ops! Algo salió mal</h2>
        <p className="mt-2 text-slate-500">{error || "No pudimos encontrar la solicitud solicitada."}</p>
        <button onClick={() => navigate("/mis-solicitudes")} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
          Volver al historial
        </button>
      </div>
    );
  }

  const isOwner = Number(data.solicitante_id) === Number(user?.id);

  if (modulo === "combustible") return <DetalleCombustible data={data} isOwner={isOwner} onRefresh={fetchData} />;
  if (modulo === "mantenimiento") return <DetalleMantenimiento data={data} isOwner={isOwner} onRefresh={fetchData} />;
  if (modulo === "transporte") return <DetalleTransporte data={data} isOwner={isOwner} onRefresh={fetchData} />;

  return (
    <div className="text-center p-10 text-red-500 font-bold">
      Módulo desconocido: {modulo}
    </div>
  );
}