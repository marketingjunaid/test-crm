import React from 'react';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<Props> = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-slate-700">{label}</label>}
    <textarea className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all resize-none ${error ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400'} bg-white ${className}`} rows={3} {...props} />
    {error && <p className="text-xs text-rose-500">{error}</p>}
  </div>
);
export default Textarea;
