import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthService } from '../../services/firebaseAuth';
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
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, fetch user data from backend
        const userData = await AuthService.getUserFromBackend(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};