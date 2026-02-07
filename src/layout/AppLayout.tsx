import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
//import Topbar from "../layout/Topbar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Navbar arriba */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Topbar (el botón hamburger para móvil, si lo tienes separado) */}
      {/* <Topbar onMenuClick={() => setSidebarOpen(true)} /> */}

      {/* Contenido principal centrado */}
      <main className="pt-20">
        {/* Contenedor con max-width centrado */}
        <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}