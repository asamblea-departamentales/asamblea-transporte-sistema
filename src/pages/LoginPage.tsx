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
    <div
      className="
        min-h-screen min-h-[100dvh]
        bg-[#f0f2f5]
        flex flex-col
        sm:items-center sm:justify-center
      "
    >
      {/* Contenedor principal */}
      <div
        className="
          flex flex-col flex-1
          w-full
          bg-white
          px-6 py-8
          sm:flex-none sm:max-w-sm
          sm:rounded-2xl sm:shadow-xl
        "
      >
        {/* Contenido centrado vertical en móvil */}
        <div className="flex flex-col justify-center flex-1">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="Asamblea Legislativa"
              className="h-20 w-auto object-contain sm:h-16"
            />
          </div>

          {/* Título */}
          <h1 className="text-center text-2xl font-bold text-[#1a1f36] mb-1">
            Bienvenido
          </h1>
          <p className="text-center text-sm text-slate-500 mb-8">
            Ingresa tus credenciales institucionales
          </p>

          {/* Formulario */}
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
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              name="password"
            />

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Botón */}
            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                disabled={loading || !email || !password}
                className="w-full min-h-12 text-base"
              >
                {loading ? "INICIANDO..." : "INICIAR SESIÓN"}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer fijo abajo */}
        <p className="text-center text-xs text-slate-400 pt-6">
          © 2026 Asamblea Legislativa de El Salvador
        </p>
      </div>
    </div>
  );
}