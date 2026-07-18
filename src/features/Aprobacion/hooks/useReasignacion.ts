import { useState } from 'react';
import { toast } from 'sonner';
import { axiosClient } from '../../../shared/api/axiosClient';
import { solicitudApi, RecursoDisponible } from '../api/solicitudApi';

export function useReasignacion(id: string | undefined, onSuccess: () => void) {
  const [showReasignarModal, setShowReasignarModal] = useState(false);
  const [recursos, setRecursos] = useState<RecursoDisponible | null>(null);
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<number | ''>('');
  const [selectedMotorista, setSelectedMotorista] = useState<number | ''>('');
  const [motivoReasignacion, setMotivoReasignacion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openReasignarModal = async (fechaS?: string, fechaR?: string) => {
    setShowReasignarModal(true);
    setLoadingRecursos(true);
    try {
      const result = await solicitudApi.getRecursosDisponibles(fechaS, fechaR);
      setRecursos(result);
    } catch {
      try {
        const [vRes, mRes] = await Promise.all([
          axiosClient.get('/catalogos/vehiculos/disponibles'),
          axiosClient.get('/catalogos/motoristas/disponibles')
        ]);
        setRecursos({
          vehiculos: Array.isArray(vRes.data) ? vRes.data : [],
          motoristas: Array.isArray(mRes.data) ? mRes.data : []
        });
      } catch {
        setRecursos({ vehiculos: [], motoristas: [] });
      }
    } finally {
      setLoadingRecursos(false);
    }
  };

  const handleReasignar = async () => {
    if (!id || !selectedVehiculo || !selectedMotorista || !motivoReasignacion.trim()) return;
    try {
      setIsSubmitting(true);
      await solicitudApi.reasignar(id, Number(selectedVehiculo), Number(selectedMotorista), motivoReasignacion);
      toast.success('¡Reasignación exitosa! El motorista y vehículo han sido actualizados.');
      setShowReasignarModal(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al reasignar recursos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    showReasignarModal,
    setShowReasignarModal,
    recursos,
    loadingRecursos,
    selectedVehiculo,
    setSelectedVehiculo,
    selectedMotorista,
    setSelectedMotorista,
    motivoReasignacion,
    setMotivoReasignacion,
    isSubmitting,
    openReasignarModal,
    handleReasignar
  };
}
