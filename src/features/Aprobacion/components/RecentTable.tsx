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
    return <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-600 rounded-full text-xs font-bold shadow-sm">Pre-Aprobada</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="font-title font-bold text-lg text-slate-800">Bandeja de Autorización</h3>
            <p className="text-xs text-slate-500">Solicitudes validadas por operaciones en espera de tu firma final.</p>
          </div>
        </div>
        <span className="bg-[#859BFF] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {preAprobadas.length} pendientes
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-100">
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">CÓDIGO</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">FECHA SALIDA</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">TIPO</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">ACCIÓN REQUERIDA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i}>
                  <td className="py-5 px-6"><div className="h-4 bg-slate-100 rounded w-20 animate-pulse"></div></td>
                  <td className="py-5 px-6"><div className="h-4 bg-slate-100 rounded w-24 animate-pulse"></div></td>
                  <td className="py-5 px-6"><div className="h-4 bg-slate-100 rounded w-20 animate-pulse"></div></td>
                  <td className="py-5 px-6"><div className="h-8 bg-slate-100 rounded-lg w-28 animate-pulse"></div></td>
                </tr>
              ))
            ) : preAprobadas.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <ShieldAlert size={48} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-slate-500 font-medium">Bandeja limpia</p>
                  <p className="text-sm text-slate-400">No hay solicitudes pendientes de tu autorización.</p>
                </td>
              </tr>
            ) : (
              preAprobadas.map((req, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => navigate(`/aprobaciones/${req.id || req.code}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6">
                    <span className="font-bold text-[#859BFF] group-hover:text-indigo-600 transition-colors">{req.code}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-600 font-medium">{req.date}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-500">{req.type}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(req.status)}
                      <span className="text-xs font-bold text-[#859BFF] opacity-0 group-hover:opacity-100 transition-opacity">
                        Revisar →
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
