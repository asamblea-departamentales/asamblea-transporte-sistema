import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { solicitudMantenimientoApi } from '../api/solicitudMantenimientoApi';
import { SolicitudMantenimientoDetalle } from '../types';

export function useAprobacionMantenimiento(id: string | undefined) {
  const navigate = useNavigate();
  const [data, setData] = useState<SolicitudMantenimientoDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await solicitudMantenimientoApi.getById(id);
        setData(result);
        setError(null);
      } catch (err: any) {
        console.error('Error cargando la solicitud de mantenimiento:', err);
        setError(err.response?.data?.message || 'Error al cargar la solicitud');
        toast.error('No se pudo cargar la solicitud');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAprobar = async () => {
    if (!id) return;
    
    // Para mantenimiento, no exigimos comentario en la aprobación obligatoriamente,
    // pero si lo escribieron lo mandamos. (Podemos poner un default si el backend lo exige).
    const obs = comentario.trim() || 'Aprobado por jefatura.';
    
    try {
      setIsSubmitting(true);
      await solicitudMantenimientoApi.aprobar(id, obs);
      toast.success('Mantenimiento aprobado oficialmente');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al aprobar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRechazar = async () => {
    if (!id) return;
    if (!comentario.trim()) {
      toast.error('Debe ingresar un comentario para rechazar');
      return;
    }

    try {
      setIsSubmitting(true);
      await solicitudMantenimientoApi.rechazar(id, comentario.trim());
      toast.success('Solicitud rechazada');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al rechazar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleObservacion = async () => {
    if (!id) return;
    if (!comentario.trim()) {
      toast.error('Debe ingresar un comentario');
      return;
    }

    try {
      setIsSubmitting(true);
      await solicitudMantenimientoApi.observacion(id, comentario.trim());
      toast.success('Observación guardada. Regresando al panel...');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar observación');
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
