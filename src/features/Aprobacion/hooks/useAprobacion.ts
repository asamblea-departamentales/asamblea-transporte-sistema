import { useState, useEffect } from 'react';
import { ComparativaResponse, DecisionType } from '../types';
import { solicitudApi } from '../api/solicitudApi';
import { useAprobacionBase } from './useAprobacionBase';

export function useAprobacion(codigo: string | undefined) {
  const [decision, setDecision] = useState<DecisionType>('ninguna');

  const {
    data, isLoading, error, comentario, setComentario,
    isSubmitting, executeAction,
  } = useAprobacionBase<ComparativaResponse>({
    codigo,
    fetchFn: (c) => solicitudApi.getComparativa(c),
  });

  // Restaurar decisión y comentario previos si la solicitud ya fue procesada
  useEffect(() => {
    if (data?.solicitud?.decision_final) {
      setDecision(data.solicitud.decision_final);
    }
    if (data?.solicitud?.comentario_jefe) {
      setComentario(data.solicitud.comentario_jefe);
    }
  }, [data, setComentario]);

  const confirmarAprobacion = () => {
    if (decision === 'ninguna') return;
    return executeAction(
      () => solicitudApi.aprobarConDecision(codigo!, decision, comentario),
      'Solicitud procesada exitosamente'
    );
  };

  const handleDesbloquear = () =>
    executeAction(
      () => solicitudApi.desbloquear(codigo!),
      'Solicitud desbloqueada correctamente'
    );

  const handleProgramar = () =>
    executeAction(
      () => solicitudApi.programar(codigo!),
      'Solicitud programada exitosamente'
    );

  const handleRechazar = () =>
    executeAction(
      () => solicitudApi.rechazar(codigo!, comentario),
      'Solicitud rechazada'
    );

  return {
    data,
    isLoading,
    error,
    decision,
    setDecision,
    comentario,
    setComentario,
    confirmarAprobacion,
    handleDesbloquear,
    handleProgramar,
    handleRechazar,
    isSubmitting,
  };
}
