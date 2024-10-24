import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import SignupPage from './components/Signup';
import SigninPage from './components/Signin';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Subscription from './components/Subscription';
import Payment from './components/Payment';
import GenerateResumePage from './components/Generate-Resume';
import JobApplications from './components/JobApplications';
import ChatBot from './components/ChatBot';
import InterviewCopilot from './components/InterviewCopilot';
import { Button } from './components/ui/button';
import { Menu } from 'lucide-react';
import { createBrowserRouter } from 'react-router-dom';
import { Toaster } from "./components/ui/toaster";



const AppContent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && !['/', '/signin', '/signup'].includes(location.pathname)) {
      navigate('/signin', { replace: true });
    }
  }, [user, loading, navigate, location]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const showSidebar = user && !['/', '/signin', '/signup'].includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {showSidebar && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${showSidebar && isSidebarOpen ? 'ml-64' : ''}`}>
        {showSidebar && (
          <Button
            variant="ghost"
            className="md:hidden absolute bg-gray-800 text-white top-4 left-4 z-50"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6 bg-gray-800 text-white" />
          </Button>
        )}

        <main className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signin" element={<SigninPage />} />
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/signin" replace />}
            />
            <Route
              path="/profile"
              element={user ? <Profile /> : <Navigate to="/signin" replace />}
            />
            <Route
              path="/settings"
              element={user ? <Settings /> : <Navigate to="/signin" replace />}
            />
            <Route
              path="/subscriptions"
              element={user ? <Subscription /> : <Navigate to="/signin" replace />}
            />
            <Route
              path="/payment"
              element={user ? <Payment /> : <Navigate to="/signin" replace />}
            />
            <Route
              path="/generate-resume"
              element={user ? <GenerateResumePage /> : <Navigate to="/signin" replace />}
            />
            <Route
              path="/applications"
              element={user ? <JobApplications /> : <Navigate to="/signin" replace />}
            />
            <Route
              path="/copilot/:callType"
              element={user ? <InterviewCopilot /> : <Navigate to="/signin" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <ChatBot />
        </div>
      <Toaster />
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;