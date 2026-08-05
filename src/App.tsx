import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './widgets/DashboardLayout';
import { ProtectedRoute } from './features/Auth/components/ProtectedRoute';
import { FullPageLoader } from './shared/components/FullPageLoader';
import { EnvironmentBanner } from './shared/components/EnvironmentBanner';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { lazyWithRetry } from './shared/lib/lazyWithRetry';

const LoginPage = lazyWithRetry(() => import('./features/Auth/pages/LoginPage'));
const AprobacionDashboardPage = lazyWithRetry(() => import('./features/Aprobacion/pages/AprobacionDashboardPage'));
const HistorialPage = lazyWithRetry(() => import('./features/Aprobacion/pages/HistorialPage'));
const PreAprobadasPage = lazyWithRetry(() => import('./features/Aprobacion/pages/PreAprobadasPage'));
const HistorialDetallePage = lazyWithRetry(() => import('./features/Aprobacion/pages/HistorialDetallePage'));
const EnEjecucionPage = lazyWithRetry(() => import('./features/Aprobacion/pages/EnEjecucionPage'));
const AprobacionPage = lazyWithRetry(() => import('./features/Aprobacion/pages/AprobacionPage'));
const AprobacionCombustiblePage = lazyWithRetry(() => import('./features/Aprobacion/pages/AprobacionCombustiblePage'));
const AprobacionMantenimientoPage = lazyWithRetry(() => import('./features/Aprobacion/pages/AprobacionMantenimientoPage'));

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
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
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
