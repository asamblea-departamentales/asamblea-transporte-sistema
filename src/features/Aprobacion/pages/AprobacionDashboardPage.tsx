import React, { useEffect, useState } from 'react';

import { SummaryCards } from '../components/SummaryCards';
import { RecentTable } from '../components/RecentTable';
import { dashboardApi, DashboardSummary, RecentRequest } from '../api/dashboardApi';

export const AprobacionDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | undefined>();
  const [requests, setRequests] = useState<RecentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Cargar independientemente para que si uno falla, el otro siga funcionando
      try {
        const sumData = await dashboardApi.getSummary();
        setSummary(sumData);
      } catch (error) {
        console.error("Error fetching summary", error);
        // Mostrar valores en 0 para que no quede vacío
        setSummary({ pending: 0, in_progress: 0, accepted: 0, completed: 0 });
      }

      try {
        const reqData = await dashboardApi.getRecentRequests();
        const rows = Array.isArray(reqData) ? reqData : (reqData.data || []);
        setRequests(rows);
      } catch (error) {
        console.error("Error fetching recent requests", error);
        setRequests([]);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">ASAMBLEA LEGISLATIVA - LOGÍSTICA</p>
          <h1 className="text-3xl font-extrabold text-[#182645] tracking-tight font-title">Dashboard de Jefatura</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Resumen general de solicitudes de transporte y combustible</p>
        </div>
      </div>

      <SummaryCards summary={summary} isLoading={isLoading} />
      
      <RecentTable requests={requests} isLoading={isLoading} />
    </div>
  );
};
