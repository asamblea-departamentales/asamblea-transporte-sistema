import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { loginRequest } from "../services/api";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/asamble.png";

export default function LoginPage() {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginRequest({ email, password });
      setToken(data.token);

      // ✅ Redirigir al dashboard (sidebar + layout)
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-indigo-100">
      {/* Decoraciones de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-64 w-64 rounded-[32px] border border-indigo-200/50 bg-white/10 backdrop-blur-sm" />
        <div className="absolute -right-32 bottom-28 h-72 w-72 rounded-full border border-indigo-200/40 bg-white/10 backdrop-blur-sm" />
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(30,41,59,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.25) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* TARJETA */}
          <div className="rounded-[26px] bg-white p-6 ring-1 ring-slate-100 shadow-xl shadow-slate-900/10">
            {/* LOGO */}
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

            {/* TEXTO */}
            <p className="mb-6 text-center text-sm font-medium text-slate-600">
              Ingresa tus credenciales institucionales
            </p>

            {/* FORM */}
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
                <Button type="submit" loading={loading} disabled={!email || !password}>
                  INICIAR SESIÓN
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

          <p className="mt-6 text-center text-xs text-slate-500">
            Frontend listo para conectarse a Laravel (token en localStorage).
          </p>
        </div>
      </div>
    </div>
  );
}
