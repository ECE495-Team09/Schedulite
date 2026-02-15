import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/AppShell';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Home from './pages/Home';
import Settings from './pages/Settings';
import JoinGroup from './pages/JoinGroup';
import CreateGroup from './pages/CreateGroup';
import GroupPage from './pages/GroupPage';
import GroupSettings from './pages/GroupSettings';
import CreateEvent from './pages/CreateEvent';
import EventPage from './pages/EventPage';
import EventSettings from './pages/EventSettings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes — wrapped in AppShell (Navbar + content area) */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/settings" element={<Settings />} />

        {/* Group routes */}
        <Route path="/groups/join" element={<JoinGroup />} />
        <Route path="/groups/create" element={<CreateGroup />} />
        <Route path="/groups/:groupId" element={<GroupPage />} />
        <Route path="/groups/:groupId/settings" element={<GroupSettings />} />
        <Route path="/groups/:groupId/events/create" element={<CreateEvent />} />

        {/* Event routes */}
        <Route path="/events/:eventId" element={<EventPage />} />
        <Route path="/events/:eventId/settings" element={<EventSettings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
