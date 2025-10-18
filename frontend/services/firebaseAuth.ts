import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithRedirect
} from 'firebase/auth';
import { auth } from '../src/config/firebase'; // Your firebase config
import type { AuthFormData, AuthResponse } from '../../shared/types/auth';
import type { User } from '../../shared/types/user'; // Adjust path as needed

// Default values for new users
const defaultDietaryRestrictions = {
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  dairyFree: false,
  nutFree: false,
  halal: false,
  custom: []
};

const defaultNutritionGoals = {
  goals: 'None',
  calories: 2000,
  protein: 50,
  carbs: 250,
  fats: 70,
  description: 'Default goals'
};

const defaultUserPreferences = {
  cuisineTypes: [],
  cookingTime: 'moderate',
  skillLevel: 'beginner',
  budgetRange: { min: 0, max: 100 },
  servingSize: 2
};

export class AuthService {
  /**
   * Sign in with Google using popup when possible.
   * If the popup is blocked or cancelled, fall back to redirect-based sign-in.
   * Note: redirect flow will navigate away and the result must be handled on app load
   * (e.g. with getRedirectResult or by checking auth state in AuthContext).
   */
  static async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const provider = new GoogleAuthProvider();
      // Try popup first (better UX). Many browsers block popups unless triggered
      // directly by a user gesture; if blocked, catch the error and redirect.
      const result = await signInWithPopup(auth, provider);

      const firebaseUser = result.user;
      if (!firebaseUser) {
        return { user: null, error: 'No user returned from Google sign-in', success: false };
      }

      // Try to fetch backend user or create fallback like signIn() does
      let user = await this.getUserFromBackend(firebaseUser.uid);
      if (!user) {
        user = {
          _id: '',
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : ''),
          photoURL: firebaseUser.photoURL || undefined,
          activityLevel: 'moderately_active',
          dietaryRestrictions: defaultDietaryRestrictions,
          nutritionGoals: defaultNutritionGoals,
          preferences: defaultUserPreferences,
          onboardingCompleted: false,
          lastLogin: new Date(),
          planGenerationCount: 0,
          mealHistory: [],
          favoriteRecipes: [],
          createdAt: new Date(),
          updatedAt: new Date()
        } as unknown as User;

        // Optionally save to backend; this is a no-op until implemented
        await this.saveUserToBackend(user);
      }

      return { user, error: null, success: true };
    } catch (err: any) {
      // Popup blocked or cancelled — fall back to redirect flow
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
        try {
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
          // Redirecting - caller should handle that the page will reload/navigate.
          return { user: null, error: null, success: false };
        } catch (redirectErr: any) {
          return { user: null, error: redirectErr?.message || String(redirectErr), success: false };
        }
      }

      return { user: null, error: err?.message || String(err), success: false };
    }
  }

  static async signUp(formData: AuthFormData): Promise<AuthResponse> {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Update Firebase profile with display name
      if (formData.displayName) {
        await updateProfile(firebaseUser, {
          displayName: formData.displayName
        });
      }

      // Create user object matching our User interface
      const user = {
        _id: '', // This will be set by your backend
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: formData.displayName || firebaseUser.email!.split('@')[0],
        photoURL: firebaseUser.photoURL || undefined,
        activityLevel: 'moderately_active',
        // note: other fields (units, medicalRestrictions etc) will be filled during onboarding
        dietaryRestrictions: defaultDietaryRestrictions,
        nutritionGoals: defaultNutritionGoals,
        preferences: defaultUserPreferences,
        onboardingCompleted: false,
        lastLogin: new Date(),
        planGenerationCount: 0,
        mealHistory: [],
        favoriteRecipes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as User;

      //  then save the user to your backend
      await this.saveUserToBackend(user);

      return { user, error: null, success: true };
    } catch (error: any) {
      return { 
        user: null, 
        error: this.getAuthErrorMessage(error.code), 
        success: false 
      };
    }
  }

  static async signIn(formData: AuthFormData): Promise<AuthResponse> {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Fetch user data from backend
      let user = await this.getUserFromBackend(firebaseUser.uid);

      // If backend doesn't have user data yet, create a fallback user from firebase profile
      if (!user) {
        user = {
          _id: '',
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || formData.email,
          displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : ''),
          photoURL: firebaseUser.photoURL || undefined,
          activityLevel: 'moderately_active',
          dietaryRestrictions: defaultDietaryRestrictions,
          nutritionGoals: defaultNutritionGoals,
          preferences: defaultUserPreferences,
          onboardingCompleted: false,
          lastLogin: new Date(),
          planGenerationCount: 0,
          mealHistory: [],
          favoriteRecipes: [],
          createdAt: new Date(),
          updatedAt: new Date()
        } as unknown as User;

        // Optionally save to backend
        await this.saveUserToBackend(user);
      }

      return { user, error: null, success: true };
    } catch (error: any) {
      return { 
        user: null, 
        error: this.getAuthErrorMessage(error.code), 
        success: false 
      };
    }
  }

  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  static async resetPassword(email: string): Promise<boolean> {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      return false;
    }
  }

  // helper methods for backend interaction
  private static async saveUserToBackend(user: User): Promise<void> {
    try {
      const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001';
      await fetch(`${API_BASE}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
    } catch (err) {
      console.warn('saveUserToBackend failed', err);
    }
  }

  // fetching data from backend for user
  static async getUserFromBackend(firebaseUid: string): Promise<User | null> {
    try {
      const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001';
      const resp = await fetch(`${API_BASE}/api/users/${firebaseUid}`);
      if (!resp.ok) return null;
      const data = await resp.json();
      return data as User;
    } catch (err) {
      console.warn('getUserFromBackend failed', err);
      return null;
    }
  }

  private static getAuthErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.'
    };
    
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
}