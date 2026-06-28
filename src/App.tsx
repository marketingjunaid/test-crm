import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout/Layout';
import type { AppSection } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/chat/Chat';
import CalendarPage from './pages/Calendar';
import Leads from './pages/crm/Leads';
import Contacts from './pages/crm/Contacts';
import CRMCompanies from './pages/crm/CRMCompanies';
import Deals from './pages/crm/Deals';
import Employees from './pages/hr/Employees';
import LeaveManagement from './pages/hr/LeaveManagement';
import Hiring from './pages/hr/Hiring';
import Onboarding from './pages/hr/Onboarding';
import Attendance from './pages/hr/Attendance';
import Payroll from './pages/hr/Payroll';
import Performance from './pages/hr/Performance';
import HRDocuments from './pages/hr/HRDocuments';
import OrgChart from './pages/hr/OrgChart';
import SelfService from './pages/hr/SelfService';
import AuditLogPage from './pages/AuditLog';
import Invoices from './pages/finance/Invoices';
import Expenses from './pages/finance/Expenses';
import BudgetPage from './pages/finance/Budget';
import FinanceReports from './pages/finance/FinanceReports';
import Projects from './pages/projects/Projects';
import Tasks from './pages/projects/Tasks';
import Timesheets from './pages/projects/Timesheets';
import Products from './pages/inventory/Products';
import Stock from './pages/inventory/Stock';
import Vendors from './pages/inventory/Vendors';
import PurchaseOrders from './pages/inventory/PurchaseOrders';
import Tickets from './pages/support/Tickets';
import KnowledgeBase from './pages/support/KnowledgeBase';
import Assets from './pages/Assets';
import Announcements from './pages/Announcements';
import Documents from './pages/Documents';
import Settings from './pages/settings/Settings';
import Analytics from './pages/Analytics';
import Polls from './pages/communication/Polls';
import Meetings from './pages/communication/Meetings';
import AutomationPage from './pages/automation/Automation';

function ChangePasswordOverlay() {
  const { changePassword } = useAuth();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    if (pw.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    if (pw !== confirm) { setErr('Passwords do not match.'); return; }
    changePassword(pw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800">Set Your Password</h2>
          <p className="text-sm text-slate-500 mt-1">Your account was set up with a temporary password. Please create a new password to continue.</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Min. 6 characters"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"/>
          </div>
          {err && <p className="text-xs text-rose-600">{err}</p>}
          <button onClick={submit}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Set Password & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function RequireAuth() {
  const { currentUser, mustChangePassword } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <>
      {mustChangePassword && <ChangePasswordOverlay />}
      <Layout />
    </>
  );
}

function StandaloneChatGuard() {
  const { currentUser, canAccess } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!canAccess('chat')) return <Navigate to="/" replace />;
  return <Chat standalone />;
}

function ProtectedSection({ section }: { section: AppSection }) {
  const { canAccess } = useAuth();
  if (!canAccess(section)) return <Navigate to="/" replace />;
  return <Outlet />;
}

function AppRoutes() {
  const { currentUser } = useAuth();
  const isStandaloneChat = new URLSearchParams(window.location.search).get('mode') === 'chat';

  if (isStandaloneChat) {
    return <StandaloneChatGuard />;
  }

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<Dashboard />} />

        <Route element={<ProtectedSection section="calendar" />}>
          <Route path="/calendar" element={<CalendarPage />} />
        </Route>

        <Route element={<ProtectedSection section="crm" />}>
          <Route path="/crm/leads" element={<Leads />} />
          <Route path="/crm/contacts" element={<Contacts />} />
          <Route path="/crm/companies" element={<CRMCompanies />} />
          <Route path="/crm/deals" element={<Deals />} />
        </Route>

        <Route element={<ProtectedSection section="hr" />}>
          <Route path="/hr/employees" element={<Employees />} />
          <Route path="/hr/leave" element={<LeaveManagement />} />
          <Route path="/hr/hiring" element={<Hiring />} />
          <Route path="/hr/onboarding" element={<Onboarding />} />
          <Route path="/hr/attendance" element={<Attendance />} />
          <Route path="/hr/payroll" element={<Payroll />} />
          <Route path="/hr/performance" element={<Performance />} />
          <Route path="/hr/documents" element={<HRDocuments />} />
        </Route>

        <Route element={<ProtectedSection section="selfservice" />}>
          <Route path="/hr/org-chart" element={<OrgChart />} />
          <Route path="/hr/self-service" element={<SelfService />} />
        </Route>

        <Route element={<ProtectedSection section="finance" />}>
          <Route path="/finance/invoices" element={<Invoices />} />
          <Route path="/finance/expenses" element={<Expenses />} />
          <Route path="/finance/budget" element={<BudgetPage />} />
          <Route path="/finance/reports" element={<FinanceReports />} />
        </Route>

        <Route element={<ProtectedSection section="projects" />}>
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/tasks" element={<Tasks />} />
          <Route path="/projects/timesheets" element={<Timesheets />} />
        </Route>

        <Route element={<ProtectedSection section="inventory" />}>
          <Route path="/inventory/products" element={<Products />} />
          <Route path="/inventory/stock" element={<Stock />} />
          <Route path="/inventory/vendors" element={<Vendors />} />
          <Route path="/inventory/purchase-orders" element={<PurchaseOrders />} />
        </Route>

        <Route element={<ProtectedSection section="support" />}>
          <Route path="/support/tickets" element={<Tickets />} />
          <Route path="/support/knowledge-base" element={<KnowledgeBase />} />
        </Route>

        <Route element={<ProtectedSection section="assets" />}>
          <Route path="/assets" element={<Assets />} />
        </Route>

        <Route element={<ProtectedSection section="announcements" />}>
          <Route path="/announcements" element={<Announcements />} />
        </Route>

        <Route element={<ProtectedSection section="documents" />}>
          <Route path="/documents" element={<Documents />} />
        </Route>

        <Route element={<ProtectedSection section="analytics" />}>
          <Route path="/analytics" element={<Analytics />} />
        </Route>

        <Route element={<ProtectedSection section="communication" />}>
          <Route path="/communication/polls" element={<Polls />} />
          <Route path="/communication/meetings" element={<Meetings />} />
        </Route>

        <Route element={<ProtectedSection section="automation" />}>
          <Route path="/automation" element={<AutomationPage />} />
        </Route>

        <Route element={<ProtectedSection section="settings" />}>
          <Route path="/settings" element={<Settings />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/test-crm">
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
