import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TextField from "../../shared/components/ui/TextField";
import Button from "../../shared/components/ui/Button";
import { activarCuentaRequest } from "../auth.service";
import type { ActivarCuentaData } from "../auth.service";
import logo from "../../shared/assets/asamble.png";
import { GlobalLoading } from "../../shared/components/GlobalLoading";
import { toast } from "sonner";
import { Check, Copy, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen min-h-[100dvh] bg-white flex flex-col justify-between">
      {loading && <GlobalLoading message="Verificando Expediente" />}



      {/* Contenido Principal */}
      <div className="flex flex-col flex-1 justify-center items-center px-6 py-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="Asamblea Legislativa"
              className="h-16 w-auto object-contain"
            />
          </div>

          {!resultado ? (
            /* PASO 1: Formulario de Solicitud */
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-[#1a1f36] mb-1">
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
                  onChange={(val) => setExpediente(val.replace(/\D/g, ''))}
                  inputMode="numeric"
                  name="expediente"
                />

                <TextField
                  label="Número de Celular"
                  placeholder="Ej. 77971102"
                  value={telefono}
                  onChange={(val) => setTelefono(val.replace(/\D/g, ''))}
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

              {/* Enlace para Volver al login */}
              <div className="mt-8 text-center">
                <p className="text-xs text-slate-500 mb-1">
                  ¿Ya tienes tu cuenta activada?
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-bold text-[#1a1f36] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Volver al Login
                </Link>
              </div>
            </>
          ) : (
            /* PASO 2: Confirmación con PIN Temporal */
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  ¡Hola, {resultado.nombre}!
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Tu cuenta ha sido verificada. Utiliza el siguiente PIN
                  temporal para ingresar por primera vez.
                </p>
              </div>

              {/* Tarjeta con PIN de 6 dígitos */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 relative">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  PIN Temporal de Acceso
                </span>
                <div className="text-3xl font-mono font-extrabold tracking-[0.3em] text-[#1a1f36] my-2 select-all">
                  {resultado.pin_temporal}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Usuario: <span className="font-semibold text-slate-600">{resultado.username}</span>
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopiarPin}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition shadow-sm"
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

      {/* Footer */}
      <div className="pb-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Asamblea Legislativa de El Salvador
      </div>
    </div>
  );
}


