import { useState, useEffect } from 'react';
import { ComparativaResponse, DecisionType } from '../types';
import { solicitudApi } from '../api/solicitudApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage, getApiValidationErrors } from '@/shared/api/errors';

export function useAprobacion(codigo: string | undefined) {
  const [data, setData] = useState<ComparativaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [decision, setDecision] = useState<DecisionType>('ninguna');
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!codigo) return;
    
    const fetchComparativa = async () => {
      try {
        setIsLoading(true);
        const result = await solicitudApi.getComparativa(codigo);
        setData(result);
        
        if (result.solicitud?.decision_final) {
          setDecision(result.solicitud.decision_final);
        }
        if (result.solicitud?.comentario_jefe) {
          setComentario(result.solicitud.comentario_jefe);
        }
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, 'Error al cargar la solicitud');
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparativa();
  }, [codigo]);

  const confirmarAprobacion = async () => {
    if (!codigo || decision === 'ninguna') return;
    
    try {
      setIsSubmitting(true);
      await solicitudApi.aprobarConDecision(codigo, decision, comentario);
      toast.success('Solicitud procesada exitosamente');
      navigate('/');
    } catch (err: unknown) {
      const validationMsg = getApiValidationErrors(err);
      const msg = validationMsg || getApiErrorMessage(err, 'Error al aprobar la solicitud');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDesbloquear = async () => {
     if(!codigo) return;
     try {
       setIsSubmitting(true);
       await solicitudApi.desbloquear(codigo);
       toast.success('Solicitud desbloqueada correctamente');
       navigate('/');
     } catch(err: unknown) {
       const msg = getApiErrorMessage(err, 'Error al desbloquear');
       setError(msg);
       toast.error(msg);
     } finally {
       setIsSubmitting(false);
     }
  };

  const handleProgramar = async () => {
    if (!codigo) return;
    try {
      setIsSubmitting(true);
      await solicitudApi.programar(codigo);
      toast.success('Solicitud programada exitosamente');
      navigate('/');
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Error al programar');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRechazar = async () => {
    if (!codigo) return;
    // Si queremos validar que haya comentario localmente antes de enviar:
    // if (!comentario.trim()) { setError('Debe ingresar un comentario para rechazar'); return; }
    try {
      setIsSubmitting(true);
      await solicitudApi.rechazar(codigo, comentario);
      toast.success('Solicitud rechazada');
      navigate('/');
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Error al rechazar la solicitud');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    isSubmitting
  };
}
