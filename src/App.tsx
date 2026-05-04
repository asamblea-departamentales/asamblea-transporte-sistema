import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./auth/pages/LoginPage";
import DashboardPage from "./viajes/DashboardPage";
import IncapacidadPage from "./disponibilidad/IncapacidadPage";
import HistorialViajesPage from "./viajes/HistorialViajesPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import { AppLayout } from "./shared/components/layout/AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas con layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/historial" element={<HistorialViajesPage />} />
            <Route path="/incapacidad" element={<IncapacidadPage />} />
          </Route>
        </Route>

        {/* Redirección raíz */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
