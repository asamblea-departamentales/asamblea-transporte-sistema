import React from 'react';
import { AsignacionOperativo } from '../types';
import { Car, User, MessageSquare } from 'lucide-react';

interface ColumnaOperativoProps {
  data: AsignacionOperativo;
  isSelected: boolean;
  onSelect: () => void;
  isFaded: boolean;
}

export const ColumnaOperativo: React.FC<ColumnaOperativoProps> = ({ data, isSelected, onSelect, isFaded }) => {
  return (
    <div 
      onClick={onSelect}
      className={`bg-white rounded-2xl p-6 shadow-sm border-2 cursor-pointer transition-all flex flex-col h-full ${
        isSelected ? 'border-[#859BFF] ring-4 ring-[#859BFF]/10' : 'border-slate-100 hover:border-[#859BFF]/50'
      } ${isFaded ? 'opacity-50 grayscale-[50%]' : ''}`}
    >
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-title font-bold text-slate-800 text-lg">Asignación Manual</h3>
          <p className="text-xs text-slate-500 mt-1">Por Operador: {data.autor}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isSelected ? 'border-[#859BFF] bg-[#859BFF]' : 'border-slate-300'
        }`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <ResourceCard 
          icon={<Car size={16} />} 
          title="Vehículo Asignado"
          name={data.vehiculo.placa}
          subtitle={data.vehiculo.modelo}
          fuel={data.vehiculo.combustible_porcentaje}
        />

        <ResourceCard 
          icon={<User size={16} />} 
          title="Motorista Asignado"
          name={data.motorista.nombre}
          hours={data.motorista.horas_periodo_7d}
        />

        {data.cambio_detectado !== 'ninguno' && data.justificacion && (
          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl mt-auto">
            <p className="text-xs font-bold text-amber-700 uppercase mb-2 flex items-center gap-1.5">
              <MessageSquare size={14} /> Justificación Operativa
            </p>
            <p className="text-sm text-amber-900 italic">"{data.justificacion}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ResourceCard = ({ icon, title, name, subtitle, fuel, hours }: any) => (
  <div className="border border-slate-100 rounded-xl p-3 flex gap-3 bg-slate-50">
    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{title}</p>
      <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
      {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      {hours !== undefined && <p className="text-xs text-slate-500 mt-0.5">Manejo 7D: {hours} hrs</p>}
    </div>
    {fuel !== undefined && (
      <div className="flex flex-col items-end justify-center shrink-0">
        <span className="text-xs font-bold text-slate-700">{fuel}%</span>
        <div className="w-8 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
          <div className={`h-full ${fuel > 20 ? 'bg-emerald-500' : 'bg-danger'}`} style={{ width: `${fuel}%` }} />
        </div>
      </div>
    )}
  </div>
);
