import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Shield, CheckCircle2, CircleDot, Play, RefreshCw } from "lucide-react";
import { useViajeActivo, type TiemposViaje } from "./hooks/useViajeActivo";
import { MapaViaje } from "./components/MapaViaje";
import { Wifi, WifiOff } from "lucide-react";

interface HitoViaje {
  fase: number;
  nombre: string;
  subtexto: string;
  hora: string | null;
}

export default function ViajeActivoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    viaje, 
    loading, 
    error, 
    faseActual, 
    tiempos, 
    isOnline, 
    setIsOnline, 
    procesarTransicion 
  } = useViajeActivo(id);

  const getBotonConfig = () => {
    switch (faseActual) {
      case 0:
        return {
          texto: "Iniciar Viaje (Salida)",
          color: "from-emerald-600 to-emerald-700 shadow-emerald-200 hover:from-emerald-700 hover:to-emerald-800",
          icon: <Play className="w-6 h-6 fill-white" />
        };
      case 1:
        return {
          texto: "Registrar Llegada",
          color: "from-blue-600 to-blue-700 shadow-blue-200 hover:from-blue-700 hover:to-blue-800",
          icon: <MapPin className="w-6 h-6" />
        };
      case 2:
        return {
          texto: "Iniciar Retorno",
          color: "from-amber-500 to-amber-600 shadow-amber-100 hover:from-amber-600 hover:to-amber-700 text-slate-900",
          icon: <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
        };
      case 3:
        return {
          texto: "Finalizar Viaje",
          color: "from-red-600 to-red-700 shadow-red-200 hover:from-red-700 hover:to-red-800",
          icon: <CheckCircle2 className="w-6 h-6" />
        };
      default:
        return {
          texto: "Servicio Concluido",
          color: "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none",
          icon: <CheckCircle2 className="w-6 h-6" />
        };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-screen">
        <div className="w-12 h-12 border-4 border-t-amber-500 border-r-slate-200 border-b-slate-200 border-l-slate-200 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold text-[14px] uppercase tracking-wider">Cargando detalles del viaje...</p>
      </div>
    );
  }

  if (error || !viaje) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-screen px-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Error de Acceso</h2>
        <p className="text-slate-500 text-[14px] max-w-sm leading-relaxed mb-6">
          {error || "No tienes permisos para visualizar esta ruta o la asignación no existe en la base de datos oficial."}
        </p>
        <button 
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 bg-[#0f2548] text-white font-extrabold text-[14px] uppercase tracking-wider rounded-xl hover:bg-[#1a3a75] shadow-md transition-colors"
        >
          Volver al Panel
        </button>
      </div>
    );
  }

  const btnConfig = getBotonConfig();

  const hitos: HitoViaje[] = [
    { fase: 1, nombre: "Salida de Base Central", subtexto: "Inicio de conducción de ida", hora: tiempos.salida },
    { fase: 2, nombre: "Llegada al Destino", subtexto: "Charla / Actividad institucional", hora: tiempos.llegada },
    { fase: 3, nombre: "Inicio de Retorno", subtexto: "Regreso hacia base central", hora: tiempos.retorno },
    { fase: 4, nombre: "Finalización de Misión", subtexto: "Servicio concluido en San Salvador", hora: tiempos.fin }
  ];

  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto bg-slate-50 min-h-screen font-sans pb-12">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#0f172a] leading-none tracking-tight">Modo Conducción</h1>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase border transition-all ${
          isOnline 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
            : "bg-amber-50 border-amber-200 text-amber-700 animate-pulse"
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>En Línea</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Sin Señal</span>
            </>
          )}
        </div>
      </header>

      <div className="px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        <div className="lg:col-span-7 space-y-5 flex flex-col">
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.12em]">Toyota Hilux · P-45321</span>
              <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md ${
                faseActual === 4 
                  ? "bg-emerald-500 text-white" 
                  : faseActual > 0 
                    ? "bg-blue-500 text-white animate-pulse" 
                    : "bg-amber-500 text-white"
              }`}>
                {faseActual === 0 ? "Programado" : faseActual === 4 ? "Completado" : "En Ejecución"}
              </span>
            </div>
            
            <h2 className="text-[19px] font-black text-slate-800 tracking-tight leading-snug">
              {viaje.solicitante ? `Misión: ${viaje.solicitante}` : "Comisión Oficial de Transporte"}
            </h2>
            <p className="text-[13px] font-bold text-amber-600 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {viaje.destino}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Punto de Partida</span>
                <span className="text-[13.5px] font-bold text-slate-700 mt-0.5">{viaje.origen}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hora Programada</span>
                <span className="text-[13.5px] font-bold text-slate-700 mt-0.5">{viaje.hora_salida}</span>
              </div>
            </div>
          </div>

          <MapaViaje destino={viaje.destino} faseActual={faseActual} isOnline={isOnline} setIsOnline={setIsOnline} />
        </div>

        <div className="lg:col-span-5 space-y-5 flex flex-col">
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex-1 flex flex-col">
            <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider mb-5">Bitácora Oficial del Servicio</h3>
            
            <div className="relative pl-6 space-y-6 flex-1">
              <div className="absolute left-[7px] top-[6px] bottom-[6px] w-[2px] bg-slate-100 rounded-full" />

              {hitos.map((h, i) => {
                const completado = faseActual >= h.fase;
                const activo = faseActual + 1 === h.fase;
                
                return (
                  <div key={i} className="flex justify-between items-start relative transition-all duration-300">
                    <div className={`absolute -left-[24px] top-[3px] w-4.5 h-4.5 rounded-full border-[3px] border-white flex items-center justify-center shadow-sm z-10 transition-all ${
                      completado 
                        ? "bg-emerald-500 ring-4 ring-emerald-50" 
                        : activo 
                          ? "bg-blue-500 ring-4 ring-blue-50 animate-pulse" 
                          : "bg-slate-200"
                    }`}>
                      {completado && <CircleDot className="w-1.5 h-1.5 text-white" />}
                    </div>

                    <div className="flex flex-col">
                      <span className={`text-[13.5px] font-extrabold transition-colors ${
                        completado ? "text-emerald-600" : activo ? "text-blue-600" : "text-slate-400"
                      }`}>
                        {h.nombre}
                      </span>
                      <span className="text-[11.5px] text-slate-400 font-medium mt-0.5 leading-snug">{h.subtexto}</span>
                    </div>

                    <span className={`text-[12px] font-bold shrink-0 ${
                      completado ? "text-slate-700 font-extrabold" : "text-slate-300"
                    }`}>
                      {h.hora || "--:--"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              {faseActual < 4 ? (
                <button
                  onClick={procesarTransicion}
                  className={`w-full py-4 px-6 rounded-[20px] bg-gradient-to-r ${btnConfig.color} text-white font-extrabold text-[15px] uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 shadow-md select-none focus:outline-none`}
                >
                  {btnConfig.icon}
                  <span>{btnConfig.texto}</span>
                </button>
              ) : (
                <div className="w-full py-4 px-6 rounded-[20px] bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-[15px] uppercase tracking-wider flex items-center justify-center gap-3 shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Servicio Completado</span>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 mt-4 px-2 text-center text-slate-400">
                <Shield className="w-4 h-4 text-slate-300 shrink-0" />
                <span className="text-[9.5px] font-bold uppercase tracking-wider leading-snug">
                  Control vial auditado bajo geolocalización satelital
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
