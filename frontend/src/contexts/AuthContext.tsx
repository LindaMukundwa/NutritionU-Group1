// File used for handling the authentication for user across the app
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthService } from '../../services/firebaseAuth';
import { getRedirectResult } from 'firebase/auth';
import type { AuthContextType, AuthFormData, AuthResponse } from '../../../shared/types/auth';
import type { User } from '../../../shared/types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribed = false;

    const handleAuthState = async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        // Check if a redirect sign-in just completed and then populate state
        try {
          const redirectResult = await getRedirectResult(auth);
          const rrUser = redirectResult?.user;
          if (rrUser) {
            const userData = await AuthService.getUserFromBackend(rrUser.uid);
            setUser(userData);
            setLoading(false);
            return;
          }
        } catch (err) {
          // ignore — redirect may not have a result to process
        }

        setUser(null);
        setLoading(false);
        return;
      }

      // Check that the user is signed in, fetch user data from backend
      const userData = await AuthService.getUserFromBackend(firebaseUser.uid);
      if (!unsubscribed) setUser(userData);
      if (!unsubscribed) setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged(handleAuthState);
    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, []);

  const signUp = async (formData: AuthFormData): Promise<AuthResponse> => {
    const result = await AuthService.signUp(formData);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signIn = async (formData: AuthFormData): Promise<AuthResponse> => {
    const result = await AuthService.signIn(formData);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signOut = async (): Promise<void> => {
    await AuthService.signOut();
    setUser(null);
  };

  const refreshUser = async (): Promise<null | User> => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;
      const userData = await AuthService.getUserFromBackend(firebaseUser.uid);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to refresh user', err);
      return null;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    return await AuthService.resetPassword(email);
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
    ,refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};