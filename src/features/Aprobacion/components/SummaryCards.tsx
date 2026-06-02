import React from 'react';
import { Clock, Zap, CheckCircle, FileText } from 'lucide-react';
import { DashboardSummary } from '../api/dashboardApi';

interface SummaryCardsProps {
  summary?: DashboardSummary;
  isLoading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, isLoading }) => {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse h-[116px]"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      topLabel: 'PENDIENTES',
      title: 'Por aprobar',
      value: summary.pending,
      icon: <Clock size={18} className="text-slate-700" />,
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-500',
    },
    {
      topLabel: 'EN PROGRESO',
      title: 'En proceso',
      value: summary.in_progress,
      icon: <Zap size={18} className="text-slate-700" />,
      dotColor: 'bg-blue-600',
      textColor: 'text-blue-600',
    },
    {
      topLabel: 'ACEPTADAS',
      title: 'Aprobadas',
      value: summary.accepted,
      icon: <CheckCircle size={18} className="text-slate-700" />,
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-500',
    },
    {
      topLabel: 'FINALIZADAS',
      title: 'Completadas',
      value: summary.completed,
      icon: <FileText size={18} className="text-slate-700" />,
      dotColor: 'bg-slate-400',
      textColor: 'text-slate-500',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/80 cursor-default flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-400 tracking-widest">{card.topLabel}</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100">
              {card.icon}
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-[40px] leading-none font-bold text-[#182645]">{card.value}</h3>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${card.dotColor}`}></span>
            <span className={`text-[13px] font-semibold ${card.textColor}`}>{card.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
