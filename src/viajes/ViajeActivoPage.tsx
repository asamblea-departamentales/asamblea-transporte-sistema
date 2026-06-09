// src/viajes/ViajeActivoPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Shield, RefreshCw, Wifi, WifiOff, CheckCircle2, Play, CircleDot, Truck } from "lucide-react";
import { toast } from "sonner";
import { getViajesMes, iniciarViaje, registrarLlegadaViaje, iniciarRetornoViaje, finalizarViaje } from "./viajes.service";
import type { ViajeAsignado } from "./viajes.service";

// Interfaces de Tipo
interface HitoViaje {
  fase: number;
  nombre: string;
  subtexto: string;
  hora: string | null;
}

export default function ViajeActivoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [viaje, setViaje] = useState<ViajeAsignado | null>(null);
  const [loadingViaje, setLoadingViaje] = useState<boolean>(true);
  const [errorAcceso, setErrorAcceso] = useState<string | null>(null);

  // ─── 1. Estados del Ciclo de Vida (Fases de 0 a 4) ───
  // 0 = Programado, 1 = En ruta de ida, 2 = En destino (Espera/Charla), 3 = Regresando, 4 = Completado
  const [faseActual, setFaseActual] = useState<number>(0);
  
  // Timestamps reales grabados
  const [tiempos, setTiempos] = useState<{
    salida: string | null;
    llegada: string | null;
    retorno: string | null;
    fin: string | null;
  }>({
    salida: null,
    llegada: null,
    retorno: null,
    fin: null
  });

  // ─── 2. Resiliencia de Red (Soporte Offline) ───
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [colaSincronizacion, setColaSincronizacion] = useState<{ fase: number; timestamp: string }[]>([]);

  // Cargar detalles del viaje
  useEffect(() => {
    async function loadViaje() {
      try {
        const today = new Date();
        const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
        
        let nextMonth = today.getMonth() + 1;
        let nextYear = today.getFullYear();
        if (nextMonth > 11) { nextMonth = 0; nextYear++; }
        const nextMonthStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}`;

        const [dataCurrent, dataNext] = await Promise.all([
          getViajesMes(currentMonthStr),
          getViajesMes(nextMonthStr)
        ]);
        
        const allViajes = [...dataCurrent, ...dataNext];
        const found = allViajes.find(v => String(v.id) === String(id));
        if (found) {
          // Validar si es editable (es de hoy o ya está en ejecución)
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          const isEditable = found.fecha === todayStr || found.estado === "EN_EJECUCION";
          
          if (!isEditable) {
            setErrorAcceso(`Este viaje está programado para la fecha ${found.fecha}. No es posible iniciarlo hoy (${todayStr}).`);
            setViaje(null);
            setLoadingViaje(false);
            toast.error("Acceso denegado: Fecha de viaje inválida para hoy");
            return;
          }

          setViaje(found);
          
          // Reconstruir fase con datos reales del backend
          if (found.estado === "COMPLETADA") {
             setFaseActual(4);
          } else if (found.estado === "EN_EJECUCION") {
            let fase = 1;
            if (found.fecha_inicio_retorno) fase = 3;
            else if (found.fecha_llegada_destino) fase = 2;
            else if (found.fecha_salida_real) fase = 1;
            
            setFaseActual(fase);
          } else {
            setFaseActual(0);
          }

          // Función helper para formatear hora
          const formatTime = (isoString?: string) => {
            if (!isoString) return null;
            const d = new Date(isoString.replace(' ', 'T'));
            if (isNaN(d.getTime())) return null;
            return d.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
          };

          setTiempos({
            salida: formatTime(found.fecha_salida_real),
            llegada: formatTime(found.fecha_llegada_destino),
            retorno: formatTime(found.fecha_inicio_retorno),
            fin: null // El backend aún no devuelve fecha_retorno_real
          });
          
          // Cargar offline queue inicial
          const q = JSON.parse(localStorage.getItem('viaje_offline_queue') || '[]');
          setColaSincronizacion(q);
        } else {
          toast.error("Asignación de viaje no encontrada");
        }
      } catch (err) {
        toast.error("Error al conectar con los servidores de transportes");
      } finally {
        setLoadingViaje(false);
      }
    }
    
    loadViaje();
  }, [id]);

  // Guardar en localStorage cuando cambie el estado del viaje
  useEffect(() => {
    if (viaje && faseActual > 0) {
      localStorage.setItem(`viaje_fase_${id}`, String(faseActual));
      localStorage.setItem(`viaje_tiempos_${id}`, JSON.stringify(tiempos));
    }
  }, [faseActual, tiempos, id, viaje]);

  // Monitor de conexión de red y Sincronizador Offline
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      
      const q = JSON.parse(localStorage.getItem('viaje_offline_queue') || '[]');
      if (q.length > 0) {
        toast.info("Señal Recuperada. Sincronizando...", {
          description: `Enviando ${q.length} registros pendientes al servidor.`,
        });
        
        try {
          for (const item of q) {
            if (item.action === 1) await iniciarViaje(item.id);
            else if (item.action === 2) await registrarLlegadaViaje(item.id);
            else if (item.action === 3) await iniciarRetornoViaje(item.id);
            else if (item.action === 4) await finalizarViaje(item.id);
          }
          localStorage.removeItem('viaje_offline_queue');
          setColaSincronizacion([]);
          toast.success("Sincronización Completa", {
            description: "Todos los tiempos de conducción han sido consolidados exitosamente.",
          });
        } catch (e) {
          toast.error("Hubo un error al sincronizar algunos registros. Se reintentará luego.");
        }
      } else {
        toast.success("Señal de Internet Recuperada");
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Modo Sin Conexión Activado", {
        description: "La señal se ha perdido. Las marcas de tiempo se guardarán localmente.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [colaSincronizacion]);

  // ─── Lógica de Clic y Transición de Estados ───
  const procesarTransicion = async () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("es-SV", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    const proximaFase = faseActual + 1;
    
    if (!isOnline) {
      // MODO OFFLINE: Guardar acción en la cola local
      const q = JSON.parse(localStorage.getItem('viaje_offline_queue') || '[]');
      q.push({ id, action: proximaFase, timestamp: now.toISOString() });
      localStorage.setItem('viaje_offline_queue', JSON.stringify(q));
      setColaSincronizacion(q);
      
      toast.info("💾 Registro guardado en Cola Offline", {
        description: "Se enviará automáticamente cuando recuperes la señal."
      });
    } else {
      // MODO ONLINE: Enviar acción al backend
      try {
        if (proximaFase === 1) await iniciarViaje(id!);
        else if (proximaFase === 2) await registrarLlegadaViaje(id!);
        else if (proximaFase === 3) await iniciarRetornoViaje(id!);
        else if (proximaFase === 4) await finalizarViaje(id!);
      } catch (err: any) {
        toast.error("Error al conectar con el servidor", {
           description: err.response?.data?.message || "La acción falló. Revisa tu conexión."
        });
        return; // Detener ejecución si falla y hay internet
      }
    }

    // Actualizar timestamps locales y UI optimistamente
    if (proximaFase === 1) {
      setTiempos((t) => ({ ...t, salida: formattedTime }));
      setFaseActual(1);
      localStorage.setItem("viaje_en_ejecucion_id", id!);
      toast.success("¡Buen viaje!", { description: "Viaje iniciado. Conducción de ida en curso." });
    } else if (proximaFase === 2) {
      setTiempos((t) => ({ ...t, llegada: formattedTime }));
      setFaseActual(2);
      toast.info("Llegada registrada", { description: "Iniciando tiempo de espera / actividad." });
    } else if (proximaFase === 3) {
      setTiempos((t) => ({ ...t, retorno: formattedTime }));
      setFaseActual(3);
      toast.success("Retorno iniciado", { description: "Viaje de regreso hacia base central." });
    } else if (proximaFase === 4) {
      setTiempos((t) => ({ ...t, fin: formattedTime }));
      setFaseActual(4);
      toast.success("¡Servicio concluido!", { description: "Viaje finalizado y guardado con éxito." });
      
      // Limpiar LocalStorage del viaje finalizado
      localStorage.removeItem(`viaje_fase_${id}`);
      localStorage.removeItem(`viaje_tiempos_${id}`);
      localStorage.removeItem("viaje_en_ejecucion_id");
    }
  };

  // Mapeo dinámico del botón principal
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

  const btnConfig = getBotonConfig();

  // Mapeo de la línea de tiempo
  const hitos: HitoViaje[] = [
    { fase: 1, nombre: "Salida de Base Central", subtexto: "Inicio de conducción de ida", hora: tiempos.salida },
    { fase: 2, nombre: "Llegada al Destino", subtexto: "Charla / Actividad institucional", hora: tiempos.llegada },
    { fase: 3, nombre: "Inicio de Retorno", subtexto: "Regreso hacia base central", hora: tiempos.retorno },
    { fase: 4, nombre: "Finalización de Misión", subtexto: "Servicio concluido en San Salvador", hora: tiempos.fin }
  ];

  if (loadingViaje) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-screen">
        <div className="w-12 h-12 border-4 border-t-amber-500 border-r-slate-200 border-b-slate-200 border-l-slate-200 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold text-[14px] uppercase tracking-wider">Cargando detalles del viaje...</p>
      </div>
    );
  }

  if (!viaje) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-screen px-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Error de Acceso</h2>
        <p className="text-slate-500 text-[14px] max-w-sm leading-relaxed mb-6">
          {errorAcceso || "No tienes permisos para visualizar esta ruta o la asignación no existe en la base de datos oficial."}
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

  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto bg-slate-50 min-h-screen font-sans pb-12">
      
      {/* ─── Cabecera Premium Coherente ─── */}
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

        {/* Indicador de red PWA */}
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

      {/* ─── Layout Responsivo ─── */}
      <div className="px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Columna Izquierda: Información del Viaje y Mapa */}
        <div className="lg:col-span-7 space-y-5 flex flex-col">
          
          {/* Tarjeta de Viaje */}
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

          {/* Mapa SVG Simulado Interactivo */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex flex-col flex-1 min-h-[300px] relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">Mapa del Recorrido (San Salvador ➔ {viaje.destino.split(",")[0]})</h3>
              <span className="text-[10.5px] font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-md">Monitoreo Activo</span>
            </div>
            
            {/* Lienzo del Mapa SVG */}
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl relative flex items-center justify-center overflow-hidden p-4">
              <svg viewBox="0 0 400 200" className="w-full h-full max-h-[220px]">
                {/* Fondo topográfico ficticio */}
                <path d="M 0 100 Q 100 50 200 120 T 400 80" fill="none" stroke="#f1f5f9" strokeWidth="20" strokeLinecap="round" />
                <path d="M 0 150 Q 150 90 300 170 T 400 130" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
                
                {/* Ruta trazada de origen a destino */}
                <path 
                  d="M 50 120 C 120 60, 200 150, 350 80" 
                  fill="none" 
                  stroke="#e2e8f0" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                />
                
                {/* Ruta completada (activa) */}
                <path 
                  d="M 50 120 C 120 60, 200 150, 350 80" 
                  fill="none" 
                  stroke={faseActual >= 3 ? "#f59e0b" : faseActual > 0 ? "#3b82f6" : "#e2e8f0"} 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeDasharray="400"
                  strokeDashoffset={faseActual === 1 ? "250" : faseActual === 2 ? "120" : faseActual >= 3 ? "0" : "400"}
                  className="transition-all duration-1000 ease-in-out"
                />

                {/* Marcadores */}
                {/* Origen (Base Central) */}
                <g transform="translate(50, 120)">
                  <circle r="8" fill="#0f2548" className="animate-ping opacity-25" />
                  <circle r="6" fill="#0f2548" />
                  <circle r="3" fill="#fff" />
                  <text y="20" textAnchor="middle" className="text-[9px] font-black fill-slate-500 uppercase tracking-wider">Base</text>
                </g>

                {/* Destino */}
                <g transform="translate(350, 80)">
                  <circle r="8" fill="#fbbf24" className="animate-ping opacity-25" />
                  <circle r="6" fill="#fbbf24" />
                  <circle r="3" fill="#0f2548" />
                  <text y="-12" textAnchor="middle" className="text-[9px] font-black fill-[#b45309] uppercase tracking-wider">{viaje.destino.split(",")[0]}</text>
                </g>

                {/* Marcador del Carro🚗 en ruta */}
                {faseActual > 0 && faseActual < 4 && (
                  <g 
                    className="transition-all duration-1000 ease-in-out"
                    style={{
                      transform: faseActual === 1 
                        ? 'translate(130px, 90px)' 
                        : faseActual === 2 
                          ? 'translate(350px, 80px)' 
                          : 'translate(230px, 120px)'
                    }}
                  >
                    <circle r="14" fill="#3b82f6" className="fill-blue-500 opacity-20 animate-pulse" />
                    <foreignObject x="-10" y="-12" width="20" height="20">
                      <Truck className="w-5 h-5 text-blue-600 animate-bounce" />
                    </foreignObject>
                  </g>
                )}
              </svg>

              {/* Botón flotante para simular cobertura */}
              <button 
                onClick={() => setIsOnline(!isOnline)}
                className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-sm py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase text-slate-500 hover:text-slate-800 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3 text-slate-400" />
                Simular Señal
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Control de Tiempos y Bitácora */}
        <div className="lg:col-span-5 space-y-5 flex flex-col">

          {/* Línea de Tiempo / Bitácora */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex-1 flex flex-col">
            <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider mb-5">Bitácora Oficial del Servicio</h3>
            
            <div className="relative pl-6 space-y-6 flex-1">
              {/* Barra vertical de conexión */}
              <div className="absolute left-[7px] top-[6px] bottom-[6px] w-[2px] bg-slate-100 rounded-full" />

              {hitos.map((h, i) => {
                const completado = faseActual >= h.fase;
                const activo = faseActual + 1 === h.fase;
                
                return (
                  <div key={i} className="flex justify-between items-start relative transition-all duration-300">
                    {/* Punto indicador */}
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

            {/* Botón de Acción Táctil */}
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
