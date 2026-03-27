// src/components/layout/AppLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar, { Icons, type NavItem } from "./Sidebar";
import { useState, useEffect } from "react";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Escuchar el tamaño de la ventana para colapsar automáticamente el sidebar en pantallas pequeñas
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    
    // Inicializar estado
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems: NavItem[] = [
    { to: "/dashboard", label: "Mis Viajes", icon: Icons.Dashboard },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        items={navItems}
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
      />
      
      <main 
        className={`flex-1 min-h-screen flex flex-col relative w-full overflow-x-hidden transition-all duration-300 ease-in-out ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
