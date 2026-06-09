import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GlobalLoading } from "..//components/GlobalLoading";

// Layout y Auth (se cargan siempre)
import AppLayout from "../layout/AppLayout";
import ProtectedRoute from "../auth/ProtectedRoute";
import "leaflet/dist/leaflet.css";

// ─── Lazy Loading: cada página se descarga solo cuando se necesita ─────────────
const LoginPage                    = lazy(() => import("../pages/LoginPage"));
const DashboardPage                = lazy(() => import("../pages/DashboardPage"));
const NewRequestPage               = lazy(() => import("../pages/NewRequestPage"));
const MyRequestsPage               = lazy(() => import("../pages/MyRequestsPage"));
const TransportStep1Page           = lazy(() => import("../pages/transport/TransportStep1Page"));
const Paso2                        = lazy(() => import("../pages/transport/paso-2"));
const Paso3                        = lazy(() => import("../pages/transport/paso-3"));
const NuevaSolicitudMantenimiento  = lazy(() => import("../pages/solicitudes/mantenimiento/NuevaSolicitudMantenimiento"));
const NuevaSolicitudCombustible    = lazy(() => import("../pages/solicitudes/Combustible/Nuevasolicitudcombustible"));
const RequestDetailPage            = lazy(() => import("../pages/solicitudes/RequestDetailPage"));

// ─── Spinner ligero para transiciones entre páginas ────────────────────────────
function PageFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-xs font-semibold text-slate-400 animate-pulse">Cargando...</span>
      </div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }, 800);

    return () => clearTimeout(loadTimer);
  }, []);

  if (loading) {
    return <GlobalLoading isClosing={isClosing} />;
  }

  return (
    <BrowserRouter>
      <div className="animate-fade-in">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/nueva-solicitud" element={<NewRequestPage />} />
                <Route path="/mis-solicitudes" element={<MyRequestsPage />} />

                {/* Transporte */}
                <Route path="/solicitudes/transporte/paso-1" element={<TransportStep1Page />} />
                <Route path="/solicitudes/transporte/paso-2" element={<Paso2 />} />
                <Route path="/solicitudes/transporte/paso-3" element={<Paso3 />} />
                {/* Otros Módulos */}
                <Route path="/solicitudes/mantenimiento/nueva" element={<NuevaSolicitudMantenimiento />} />
                <Route path="/solicitudes/combustible/nueva" element={<NuevaSolicitudCombustible />} />
                
                {/* Detalle Universal */}
                <Route path="/solicitudes/:modulo/:id" element={<RequestDetailPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}