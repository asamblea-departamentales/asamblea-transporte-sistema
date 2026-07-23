import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TextField from "../../shared/components/ui/TextField";
import Button from "../../shared/components/ui/Button";
import { activarCuentaRequest } from "../auth.service";
import type { ActivarCuentaData } from "../auth.service";
import logo from "../../shared/assets/asamble.png";
import { GlobalLoading } from "../../shared/components/GlobalLoading";
import { toast } from "sonner";
import { Check, Copy, ArrowLeft, ShieldCheck, UserCheck } from "lucide-react";

export default function ActivarCuentaPage() {
  const navigate = useNavigate();

  const [expediente, setExpediente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos devueltos tras la activación exitosa
  const [resultado, setResultado] = useState<ActivarCuentaData | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const res = await activarCuentaRequest({
        numero_expediente: expediente.trim(),
        telefono: telefono.trim(),
      });

      if (res.status && res.data) {
        setResultado(res.data);
        toast.success("Cuenta verificada exitosamente");
      } else {
        setError(res.message || "No se pudo verificar la cuenta.");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (
          err as {
            response?: {
              status?: number;
              data?: {
                message?: string;
                errors?: Record<string, string[]>;
                status?: boolean;
              };
            };
          }
        ).response;

        if (response?.status === 429) {
          setError(
            "Demasiados intentos. Por favor espera 1 minuto e intenta de nuevo."
          );
          setLoading(false);
          return;
        }

        const data = response?.data;
        if (data?.errors) {
          const firstKey = Object.keys(data.errors)[0];
          const firstMsg = data.errors[firstKey]?.[0];
          setError(firstMsg || "Error en la validación de los datos.");
        } else if (data?.message) {
          setError(data.message);
        } else {
          setError("No se pudo activar la cuenta. Revisa tus datos.");
        }
      } else {
        setError("Error de conexión. Intente de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCopiarPin() {
    if (!resultado?.pin_temporal) return;
    navigator.clipboard.writeText(resultado.pin_temporal);
    setCopiado(true);
    toast.success("PIN copiado al portapapeles");
    setTimeout(() => setCopiado(false), 3000);
  }

  function handleIrALogin() {
    if (resultado?.username) {
      navigate(`/login?username=${encodeURIComponent(resultado.username)}`, {
        replace: true,
      });
    } else {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50/60 sm:bg-slate-100/70 flex flex-col justify-between">
      {loading && <GlobalLoading message="Verificando Expediente" />}

      {/* Header con botón de regresar */}
      <div className="pt-6 px-4 sm:px-6 max-w-sm sm:max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition py-1 px-2 rounded-lg hover:bg-slate-200/50"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver al Login
        </Link>
      </div>

      {/* Spacer superior PC */}
      <div className="hidden sm:block flex-1" />

      {/* Contenido Principal */}
      <div className="flex flex-col flex-1 sm:flex-none justify-center items-center px-4 sm:px-6 py-4">
        <div className="w-full max-w-sm sm:max-w-md bg-white p-6 sm:p-10 sm:rounded-3xl sm:shadow-xl sm:border sm:border-slate-200/80">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img
              src={logo}
              alt="Asamblea Legislativa"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>

          {!resultado ? (
            /* PASO 1: Formulario de Solicitud */
            <>
              <div className="text-center mb-6">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3 shadow-sm border border-blue-100">
                  <UserCheck className="w-6 h-6" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1f36] mb-1">
                  Activar mi Cuenta
                </h1>
                <p className="text-sm text-slate-500">
                  Ingresa tu número de expediente e información de contacto
                  registrada.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <TextField
                  label="Número de Expediente"
                  placeholder="Ej. 1078"
                  value={expediente}
                  onChange={setExpediente}
                  inputMode="numeric"
                  name="expediente"
                />

                <TextField
                  label="Número de Celular"
                  placeholder="Ej. 7797-1102"
                  value={telefono}
                  onChange={setTelefono}
                  inputMode="tel"
                  name="telefono"
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
                  disabled={loading || !expediente.trim() || !telefono.trim()}
                  className="min-h-12 text-base"
                >
                  VALIDAR Y ACTIVAR CUENTA
                </Button>
              </form>
            </>
          ) : (
            /* PASO 2: Confirmación con PIN Temporal */
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-1 shadow-sm border border-emerald-100">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                  ¡Hola, {resultado.nombre}!
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Tu cuenta ha sido verificada. Utiliza el siguiente PIN
                  temporal para ingresar por primera vez.
                </p>
              </div>

              {/* Tarjeta con PIN de 6 dígitos */}
              <div className="bg-slate-50/80 border-2 border-dashed border-slate-300 rounded-2xl p-6 relative">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  PIN Temporal de Acceso
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-extrabold tracking-[0.3em] text-[#1a1f36] my-2 select-all">
                  {resultado.pin_temporal}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Usuario de acceso: <span className="font-bold text-slate-700">{resultado.username}</span>
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopiarPin}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition shadow-sm active:scale-[0.99]"
                >
                  {copiado ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600">¡PIN Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copiar PIN</span>
                    </>
                  )}
                </button>

                <Button
                  type="button"
                  onClick={handleIrALogin}
                  className="min-h-12 text-base"
                >
                  IR A INICIAR SESIÓN
                </Button>
              </div>
            </div>
          )}
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

