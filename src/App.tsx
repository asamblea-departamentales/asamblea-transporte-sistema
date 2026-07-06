import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AprobacionPage from './features/Aprobacion/pages/AprobacionPage';
import AprobacionCombustiblePage from './features/Aprobacion/pages/AprobacionCombustiblePage';
import AprobacionMantenimientoPage from './features/Aprobacion/pages/AprobacionMantenimientoPage';
import { AprobacionDashboardPage } from './features/Aprobacion/pages/AprobacionDashboardPage';
import { HistorialPage } from './features/Aprobacion/pages/HistorialPage';
import HistorialDetallePage from './features/Aprobacion/pages/HistorialDetallePage';
import LoginPage from './features/Auth/pages/LoginPage';
import { useAuth } from './features/Auth/context/AuthContext';
import { DashboardLayout } from './shared/components/DashboardLayout';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#859BFF]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
