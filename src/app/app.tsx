import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AppLayout from "../layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import NewRequestPage from "../pages/NewRequestPage";
import MyRequestsPage from "../pages/MyRequestsPage";
import TransportStep1Page from "../pages/transport/TransportStep1Page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/login" element={<LoginPage />} />

        {/* Privado (layout) */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Menú principal */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="nueva-solicitud" element={<NewRequestPage />} />
          <Route path="mis-solicitudes" element={<MyRequestsPage />} />

          {/* Transporte - Wizard */}
          <Route path="solicitudes/transporte/paso-1" element={<TransportStep1Page />} />
          <Route path="solicitudes/transporte/paso-2" element={<div />} />
          <Route path="solicitudes/transporte/paso-3" element={<div />} />

          {/* Otros módulos (futuros) */}
          <Route path="solicitudes/combustible/paso-1" element={<div />} />
          <Route path="solicitudes/mantenimiento/paso-1" element={<div />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
