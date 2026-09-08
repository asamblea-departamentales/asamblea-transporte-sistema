import { useState } from 'react';
import { ClipboardCheck, Download, FileText, LoaderCircle, Route, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/Auth/context/useAuth';
import { documentosApi } from '../api/documentosApi';
import {
  getDocumentoLabel,
  getDocumentosDisponibles,
  hasDocumentosAccess,
  type DocumentoModulo,
  type DocumentoTipo,
} from '../types/documentos';

interface DocumentosActionsProps {
  codigo: string;
  modulo: DocumentoModulo;
  estado: unknown;
  vehiculoPlaca?: string | null;
  motoristaNombre?: string | null;
  combustibleId?: number;
}

const getIcon = (tipo: DocumentoTipo) => {
  if (tipo === 'transporte-mision-oficial') return Route;
  if (tipo === 'mantenimiento-orden-trabajo') return Wrench;
  return ClipboardCheck;
};

export const DocumentosActions = ({
  codigo,
  modulo,
  estado,
  vehiculoPlaca,
  motoristaNombre,
  combustibleId,
}: DocumentosActionsProps) => {
  const { user } = useAuth();
  const [loadingTipo, setLoadingTipo] = useState<DocumentoTipo | null>(null);

  const tiposDisponibles = getDocumentosDisponibles({
    modulo,
    estado,
    vehiculoPlaca,
    motoristaNombre,
  });

  if (!hasDocumentosAccess(user?.roles) || tiposDisponibles.length === 0) {
    return null;
  }

  const handleOpen = async (tipo: DocumentoTipo) => {
    if (!codigo || loadingTipo) return;

    // Abrir una sola pestaña durante el click evita el bloqueo de la navegación asíncrona.
    const popup = typeof window !== 'undefined'
      ? window.open('about:blank', '_blank')
      : null;

    if (!popup) {
      toast.error('Permite las ventanas emergentes para abrir el PDF.');
      return;
    }

    popup.document.title = 'Generando PDF...';
    popup.document.body.innerHTML = '<p style="font-family: sans-serif; padding: 2rem;">Generando documento...</p>';

    setLoadingTipo(tipo);
    try {
      const blob = await documentosApi.obtener({
        codigo,
        modulo,
        tipo,
        combustibleId,
      });
      const objectUrl = URL.createObjectURL(blob);

      if (!popup.closed) {
        popup.location.href = objectUrl;
      }

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error: unknown) {
      popup?.close();
      const message = error instanceof Error ? error.message : 'No se pudo abrir el documento.';
      toast.error(message);
    } finally {
      setLoadingTipo(null);
    }
  };

  return (
    <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Documentos de jefatura</h3>
          <p className="mt-1 text-sm text-slate-500">
            Documentos disponibles para esta solicitud aprobada.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {tiposDisponibles.map((tipo) => {
          const Icon = getIcon(tipo);
          const isLoading = loadingTipo === tipo;

          return (
            <button
              key={tipo}
              type="button"
              onClick={() => void handleOpen(tipo)}
              disabled={loadingTipo !== null}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <LoaderCircle className="animate-spin" size={17} /> : <Icon size={17} />}
              {isLoading ? 'Generando PDF...' : getDocumentoLabel(tipo)}
              {!isLoading && <Download size={15} />}
            </button>
          );
        })}
      </div>
    </section>
  );
};
