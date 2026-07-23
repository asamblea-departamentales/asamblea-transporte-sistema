import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import TextField from "../../shared/components/ui/TextField";
import Button from "../../shared/components/ui/Button";
import { loginRequest } from "../auth.service";
import { useAuth } from "../AuthContext";
import logo from "../../shared/assets/asamble.png";
import { GlobalLoading } from "../../shared/components/GlobalLoading";

export default function LoginPage() {
  const { setUser, setDebeCambiarPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const usernameParam = searchParams.get("username");
    if (usernameParam) {
      setUsername(usernameParam);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);
    
    // Limpieza preventiva: asegurar que no haya rastro de sesiones previas en este navegador
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("debe_cambiar_password");

    try {
      const loginResult = await loginRequest({ username: username.trim(), password });
      const user = loginResult.user;
      
      // Validar que el usuario tenga el rol de motorista
      const esMotorista = user.roles?.includes("motorista");
      if (!esMotorista) {
        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("debe_cambiar_password");
        setError("Acceso denegado. Esta aplicación es exclusiva para motoristas.");
        return;
      }

      setUser(user);
      setDebeCambiarPassword(loginResult.debe_cambiar_password);

      if (loginResult.debe_cambiar_password) {
        navigate("/cambiar-pin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { status?: number, data?: { message?: string } } }).response;
        
        if (response?.status === 409) {
          setError("Sesión Activa: Ya tienes una sesión abierta en otro dispositivo. Debes cerrarla allá para poder entrar aquí.");
          setLoading(false); // Detener el loading inmediatamente
          return; // SALIR ABSOLUTAMENTE DEL FLUJO
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
          <h1 className="text-center text-2xl font-bold text-slate-900 mb-1">
            Bienvenido
          </h1>
          <p className="text-center text-sm text-slate-500 mb-10">
            Ingresa tus credenciales institucionales
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              label="Número Celular o Usuario"
              placeholder="77971102"
              value={username}
              onChange={setUsername}
              autoComplete="username"
              inputMode="tel"
              name="username"
            />

            <TextField
              label="PIN de acceso"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(val) => setPassword(val.replace(/\D/g, ''))}
              autoComplete="current-password"
              inputMode="numeric"
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

          {/* Enlace para primera vez / activación */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              ¿Es la primera vez que ingresas a la app?
            </p>
            <Link
              to="/activar-cuenta"
              className="mt-1 inline-block text-sm font-bold text-slate-900 hover:underline"
            >
              Activar mi cuenta aquí
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Asamblea Legislativa de El Salvador
      </div>

    </div>
  );
}


