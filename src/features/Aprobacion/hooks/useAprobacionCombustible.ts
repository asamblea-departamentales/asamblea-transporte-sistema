import { useState, useEffect } from 'react';
import { ComparativaCombustibleResponse, DecisionCombustibleType } from '../types';
import { solicitudCombustibleApi } from '../api/solicitudCombustibleApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useAprobacionCombustible(id: string | undefined) {
  const [data, setData] = useState<ComparativaCombustibleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [decision, setDecision] = useState<DecisionCombustibleType>('ninguna');
  const [comentario, setComentario] = useState('');
  const [montoManual, setMontoManual] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    
    const fetchComparativa = async () => {
      try {
        setIsLoading(true);
        const result = await solicitudCombustibleApi.getComparativa(id);
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
    
    // Si la decisión es jefe, necesitamos validar que se ingresó un monto
    if (decision === 'jefe' && (!montoManual || montoManual <= 0)) {
      const msg = 'Debe ingresar un monto válido para re-asignar';
      setError(msg);
      toast.error(msg);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      await solicitudCombustibleApi.aprobarConDecision(id, decision, comentario, montoManual);
      toast.success('Solicitud procesada exitosamente');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al aprobar la solicitud';
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
       await solicitudCombustibleApi.desbloquear(id);
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

  const handleRechazar = async () => {
    if (!id) return;
    if (!comentario.trim()) { 
      const msg = 'Debe ingresar un comentario para rechazar';
      setError(msg); 
      toast.error(msg);
      return; 
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await solicitudCombustibleApi.rechazar(id, comentario);
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
    montoManual,
    setMontoManual,
    confirmarAprobacion,
    handleDesbloquear,
    handleRechazar,
    isSubmitting
  };
}
