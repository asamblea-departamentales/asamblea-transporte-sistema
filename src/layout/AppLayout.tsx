// src/layouts/AppLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import { NotificationProvider } from "../notifications/NotificationContext";
import NotificationToast from "../notifications/NotificationToast";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col">

        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
        />

        <main className="flex-1 pt-16 pb-24 lg:pb-8 animate-fade-in">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>

        <footer className="hidden lg:block py-6 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-8 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span>© 2026 Asamblea Legislativa de El Salvador</span>
            <span>Sistema de Transporte Institucional</span>
          </div>
        </footer>

        {/* Toast global — aparece en esquina inferior derecha */}
        <NotificationToast />

      </div>
    </NotificationProvider>
  );
}