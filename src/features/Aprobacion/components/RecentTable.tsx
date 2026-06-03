import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RecentRequest } from '../api/dashboardApi';

interface RecentTableProps {
  requests: RecentRequest[];
  isLoading: boolean;
}

export const RecentTable: React.FC<RecentTableProps> = ({ requests, isLoading }) => {
  const navigate = useNavigate();

  // Filtrar solo las solicitudes pre-aprobadas, ya que al Jefe solo le interesan estas para aprobar
  const safeRequests = requests || [];
  const preAprobadas = safeRequests.filter(req => req.status && (req.status.toLowerCase().includes('pre_aprobada') || req.status.toLowerCase().includes('pre')));

  const getStatusBadge = (status: string) => {
    let colorClass = "border-amber-200 text-amber-600";
    let dotClass = "bg-amber-500";
    let text = "pendiente";

    if (status.toLowerCase().includes('pre')) {
      colorClass = "border-emerald-200 text-emerald-600";
      dotClass = "bg-emerald-500";
      text = "pre_aprobada";
    }

    return (
      <span className={`px-3 py-1 bg-white border ${colorClass} rounded-full text-[11px] font-semibold flex items-center w-max shadow-sm`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass} mr-1.5`}></span>
        {text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/80 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100/80 flex justify-between items-center bg-white">
        <div>
          <h3 className="font-extrabold text-[#182645] text-lg tracking-tight">Solicitudes recientes</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Últimas solicitudes registradas en el sistema</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
          Ver todas <span>&rarr;</span>
        </button>
      </div>
      
      {/* Mobile View (Cards) */}
      <div className="md:hidden flex flex-col p-4 gap-3">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
              <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
            </div>
          ))
        ) : preAprobadas.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium text-sm">No hay solicitudes recientes.</p>
          </div>
        ) : (
          preAprobadas.map((req, idx) => (
            <div 
              key={idx}
              onClick={() => {
                const basePath = req.type?.toLowerCase() === 'combustible' ? '/combustible/aprobaciones' : '/aprobaciones';
                navigate(`${basePath}/${req.code}`);
              }}
              className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:border-indigo-200 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#4F46E5] rounded-full"></span>
                  <span className="font-bold text-[#182645] text-sm">{req.code}</span>
                </div>
                {getStatusBadge(req.status)}
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>{req.date}</span>
                <span className="font-medium bg-slate-100 px-2 py-1 rounded-md">{req.type || 'Transporte'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto p-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100/80">
              <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">CÓDIGO</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">FECHA</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIPO</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">ESTADO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
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
                  <p className="text-slate-400 font-medium text-sm">No hay solicitudes recientes.</p>
                </td>
              </tr>
            ) : (
              preAprobadas.map((req, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => {
                    const basePath = req.type?.toLowerCase() === 'combustible' ? '/combustible/aprobaciones' : '/aprobaciones';
                    navigate(`${basePath}/${req.code}`);
                  }}
                  className="hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer group"
                >
                  <td className="py-5 px-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full"></span>
                    <span className="font-semibold text-[#182645] text-[13px]">{req.code}</span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-[13px] text-slate-500 font-medium">{req.date}</span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-[13px] text-[#182645] font-medium">{req.type || 'Transporte'}</span>
                  </td>
                  <td className="py-5 px-6 flex justify-end">
                    {getStatusBadge(req.status)}
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
