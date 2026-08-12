import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./auth/pages/LoginPage";
import ActivarCuentaPage from "./auth/pages/ActivarCuentaPage";
import CambiarPinInicialPage from "./auth/pages/CambiarPinInicialPage";
import DashboardPage from "./viajes/DashboardPage";
import ViajeActivoPage from "./viajes/ViajeActivoPage";
import IncapacidadPage from "./disponibilidad/IncapacidadPage";
import HistorialViajesPage from "./viajes/HistorialViajesPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import { AppLayout } from "./shared/components/layout/AppLayout";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { EnvironmentBanner } from "./shared/components/EnvironmentBanner";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <EnvironmentBanner />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/activar-cuenta" element={<ActivarCuentaPage />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            {/* Ruta sin AppLayout para cambio inicial obligatorio de PIN */}
            <Route path="/cambiar-pin" element={<CambiarPinInicialPage />} />

            {/* Rutas con AppLayout navegable */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/viajes" element={<Navigate to="/dashboard" replace />} />
              <Route path="/viajes/:id/activo" element={<ViajeActivoPage />} />
              <Route path="/historial" element={<HistorialViajesPage />} />
              <Route path="/incapacidad" element={<IncapacidadPage />} />
            </Route>
          </Route>

          {/* Redirección raíz */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
