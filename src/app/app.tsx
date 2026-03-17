import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GlobalLoading } from "..//components/GlobalLoading";

// Imports de tus páginas
import LoginPage from "../pages/LoginPage";
import AppLayout from "../layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import NewRequestPage from "../pages/NewRequestPage";
import MyRequestsPage from "../pages/MyRequestsPage";
import TransportStep1Page from "../pages/transport/TransportStep1Page";
import Paso2 from "../pages/transport/paso-2";
import Paso3 from "../pages/transport/paso-3";
import ProtectedRoute from "../auth/ProtectedRoute";
import NuevaSolicitudMantenimiento from "../pages/solicitudes/mantenimiento/NuevaSolicitudMantenimiento";
import NuevaSolicitudCombustible from "../pages/solicitudes/Combustible/Nuevasolicitudcombustible";
import RequestDetailPage from "../pages/solicitudes/RequestDetailPage";
import "leaflet/dist/leaflet.css";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Simulamos la carga inicial (F5)
    const loadTimer = setTimeout(() => {
      setIsClosing(true); // Inicia zoom y desvanecimiento
      
      setTimeout(() => {
        setLoading(false); // Desmonta el loader
      }, 600); // Duración de la animación de salida
    }, 1500);

    return () => clearTimeout(loadTimer);
  }, []);

  // Mientras carga, mostramos el logo institucional
  if (loading) {
    return <GlobalLoading isClosing={isClosing} />;
  }

  return (
    <BrowserRouter>
      {/* Contenedor con fade-in para que el contenido aparezca suavemente tras el logo */}
      <div className="animate-fade-in">
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
      </div>
    </BrowserRouter>
  );
}