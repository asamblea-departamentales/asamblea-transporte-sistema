import { useState, useEffect } from 'react';
import { ComparativaCombustibleResponse } from '../types';
import { solicitudCombustibleApi } from '../api/solicitudCombustibleApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/shared/api/errors';

export function useAprobacionCombustible(codigo: string | undefined) {
  const [data, setData] = useState<ComparativaCombustibleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [comentario, setComentario] = useState('');
  const [tipoDecision, setTipoDecision] = useState<'operativo' | 'jefe'>('operativo');
  const [montoManual, setMontoManual] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!codigo) return;
    
    const fetchComparativa = async () => {
      try {
        setIsLoading(true);
        const result = await solicitudCombustibleApi.getComparativa(codigo);
        setData(result);
        
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
    if (!codigo) return;
    
    if (tipoDecision === 'jefe' && (!montoManual || Number(montoManual) <= 0)) {
      const msg = 'Debe ingresar una cantidad válida de cargas para aprobar manualmente';
      setError(msg); 
      toast.error(msg); 
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await solicitudCombustibleApi.aprobarConDecision(
        codigo, 
        tipoDecision, 
        comentario || 'Aprobado por jefatura', 
        tipoDecision === 'jefe' ? Number(montoManual) : undefined
      );
      toast.success('Solicitud procesada exitosamente');
      navigate('/');
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Error al aprobar la solicitud');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleObservacion = async () => {
    if (!codigo) return;
    if (!comentario.trim()) { 
      const msg = 'Debe ingresar un comentario para enviar una observación';
      setError(msg); toast.error(msg); return; 
    }
    try {
      setIsSubmitting(true); setError(null);
      await solicitudCombustibleApi.observacion(codigo, comentario);
      toast.success('Observación registrada');
      navigate('/');
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Error al registrar la observación');
      setError(msg); toast.error(msg);
    } finally { setIsSubmitting(false); }
  };

  const handlePreAprobar = async () => {
    if (!codigo) return;
    try {
      setIsSubmitting(true); setError(null);
      await solicitudCombustibleApi.preAprobar(codigo, comentario || 'Pre-aprobado por jefatura');
      toast.success('Solicitud pre-aprobada');
      navigate('/');
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Error al pre-aprobar la solicitud');
      setError(msg); toast.error(msg);
    } finally { setIsSubmitting(false); }
  };

  const handleRechazar = async () => {
    if (!codigo) return;
    if (!comentario.trim()) { 
      const msg = 'Debe ingresar un comentario para rechazar';
      setError(msg); 
      toast.error(msg);
      return; 
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await solicitudCombustibleApi.rechazar(codigo, comentario);
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
    isSubmitting
  };
}
