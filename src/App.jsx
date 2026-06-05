import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Dashboard from './pages/Dashboard';
import About from './pages/About.jsx';
import Admin from './pages/Admin.jsx';
import ZohoCallback from './pages/ZohoCallback.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import MyTickets from './pages/MyTickets.jsx';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import PageTransition from '@/components/PageTransition';
import SplashScreen from '@/components/SplashScreen';


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { authError } = useAuth();

  // Only block rendering for user_not_registered — everything else renders normally.
  // Public pages don't need auth. Protected pages (Dashboard, Admin) handle their own auth.
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        {/* Auth routes — public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/About" element={<LayoutWrapper currentPageName="About"><About /></LayoutWrapper>} />
        <Route path="/zoho-callback" element={<ZohoCallback />} />

        {/* Protected routes — require authentication */}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<LayoutWrapper currentPageName="Admin"><Admin /></LayoutWrapper>} />
          <Route path="/MyTickets" element={<LayoutWrapper currentPageName="MyTickets"><MyTickets /></LayoutWrapper>} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </PageTransition>
  );
};


function App() {

  return (
    <SplashScreen>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </SplashScreen>
  )
}

export default App