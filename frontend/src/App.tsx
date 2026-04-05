import React from 'react';
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes } from 'react-router-dom';
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
import { FeedbackProvider } from './contexts/FeedbackContext';
import { isAdminEmail } from './constants/admin';
import NavProgress from './components/ui/NavProgress';

const PublicHomeRoute: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) return <LandingPage />;
  return <Navigate to={isAdminEmail(user?.email) ? '/admin' : '/dashboard'} replace />;
};

const PrivateAppShell: React.FC = () => (
  <PrivateRoute>
    <AppLayout>
      <Outlet />
    </AppLayout>
  </PrivateRoute>
);

const AdminAppShell: React.FC = () => (
  <AdminRoute>
    <AppLayout>
      <Outlet />
    </AppLayout>
  </AdminRoute>
);

const AnimatedRoutes: React.FC = () => {
  return (
    <>
      {/* Top glowing progress bar on every navigation */}
      <NavProgress />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/rules" element={<PlatformRules />} />

        {/* Private app shell */}
        <Route element={<PrivateAppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/goals/new" element={<NewGoal />} />
          <Route path="/goals" element={<GoalsList />} />
          <Route path="/goals/:id" element={<GoalDetail />} />
          <Route path="/goals/:id/edit" element={<EditGoal />} />
          <Route path="/goals/:id/log" element={<GoalLogActivity />} />
          <Route path="/leaderboard" element={<EnhancedLeaderboard />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/activity" element={<ActivityLog />} />
        </Route>

        {/* Admin shell */}
        <Route element={<AdminAppShell />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="/" element={<PublicHomeRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <FeedbackProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AnimatedRoutes />
          </Router>
        </FeedbackProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
