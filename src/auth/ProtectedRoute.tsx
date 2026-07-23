import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { GlobalLoading } from "../shared/components/GlobalLoading";

export default function ProtectedRoute() {
  const { user, loading, debeCambiarPassword } = useAuth();
  const location = useLocation();

  if (loading) return <GlobalLoading />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario debe cambiar su PIN/contraseña obligatoriamente
  if (debeCambiarPassword && location.pathname !== "/cambiar-pin") {
    return <Navigate to="/cambiar-pin" replace />;
  }

  // Si ya no debe cambiar su PIN pero intenta entrar a /cambiar-pin
  if (!debeCambiarPassword && location.pathname === "/cambiar-pin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

