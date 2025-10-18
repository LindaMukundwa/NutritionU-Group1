import type { User } from './user';
export interface AuthFormData {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
  success: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (formData: AuthFormData) => Promise<AuthResponse>;
  signIn: (formData: AuthFormData) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  // Fetch latest user from backend and update context
  refreshUser?: () => Promise<null | import('./user').User>;
}