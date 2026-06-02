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
      try {
        const [sumData, reqData] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getRecentRequests()
        ]);
        setSummary(sumData);
        setRequests(reqData.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-title text-3xl font-extrabold text-slate-900">Bandeja del Jefe</h1>
          <p className="text-slate-500 mt-1">Resumen operativo y bandeja de solicitudes en espera de tu autorización.</p>
        </div>
      </div>

      <SummaryCards summary={summary} isLoading={isLoading} />
      
      <RecentTable requests={requests} isLoading={isLoading} />
    </div>
  );
};
