import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GlobalLoading } from "../components/GlobalLoading";
import AppLayout from "../layout/AppLayout";
import ProtectedRoute from "../auth/ProtectedRoute";
import "leaflet/dist/leaflet.css";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const NewRequestPage = lazy(() => import("../pages/NewRequestPage"));
const MyRequestsPage = lazy(() => import("../pages/MyRequestsPage"));
const TransportStep1Page = lazy(() => import("../pages/transport/TransportStep1Page"));
const TransportStep2Page = lazy(() => import("../pages/transport/TransportStep2Refactored"));
const TransportStep3Page = lazy(() => import("../pages/transport/paso-3"));
const NuevaSolicitudMantenimiento = lazy(() => import("../pages/solicitudes/mantenimiento/NuevaSolicitudMantenimiento"));
const NuevaSolicitudCombustible = lazy(() => import("../pages/solicitudes/Combustible/Nuevasolicitudcombustible"));
const RequestDetailPage = lazy(() => import("../pages/solicitudes/RequestDetailPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));

function PageFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <svg aria-hidden className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-xs font-semibold text-slate-500">Cargando…</span>
      </div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  useEffect(() => {
    const closeTimer = window.setTimeout(() => setIsClosing(true), 150);
    const hideTimer = window.setTimeout(() => setLoading(false), 400);
    return () => { window.clearTimeout(closeTimer); window.clearTimeout(hideTimer); };
  }, []);
  if (loading) return <GlobalLoading isClosing={isClosing} />;

  return (
    <BrowserRouter>
      <div className="animate-fade-in">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/nueva-solicitud" element={<NewRequestPage />} />
                <Route path="/mis-solicitudes" element={<MyRequestsPage />} />
                <Route path="/notificaciones" element={<NotificationsPage />} />
                <Route path="/solicitudes/transporte/paso-1" element={<TransportStep1Page />} />
                <Route path="/solicitudes/transporte/paso-2" element={<TransportStep2Page />} />
                <Route path="/solicitudes/transporte/paso-3" element={<TransportStep3Page />} />
                <Route path="/solicitudes/mantenimiento/nueva" element={<NuevaSolicitudMantenimiento />} />
                <Route path="/solicitudes/combustible/nueva" element={<NuevaSolicitudCombustible />} />
                <Route path="/solicitudes/:modulo/:id" element={<RequestDetailPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
