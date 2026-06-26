import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout/Layout';
import type { AppSection } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/chat/Chat';
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

function RequireAuth() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Layout />;
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

        <Route element={<ProtectedSection section="settings" />}>
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/test-crm">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
