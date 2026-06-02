import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-body">
      <Sidebar />
      <main className="ml-[260px] flex-1">
        <Outlet />
      </main>
    </div>
  );
};
