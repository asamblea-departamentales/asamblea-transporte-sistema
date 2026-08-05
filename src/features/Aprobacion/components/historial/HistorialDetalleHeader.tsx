import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface HistorialDetalleHeaderProps {
  codigo: string;
  statusInfo: { bg: string; border: string; text: string; dot: string; label: string };
}

export const HistorialDetalleHeader = ({ codigo, statusInfo }: HistorialDetalleHeaderProps) => {
  return (
    <div className="mb-6 border-b border-slate-200 pb-4 mt-2">
      <Link to="/historial" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3">
        <ArrowLeft size={16} /> Volver al Historial
      </Link>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
            Detalle de Solicitud <span className="text-slate-500 font-medium">#{codigo}</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Información completa del proceso.</p>
        </div>
        <span className={`px-4 py-1.5 ${statusInfo.bg} ${statusInfo.border} border rounded-full text-sm font-semibold ${statusInfo.text} flex items-center gap-2 shadow-sm`}>
          <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
          {statusInfo.label}
        </span>
      </div>
    </div>
  );
};
