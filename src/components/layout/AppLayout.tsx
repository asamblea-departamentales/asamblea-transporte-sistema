import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onOpen={() => setSidebarOpen(true)} 
      />
      {/* 
        Contenedor Principal: 
        En pantallas móviles (PWA):
          - Añade un padding superior (pt-[60px]) para no tapar la Top Bar.
          - Añade un padding inferior (pb-[64px]) para acomodar la Bottom Nav Bar.
        En escritorio (lg:):
          - El padding vertical es cero, y se traslada hacia la derecha (lg:ml-[280px]) para dar espacio al Sidebar fijo.
      */}
      <main className="flex-1 lg:ml-[280px] pt-[60px] pb-[64px] lg:pt-0 lg:pb-0 min-h-screen flex flex-col relative w-full overflow-x-hidden transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}
