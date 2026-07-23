import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../../shared/components/ui/TextField";
import Button from "../../shared/components/ui/Button";
import { cambiarPinInicialRequest } from "../auth.service";
import { useAuth } from "../AuthContext";
import logo from "../../shared/assets/asamble.png";
import { GlobalLoading } from "../../shared/components/GlobalLoading";
import { toast } from "sonner";

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
      setError("El nuevo PIN debe tener al menos 4 dígitos.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Los PIN ingresados no coinciden.");
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
          setError(firstMsg || "Error al validar el nuevo PIN.");
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
    <div className="min-h-screen min-h-[100dvh] bg-white flex flex-col justify-between">
      {loading && <GlobalLoading message="Guardando tu PIN Privado" />}

      {/* Contenido Principal */}
      <div className="flex flex-col flex-1 justify-center items-center px-6 py-6">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={logo}
              alt="Asamblea Legislativa"
              className="h-20 w-auto object-contain"
            />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#1a1f36] mb-1">
              Establece tu PIN Privado
            </h1>
            <p className="text-sm text-slate-500">
              {user?.name ? `Hola ${user.name}. ` : ""}
              Por tu seguridad, define el PIN privado que usarás en tus accesos futuros.
            </p>
          </div>

          {/* Banner Informativo Obligatorio */}
          <div className="rounded-lg bg-amber-50 px-4 py-3 mb-6 text-xs text-amber-800 border border-amber-200">
            Este paso es obligatorio para activar tu cuenta por primera vez.
            Recuerda memorizar tu nuevo PIN.
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              label="Nuevo PIN Privado"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(val) => setPassword(val.replace(/\D/g, ''))}
              autoComplete="new-password"
              inputMode="numeric"
              name="password"
            />

            <TextField
              label="Confirmar Nuevo PIN"
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(val) => setPasswordConfirm(val.replace(/\D/g, ''))}
              autoComplete="new-password"
              inputMode="numeric"
              name="password_confirmation"
            />

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
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

      {/* Footer */}
      <div className="pb-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Asamblea Legislativa de El Salvador
      </div>
    </div>
  );
}

