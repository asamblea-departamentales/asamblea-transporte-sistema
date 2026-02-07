// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { loginRequest } from "../services/auth.service";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/asamble.png";

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
      // ✅ loginRequest devuelve AuthUser directo
      const user = await loginRequest({ email, password });
      setUser(user);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-indigo-100">
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-[26px] bg-white p-6 ring-1 ring-slate-100 shadow-xl shadow-slate-900/10">
            <div className="mb-6 flex items-center justify-center">
              <div className="w-full max-w-[300px] rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex h-32 items-center justify-center">
                  <img
                    src={logo}
                    alt="Asamblea Legislativa"
                    className="h-28 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            <p className="mb-6 text-center text-sm font-medium text-slate-600">
              Ingresa tus credenciales institucionales
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                name="password"
              />

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading || !email || !password}
                >
                  {loading ? "INICIANDO..." : "INICIAR SESIÓN"}
                </Button>
              </div>

              <div className="pt-4">
                <div className="h-px w-full bg-slate-200/70" />
                <p className="mt-4 text-center text-xs text-slate-500">
                  © 2026 Asamblea Legislativa de El Salvador
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
