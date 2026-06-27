import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';
import OnboardingTour from '../UI/OnboardingTour';

export const Layout: React.FC = () => (
  <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
    <Sidebar />
    <div className="flex-1 flex flex-col ml-56 overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 dark:bg-slate-950">
        <Outlet />
      </main>
    </div>
    <OnboardingTour />
  </div>
);
