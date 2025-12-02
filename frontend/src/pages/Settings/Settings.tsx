import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';

export default function Settings() {
  const navigate = useNavigate();
  const [emailFrequency, setEmailFrequency] = useState<'never' | 'daily' | 'weekly' | 'monthly'>('never');

  // Load theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    return savedTheme;
  });

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      // Remove data-theme attribute to use system preference
      root.removeAttribute('data-theme');
      // Listen to system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (theme === 'auto') {
          root.removeAttribute('data-theme');
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Load saved preferences on mount
  useEffect(() => {
    const savedEmailFrequency = localStorage.getItem('emailFrequency');
    if (savedEmailFrequency && ['never', 'daily', 'weekly', 'monthly'].includes(savedEmailFrequency)) {
      setEmailFrequency(savedEmailFrequency as 'never' | 'daily' | 'weekly' | 'monthly');
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const root = document.documentElement;
    if (newTheme === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', newTheme);
    }
  };

  const handleSave = () => {
    // Save all preferences to localStorage
    localStorage.setItem('emailFrequency', emailFrequency);
    localStorage.setItem('theme', theme);
    
    console.log('Settings saved:', { emailFrequency, theme });
    // Show success message or navigate back
    alert('Settings saved successfully!');
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Settings</h1>
        <p>Manage your app preferences and settings</p>
      </div>

      <div className={styles.settingsContent}>
        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Preferences</h2>
          
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <label className={styles.settingLabel}>Notifications</label>
              <p className={styles.settingDescription}>How often would you like to receive email updates?</p>
            </div>
            <div className={styles.settingValue}>
              <select
                value={emailFrequency}
                onChange={(e) => setEmailFrequency(e.target.value as 'never' | 'daily' | 'weekly' | 'monthly')}
                className={styles.select}
              >
                <option value="never">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <label className={styles.settingLabel}>Theme</label>
              <p className={styles.settingDescription}>Choose your preferred color theme</p>
            </div>
            <div className={styles.settingValue}>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className={styles.select}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>About</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <label className={styles.settingLabel}>Version</label>
              <p className={styles.settingDescription}>Application version information</p>
            </div>
            <div className={styles.settingValue}>
              <span>1.0.0</span>
            </div>
          </div>
        </section>

        <div className={styles.actions}>
          <button className={styles.saveButton} onClick={handleSave}>
            Save Changes
          </button>
          <button className={styles.cancelButton} onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
