import { useState, useEffect } from 'react';
import { ComparativaResponse, DecisionType } from '../types';
import { solicitudApi } from '../api/solicitudApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useAprobacion(id: string | undefined) {
  const [data, setData] = useState<ComparativaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [decision, setDecision] = useState<DecisionType>('ninguna');
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    
    const fetchComparativa = async () => {
      try {
        setIsLoading(true);
        const result = await solicitudApi.getComparativa(id);
        setData(result);
        
        if (result.solicitud?.decision_final) {
          setDecision(result.solicitud.decision_final);
        }
        if (result.solicitud?.comentario_jefe) {
          setComentario(result.solicitud.comentario_jefe);
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Error al cargar la solicitud';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparativa();
  }, [id]);

  const confirmarAprobacion = async () => {
    if (!id || decision === 'ninguna') return;
    
    try {
      setIsSubmitting(true);
      await solicitudApi.aprobarConDecision(id, decision, comentario);
      toast.success('Solicitud procesada exitosamente');
      navigate('/');
    } catch (err: any) {
      const responseData = err.response?.data;
      let msg = responseData?.message || 'Error al aprobar la solicitud';
      if (err.response?.status === 422 && responseData?.errors) {
        const firstError = Object.values(responseData.errors)[0] as string[];
        msg = firstError[0] || 'Datos inválidos (422)';
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDesbloquear = async () => {
     if(!id) return;
     try {
       setIsSubmitting(true);
       await solicitudApi.desbloquear(id);
       toast.success('Solicitud desbloqueada correctamente');
       navigate('/');
     } catch(err:any) {
       const msg = err.response?.data?.message || 'Error al desbloquear';
       setError(msg);
       toast.error(msg);
     } finally {
       setIsSubmitting(false);
     }
  };

  const handleProgramar = async () => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await solicitudApi.programar(id);
      toast.success('Solicitud programada exitosamente');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al programar';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRechazar = async () => {
    if (!id) return;
    // Si queremos validar que haya comentario localmente antes de enviar:
    // if (!comentario.trim()) { setError('Debe ingresar un comentario para rechazar'); return; }
    try {
      setIsSubmitting(true);
      await solicitudApi.rechazar(id, comentario);
      toast.success('Solicitud rechazada');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al rechazar la solicitud';
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
