import React from 'react';

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<Props> = ({ label, error, options, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-slate-700">{label}</label>}
    <select className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all ${error ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400'} bg-white ${className}`} {...props}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="text-xs text-rose-500">{error}</p>}
  </div>
);
export default Select;
