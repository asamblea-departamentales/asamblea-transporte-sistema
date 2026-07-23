import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../../shared/components/ui/TextField";
import Button from "../../shared/components/ui/Button";
import { cambiarPinInicialRequest } from "../auth.service";
import { useAuth } from "../AuthContext";
import logo from "../../shared/assets/asamble.png";
import { GlobalLoading } from "../../shared/components/GlobalLoading";
import { toast } from "sonner";
import { KeyRound, ShieldAlert } from "lucide-react";

export default function CambiarPinInicialPage() {
  const { setDebeCambiarPassword, user } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (password.length < 4) {
      setError("El nuevo PIN o contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Las contraseñas ingresadas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const res = await cambiarPinInicialRequest({
        password,
        password_confirmation: passwordConfirm,
      });

      if (res.status) {
        toast.success(
          res.message || "PIN privado configurado correctamente. Cuenta activada."
        );
        setDebeCambiarPassword(false);
        navigate("/dashboard", { replace: true });
      } else {
        setError(res.message || "No se pudo actualizar el PIN.");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (
          err as {
            response?: {
              data?: {
                message?: string;
                errors?: Record<string, string[]>;
              };
            };
          }
        ).response;

        const data = response?.data;
        if (data?.errors) {
          const firstKey = Object.keys(data.errors)[0];
          const firstMsg = data.errors[firstKey]?.[0];
          setError(firstMsg || "Error al validar la nueva contraseña.");
        } else if (data?.message) {
          setError(data.message);
        } else {
          setError("No se pudo actualizar el PIN. Intente de nuevo.");
        }
      } else {
        setError("Error de conexión. Intente de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50/60 sm:bg-slate-100/70 flex flex-col justify-between">
      {loading && <GlobalLoading message="Guardando tu PIN Privado" />}

      {/* Spacer superior PC */}
      <div className="hidden sm:block flex-1" />

      {/* Contenido Principal */}
      <div className="flex flex-col flex-1 sm:flex-none justify-center items-center px-4 sm:px-6 py-6">
        <div className="w-full max-w-sm sm:max-w-md bg-white p-6 sm:p-10 sm:rounded-3xl sm:shadow-xl sm:border sm:border-slate-200/80">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img
              src={logo}
              alt="Asamblea Legislativa"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>

          <div className="text-center mb-6">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-600 mb-3 shadow-sm border border-amber-100">
              <KeyRound className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1f36] mb-1">
              Establece tu PIN Privado
            </h1>
            <p className="text-sm text-slate-500">
              {user?.name ? `Hola ${user.name}. ` : ""}
              Por tu seguridad, define la contraseña o PIN privado que usarás en tus accesos futuros.
            </p>
          </div>

          {/* Banner Informativo Obligatorio */}
          <div className="rounded-xl bg-amber-50 p-4 mb-6 text-xs text-amber-800 border border-amber-200 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Este paso es obligatorio para activar tu cuenta por primera vez.
              Recuerda memorizar tu nueva contraseña.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <TextField
              label="Nueva Contraseña o PIN Privado"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              inputMode="numeric"
              name="password"
            />

            <TextField
              label="Confirmar Nueva Contraseña"
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              autoComplete="new-password"
              inputMode="numeric"
              name="password_confirmation"
            />

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-start space-x-2">
                <span className="shrink-0 text-red-500 font-bold">•</span>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={loading || !password || !passwordConfirm}
              className="min-h-12 text-base"
            >
              GUARDAR PIN PRIVADO
            </Button>
          </form>
        </div>
      </div>

      {/* Spacer inferior PC */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="pb-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Asamblea Legislativa de El Salvador
      </div>
    </div>
  );
}

