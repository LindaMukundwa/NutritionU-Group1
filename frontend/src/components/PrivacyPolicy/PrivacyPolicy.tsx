import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PrivacyPolicy.module.css';

interface PrivacyPolicyProps {}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = () => {
  const navigate = useNavigate();
  
  const handleGoBack = (): void => {
    navigate('/');
  };

  return (
    <div className="privacy-policy-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          <h2>NutritionU</h2>
        </div>
      </nav>
      
      <div className='privacy-policy-header'>
        <h1>Privacy Policy</h1>
      </div>
      
      <div className={styles.content}>
        <h2>Data We Collect</h2>
        
        <h3>Account Information:</h3>
        <p>Email address (via Firebase Authentication)</p>
        <p>Display name</p>
        <p>Firebase UID (unique identifier)</p>
        
        <h3>User-Generated Content:</h3>
        <p>Meal plans and scheduled meals</p>
        <p>Favorite recipes</p>
        <p>Nutrition goals and preferences</p>
        <p>Budget settings</p>
        
        <h3>Recipe Data:</h3>
        <p>Recipe titles, ingredients, and instructions</p>
        <p>Nutritional information (calories, macros, etc.)</p>
        <p>Cooking directions</p>
        
        <h2>How We Use Your Data</h2>
        <div>
          <p><strong>Service Delivery</strong>: To provide meal planning, recipe discovery, and nutrition tracking features</p>
          <p><strong>Personalization</strong>: To customize your experience based on your goals and preferences</p>
          <p><strong>Data Persistence</strong>: To save your meal plans across devices and sessions</p>
          <p><strong>Analytics</strong>: To improve the application and understand usage patterns which is aggregated and anonymized</p>
        </div>
        
        <h2>Data Storage & Security</h2>
        
        <h3>Storage Location:</h3>
        <p>Authentication data: Firebase (Google Cloud Platform)</p>
        <p>Application data: Neon PostgreSQL (AWS, encrypted at rest)</p>
        <p>User sessions: Encrypted tokens, HTTPS-only transmission</p>
        
        <h3>Security Measures:</h3>
        <p>All data transmitted over HTTPS/TLS</p>
        <p>Database connections use SSL</p>
        <p>Authentication tokens expire after inactivity</p>
        <p>Password hashing via Firebase using bcrypt</p>
        <p>CORS restrictions to prevent unauthorized access</p>
        <p>Environment variables for sensitive credentials</p>
        
        <h2>Data Retention</h2>
        <p><strong>Active accounts</strong>: Data retained indefinitely while account is active</p>
        <p><strong>Inactive accounts</strong>: Data may be archived after 2 years of inactivity</p>
        <p><strong>Deleted accounts</strong>: All user data permanently deleted within 30 days</p>
        
        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <p><strong>Access</strong>: View all data we store about you</p>
        <p><strong>Correction</strong>: Update incorrect information</p>
        <p><strong>Deletion</strong>: Request complete account and data deletion</p>
        <p><strong>Export</strong>: Download your data in JSON format</p>
        <p><strong>Opt-out</strong>: Disable optional features (e.g., AI assistant)</p>
        
        <h2>Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <p><strong>Firebase (Google)</strong>: Authentication and user management</p>
        <p><strong>Neon</strong>: Database hosting</p>
        <p><strong>Railway</strong>: Backend application hosting</p>
        <p><strong>Vercel</strong>: Frontend application hosting</p>
        <p><strong>OpenAI</strong>: AI assistant feature and meal plan personalization</p>
        <p>Each service has its own privacy policy. We do not sell your data to third parties.</p>
        
        <h2>Data Sharing</h2>
        <p>We <strong>do not</strong> share your personal data with third parties except:</p>
        <p>When required by law</p>
        <p>To protect our rights or safety</p>
        <p>With your explicit consent</p>
        
        <h2>Cookies</h2>
        <p>We use minimal cookies:</p>
        <p><strong>Authentication token</strong>: To keep you logged in</p>
        <p><strong>Session data</strong>: Temporary, cleared on logout</p>
        
        <h2>Changes to Privacy Policy</h2>
        <p>We may update this policy periodically. Users will be notified of significant changes via email or with in app notifications.</p>
        
        <h2>Contact</h2>
        <p>For any privacy-related questions, please contact us at Linda.Mukundwa1@marist.edu.</p>
      </div>
      
      <div className="cta-buttons">
        <button 
          className="primary-btn" 
          onClick={handleGoBack}
          aria-label="Click here to go back to main page"
        >
          Click here to go back to main page
        </button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;