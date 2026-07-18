import React, { useEffect, useMemo, useState } from 'react';
import { dashboardApi, RecentRequest } from '../api/dashboardApi';
import { useNavigate } from 'react-router-dom';
import { History, Search, Calendar, Filter } from 'lucide-react';
import { Pagination } from '../../../shared/components/Pagination';

export const HistorialPage: React.FC = () => {
  const [requests, setRequests] = useState<RecentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('todos');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const data = await dashboardApi.getHistorialJefatura();
        console.log("RESPUESTA REAL DEL BACKEND (historial-jefatura):", data);
        setRequests(data.data || []);
      } catch (error) {
        console.error("Error fetching historial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistorial();
  }, []);

  // Apply filters (useMemo en lugar de useEffect)
  const filteredRequests = useMemo(() => {
    let result = requests;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(req => {
        const code = typeof req.code === 'string' ? req.code : '';
        const type = typeof req.type === 'string' ? req.type : '';
        const status = typeof req.status === 'string' ? req.status : '';
        
        // Expandir búsqueda a más campos para mejor UX
        const searchStr = `${code} ${type} ${status} ${(req as any).solicitante || ''} ${(req as any).destino || ''}`.toLowerCase();
        return searchStr.includes(lowerSearch);
      });
    }

    if (dateFilter !== 'todos') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      result = result.filter(req => {
        const dateStr = req.rawDate || req.date;
        if (!dateStr) return false;
        
        const reqDate = new Date(dateStr);
        if (isNaN(reqDate.getTime())) return true; // Si la fecha es inválida, mejor mostrarlo

        const reqDateMidnight = new Date(reqDate);
        reqDateMidnight.setHours(0, 0, 0, 0);

        if (dateFilter === 'hoy') {
          return reqDateMidnight.getTime() === today.getTime();
        }
        
        if (dateFilter === 'semana') {
          const currentDay = today.getDay(); // 0 = Domingo, 1 = Lunes
          const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
          
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - daysToMonday);
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          
          return reqDateMidnight.getTime() >= startOfWeek.getTime() && reqDateMidnight.getTime() <= endOfWeek.getTime();
        }
        
        if (dateFilter === 'mes') {
          return reqDateMidnight.getMonth() === today.getMonth() && 
                 reqDateMidnight.getFullYear() === today.getFullYear();
        }
        
        return true;
      });
    }

    return result;
  }, [searchTerm, dateFilter, requests]);

  const searchTermChangeHandler = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const dateFilterChangeHandler = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  // Paginate results
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRequests = filteredRequests.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);


  const getStatusBadge = (status?: any) => {
    if (!status) return <span className="text-slate-400">-</span>;
    let colorClass = "border-slate-200 text-slate-600";
    let dotClass = "bg-slate-500";
    const statusVal = typeof status === 'string' ? status : status.value || '';
    const text = statusVal.toLowerCase();

    if (text.includes('aprobada')) {
      colorClass = "border-emerald-200 text-emerald-600";
      dotClass = "bg-emerald-500";
    } else if (text.includes('rechazada')) {
      colorClass = "border-red-200 text-red-600";
      dotClass = "bg-red-500";
    } else if (text.includes('programada')) {
      colorClass = "border-blue-200 text-blue-600";
      dotClass = "bg-blue-500";
    } else if (text.includes('completada')) {
      colorClass = "border-slate-200 text-slate-600";
      dotClass = "bg-slate-500";
    } else if (text.includes('en_ejecucion') || text.includes('ejecucion')) {
      colorClass = "border-indigo-200 text-indigo-600";
      dotClass = "bg-indigo-500";
    }

    return (
      <span className={`px-3 py-1 bg-white border ${colorClass} rounded-full text-[11px] font-semibold flex items-center w-max shadow-sm capitalize`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass} mr-1.5`}></span>
        {text.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-600">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#182645] tracking-tight font-title">Historial de Aprobaciones</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Solicitudes que ya han sido procesadas</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/80 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por código..." 
            value={searchTerm}
            onChange={(e) => searchTermChangeHandler(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={dateFilter}
              onChange={(e) => dateFilterChangeHandler(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer"
            >
              <option value="todos">Todas las fechas</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
            </select>
          </div>
          <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/80 overflow-hidden">
        {/* Mobile View (Cards) */}
        <div className="md:hidden flex flex-col p-4 gap-3">
          {isLoading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
              </div>
            ))
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <History className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-slate-500 font-medium">No hay registros en el historial.</p>
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
                [1, 2, 3, 4, 5].map(i => (
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
                    <History className="mx-auto text-slate-300 mb-3" size={32} />
                    <p className="text-slate-500 font-medium">No se encontraron resultados en el historial.</p>
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
