import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const TOUR_KEY = 'orgos_tour_done';

const steps = [
  {
    title: 'Welcome to OrgOS!',
    description: 'Your all-in-one business management platform. Let\'s take a quick tour to get you started.',
    icon: '🎉',
    position: 'center',
  },
  {
    title: 'Navigation Sidebar',
    description: 'Use the left sidebar to navigate between modules: CRM, HR, Finance, Projects, and more. Each section is organized by business function.',
    icon: '🗂️',
    position: 'center',
  },
  {
    title: 'Role-Based Access',
    description: 'Your dashboard and navigation are tailored to your role. Admins see everything, Managers see their team\'s data, and Employees see their personal information.',
    icon: '👤',
    position: 'center',
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Speed up your workflow! Press ? to see all shortcuts. Use g+d for Dashboard, g+c for CRM, g+h for HR, and more.',
    icon: '⌨️',
    position: 'center',
  },
  {
    title: 'Export & Reports',
    description: 'Export any table to CSV or print as PDF using the buttons in the header of each page. Available in Payroll, Attendance, Invoices, and Finance Reports.',
    icon: '📊',
    position: 'center',
  },
  {
    title: 'Dark Mode',
    description: 'Toggle dark mode using the moon/sun icon in the top header. Your preference is saved automatically.',
    icon: '🌙',
    position: 'center',
  },
  {
    title: 'You\'re all set!',
    description: 'Explore OrgOS at your own pace. If you ever need a refresher, check the Settings page for help. Enjoy!',
    icon: '🚀',
    position: 'center',
  },
];

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setVisible(false);
  };

  const next = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else dismiss();
  };

  const prev = () => setStep(s => Math.max(0, s - 1));

  if (!visible) return null;

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in">
        <button onClick={dismiss} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Quick Tour</span>
        </div>

        <div className="text-4xl mb-4">{current.icon}</div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">{current.title}</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{current.description}</p>

        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-indigo-600 w-4' : 'bg-slate-300'}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={prev} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button onClick={next} className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              {step === steps.length - 1 ? 'Get Started' : 'Next'} <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-3 text-center">Step {step + 1} of {steps.length}</p>
      </div>
    </div>
  );
}
