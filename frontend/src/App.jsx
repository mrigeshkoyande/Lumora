import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import StockPage from './pages/StockPage';
import BedManagementPage from './pages/BedManagementPage';
import StaffPage from './pages/StaffPage';
import AlertsPage from './pages/AlertsPage';
import SimulationPage from './pages/SimulationPage';
import ApprovalsPage from './pages/ApprovalsPage';
import FacilityDataEntryPage from './pages/FacilityDataEntryPage';
import SettingsPage from './pages/SettingsPage';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <OnboardingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/stock"
            element={
              <PrivateRoute>
                <StockPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/beds"
            element={
              <PrivateRoute>
                <BedManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <PrivateRoute>
                <StaffPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <PrivateRoute>
                <AlertsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/simulation"
            element={
              <PrivateRoute>
                <SimulationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <PrivateRoute>
                <ApprovalsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/facilities"
            element={
              <PrivateRoute>
                <FacilityDataEntryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />

          {/* Redirect base / root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
