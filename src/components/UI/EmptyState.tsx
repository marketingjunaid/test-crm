import React from 'react';
import { Inbox } from 'lucide-react';

interface Props { message?: string; action?: React.ReactNode; }

export const EmptyState: React.FC<Props> = ({ message = 'No records found', action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
      <Inbox size={22} className="text-slate-400" />
    </div>
    <p className="text-sm text-slate-500 mb-4">{message}</p>
    {action}
  </div>
);
export default EmptyState;
