import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onOpen={() => setSidebarOpen(true)} 
      />
      <main className="flex-1 lg:ml-[280px] pt-[60px] pb-[64px] lg:pt-0 lg:pb-0 min-h-screen flex flex-col relative w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
