import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AprobacionPage from './features/Aprobacion/pages/AprobacionPage';
import AprobacionCombustiblePage from './features/Aprobacion/pages/AprobacionCombustiblePage';
import AprobacionMantenimientoPage from './features/Aprobacion/pages/AprobacionMantenimientoPage';
import { AprobacionDashboardPage } from './features/Aprobacion/pages/AprobacionDashboardPage';
import { HistorialPage } from './features/Aprobacion/pages/HistorialPage';
import HistorialDetallePage from './features/Aprobacion/pages/HistorialDetallePage';
import LoginPage from './features/Auth/pages/LoginPage';
import { DashboardLayout } from './widgets/DashboardLayout';
import { ProtectedRoute } from './features/Auth/components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<AprobacionDashboardPage />} />
            <Route path="historial" element={<HistorialPage />} />
            <Route path="historial/:id" element={<HistorialDetallePage />} />
            <Route path="aprobaciones/:id" element={<AprobacionPage />} />
            <Route path="aprobaciones" element={<AprobacionPage />} />
            <Route path="combustible/aprobaciones/:id" element={<AprobacionCombustiblePage />} />
            <Route path="combustible/aprobaciones" element={<AprobacionCombustiblePage />} />
            <Route path="mantenimiento/aprobaciones/:id" element={<AprobacionMantenimientoPage />} />
            <Route path="mantenimiento/aprobaciones" element={<AprobacionMantenimientoPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
