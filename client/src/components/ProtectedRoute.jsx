import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Or your loading spinner

  // 1. If not logged in, kick them to the landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. If logged in but wrong role, redirect to their correct dashboard
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'warden') return <Navigate to="/warden/dashboard" replace />;
    if (user.role === 'security') return <Navigate to="/security/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  // 3. If authorized, show the page
  return <Outlet />;
};

export default ProtectedRoute;