import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { GlobalLoading } from "../shared/components/GlobalLoading";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <GlobalLoading />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
