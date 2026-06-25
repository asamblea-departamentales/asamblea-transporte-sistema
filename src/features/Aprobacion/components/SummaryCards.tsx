import React from 'react';
import { Clock, Zap, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { DashboardSummary } from '../api/dashboardApi';
import { useNavigate } from 'react-router-dom';

interface SummaryCardsProps {
  summary?: DashboardSummary;
  isLoading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse h-[140px]"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      topLabel: 'ACCIÓN REQUERIDA',
      title: 'Por aprobar',
      value: summary.pending,
      icon: <Clock size={22} className="text-white" />,
      bgClass: 'bg-gradient-to-br from-[#4F46E5] to-[#3b32c9] text-white',
      borderClass: 'border-[#4F46E5]',
      iconBg: 'bg-white/20',
      textValue: 'text-white',
      textLabel: 'text-indigo-100',
      action: () => navigate('/aprobaciones')
    },
    {
      topLabel: 'EN PROGRESO',
      title: 'En proceso',
      value: summary.in_progress,
      icon: <Zap size={22} className="text-blue-500" />,
      bgClass: 'bg-white',
      borderClass: 'border-slate-100',
      iconBg: 'bg-blue-50',
      textValue: 'text-[#182645]',
      textLabel: 'text-slate-400',
      action: () => navigate('/historial')
    },
    {
      topLabel: 'ACEPTADAS',
      title: 'Aprobadas',
      value: summary.accepted,
      icon: <CheckCircle size={22} className="text-emerald-500" />,
      bgClass: 'bg-white',
      borderClass: 'border-slate-100',
      iconBg: 'bg-emerald-50',
      textValue: 'text-[#182645]',
      textLabel: 'text-slate-400',
      action: () => navigate('/historial')
    },
    {
      topLabel: 'FINALIZADAS',
      title: 'Completadas',
      value: summary.completed,
      icon: <FileText size={22} className="text-slate-500" />,
      bgClass: 'bg-white',
      borderClass: 'border-slate-100',
      iconBg: 'bg-slate-50',
      textValue: 'text-[#182645]',
      textLabel: 'text-slate-400',
      action: () => navigate('/historial')
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          onClick={card.action}
          className={`${card.bgClass} rounded-[20px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border ${card.borderClass} flex flex-col justify-between min-h-[150px] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
        >
          <div className="flex justify-between items-start">
            <p className={`text-[10px] font-bold tracking-widest ${card.textLabel}`}>{card.topLabel}</p>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <h3 className={`text-[44px] leading-none font-bold ${card.textValue}`}>{card.value}</h3>
          </div>
          <div className="mt-4">
            <span className={`text-[14px] font-semibold ${idx === 0 ? 'text-white' : 'text-slate-700'}`}>{card.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
