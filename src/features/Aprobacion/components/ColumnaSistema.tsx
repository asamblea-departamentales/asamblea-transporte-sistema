import React from 'react';
import { SugerenciaSistema } from '../types';
import { Car, User, Cpu, CheckCircle2 } from 'lucide-react';

interface ColumnaSistemaProps {
  data: SugerenciaSistema | null;
  isSelected: boolean;
  onSelect: () => void;
  isFaded: boolean;
}

export const ColumnaSistema: React.FC<ColumnaSistemaProps> = ({ data, isSelected, onSelect, isFaded }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col h-full items-center justify-center text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
          <Cpu className="text-slate-400" size={24} />
        </div>
        <p className="text-sm font-bold text-slate-800">Sin Sugerencia de Sistema</p>
        <p className="text-xs text-slate-500 mt-1">El sistema no pudo generar una sugerencia para esta solicitud.</p>
      </div>
    );
  }

  return (
    <div 
      onClick={onSelect}
      className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-colors flex flex-col h-full ${
        isSelected ? 'border-success' : 'border-transparent hover:border-slate-300'
      } ${isFaded ? 'opacity-60 grayscale-[30%]' : ''}`}
      style={{
        boxShadow: isSelected ? '0 0 0 1px rgba(16, 185, 129, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-200">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 tracking-tight">
            <Cpu size={20} className="text-success" />
            Sugerencia del Sistema
          </h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            Score: <span className="text-success font-bold">{data.score_confianza}%</span> compatibilidad
          </p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isSelected ? 'border-success bg-success' : 'border-slate-300'
        }`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <ResourceCard 
          icon={<Car size={16} />} 
          title="VehÃ­culo Ã“ptimo"
          name={data.vehiculo_sugerido.placa}
          subtitle={data.vehiculo_sugerido.modelo}
          fuel={data.vehiculo_sugerido.nivel_combustible}
        />

        <ResourceCard 
          icon={<User size={16} />} 
          title="Motorista Ã“ptimo"
          name={data.motorista_sugerido.nombre}
          hours={data.motorista_sugerido.horas_periodo_7d || data.horas_motorista_periodo}
        />

        <div className="bg-success/5 border border-success/20 p-4 rounded-lg mt-auto">
          <p className="text-[11px] font-bold text-success uppercase tracking-wider mb-3">Razones de SelecciÃ³n</p>
          <ul className="space-y-2">
            {data.bullets_tecnicos.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                <span className="leading-tight">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

interface ResourceCardProps {
  icon: React.ReactNode;
  title: string;
  name?: string | number;
  subtitle?: string | number;
  fuel?: {
    valor?: number;
    label?: string;
  } | null;
  hours?: number;
}

const ResourceCard = ({ icon, title, name, subtitle, fuel, hours }: ResourceCardProps) => (
  <div className="border border-slate-200 rounded-lg p-3 flex flex-col gap-3 bg-slate-50">
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded text-slate-500 bg-white border border-slate-200 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
        {subtitle && <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>}
        {hours !== undefined && <p className="text-xs text-slate-500 mt-0.5 font-medium">Manejo 7D: <span className="text-slate-800">{hours} hrs</span></p>}
      </div>
    </div>
    {fuel && fuel.valor !== undefined && (
      <div className="pt-2 mt-1 border-t border-slate-200">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nivel de Combustible</span>
          <span className="text-xs font-bold text-slate-700">{fuel.label}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full ${fuel.valor > 20 ? 'bg-success' : 'bg-danger'}`} style={{ width: `${fuel.valor}%` }} />
        </div>
      </div>
    )}
  </div>
);
