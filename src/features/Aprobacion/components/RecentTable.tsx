import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RecentRequest } from '../api/dashboardApi';
import { ShieldAlert } from 'lucide-react';

interface RecentTableProps {
  requests: RecentRequest[];
  isLoading: boolean;
}

export const RecentTable: React.FC<RecentTableProps> = ({ requests, isLoading }) => {
  const navigate = useNavigate();

  // Filtrar solo las solicitudes pre-aprobadas, ya que al Jefe solo le interesan estas para aprobar
  const preAprobadas = requests.filter(req => req.status.toLowerCase().includes('pre_aprobada') || req.status.toLowerCase().includes('pre'));

  const getStatusBadge = (_status: string) => {
    return <span className="px-2.5 py-1 bg-amber-100 border border-amber-200 text-amber-800 rounded text-[11px] font-bold uppercase tracking-wider shadow-sm">Pre-Aprobada</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-700 rounded text-sm border border-amber-200">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-md tracking-tight">Bandeja de Autorización</h3>
            <p className="text-xs text-slate-500 mt-0.5">Solicitudes validadas por operaciones en espera de tu firma final.</p>
          </div>
        </div>
        <span className="bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wider shadow-sm">
          {preAprobadas.length} pendientes
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-3 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">CÓDIGO</th>
              <th className="py-3 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">FECHA SALIDA</th>
              <th className="py-3 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">TIPO</th>
              <th className="py-3 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">ACCIÓN REQUERIDA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i}>
                  <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-20 animate-pulse"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-24 animate-pulse"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-20 animate-pulse"></div></td>
                  <td className="py-4 px-6"><div className="h-6 bg-slate-100 rounded w-28 animate-pulse ml-auto"></div></td>
                </tr>
              ))
            ) : preAprobadas.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <ShieldAlert size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-600 font-semibold text-sm">Bandeja limpia</p>
                  <p className="text-xs text-slate-400 mt-1">No hay solicitudes pendientes de tu autorización.</p>
                </td>
              </tr>
            ) : (
              preAprobadas.map((req, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => navigate(`/aprobaciones/${req.id || req.code}`)}
                  className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer group"
                >
                  <td className="py-4 px-6">
                    <span className="font-bold text-primary group-hover:text-primary-hover transition-colors">{req.code}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-600 font-medium">{req.date}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-500">{req.type}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-4">
                      {getStatusBadge(req.status)}
                      <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Revisar <span className="text-lg leading-none">&rarr;</span>
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
