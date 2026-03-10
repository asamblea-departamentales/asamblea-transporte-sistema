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

        {/*
          pt-[60px]  → compensa el header fijo de 60px (desktop y móvil)
          pb-[76px]  → compensa bottom nav 60px + safe area en móvil
          lg:pb-0    → en desktop no hay bottom nav
        */}
        <main className="flex-1 pt-[60px] pb-[76px] lg:pb-0 animate-fade-in">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>

        {/* Footer solo desktop */}
        <footer className="hidden lg:block py-5 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              © 2026 Asamblea Legislativa de El Salvador
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Sistema de Transporte Institucional
            </span>
          </div>
        </footer>

        {/* Toast global */}
        <NotificationToast />

      </div>
    </NotificationProvider>
  );
}