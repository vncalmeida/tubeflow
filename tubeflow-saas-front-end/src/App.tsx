import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Freelancer from './pages/Freelancers';
import Recuperacao from './pages/Recuperacao';
import VerificationCode from './pages/VerificationCode';
import Newpassword from './pages/Newpassword';
import Channels from './pages/Channels';
import Videos from './pages/Videos';
import LogsAndStats from './pages/LogsAndStats';
import CustomReports from './pages/CustomReports';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Home from './pages/Home';
import PaymentPage from './pages/Paymentpage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentError from './pages/PaymentError';
import RegisterPage from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminUsers from './pages/AdminUsers';
import AdminPlans from './pages/AdminPlans';
import AdminCompanies from './pages/AdminCompanies';
import AdminWelcomeSettings from './pages/AdminWelcomeSettings';
import AdminFooterSettings from './pages/AdminFooterSettings';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import { SidebarProvider } from './context/SidebarContext';

const isAuthenticated = () => !!localStorage.getItem('token');
const isAdminAuthenticated = () => !!localStorage.getItem('adminToken');
const isFreelancer = () => localStorage.getItem('isFreelancer') === 'true';

const ProtectedRoute = ({
  element,
  allowedForFreelancers,
  allowedRoles = [],
}: {
  element: JSX.Element;
  allowedForFreelancers?: boolean;
  allowedRoles?: string[];
}) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const roles = JSON.parse(localStorage.getItem('roles') || '[]') as string[];
  if (allowedRoles.length > 0 && !allowedRoles.some((r) => roles.includes(r))) {
    return <Navigate to="/" replace />;
  }
  if (isFreelancer() && !allowedForFreelancers) return <Navigate to="/" replace />;
  return element;
};

const AdminProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const adminRoles: string[] = adminData.roles || [];
  if (!isAdminAuthenticated() || !adminRoles.includes('admin')) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    return <Navigate to="/admin/login" replace />;
  }
  return element;
};

function ThemeGuard() {
  const location = useLocation();

  // Aplicar tema inicial imediatamente ao montar o componente
  useEffect(() => {
    try {
      const root = document.documentElement;
      const isAdminRoute = location.pathname.startsWith('/admin');

      if (isAdminRoute) {
        root.classList.remove('dark');
        root.setAttribute('data-admin', 'true');
      } else {
        root.removeAttribute('data-admin');
        // Usar try-catch para evitar erros se localStorage não estiver disponível
        try {
          const theme = localStorage.getItem('theme') || 'dark';
          localStorage.setItem('theme', theme);
          if (theme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        } catch (storageError) {
          // Fallback para dark mode se localStorage não estiver disponível
          root.classList.add('dark');
        }
      }
    } catch (error) {
      console.warn('Erro ao aplicar tema:', error);
    }
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ThemeGuard />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperacao" element={<Recuperacao />} />
        <Route path="/codigo" element={<VerificationCode />} />
        <Route path="/reset-password" element={<Newpassword />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-error" element={<PaymentError />} />
        <Route path="/" element={<Home />} />
        <Route path="/payment" element={<PaymentPage onBack={() => window.history.back()} />} />
        <Route
          path="/freelancers"
          element={
            <SidebarProvider>
              <ProtectedRoute element={<Freelancer />} allowedForFreelancers={false} />
            </SidebarProvider>
          }
        />
        <Route
          path="/welcome"
          element={
            <SidebarProvider>
              <ProtectedRoute element={<Welcome />} allowedForFreelancers={true} />
            </SidebarProvider>
          }
        />
        <Route
          path="/administradores"
          element={
            <SidebarProvider>
              <ProtectedRoute element={<Admin />} allowedForFreelancers={false} />
            </SidebarProvider>
          }
        />
        <Route
          path="/logs"
          element={
            <SidebarProvider>
              <ProtectedRoute element={<LogsAndStats />} allowedForFreelancers={false} />
            </SidebarProvider>
          }
        />
        <Route
          path="/videos"
          element={
            <SidebarProvider>
              <ProtectedRoute element={<Videos />} allowedForFreelancers={true} />
            </SidebarProvider>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <SidebarProvider>
              <ProtectedRoute element={<Settings />} allowedForFreelancers={true} />
            </SidebarProvider>
          }
        />
        <Route
          path="/reports"
          element={
            <SidebarProvider>
              <ProtectedRoute element={<CustomReports />} allowedForFreelancers={true} />
            </SidebarProvider>
          }
        />
        <Route
          path="/canais"
          element={
            <SidebarProvider>
              <ProtectedRoute element={<Channels />} allowedForFreelancers={false} />
            </SidebarProvider>
          }
        />
        <Route
          path="/dashboard"
          element={
            <SidebarProvider>
              <ProtectedRoute element={<Dashboard />} allowedForFreelancers={true} />
            </SidebarProvider>
          }
        />
        <Route path="/registro" element={<RegisterPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute element={<AdminDashboard />} />} />
        <Route path="/admin/footer" element={<AdminProtectedRoute element={<AdminFooterSettings />} />} />
        <Route path="/admin/config" element={<AdminProtectedRoute element={<AdminWelcomeSettings />} />} />
        <Route path="/admin/users" element={<AdminProtectedRoute element={<AdminUsers />} />} />
        <Route path="/admin/plans" element={<AdminProtectedRoute element={<AdminPlans />} />} />
        <Route path="/admin/companies" element={<AdminProtectedRoute element={<AdminCompanies />} />} />

        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
