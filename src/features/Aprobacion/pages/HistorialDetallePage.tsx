import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, FileText, User, Car, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { axiosClient } from '../../../shared/api/axiosClient';

export default function HistorialDetallePage() {
  const { id } = useParams(); // Esto será el código (ej: TR-2026-000001)
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Intentar comparativa primero (trae más datos: operativo, sistema, solicitud)
        const response = await axiosClient.get(`/solicitudes-transporte/${id}/comparativa`);
        setData(response.data);
      } catch (_err: any) {
        try {
          // Fallback: intentar el show directo
          const response = await axiosClient.get(`/solicitudes-transporte/${id}`);
          setData({ solicitud: response.data.data || response.data });
        } catch (err2: any) {
          setError(err2.response?.data?.message || 'No se pudo cargar el detalle de la solicitud.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#859BFF]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 mb-4 font-medium">{error || 'Solicitud no encontrada'}</p>
        <Link to="/historial" className="text-[#859BFF] hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Volver al Historial
        </Link>
      </div>
    );
  }

  const solicitud = data.solicitud || data;
  const status = (solicitud.status || solicitud.estado || '').toLowerCase();
  
  const isAprobada = status.includes('aprobada') || status.includes('programada');
  const isRechazada = status.includes('rechazada');

  const getStatusColor = () => {
    if (isAprobada) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Aprobada' };
    if (isRechazada) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', label: 'Rechazada' };
    return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-500', label: status };
  };

  const statusInfo = getStatusColor();

  // Determinar si podemos reasignar (solo aprobadas con fecha futura)
  const fechaSalida = solicitud.fechas?.salida ? new Date(solicitud.fechas.salida) : null;
  const canReasignar = isAprobada && fechaSalida && fechaSalida > new Date();

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 border-b border-slate-200 pb-4 mt-2">
        <Link to="/historial" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3">
          <ArrowLeft size={16} /> Volver al Historial
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              Detalle de Solicitud <span className="text-slate-500 font-medium">#{solicitud.id}</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Información completa del viaje procesado.</p>
          </div>
          <span className={`px-4 py-1.5 ${statusInfo.bg} ${statusInfo.border} border rounded-full text-sm font-semibold ${statusInfo.text} flex items-center gap-2 shadow-sm`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card: Datos del Viaje */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-200">
            <FileText className="text-slate-400" size={18} />
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Datos del Viaje</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Solicitante</p>
              <p className="text-sm text-slate-800 font-medium">{solicitud.solicitante || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin size={12} /> Destino
              </p>
              <p className="text-sm text-slate-800 font-medium">{solicitud.destino || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 overflow-hidden rounded-lg">
              <div className="bg-slate-50 p-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Salida
                </p>
                <p className="text-xs text-slate-800 font-medium">
                  {solicitud.fechas?.salida ? new Date(solicitud.fechas.salida).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 p-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Retorno
                </p>
                <p className="text-xs text-slate-800 font-medium">
                  {solicitud.fechas?.retorno ? new Date(solicitud.fechas.retorno).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock size={12} /> Horas Estimadas
              </p>
              <p className="text-sm text-slate-800 font-medium">{solicitud.horas_estimadas || 0} hrs</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Motivo</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                "{solicitud.motivo || 'Sin motivo'}"
              </p>
            </div>
          </div>
        </div>

        {/* Card: Asignación Actual */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-200">
            {isAprobada ? <CheckCircle className="text-emerald-500" size={18} /> : <XCircle className="text-red-500" size={18} />}
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">
              {isAprobada ? 'Asignación Aprobada' : 'Decisión Final'}
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Decisión</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${isAprobada ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {solicitud.decision_final || status}
              </span>
            </div>

            {/* Motorista asignado */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User size={12} /> Motorista Asignado
              </p>
              <p className="text-sm text-slate-800 font-medium">
                {data.operativo?.motorista?.nombre || solicitud.motorista_nombre || 'Sin asignar'}
              </p>
            </div>

            {/* Vehículo asignado */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Car size={12} /> Vehículo Asignado
              </p>
              <p className="text-sm text-slate-800 font-medium">
                {data.operativo?.vehiculo?.placa || solicitud.vehiculo_placa || 'Sin asignar'}
              </p>
              {(data.operativo?.vehiculo?.marca || solicitud.vehiculo_marca) && (
                <p className="text-xs text-slate-500">
                  {data.operativo?.vehiculo?.marca || solicitud.vehiculo_marca}
                </p>
              )}
            </div>

            {/* Comentario del Jefe */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Comentario del Jefe</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                "{solicitud.comentario_jefe || 'Sin comentario'}"
              </p>
            </div>
          </div>

          {/* Botón de Reasignar */}
          {canReasignar && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => alert('El endpoint PUT /reasignar aún no está disponible en el backend. Cuando esté listo, este botón abrirá un modal para seleccionar nuevo motorista y vehículo.')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#3b32c9] text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
              >
                <RefreshCw size={18} />
                Reasignar Motorista / Vehículo
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Puedes cambiar la asignación antes de la fecha de salida.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
