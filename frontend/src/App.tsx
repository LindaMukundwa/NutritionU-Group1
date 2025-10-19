//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// Dashboard is rendered via onboarding/dashboard routes
import LandingPage from './components/LandingPage/LandingPage'
//import AuthPage from './components/AuthPage/AuthPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Signup from './components/SignUp/SignUp';
import Dashboard from './components/Dashboard/Dashboard';

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const auth = useAuth();
  if (auth.loading) return <div>Loading...</div>;
  // Redirect to signup so the flow is: Landing -> Signup -> Onboarding -> Dashboard
  return auth.user ? children : <Navigate to="/signup" replace />;
}
import OnboardingPage from './components/OnboardingPage/OnboardingPage'

function App() {
  return (
     <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          {/* Public onboarding route used immediately after signup/sign-in */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          {/* Protected dashboard (after onboarding completes, may route here instead) */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          {/* Fallback: redirect unknown routes to auth */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
