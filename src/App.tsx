import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './widgets/DashboardLayout';
import { ProtectedRoute } from './features/Auth/components/ProtectedRoute';
import { FullPageLoader } from './shared/components/FullPageLoader';
import { EnvironmentBanner } from './shared/components/EnvironmentBanner';

const LoginPage = lazy(() => import('./features/Auth/pages/LoginPage'));
const AprobacionDashboardPage = lazy(() => import('./features/Aprobacion/pages/AprobacionDashboardPage').then(m => ({ default: m.AprobacionDashboardPage })));
const HistorialPage = lazy(() => import('./features/Aprobacion/pages/HistorialPage').then(m => ({ default: m.HistorialPage })));
const PreAprobadasPage = lazy(() => import('./features/Aprobacion/pages/PreAprobadasPage').then(m => ({ default: m.PreAprobadasPage })));
const HistorialDetallePage = lazy(() => import('./features/Aprobacion/pages/HistorialDetallePage'));
const EnEjecucionPage = lazy(() => import('./features/Aprobacion/pages/EnEjecucionPage').then(m => ({ default: m.EnEjecucionPage })));
const AprobacionPage = lazy(() => import('./features/Aprobacion/pages/AprobacionPage'));
const AprobacionCombustiblePage = lazy(() => import('./features/Aprobacion/pages/AprobacionCombustiblePage'));
const AprobacionMantenimientoPage = lazy(() => import('./features/Aprobacion/pages/AprobacionMantenimientoPage'));

function App() {
  return (
    <BrowserRouter>
      <EnvironmentBanner />
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<AprobacionDashboardPage />} />
              <Route path="pre-aprobadas" element={<PreAprobadasPage />} />
              <Route path="en-ejecucion" element={<EnEjecucionPage />} />
              <Route path="historial" element={<HistorialPage />} />
              <Route path="historial/:codigo" element={<HistorialDetallePage />} />
              <Route path="aprobaciones/:codigo" element={<AprobacionPage />} />
              <Route path="aprobaciones" element={<AprobacionPage />} />
              <Route path="combustible/aprobaciones/:codigo" element={<AprobacionCombustiblePage />} />
              <Route path="combustible/aprobaciones" element={<AprobacionCombustiblePage />} />
              <Route path="mantenimiento/aprobaciones/:codigo" element={<AprobacionMantenimientoPage />} />
              <Route path="mantenimiento/aprobaciones" element={<AprobacionMantenimientoPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
