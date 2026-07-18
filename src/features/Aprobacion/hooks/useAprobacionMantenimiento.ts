import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { solicitudMantenimientoApi } from '../api/solicitudMantenimientoApi';
import { SolicitudMantenimientoDetalle } from '../types';
import { getApiErrorMessage } from '@/shared/api/errors';

export function useAprobacionMantenimiento(codigo: string | undefined) {
  const navigate = useNavigate();
  const [data, setData] = useState<SolicitudMantenimientoDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    if (!codigo) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await solicitudMantenimientoApi.getById(codigo);
        setData(result);
        setError(null);
      } catch (err: unknown) {
        console.error('Error cargando la solicitud de mantenimiento:', err);
        setError(getApiErrorMessage(err, 'Error al cargar la solicitud'));
        toast.error('No se pudo cargar la solicitud');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [codigo]);

  const handleAprobar = async () => {
    if (!codigo) return;
    
    // Para mantenimiento, no exigimos comentario en la aprobación obligatoriamente,
    // pero si lo escribieron lo mandamos. (Podemos poner un default si el backend lo exige).
    const obs = comentario.trim() || 'Aprobado por jefatura.';
    
    try {
      setIsSubmitting(true);
      await solicitudMantenimientoApi.aprobar(codigo, obs);
      toast.success('Mantenimiento aprobado oficialmente');
      navigate('/');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Error al aprobar la solicitud'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRechazar = async () => {
    if (!codigo) return;
    if (!comentario.trim()) {
      toast.error('Debe ingresar un comentario para rechazar');
      return;
    }

    try {
      setIsSubmitting(true);
      await solicitudMantenimientoApi.rechazar(codigo, comentario.trim());
      toast.success('Solicitud rechazada');
      navigate('/');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Error al rechazar la solicitud'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleObservacion = async () => {
    if (!codigo) return;
    if (!comentario.trim()) {
      toast.error('Debe ingresar un comentario');
      return;
    }

    try {
      setIsSubmitting(true);
      await solicitudMantenimientoApi.observacion(codigo, comentario.trim());
      toast.success('Observación guardada. Regresando al panel...');
      navigate('/');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Error al guardar observación'));
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
    handleAprobar,
    handleRechazar,
    handleObservacion,
    isSubmitting
  };
}
