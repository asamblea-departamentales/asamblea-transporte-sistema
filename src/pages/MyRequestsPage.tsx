import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllRequests,
  type Request,
} from "../services/requests.service";

// --- COMPONENTE DE DETALLE (Reutilizamos tu diseño) ---
function RequestDetailRow({ request }: { request: Request }) {
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <tr className="bg-slate-50/50 border-b border-slate-100 animate-fadeIn">
      <td colSpan={4} className="px-0 py-0">
        <div className="border-t border-slate-200 bg-slate-50 p-6 shadow-inner">
            <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold text-slate-800">Detalle de Solicitud #{request.codigo}</h3>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Bloque 1: Ruta */}
                    <div>
                        <h4 className="mb-2 text-xs font-black uppercase text-slate-500">Ruta</h4>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-2">
                                <div className="mt-1 h-2 w-2 rounded-full bg-green-500"/>
                                <div>
                                    <span className="block text-xs text-slate-500">Origen</span>
                                    <span className="font-medium text-slate-900">{request.origen}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="mt-1 h-2 w-2 rounded-full bg-red-500"/>
                                <div>
                                    <span className="block text-xs text-slate-500">Destino</span>
                                    <span className="font-medium text-slate-900">{request.destino}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bloque 2: Info Adicional */}
                    <div>
                        <h4 className="mb-2 text-xs font-black uppercase text-slate-500">Datos Generales</h4>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-semibold text-slate-700">Pasajeros:</span> {request.cantidad_personas}</p>
                            <p><span className="font-semibold text-slate-700">Motivo:</span> {request.motivo_actividad}</p>
                            {/* Verificamos si existe la unidad antes de mostrarla */}
                            {request.unidad && <p><span className="font-semibold text-slate-700">Unidad:</span> {request.unidad.nombre}</p>}
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 flex justify-end text-xs text-slate-400">
                    Creado el {formatFecha(request.created_at)}
                </div>
            </div>
        </div>
      </td>
    </tr>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-50">
      <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="ml-auto h-6 w-24 rounded-full bg-slate-100" /></td>
    </tr>
  );
}

export default function RecentRequestsWidget() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  
  // Estado para la expansión
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // SOLUCIÓN: Usamos el objeto directo, no hacemos otra petición
  const [expandedRequest, setExpandedRequest] = useState<Request | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllRequests({ page: 1, per_page: 5 }); 
        setRequests(data.data);
      } catch (e) {
        console.error("Error cargando solicitudes", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // --- FUNCIÓN CLAVE CORREGIDA ---
  // Recibe el objeto completo 'req', no solo el ID
  const handleRowClick = (req: Request) => {
    // Si ya está abierto, lo cerramos
    if (expandedId === req.id) {
      setExpandedId(null);
      setExpandedRequest(null);
      return;
    }

    // Si no está abierto, LO ABRIMOS DIRECTAMENTE
    // Sin llamar a getRequestById (evitando el error 403)
    setExpandedId(req.id);
    setExpandedRequest(req); 
  };

  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pendiente') return "bg-amber-100 text-amber-700 border-amber-200";
    if (s === 'aprobada') return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s === 'programada') return "bg-slate-100 text-slate-600 border-slate-200";
    if (s === 'rechazada') return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="w-full bg-white font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">Solicitudes Recientes</h2>
          <p className="mt-1 text-sm text-slate-500">Últimas solicitudes registradas en el sistema</p>
        </div>
        <button 
            onClick={() => navigate('/todas-las-solicitudes')}
            className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
            Ver todas
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Tipo de Solicitud</th>
              <th className="px-6 py-4 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : (
              requests.map((req) => (
                <>
                  <tr 
                    key={req.id} 
                    // AQUÍ ESTÁ EL CAMBIO: Pasamos 'req' completo
                    onClick={() => handleRowClick(req)} 
                    className={`cursor-pointer transition-all hover:bg-slate-50 ${expandedId === req.id ? 'bg-slate-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100" />
                            <span className="font-bold text-slate-900">{req.codigo}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-600">
                            {new Date(req.fecha_salida).toISOString().slice(0, 16).replace('T', ' ')}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">Transporte</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${getStatusStyles(req.estado)}`}>
                            {req.estado}
                        </span>
                    </td>
                  </tr>
                  
                  {expandedId === req.id && expandedRequest && (
                    <RequestDetailRow request={expandedRequest} />
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}