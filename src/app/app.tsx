import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AppLayout from "../layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import NewRequestPage from "../pages/NewRequestPage";
import MyRequestsPage from "../pages/MyRequestsPage";
import TransportStep1Page from "../pages/transport/TransportStep1Page";
import Paso2 from "../pages/transport/paso-2";
import Paso3 from "../pages/transport/paso-3";
import ProtectedRoute from "../auth/ProtectedRoute";
import "leaflet/dist/leaflet.css";
//import RequestDetailPage from "../pages/RequestDetailPage";
//import SolicitudDetailPage from "../pages/SolicitudDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Raíz → Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Público */}
        <Route path="/login" element={<LoginPage />} />

        {/* Privado */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="nueva-solicitud" element={<NewRequestPage />} />
          <Route path="mis-solicitudes" element={<MyRequestsPage />} />
          

          


          <Route path="solicitudes/transporte/paso-1" element={<TransportStep1Page />} />
          <Route path="solicitudes/transporte/paso-2" element={<Paso2 />} />
          <Route path="solicitudes/transporte/paso-3" element={<Paso3 />} />
          

        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
