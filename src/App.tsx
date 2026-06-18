import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Contacts } from './pages/Contacts';
import { Companies } from './pages/Companies';
import { Deals } from './pages/Deals';
import { Tasks } from './pages/Tasks';
import { Notes } from './pages/Notes';
import { Settings } from './pages/Settings';
import { HR } from './pages/HR';

function ProtectedRoutes() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/hr" element={<HR />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </AppProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/test-crm">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
