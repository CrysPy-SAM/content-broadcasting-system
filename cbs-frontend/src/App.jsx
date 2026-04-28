import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherUpload from './pages/teacher/Upload';
import PrincipalDashboard from './pages/principal/Dashboard';
import PrincipalApprovals from './pages/principal/Approvals';
import BroadcastEntry from './pages/public/BroadcastEntry';
import LiveBroadcast from './pages/public/LiveBroadcast';

export default function App() {
  const { user } = useAuth();

  // Smart root: public landing if signed-out, role home if signed-in
  const root = user
    ? user.role === 'principal'
      ? '/principal'
      : '/teacher'
    : null;

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={root ? <Navigate to={root} replace /> : <BroadcastEntry />} />
      <Route path="/live/:teacherId" element={<LiveBroadcast />} />
      <Route path="/login" element={<Login />} />

      {/* Teacher */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/upload"
        element={
          <ProtectedRoute role="teacher">
            <TeacherUpload />
          </ProtectedRoute>
        }
      />

      {/* Principal */}
      <Route
        path="/principal"
        element={
          <ProtectedRoute role="principal">
            <PrincipalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/principal/approvals"
        element={
          <ProtectedRoute role="principal">
            <PrincipalApprovals />
          </ProtectedRoute>
        }
      />

      {/* 404 fallback → home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
