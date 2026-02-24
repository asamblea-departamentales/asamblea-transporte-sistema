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
    /*
     * PWA / Mobile-first layout:
     * - Ocupa el 100% del viewport real (dvh) para evitar que la barra del
     *   navegador móvil corte el contenido.
     * - safe-area-inset garantiza que el contenido no quede bajo el notch
     *   ni la barra de gestos de iOS/Android.
     * - El card se estira a pantalla completa en móvil y se centra como
     *   tarjeta en tablets/escritorio.
     */
    <div
      className="
        min-h-[100dvh] bg-[#f0f2f5]
        flex flex-col
        px-safe-or-4 pt-safe-or-6 pb-safe-or-6
        sm:items-center sm:justify-center sm:px-4 sm:py-10
      "
      style={{
        paddingTop: "max(env(safe-area-inset-top), 1.5rem)",
        paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)",
        paddingLeft: "max(env(safe-area-inset-left), 1rem)",
        paddingRight: "max(env(safe-area-inset-right), 1rem)",
      }}
    >
      {/* Card — full-height en mobile, max-w tarjeta en sm+ */}
      <div
        className="
          flex flex-col flex-1
          bg-white rounded-2xl shadow-lg
          px-6 py-8
          sm:flex-none sm:w-full sm:max-w-sm sm:px-8 sm:py-10
        "
      >
        {/* Spacer superior para empujar logo al centro en mobile */}
        <div className="flex-1 sm:hidden" />

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo}
            alt="Asamblea Legislativa"
            className="h-20 w-auto object-contain mb-3 sm:h-16"
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

          {/* Botón — area táctil generosa (min-h-12 = 48 px) */}
          {/* Wrapper que garantiza área táctil mínima de 48 px en móvil */}
          <div className="pt-2 [&>*]:min-h-12 [&>*]:text-base [&>*]:w-full">
            <Button
              type="submit"
              loading={loading}
              disabled={loading || !email || !password}
            >
              {loading ? "INICIANDO..." : "INICIAR SESIÓN"}
            </Button>
          </div>
        </form>

        {/* Spacer inferior para empujar footer al fondo en mobile */}
        <div className="flex-1 sm:hidden" />

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 pt-6">
          © 2026 Asamblea Legislativa de El Salvador
        </p>
      </div>
    </div>
  );
}