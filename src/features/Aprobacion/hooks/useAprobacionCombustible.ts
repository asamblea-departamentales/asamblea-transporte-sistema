import { useState, useEffect } from 'react';
import { ComparativaCombustibleResponse, DecisionCombustibleType } from '../types';
import { solicitudCombustibleApi } from '../api/solicitudCombustibleApi';
import { useNavigate } from 'react-router-dom';

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
        setError(err.response?.data?.message || 'Error al cargar la solicitud');
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
      setError('Debe ingresar un monto válido para re-asignar');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      await solicitudCombustibleApi.aprobarConDecision(id, decision, comentario, montoManual);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al aprobar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDesbloquear = async () => {
     if(!id) return;
     try {
       setIsSubmitting(true);
       await solicitudCombustibleApi.desbloquear(id);
       navigate('/');
     } catch(err:any) {
       setError(err.response?.data?.message || 'Error al desbloquear');
     } finally {
       setIsSubmitting(false);
     }
  };

  const handleRechazar = async () => {
    if (!id) return;
    if (!comentario.trim()) { 
      setError('Debe ingresar un comentario para rechazar'); 
      return; 
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await solicitudCombustibleApi.rechazar(id, comentario);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al rechazar la solicitud');
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
