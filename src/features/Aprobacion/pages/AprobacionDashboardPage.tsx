import React, { useCallback, useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Layers, Car, Droplet, Wrench } from 'lucide-react';
import { SummaryCards } from '../components/SummaryCards';
import { RecentTable } from '../components/RecentTable';
import { dashboardApi, DashboardSummary, RecentRequest } from '../api/dashboardApi';
import { ErrorBanner } from '@/shared/components/ErrorBanner';

export const AprobacionDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | undefined>();
  const [requests, setRequests] = useState<RecentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  type TabType = 'todas' | 'transporte' | 'combustible' | 'mantenimiento';
  const [activeTab, setActiveTab] = useState<TabType>('todas');

  const counts = useMemo(() => {
    const defaultCounts = { todas: 0, transporte: 0, combustible: 0, mantenimiento: 0 };
    if (!requests) return defaultCounts;
    
    return requests.reduce((acc, req) => {
      const type = (req.type || 'Transporte').toLowerCase();
      acc.todas++;
      if (type.includes('transporte')) acc.transporte++;
      if (type.includes('combustible')) acc.combustible++;
      if (type.includes('mantenimiento')) acc.mantenimiento++;
      return acc;
    }, defaultCounts);
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (activeTab === 'todas') return requests;
    return requests.filter(req => {
        const type = (req.type || 'Transporte').toLowerCase();
        return type.includes(activeTab);
    });
  }, [requests, activeTab]);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setSummaryError(null);
      setRequestsError(null);

      try {
        const sumData = await dashboardApi.getSummary(controller.signal);
        setSummary(sumData);
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error("Error fetching summary", error);
        setSummaryError("No se pudo cargar el resumen de solicitudes.");
        setSummary({ pending: 0, in_progress: 0, accepted: 0, completed: 0 });
      }

      try {
        const reqData = await dashboardApi.getRecentRequests(controller.signal);
        setRequests(reqData.data);
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error("Error fetching recent requests", error);
        setRequestsError("No se pudieron cargar las solicitudes recientes.");
        setRequests([]);
      }

      setIsLoading(false);
    };

    void load();

    return () => controller.abort();
  }, [retryToken]);

  const handleRetry = useCallback(() => setRetryToken(t => t + 1), []);

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">ASAMBLEA LEGISLATIVA - LOGÍSTICA</p>
          <h1 className="text-3xl font-extrabold text-[#182645] tracking-tight font-title">Dashboard de Jefatura</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Resumen general de solicitudes de transporte y combustible</p>
        </div>
      </div>

      {summaryError && <ErrorBanner message={summaryError} onRetry={handleRetry} />}
      {requestsError && <ErrorBanner message={requestsError} onRetry={handleRetry} />}

      <SummaryCards summary={summary} isLoading={isLoading} />
      
      <div className="flex overflow-x-auto gap-3 mb-6 hide-scrollbar pb-2 mt-8">
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
