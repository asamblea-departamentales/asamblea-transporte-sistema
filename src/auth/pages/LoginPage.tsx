import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../../shared/components/ui/TextField";
import Button from "../../shared/components/ui/Button";
import { loginRequest } from "../auth.service";
import { useAuth } from "../AuthContext";
import logo from "../../shared/assets/asamble.png";
import { GlobalLoading } from "../../shared/components/GlobalLoading";

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
        sessionStorage.removeItem("auth_token");
        setError("Acceso denegado. Esta aplicación es exclusiva para motoristas.");
        return;
      }

      setUser(user);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { status?: number, data?: { message?: string } } }).response;
        
        if (response?.status === 409) {
          setError("Ya tienes una sesión activa en otro dispositivo.");
          return;
        }
        
        setError(response?.data?.message || "Credenciales incorrectas. Intente de nuevo.");
      } else {
        setError("Error de conexión. Intente de nuevo.");
      }
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
          <h1 className="text-center text-2xl font-bold text-[#1a1f36] mb-1">
            Bienvenido
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
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
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
