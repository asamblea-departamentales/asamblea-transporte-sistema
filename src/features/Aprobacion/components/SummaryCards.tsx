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
      title: 'Por Aprobar',
      value: summary.pending,
      icon: <Clock size={24} className="text-amber-500" />,
      bgIcon: 'bg-amber-50',
    },
    {
      title: 'En progreso',
      value: summary.in_progress,
      icon: <Zap size={24} className="text-[#859BFF]" />,
      bgIcon: 'bg-indigo-50',
    },
    {
      title: 'Aprobadas',
      value: summary.accepted,
      icon: <CheckCircle size={24} className="text-emerald-500" />,
      bgIcon: 'bg-emerald-50',
    },
    {
      title: 'Completadas',
      value: summary.completed,
      icon: <FileText size={24} className="text-slate-400" />,
      bgIcon: 'bg-slate-50',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
              <h3 className="text-3xl font-bold text-slate-800">{card.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bgIcon}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
