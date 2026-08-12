import { useCallback, useState } from 'react';
import { ComparativaResponse, DecisionType } from '../types';
import { solicitudApi } from '../api/solicitudApi';
import { useAprobacionBase } from './useAprobacionBase';

export function useAprobacion(codigo: string | undefined) {
  const [decision, setDecision] = useState<DecisionType>('ninguna');
  const [comentarioOverride, setComentarioOverride] = useState<string | null>(null);

  const {
    data, isLoading, error,
    isSubmitting, executeAction
  } = useAprobacionBase<ComparativaResponse>({
    codigo,
    fetchFn: c => solicitudApi.getComparativa(c)
  });

  const decisionFromData = data?.solicitud?.decision_final;
  const effectiveDecision = decision === 'ninguna' && decisionFromData
    ? decisionFromData
    : decision;
  const comentario = comentarioOverride ?? data?.solicitud?.comentario_jefe ?? '';
  const setComentario = useCallback((value: string) => {
    setComentarioOverride(value);
  }, []);

  const confirmarAprobacion = () => {
    if (effectiveDecision === 'ninguna') return;
    return executeAction(
      () => solicitudApi.aprobarConDecision(codigo!, effectiveDecision, comentario),
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
    decision: effectiveDecision,
    setDecision,
    comentario,
    setComentario,
    confirmarAprobacion,
    handleDesbloquear,
    handleProgramar,
    handleRechazar,
    isSubmitting
  };
}
