import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ CORRECCIÓN: Función toggle en lugar de solo cerrar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Sidebar con función toggle */}
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} />

      {/* Contenido principal con padding para las barras fijas */}
      <main className="pt-16 lg:pt-20">
        {/* pt-16 = 64px para móvil (altura de barra superior) */}
        {/* pt-20 = 80px para desktop (altura del navbar) */}
        
        {/* Contenedor con max-width centrado */}
        <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}