import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guards routes by authentication and role.
 * Usage: <ProtectedRoute role="teacher"><Page/></ProtectedRoute>
 */
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // Wrong role — bounce them to their own home
    const home = user.role === 'principal' ? '/principal' : '/teacher';
    return <Navigate to={home} replace />;
  }

  return children;
}
