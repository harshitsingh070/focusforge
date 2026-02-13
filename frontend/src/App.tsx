import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
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
import { isAdminEmail } from './constants/admin';

const PublicHomeRoute: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <Navigate to={isAdminEmail(user?.email) ? '/admin' : '/dashboard'} replace />;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/rules" element={<PlatformRules />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals/new"
            element={
              <PrivateRoute>
                <NewGoal />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <PrivateRoute>
                <GoalsList />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals/:id"
            element={
              <PrivateRoute>
                <GoalDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals/:id/edit"
            element={
              <PrivateRoute>
                <EditGoal />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals/:id/log"
            element={
              <PrivateRoute>
                <GoalLogActivity />
              </PrivateRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <EnhancedLeaderboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/badges"
            element={
              <PrivateRoute>
                <Badges />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <PrivateRoute>
                <ActivityLog />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/" element={<PublicHomeRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
