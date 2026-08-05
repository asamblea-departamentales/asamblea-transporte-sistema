import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage, getApiValidationErrors } from '@/shared/api/errors';

export interface UseAprobacionBaseOptions<TData> {
  /** Código de la solicitud */
  codigo: string | undefined;
  /** Función que obtiene los datos del backend */
  fetchFn: (codigo: string) => Promise<TData>;
  /** Callback opcional para inicializar estado tras cargar los datos */
  onDataLoaded?: (data: TData) => void;
}

export interface UseAprobacionBaseReturn<TData> {
  data: TData | null;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  comentario: string;
  setComentario: (comentario: string) => void;
  isSubmitting: boolean;
  /** Ejecuta una acción del servidor con manejo estándar de loading/error/toast/navigate */
  executeAction: (action: () => Promise<unknown>, successMsg: string) => Promise<void>;
}

/**
 * Hook base reutilizable para los flujos de aprobación.
 * Encapsula: fetch de datos, estado de loading/error/submitting,
 * comentario, y ejecución de acciones con toast + navegación.
 */
export function useAprobacionBase<TData>({
  codigo,
  fetchFn,
  onDataLoaded,
}: UseAprobacionBaseOptions<TData>): UseAprobacionBaseReturn<TData> {
  const navigate = useNavigate();
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setComentarioStable = useCallback((val: string) => setComentario(val), []);

  useEffect(() => {
    if (!codigo) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchFn(codigo);
        setData(result);
        onDataLoaded?.(result);
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, 'Error al cargar la solicitud');
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  const executeAction = useCallback(async (
    action: () => Promise<unknown>,
    successMsg: string,
  ) => {
    if (!codigo) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await action();
      toast.success(successMsg);
      navigate('/');
    } catch (err: unknown) {
      const validationMsg = getApiValidationErrors(err);
      const msg = validationMsg || getApiErrorMessage(err, 'Error al procesar la solicitud');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [codigo, navigate]);

  return {
    data,
    isLoading,
    error,
    setError,
    comentario,
    setComentario: setComentarioStable,
    isSubmitting,
    executeAction,
  };
}
