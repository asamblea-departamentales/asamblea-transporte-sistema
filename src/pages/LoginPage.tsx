import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { loginRequest } from "../services/auth.service";
import { useAuth } from "../auth/AuthContext";
import { GlobalLoading } from "../components/GlobalLoading";

export default function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const user = await loginRequest({ email, password });

      // Validar que el usuario tenga el rol de motorista
      const esMorista = user.roles?.includes("motorista");
      if (!esMorista) {
        localStorage.removeItem("auth_token");
        setError("Acceso denegado. Esta aplicación es exclusiva para motoristas.");
        return;
      }

      setUser(user);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message)
          : undefined;
      setError(message || "Credenciales incorrectas. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-white flex flex-col">
      {loading && <GlobalLoading message="Iniciando Sesión Segura" />}

      {/* Franja superior institucional */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0f2548] to-[#2354b4]" />

      {/* Contenido */}
      <div className="flex flex-col flex-1 justify-center items-center px-6">
        <div className="w-full max-w-sm">

          {/* Escudo SVG */}
          <div className="flex justify-center mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0f2548] shadow-xl shadow-slate-300">
              <svg viewBox="0 0 24 24" className="h-10 w-10 text-white" fill="none"
                stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-center text-2xl font-bold text-[#1a1f36] mb-1">
            Bienvenido, Motorista
          </h1>
          <p className="text-center text-sm text-slate-500 mb-10">
            Ingresa tus credenciales institucionales
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              label="Correo institucional"
              placeholder="usuario@asamblea.gob.sv"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              name="email"
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
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={loading || !email || !password}
              className="min-h-12 text-base"
            >
              INICIAR SESIÓN
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Asamblea Legislativa de El Salvador
      </div>
    </div>
  );
}
