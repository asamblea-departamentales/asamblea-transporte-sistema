import React from 'react';
import { ENV } from '../config/environment';
import { AlertTriangle, Terminal } from 'lucide-react';

export const EnvironmentBanner: React.FC = () => {
  if (ENV.isProduccion) return null;

  if (ENV.isPrueba) {
    return (
      <div className="bg-amber-600 text-white text-xs font-medium px-4 py-1.5 flex items-center justify-between shadow-md z-50 sticky top-0">
        <div className="flex items-center space-x-2 container mx-auto">
          <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
          <span>
            <strong>ENTORNO DE PRUEBAS (QA)</strong> — Sistema Institucional de Transporte (Servidor QA).
          </span>
        </div>
      </div>
    );
  }

  if (ENV.isLocal) {
    return (
      <div className="bg-slate-800 text-slate-200 text-[11px] font-mono px-3 py-1 flex items-center justify-between z-50">
        <div className="flex items-center space-x-2 container mx-auto">
          <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>DEV LOCAL | API: <span className="text-emerald-300">{ENV.apiBaseUrl}</span></span>
        </div>
      </div>
    );
  }

  return null;
};
