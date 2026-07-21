import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Layers, Car, Droplet, Wrench, Calendar, CheckCircle } from 'lucide-react';
import { RecentTable } from '../components/RecentTable';
import { dashboardApi, RecentRequest } from '../api/dashboardApi';
import { ErrorBanner } from '@/shared/components/ErrorBanner';

type TabType = 'todas' | 'transporte' | 'combustible' | 'mantenimiento';

export const PreAprobadasPage: React.FC = () => {
  const [requests, setRequests] = useState<RecentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<TabType>('todas');
  const [fechaFiltro, setFechaFiltro] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const reqData = await dashboardApi.getPendientesJefatura(controller.signal);
        setRequests(reqData.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Error fetching pre-aprobadas", err);
        setError("No se pudieron cargar las solicitudes pre-aprobadas.");
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const type = (req.type || 'Transporte').toLowerCase();
      const matchTab = activeTab === 'todas' || type.includes(activeTab);
      
      // La fechaEjecucion viene del backend. Se compara si coincide con el string fechaFiltro (YYYY-MM-DD)
      const matchDate = !fechaFiltro || (req.fechaEjecucion && req.fechaEjecucion.startsWith(fechaFiltro));
      
      return matchTab && matchDate;
    });
  }, [requests, activeTab, fechaFiltro]);

  const counts = useMemo(() => {
    const defaultCounts = { todas: 0, transporte: 0, combustible: 0, mantenimiento: 0 };
    return requests.reduce((acc, req) => {
      const type = (req.type || 'Transporte').toLowerCase();
      acc.todas++;
      if (type.includes('transporte')) acc.transporte++;
      if (type.includes('combustible')) acc.combustible++;
      if (type.includes('mantenimiento')) acc.mantenimiento++;
      return acc;
    }, defaultCounts);
  }, [requests]);

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-primary">
            <CheckCircle size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#182645] tracking-tight font-title">Bandeja de Aprobación</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Solicitudes pendientes de autorización final por Jefatura</p>
          </div>
        </div>
        
        {/* Date Filter */}
        <div className="flex flex-col w-full md:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Fecha de Ejecución / Uso</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="date" 
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="w-full md:w-48 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
            {fechaFiltro && (
              <button 
                onClick={() => setFechaFiltro('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-danger"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => window.location.reload()} />}

      <div className="flex overflow-x-auto gap-3 mb-6 hide-scrollbar pb-2">
        <button
          onClick={() => setActiveTab('todas')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'todas' 
              ? 'bg-slate-800 text-white shadow-md' 
              : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers size={16} /> Todas
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'todas' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
            {counts.todas}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('transporte')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'transporte' 
              ? 'bg-[#859BFF] text-white shadow-md' 
              : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Car size={16} /> Transporte
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'transporte' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
            {counts.transporte}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('combustible')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'combustible' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Droplet size={16} /> Combustible
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'combustible' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
            {counts.combustible}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('mantenimiento')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'mantenimiento' 
              ? 'bg-emerald-500 text-white shadow-md' 
              : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wrench size={16} /> Mantenimiento
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'mantenimiento' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
            {counts.mantenimiento}
          </span>
        </button>
      </div>

      <RecentTable requests={filteredRequests} isLoading={isLoading} />
    </div>
  );
};
