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

      <main
        style={{
          paddingTop: 60, // exact navbar height
          paddingBottom: "calc(62px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{
          margin: "0 auto",
          width: "100%",
          maxWidth: 1440,
          padding: "0 24px", // NO vertical padding here — let each page control its own
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}