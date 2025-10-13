import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../src/config/firebase'; // Your firebase config
import type { AuthFormData, AuthResponse } from '../../shared/types/auth';
import type { User, DietaryRestrictions, NutritionGoals, UserPreferences } from '../../shared/types/user'; // Adjust path as needed

// Default values for new users
const defaultDietaryRestrictions: DietaryRestrictions = {
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  dairyFree: false,
  nutFree: false,
  halal: false,
  custom: []
};

const defaultNutritionGoals: NutritionGoals = {
  dailyCalories: 2000,
  protein: 50,
  carbs: 250,
  fat: 70,
  fiber: 25,
  sugar: 50,
  sodium: 2300
};

const defaultUserPreferences: UserPreferences = {
  cuisineTypes: [],
  cookingTime: 'moderate',
  skillLevel: 'beginner',
  budgetRange: {
    min: 0,
    max: 100
  },
  servingSize: 2
};

export class AuthService {
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

      // Create user object matching your User interface
      const user: User = {
        _id: '', // This will be set by your backend
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: formData.displayName || firebaseUser.email!.split('@')[0],
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
      };

      // Here you would typically save the user to your backend
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

      // Fetch user data from your backend
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
          dietaryRestrictions: {
            vegetarian: false,
            vegan: false,
            glutenFree: false,
            dairyFree: false,
            nutFree: false,
            halal: false,
            custom: []
          },
          nutritionGoals: {
            dailyCalories: 2000,
            protein: 50,
            carbs: 250,
            fat: 70,
            fiber: 25,
            sugar: 50,
            sodium: 2300
          },
          preferences: {
            cuisineTypes: [],
            cookingTime: 'moderate',
            skillLevel: 'beginner',
            budgetRange: { min: 0, max: 100 },
            servingSize: 2
          },
          onboardingCompleted: false,
          lastLogin: new Date(),
          planGenerationCount: 0,
          mealHistory: [],
          favoriteRecipes: [],
          createdAt: new Date(),
          updatedAt: new Date()
        } as User;

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

  private static async saveUserToBackend(user: User): Promise<void> {
    // Implement your API call to save user to backend
    // Example:
    // await fetch('/api/users', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(user)
    // });
    console.log('Saving user to backend:', user);
  }

  static async getUserFromBackend(firebaseUid: string): Promise<User | null> {
    // Implement your API call to get user from backend
    // Example:
    // const response = await fetch(`/api/users/${firebaseUid}`);
    // return await response.json();
    console.log('Fetching user from backend:', firebaseUid);
    return null; // Replace with actual implementation
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