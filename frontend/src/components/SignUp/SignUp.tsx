import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useState } from "react";
import "./SignUp.css";
import { AuthService } from "../../../services/firebaseAuth";
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, SetEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const navigate = useNavigate();

  const SignupWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      console.error("Provide Email and Password");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      console.log(user);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.log("errorCode:", errorCode, "errorMessage:", errorMessage);
    }
  };

  const SignUpWithGoogle = async () => {
    try {
      const resp = await AuthService.signInWithGoogle();
      if (resp.success && resp.user) {
        // navigate to onboarding (new users should complete onboarding first)
        navigate('/onboarding');
      } else if (!resp.success && !resp.error) {
        // redirect flow started (signInWithRedirect) — nothing more to do here
        console.log('Redirecting to Google sign-in...');
      } else {
        console.error('Google sign-up error', resp.error);
      }
    } catch (error) {
      console.error('Google sign-up error', error);
    }
  };

  return (
    <div className="nutritionU-signup-container">
      <div className="nutritionU-signup-card">
        {/* Logo - Replace with your actual NutritionU logo */}
        <img
          className="nutritionU-logo"
          src="/2.png"
          alt="NutritionU"
        />
        
        <h2 className="nutritionU-signup-title">Create an Account</h2>
        <p className="nutritionU-signup-subtitle">Join NutritionU and start your meal planning journey</p>

        <form onSubmit={SignupWithEmail}>
          <div className="nutritionU-form-group">
            <label htmlFor="email" className="nutritionU-form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              required
              className="nutritionU-form-input"
              onChange={(e) => SetEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="nutritionU-form-group">
            <div className="form-header">
              <label htmlFor="password" className="nutritionU-form-label">
                Password
              </label>
              <a href="#" className="forgot-password-link">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="nutritionU-form-input"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="nutritionU-primary-button">
            Create Account
          </button>
        </form>

        <div className="nutritionU-divider">
          <span>Or continue with</span>
        </div>

        <div className="nutritionU-social-buttons">
          <button className="nutritionU-social-button" onClick={SignUpWithGoogle}>
            <svg className="nutritionU-social-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>  
        </div>

        <p className="nutritionU-login-link">
          Already a member?{" "}
          <a href="/login" className="nutritionU-login-link">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;