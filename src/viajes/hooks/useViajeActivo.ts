import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  getViajeById, 
  iniciarViaje, 
  registrarLlegadaViaje, 
  iniciarRetornoViaje, 
  finalizarViaje,
  type ViajeAsignado 
} from "../viajes.service";

export interface TiemposViaje {
  salida: string | null;
  llegada: string | null;
  retorno: string | null;
  fin: string | null;
}

export function useViajeActivo(id: string | undefined) {
  const [viaje, setViaje] = useState<ViajeAsignado | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [faseActual, setFaseActual] = useState<number>(0);
  const [tiempos, setTiempos] = useState<TiemposViaje>({
    salida: null, llegada: null, retorno: null, fin: null
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return null;
    const d = new Date(isoString.replace(' ', 'T'));
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  };

  const cargarViaje = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getViajeById(id);
      
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const isEditable = data.fecha === todayStr || data.estado === "EN_EJECUCION";
      
      if (!isEditable) {
        setError(`Este viaje está programado para la fecha ${data.fecha}. No es posible iniciarlo hoy (${todayStr}).`);
        return;
      }

      setViaje(data);
      
      let fase = 0;
      if (data.estado === "COMPLETADA" || data.estado === "FINALIZADA") {
        fase = 4;
      } else if (data.estado === "EN_EJECUCION") {
        fase = 1;
        if (data.fecha_inicio_retorno) fase = 3;
        else if (data.fecha_llegada_destino) fase = 2;
        else if (data.fecha_salida_real) fase = 1;
      }
      setFaseActual(fase);
      
      setTiempos({
        salida: formatTime(data.fecha_salida_real),
        llegada: formatTime(data.fecha_llegada_destino),
        retorno: formatTime(data.fecha_inicio_retorno),
        fin: formatTime(data.fecha_retorno_real)
      });
      
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al conectar con los servidores de transportes";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarViaje();
  }, [cargarViaje]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const q = JSON.parse(localStorage.getItem('viaje_offline_queue') || '[]');
      if (q.length > 0) {
        toast.info("Señal Recuperada. Sincronizando...", { description: `Enviando ${q.length} registros pendientes al servidor.`});
        try {
          for (const item of q) {
            if (item.action === 1) await iniciarViaje(item.id, item.timestamp);
            else if (item.action === 2) await registrarLlegadaViaje(item.id, item.timestamp);
            else if (item.action === 3) await iniciarRetornoViaje(item.id, item.timestamp);
            else if (item.action === 4) await finalizarViaje(item.id, item.timestamp);
          }
          localStorage.removeItem('viaje_offline_queue');
          toast.success("Sincronización Completa");
        } catch (e) {
          toast.error("Hubo un error al sincronizar algunos registros. Se reintentará luego.");
        }
      } else {
        toast.success("Señal de Internet Recuperada");
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Modo Sin Conexión", { description: "La señal se ha perdido. Las marcas de tiempo se guardarán localmente."});
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const procesarTransicion = async () => {
    if (!id) return;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    
    const isoTimestamp = now.toISOString(); 
    const proximaFase = faseActual + 1;
    
    if (!isOnline) {
      const q = JSON.parse(localStorage.getItem('viaje_offline_queue') || '[]');
      q.push({ id, action: proximaFase, timestamp: isoTimestamp });
      localStorage.setItem('viaje_offline_queue', JSON.stringify(q));
      toast.info("💾 Registro guardado en Cola Offline");
    } else {
      try {
        if (proximaFase === 1) await iniciarViaje(id, isoTimestamp);
        else if (proximaFase === 2) await registrarLlegadaViaje(id, isoTimestamp);
        else if (proximaFase === 3) await iniciarRetornoViaje(id, isoTimestamp);
        else if (proximaFase === 4) await finalizarViaje(id, isoTimestamp);
      } catch (err: any) {
        toast.error("Error al conectar con el servidor", { description: err.response?.data?.message || "La acción falló." });
        return; 
      }
    }

    if (proximaFase === 1) {
      setTiempos(t => ({ ...t, salida: formattedTime }));
      setFaseActual(1);
      localStorage.setItem("viaje_en_ejecucion_id", id);
      toast.success("¡Buen viaje!", { description: "Viaje iniciado. Conducción de ida en curso." });
    } else if (proximaFase === 2) {
      setTiempos(t => ({ ...t, llegada: formattedTime }));
      setFaseActual(2);
      toast.info("Llegada registrada", { description: "Iniciando tiempo de espera / actividad." });
    } else if (proximaFase === 3) {
      setTiempos(t => ({ ...t, retorno: formattedTime }));
      setFaseActual(3);
      toast.success("Retorno iniciado", { description: "Viaje de regreso hacia base central." });
    } else if (proximaFase === 4) {
      setTiempos(t => ({ ...t, fin: formattedTime }));
      setFaseActual(4);
      localStorage.removeItem("viaje_en_ejecucion_id");
      toast.success("¡Servicio concluido!", { description: "Viaje finalizado y guardado con éxito." });
    }
  };

  return { viaje, loading, error, faseActual, tiempos, isOnline, setIsOnline, procesarTransicion };
}
