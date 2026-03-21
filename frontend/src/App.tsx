import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from './store';
import ForgotPassword from './components/Auth/ForgotPassword';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import LandingPage from './components/Landing/LandingPage';
import Dashboard from './components/Dashboard/Dashboard';
import NewGoal from './components/Goals/NewGoal';
import GoalsList from './components/Goals/GoalsList';
import GoalDetail from './components/Goals/GoalDetail';
import EditGoal from './components/Goals/EditGoal';
import GoalLogActivity from './components/Goals/LogActivity';
import EnhancedLeaderboard from './components/Leaderboard/EnhancedLeaderboard';
import Badges from './components/Badges/Badges';
import Analytics from './components/Analytics/Analytics';
import Settings from './components/Settings/Settings';
import PlatformRules from './components/Rules/PlatformRules';
import ActivityLog from './components/Activity/ActivityLog';
import PrivateRoute from './components/Layout/PrivateRoute';
import AdminRoute from './components/Layout/AdminRoute';
import AdminDashboard from './components/Admin/AdminDashboard';
import AppLayout from './components/Layout/AppLayout';
import { isAdminEmail } from './constants/admin';

const PublicHomeRoute: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) return <LandingPage />;
  return <Navigate to={isAdminEmail(user?.email) ? '/admin' : '/dashboard'} replace />;
};

/**
 * PrivateLayout — wraps children in AppLayout for authenticated pages.
 */
const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PrivateRoute>
    <AppLayout>{children}</AppLayout>
  </PrivateRoute>
);

/**
 * AnimatedRoutes — wraps all routes in a keyed div so every top-level
 * pathname change triggers a fresh CSS ff-page-enter animation.
 */
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const routeKey = '/' + (location.pathname.split('/')[1] || '');

  return (
    <div
      key={routeKey}
      style={{
        animation: 'ff-page-enter 160ms cubic-bezier(0.4,0,0.2,1) both',
        willChange: 'transform, opacity',
      }}
    >
      <Routes location={location}>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/rules" element={<PlatformRules />} />

        {/* Private routes — wrapped in AppLayout */}
        <Route path="/dashboard" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
        <Route path="/goals/new" element={<PrivateLayout><NewGoal /></PrivateLayout>} />
        <Route path="/goals" element={<PrivateLayout><GoalsList /></PrivateLayout>} />
        <Route path="/goals/:id" element={<PrivateLayout><GoalDetail /></PrivateLayout>} />
        <Route path="/goals/:id/edit" element={<PrivateLayout><EditGoal /></PrivateLayout>} />
        <Route path="/goals/:id/log" element={<PrivateLayout><GoalLogActivity /></PrivateLayout>} />
        <Route path="/leaderboard" element={<PrivateLayout><EnhancedLeaderboard /></PrivateLayout>} />
        <Route path="/badges" element={<PrivateLayout><Badges /></PrivateLayout>} />
        <Route path="/analytics" element={<PrivateLayout><Analytics /></PrivateLayout>} />
        <Route path="/settings" element={<PrivateLayout><Settings /></PrivateLayout>} />
        <Route path="/activity" element={<PrivateLayout><ActivityLog /></PrivateLayout>} />
        <Route path="/admin" element={<AdminRoute><AppLayout><AdminDashboard /></AppLayout></AdminRoute>} />

        <Route path="/" element={<PublicHomeRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AnimatedRoutes />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
