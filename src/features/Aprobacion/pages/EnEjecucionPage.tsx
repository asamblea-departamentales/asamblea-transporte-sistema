import React, { useEffect, useMemo, useState } from 'react';
import { dashboardApi, RecentRequest } from '../api/dashboardApi';
import { useNavigate } from 'react-router-dom';
import { Map, Search, Navigation } from 'lucide-react';
import { Pagination } from '../../../shared/components/Pagination';

export const EnEjecucionPage: React.FC = () => {
  const [requests, setRequests] = useState<RecentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const data = await dashboardApi.getHistorialJefatura();
        setRequests(data.data || []);
      } catch (error) {
        console.error("Error fetching historial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistorial();
  }, []);

  const filteredRequests = useMemo(() => {
    // 1. Mostrar SOLO lo que está en ejecución
    let result = requests.filter(req => {
      const status = typeof req.status === 'string' ? req.status.toLowerCase() : '';
      return status.includes('ejecucion');
    });

    // 2. Filtro de búsqueda
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(req => {
        const code = typeof req.code === 'string' ? req.code : '';
        const type = typeof req.type === 'string' ? req.type : '';
        const searchStr = `${code} ${type} ${(req as any).solicitante || ''} ${(req as any).destino || ''}`.toLowerCase();
        return searchStr.includes(lowerSearch);
      });
    }

    return result;
  }, [searchTerm, requests]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRequests = filteredRequests.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const getStatusBadge = () => {
    return (
      <span className="px-3 py-1 bg-white border border-indigo-200 text-indigo-600 rounded-full text-[11px] font-semibold flex items-center w-max shadow-sm capitalize">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5 animate-pulse"></span>
        En Ejecución
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Navigation size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#182645] tracking-tight font-title">Vehículos en Ruta</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Monitoreo en tiempo real de viajes y tareas operativas activas.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/80 mb-6 flex items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por código..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/80 overflow-hidden">
        {/* Mobile View */}
        <div className="md:hidden flex flex-col p-4 gap-3">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
              </div>
            ))
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Map className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-slate-500 font-medium">No hay vehículos en ruta en este momento.</p>
            </div>
          ) : (
            paginatedRequests.map((req, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  navigate(`/historial/${req.code}`);
                }}
                className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:border-indigo-200 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <span className="font-bold text-[#182645] text-sm">{req.code}</span>
                  </div>
                  {getStatusBadge()}
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>{req.date}</span>
                  <span className="font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">{req.type || 'Transporte'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100/80">
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">CÓDIGO</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">FECHA</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIPO</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">ACCIÓN</th>
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
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <Map className="mx-auto text-slate-300 mb-3" size={32} />
                    <p className="text-slate-500 font-medium">No hay vehículos en ruta en este momento.</p>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => {
                      navigate(`/historial/${req.code}`);
                    }}
                    className="hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer group"
                  >
                    <td className="py-5 px-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                      <span className="font-semibold text-[#182645] text-[13px]">{req.code}</span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[13px] text-slate-500 font-medium">{req.date}</span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[13px] text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md font-bold">{req.type || 'Transporte'}</span>
                    </td>
                    <td className="py-5 px-6 flex justify-end">
                      {req.code.startsWith('TR-') ? (
                        <button className="text-[11px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                          Modificar Ruta
                        </button>
                      ) : (
                         getStatusBadge()
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {totalPages > 1 && !isLoading && (
        <div className="mt-4">
          <Pagination 
            currentPage={safePage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
            className="rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/80"
          />
        </div>
      )}
    </div>
  );
};
