import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { AuthFormData } from '../../../../shared/types/auth';
import AuthForm from './AuthForm.tsx';
import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleAuthSubmit = async (formData: AuthFormData) => {
    setLoading(true);
    setError(null);

    try {
      const result = mode === 'signin' 
        ? await signIn(formData)
        : await signUp(formData);

      if (!result.success) {
        setError(result.error);
      } else {
        // Navigate to onboarding on successful auth
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setError(null);
  };

  return (
    <div className={styles['auth-page'] ?? 'auth-page'}>
      <div className={styles['auth-container'] ?? 'auth-container'}>
        <div className={styles['auth-header'] ?? 'auth-header'}>
          <h1>NutritionU</h1>
          <p className={styles['auth-subtitle'] ?? 'auth-subtitle'}>
            {mode === 'signin' 
              ? 'Sign in to your account' 
              : 'Start your nutrition journey today'
            }
          </p>
        </div>

        <AuthForm
          mode={mode}
          onSubmit={handleAuthSubmit}
          loading={loading}
          error={error}
        />

        <div className={styles['auth-footer'] ?? 'auth-footer'}>
          <p>
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className={styles['toggle-mode-button'] ?? 'toggle-mode-button'}
              onClick={toggleMode}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
          
          {mode === 'signin' && (
            <button type="button" className={styles['forgot-password-button'] ?? 'forgot-password-button'}>
              Forgot your password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
