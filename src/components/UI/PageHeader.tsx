import React from 'react';

interface Props { title: string; subtitle?: string; action?: React.ReactNode; }

export const PageHeader: React.FC<Props> = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
export default PageHeader;
