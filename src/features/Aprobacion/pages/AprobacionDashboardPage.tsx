import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
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
      
      <RecentTable requests={requests} isLoading={isLoading} />
    </div>
  );
};
