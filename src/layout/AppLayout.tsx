import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Componente de Navegación (Sidebar, Headers y Bottom Nav) */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      />

      {/* Contenedor Principal:
          - pt-16 (64px) para compensar el Header fijo en Desktop y Mobile.
          - pb-20 en móvil para dejar espacio al Bottom Nav.
      */}
      <main className="flex-1 pt-16 pb-24 lg:pb-8 animate-fade-in">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Aquí es donde React Router renderiza tus páginas:
              Dashboard, Paso 1, 2, 3, etc. 
          */}
          <Outlet />
        </div>
      </main>

      {/* Footer Institucional opcional (solo visible en Desktop) */}
      <footer className="hidden lg:block py-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>© 2026 Asamblea Legislativa de El Salvador</span>
          <span>Sistema de Transporte Institucional</span>
        </div>
      </footer>
    </div>
  );
}