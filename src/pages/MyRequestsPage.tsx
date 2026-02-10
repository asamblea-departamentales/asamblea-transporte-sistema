import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllRequests,
  completeRequest, // <--- Importamos la nueva función
  type Request,
} from "../services/requests.service";

// --- COMPONENTE DE DETALLE ---
function RequestDetailRow({ 
    request, 
    onComplete 
}: { 
    request: Request; 
    onComplete: (id: number) => Promise<void>; // Recibimos la función del padre
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCompleteClick = async () => {
    if (!confirm("¿Confirmas que el viaje ha finalizado y se ha completado?")) return;
    
    setIsUpdating(true);
    try {
        await onComplete(request.id);
    } catch (error) {
        console.error(error);
        alert("Error al completar la solicitud.");
    } finally {
        setIsUpdating(false);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <tr className="bg-slate-50/50 border-b border-slate-100 animate-fadeIn cursor-default">
      <td colSpan={4} className="px-0 py-0">
        <div className="border-t border-slate-200 bg-slate-50 p-6 shadow-inner">
            <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                
                {/* Cabecera con Botón de Acción */}
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold text-slate-800">Detalle de Solicitud #{request.codigo}</h3>
                    
                    {/* --- BOTÓN FINALIZAR (Solo aparece si está programada) --- */}
                    {request.estado === 'programada' && (
                        <button 
                            onClick={handleCompleteClick}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition-all shadow-md
                                ${isUpdating 
                                    ? 'bg-slate-400 cursor-not-allowed' 
                                    : 'bg-slate-800 hover:bg-black hover:shadow-lg hover:-translate-y-0.5'
                                }`}
                        >
                            {isUpdating ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Finalizar Viaje
                                </>
                            )}
                        </button>
                    )}
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

  const handleRowClick = (req: Request) => {
    if (expandedId === req.id) {
      setExpandedId(null);
      setExpandedRequest(null);
      return;
    }
    setExpandedId(req.id);
    setExpandedRequest(req); 
  };

  // --- LÓGICA DE ACTUALIZACIÓN ---
  const handleCompleteRequest = async (id: number) => {
    // 1. Llamar a la API
    await completeRequest(id);

    // 2. Actualizar estado LOCALMENTE (sin F5)
    setRequests(current => 
        current.map(req => 
            req.id === id ? { ...req, estado: 'completada' } : req
        )
    );

    // 3. Actualizar el detalle abierto
    if (expandedRequest && expandedRequest.id === id) {
        setExpandedRequest({ ...expandedRequest, estado: 'completada' });
    }
  };

  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pendiente') return "bg-amber-100 text-amber-700 border-amber-200";
    if (s === 'aprobada') return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s === 'programada') return "bg-purple-100 text-purple-700 border-purple-200";
    if (s === 'completada' || s === 'finalizada') return "bg-slate-800 text-white border-slate-600"; // Estilo oscuro
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
                             {/* Check verde si está completada */}
                             {(req.estado === 'completada' || req.estado === 'finalizada') && (
                                <svg className="mr-1 h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {req.estado}
                        </span>
                    </td>
                  </tr>
                  
                  {expandedId === req.id && expandedRequest && (
                    <RequestDetailRow 
                        request={expandedRequest} 
                        onComplete={handleCompleteRequest} // <--- Pasamos la función
                    />
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