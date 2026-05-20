import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import ScrollToTop from './components/ScrollToTop';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import RecoverPassword from './pages/RecoverPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AIStudio from './pages/AIStudio';
import Providers from './pages/Providers';
import Plans from './pages/Plans';
import AdminDashboard from './pages/AdminDashboard';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import './index.css';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function SmartDashboard() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'provider') return <ProviderDashboard />;
  return <Dashboard />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/recover-password" element={user ? <Navigate to="/dashboard" /> : <RecoverPassword />} />
        <Route path="/reset-password" element={user ? <Navigate to="/dashboard" /> : <ResetPassword />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/dashboard" element={<ProtectedRoute><SmartDashboard /></ProtectedRoute>} />
        <Route path="/provider-portal" element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />
        <Route path="/studio" element={<ProtectedRoute>{user?.role === 'user' ? <AIStudio /> : <Navigate to="/dashboard" />}</ProtectedRoute>} />
        <Route path="/studio/:projectId" element={<ProtectedRoute>{user?.role === 'user' ? <AIStudio /> : <Navigate to="/dashboard" />}</ProtectedRoute>} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
      {user?.role !== 'provider' && <ChatWidget />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
