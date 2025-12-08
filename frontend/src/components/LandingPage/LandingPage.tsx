import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

interface LandingPageProps {
  // Example: onSignIn?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = () => {
  // Event handlers with the TypeScript types

  const navigate = useNavigate();

  const handleSignIn = (): void => {
    navigate('/signup');
  };

  const handlePrivacyPolicy = (): void => {
    navigate('/privacy-policy');
  };

  const handleNavAuthClick = (action: string): void => {
    navigate('/signup');
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          <h2>NutritionU</h2>
        </div>
        <div className="auth-buttons">
          <button 
            className="sign-in-btn" 
            onClick={handleSignIn}
            aria-label="Sign in to your account"
          >
            Sign In
          </button>
          <button 
            className="get-started-btn" 
            onClick={() => handleNavAuthClick('Get Started')}
            aria-label="Get started with NutritionU"
          >
            Get Started
          </button>
        </div>
      </nav>

      <div className="divider" role="separator" />

      {/* Hero Section */}
      <section className="hero-section" aria-labelledby="main-heading">
        <div className="hero-subtitle">AI-powered Meal Planning</div>
        <h1 id="main-heading" className="hero-title">
          Smart Meal Planning for Students
        </h1>
        <p className="hero-description">
          Plan affordable, nutritious meals in seconds. Get personalized recipes, 
          automatic grocery lists, and step-by-step cooking guides that fit your 
          budget and schedule.
        </p>
        <div className="cta-buttons">
          <button 
            className="primary-btn" 
            onClick={handlePrivacyPolicy}
            aria-label="Ready Our Privacy Policy"
          >
            Read Our Privacy Policy
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;