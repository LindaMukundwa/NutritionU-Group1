//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard/Dashboard'
import LandingPage from './components/LandingPage/LandingPage'
import AuthPage from './components/AuthPage/AuthPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Signup from './components/SignUp/SignUp';

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const auth = useAuth();
  if (auth.loading) return <div>Loading...</div>;
  return auth.user ? children : <Navigate to="/auth" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
