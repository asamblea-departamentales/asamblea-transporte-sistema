import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      />
      <main style={{
        paddingTop: 60,
        paddingBottom: "calc(62px + env(safe-area-inset-bottom))",
      }}>
        <div style={{
          margin: "0 auto",
          width: "100%",
          maxWidth: 1440,
          padding: "24px 28px",
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}