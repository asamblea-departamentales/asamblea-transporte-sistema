import { SolicitudMantenimientoDetalle } from '../types';
import { solicitudMantenimientoApi } from '../api/solicitudMantenimientoApi';
import { toast } from 'sonner';
import { useAprobacionBase } from './useAprobacionBase';

export function useAprobacionMantenimiento(codigo: string | undefined) {
  const {
    data, isLoading, error, comentario, setComentario,
    isSubmitting, executeAction,
  } = useAprobacionBase<SolicitudMantenimientoDetalle>({
    codigo,
    fetchFn: (c) => solicitudMantenimientoApi.getById(c),
  });

  const handleAprobar = () => {
    const obs = comentario.trim() || 'Aprobado por jefatura.';
    return executeAction(
      () => solicitudMantenimientoApi.aprobar(codigo!, obs),
      'Mantenimiento aprobado oficialmente'
    );
  };

  const handleRechazar = async () => {
    if (!comentario.trim()) {
      toast.error('Debe ingresar un comentario para rechazar');
      return;
    }
    return executeAction(
      () => solicitudMantenimientoApi.rechazar(codigo!, comentario.trim()),
      'Solicitud rechazada'
    );
  };

  const handleObservacion = async () => {
    if (!comentario.trim()) {
      toast.error('Debe ingresar un comentario');
      return;
    }
    return executeAction(
      () => solicitudMantenimientoApi.observacion(codigo!, comentario.trim()),
      'Observación guardada. Regresando al panel...'
    );
  };

  return {
    data,
    isLoading,
    error,
    comentario,
    setComentario,
    handleAprobar,
    handleRechazar,
    handleObservacion,
    isSubmitting,
  };
}
