import { useState, useEffect } from 'react';
import { ComparativaCombustibleResponse } from '../types';
import { solicitudCombustibleApi } from '../api/solicitudCombustibleApi';
import { toast } from 'sonner';
import { useAprobacionBase } from './useAprobacionBase';

export function useAprobacionCombustible(codigo: string | undefined) {
  const [tipoDecision, setTipoDecision] = useState<'operativo' | 'jefe'>('operativo');
  const [montoManual, setMontoManual] = useState<number | ''>('');

  const {
    data, isLoading, error, setError, comentario, setComentario,
    isSubmitting, executeAction,
  } = useAprobacionBase<ComparativaCombustibleResponse>({
    codigo,
    fetchFn: (c) => solicitudCombustibleApi.getComparativa(c),
  });

  // Restaurar comentario previo
  useEffect(() => {
    if (data?.solicitud?.comentario_jefe) {
      setComentario(data.solicitud.comentario_jefe);
    }
  }, [data, setComentario]);

  const confirmarAprobacion = async () => {
    if (!codigo) return;
    if (tipoDecision === 'jefe' && (!montoManual || Number(montoManual) <= 0)) {
      const msg = 'Debe ingresar una cantidad válida de cargas para aprobar manualmente';
      setError(msg);
      toast.error(msg);
      return;
    }
    return executeAction(
      () => solicitudCombustibleApi.aprobarConDecision(
        codigo,
        tipoDecision,
        comentario || 'Aprobado por jefatura',
        tipoDecision === 'jefe' ? Number(montoManual) : undefined
      ),
      'Solicitud procesada exitosamente'
    );
  };

  const handleObservacion = async () => {
    if (!comentario.trim()) {
      const msg = 'Debe ingresar un comentario para enviar una observación';
      setError(msg);
      toast.error(msg);
      return;
    }
    return executeAction(
      () => solicitudCombustibleApi.observacion(codigo!, comentario),
      'Observación registrada'
    );
  };

  const handlePreAprobar = () =>
    executeAction(
      () => solicitudCombustibleApi.preAprobar(codigo!, comentario || 'Pre-aprobado por jefatura'),
      'Solicitud pre-aprobada'
    );

  const handleRechazar = async () => {
    if (!comentario.trim()) {
      const msg = 'Debe ingresar un comentario para rechazar';
      setError(msg);
      toast.error(msg);
      return;
    }
    return executeAction(
      () => solicitudCombustibleApi.rechazar(codigo!, comentario),
      'Solicitud rechazada'
    );
  };

  return {
    data,
    isLoading,
    error,
    comentario,
    setComentario,
    tipoDecision,
    setTipoDecision,
    montoManual,
    setMontoManual,
    confirmarAprobacion,
    handleObservacion,
    handlePreAprobar,
    handleRechazar,
    isSubmitting,
  };
}
