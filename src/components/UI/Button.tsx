import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
  secondary: 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white',
  ghost: 'hover:bg-slate-100 text-slate-600',
};
const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' };

export const Button: React.FC<Props> = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => (
  <button className={`inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
    {children}
  </button>
);
export default Button;
