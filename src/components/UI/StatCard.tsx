import React from 'react';

interface Props { label: string; value: string | number; icon: React.ReactNode; color: string; }

export const StatCard: React.FC<Props> = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
    </div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
  </div>
);
export default StatCard;
