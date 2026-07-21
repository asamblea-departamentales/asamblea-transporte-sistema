// src/layouts/AppLayout.tsx
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../layout/Sidebar";
import { NotificationProvider } from "../notifications/NotificationContext";
import NotificationToast from "../notifications/NotificationToast";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-slate-50 flex">
        <a href="#main-content" className="sr-only z-[100] rounded bg-white px-4 py-2 text-sm font-bold text-slate-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-blue-600">Saltar al contenido principal</a>

        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-[280px]">
          {/*
            pt-[60px]  → compensa el header fijo de 60px en móvil
            pb-[76px]  → compensa bottom nav 60px + safe area en móvil
            lg:pt-0, lg:pb-0 → en desktop no hay header ni bottom nav, el sidebar maneja todo.
          */}
          <main id="main-content" className="flex-1 pt-[60px] pb-[76px] lg:pt-0 lg:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Footer solo desktop */}
          <footer className="hidden lg:block py-5 border-t border-slate-200 bg-white z-10 relative mt-auto">
            <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                © 2026 Asamblea Legislativa de El Salvador
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Sistema de Transporte Institucional
              </span>
            </div>
          </footer>
        </div>

        {/* Toast global */}
        <NotificationToast />

      </div>
    </NotificationProvider>
  );
}