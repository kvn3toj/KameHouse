import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import WelcomeModal from '@/components/WelcomeModal';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Habits from '@/pages/Habits';
import Achievements from '@/pages/Achievements';
import KameHouse from '@/pages/KameHouse';
import Marketplace from '@/pages/Marketplace';
import Chores from '@/pages/Chores';
import BulletinBoard from '@/pages/BulletinBoard';
import Tasks from '@/pages/Tasks';
import { householdApi } from '@/lib/household-api';

function AppContent() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeChecked, setWelcomeChecked] = useState(false);

  useEffect(() => {
    const checkWelcome = async () => {
      // Only check if user is logged in
      if (!user) {
        setWelcomeChecked(true);
        return;
      }

      // Check if user has already dismissed welcome
      const welcomeDismissed = localStorage.getItem('kh_welcome_dismissed');
      if (welcomeDismissed === 'true') {
        setShowWelcome(false);
        setWelcomeChecked(true);
        return;
      }

      // Check if user has a household
      try {
        const household = await householdApi.getMy();
        setShowWelcome(!household); // Show welcome if no household
      } catch (error) {
        // If error, assume user doesn't have household
        setShowWelcome(true);
      } finally {
        setWelcomeChecked(true);
      }
    };

    checkWelcome();
  }, [user]);

  const handleWelcomeSuccess = async () => {
    setShowWelcome(false);
    // Reload the page to refresh user data
    window.location.reload();
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/habits"
          element={
            <ProtectedRoute>
              <Layout>
                <Habits />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <Layout>
                <Achievements />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/kamehouse"
          element={
            <ProtectedRoute>
              <Layout>
                <KameHouse />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Layout>
                <Marketplace />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chores"
          element={
            <ProtectedRoute>
              <Layout>
                <Chores />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulletin"
          element={
            <ProtectedRoute>
              <Layout>
                <BulletinBoard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Welcome Modal for first-time users */}
      {welcomeChecked && (
        <WelcomeModal
          open={showWelcome}
          onClose={() => setShowWelcome(false)}
          onSuccess={handleWelcomeSuccess}
        />
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
