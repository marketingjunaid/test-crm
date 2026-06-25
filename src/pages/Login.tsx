import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const ok = login(email, password);
      if (ok) navigate('/dashboard');
      else setError('Invalid email or password');
      setLoading(false);
    }, 400);
  };

  const features = ['Manage your entire organization in one place', 'CRM, HR, Finance, Projects & more', 'No subscriptions, no external APIs'];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">OrgOS</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">Run your entire<br />organization<br /><span className="text-indigo-400">smarter.</span></h1>
          <div className="flex flex-col gap-3 mt-8">
            {features.map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-slate-600 text-xs">© 2025 OrgOS. All rights reserved.</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 size={16} className="text-white" />
              </div>
              <span className="font-bold text-slate-900">OrgOS</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs text-rose-600">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 mt-1 shadow-sm">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-medium text-slate-600 mb-2">Demo credentials</p>
            <div className="flex flex-col gap-1.5">
              {[
                { role: 'Admin', email: 'admin@acme.com', pw: 'admin123' },
                { role: 'Manager', email: 'manager@acme.com', pw: 'manager123' },
                { role: 'Employee', email: 'employee@acme.com', pw: 'employee123' },
              ].map(c => (
                <button key={c.role} onClick={() => { setEmail(c.email); setPassword(c.pw); }}
                  className="text-left text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                  <span className="font-medium text-slate-700">{c.role}:</span> {c.email} / {c.pw}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
