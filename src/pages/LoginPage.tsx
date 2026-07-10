// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { loginRequest } from "../services/auth.service";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/asamble.png";
import { GlobalLoading } from "../components/GlobalLoading";

export default function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const user = await loginRequest({ username, password });
      setUser(user);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-white flex flex-col">
      {loading && <GlobalLoading message="Iniciando Sesión Segura" />}

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 justify-center items-center px-6">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={logo}
              alt="Asamblea Legislativa"
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Título */}
          <h1 className="text-center text-2xl font-bold text-slate-900 mb-1">
            Bienvenido
          </h1>
          <p className="text-center text-sm text-slate-500 mb-10">
            Ingresa tus credenciales institucionales
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              label="Usuario institucional"
              placeholder="usuario"
              value={username}
              onChange={setUsername}
              autoComplete="username"
              name="username"
            />

            <TextField
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              name="password"
            />

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={loading || !username || !password}
              className="min-h-12 text-base"
            >
              INICIAR SESIÓN
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-6 text-center text-xs text-slate-400">
        © 2026 Asamblea Legislativa de El Salvador
      </div>

    </div>
  );
}