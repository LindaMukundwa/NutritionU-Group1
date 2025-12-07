import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../services/firebaseAuth';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../config/firebase';
import styles from './Profile.module.css';

type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
type Units = 'imperial' | 'metric';
type PreferenceField = 'lifestyleDiets' | 'medicalRestrictions' | 'culturalDiets' | 'goals';

interface ProfileFormState {
  displayName: string;
  gender: string;
  units: Units;
  age: string;
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
  budget: number;
  cookingLevel: string;
  mealPrep: string;
  lifestyleDiets: string[];
  medicalRestrictions: string[];
  culturalDiets: string[];
  goals: string[];
}

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'lightly_active', label: 'Lightly Active' },
  { value: 'moderately_active', label: 'Moderately Active' },
  { value: 'very_active', label: 'Very Active' },
];

const LIFESTYLE_OPTIONS = ['Vegetarian', 'Vegan', 'Pescatarian', 'Flexitarian', 'Mediterranean', 'Paleo', 'Keto', 'Whole30'];
const MEDICAL_OPTIONS = ['Gluten', 'Dairy', 'Nuts', 'Peanuts', 'Soy', 'Eggs', 'Shellfish', 'Wheat', 'Sesame', 'Corn', 'Sulfites', 'FODMAP', 'Histamine', 'Sodium (Low)', 'Sugar (Low)'];
const CULTURAL_OPTIONS = ['Halal', 'Kosher', 'Jain', 'Hindu (No Beef)', 'Buddhist (Vegetarian)'];
const GOAL_OPTIONS = ['Save Money', 'Eat Healthier', 'Save Time', 'Learn to Cook', 'Lose Weight', 'Gain Muscle'];
const COOKING_LEVELS = [
  { value: '', label: 'Select cooking level' },
  { value: 'beginner', label: 'Beginner - Just getting started' },
  { value: 'intermediate', label: 'Intermediate - Comfortable with recipes' },
  { value: 'advanced', label: 'Advanced - Confident experimenting' },
];
const MEAL_PREP_OPTIONS = [
  "Never - I prefer cooking daily",
  "Once a week",
  "Several times a week",
  "I'm flexible",
];

const BUDGET_MIN = 25;
const BUDGET_MAX = 300;
const BUDGET_STEP = 25;

export default function Profile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    displayName: '',
    gender: '',
    units: 'imperial',
    age: '',
    height: '',
    weight: '',
    activityLevel: 'moderately_active',
    budget: 100,
    cookingLevel: '',
    mealPrep: '',
    lifestyleDiets: [],
    medicalRestrictions: [],
    culturalDiets: [],
    goals: [],
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    const profileData = (user as any)?.profile || {};

    console.log(user);

    setProfileForm({
      displayName: user.displayName || profileData.displayName || '',
      gender: user.gender || profileData.gender || '',
      units: (profileData.units || user.units || 'imperial') as Units,
      age: profileData.age != null ? String(profileData.age) : (user.age != null ? String(user.age) : ''),
      height: profileData.height != null ? String(profileData.height) : (user.height != null ? String(user.height) : ''),
      weight: profileData.weight != null ? String(profileData.weight) : (user.weight != null ? String(user.weight) : ''),
      activityLevel: (profileData.activityLevel || user.activityLevel || 'moderately_active') as ActivityLevel,
      budget: user.budget.value || 0,
      cookingLevel: user.cookingLevel || "none", // TODO: Add cooking level to database
      mealPrep: user.mealPlans?.length != null ? String(user.mealPlans.length) : '',
      lifestyleDiets: Array.isArray(user.lifestyleDiets) ? user.lifestyleDiets : [],
      medicalRestrictions: Array.isArray(user.medicalRestrictions) ? user.medicalRestrictions : [],
      culturalDiets: Array.isArray(user.culturalDiets) ? user.culturalDiets : [],
      goals: Array.isArray(user.goals) ? user.goals : [],
    });
  }, [user]);

  const handleProfileInputChange = (field: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBudgetChange = (value: number) => {
    setProfileForm((prev) => ({
      ...prev,
      budget: value,
    }));
  };

  const togglePreference = (field: PreferenceField, option: string) => {
    setProfileForm((prev) => {
      const exists = prev[field].includes(option);
      const next = exists ? prev[field].filter((item) => item !== option) : [...prev[field], option];
      return {
        ...prev,
        [field]: next,
      };
    });
  };

  const handleMealPrepSelect = (option: string) => {
    setProfileForm((prev) => ({
      ...prev,
      mealPrep: prev.mealPrep === option ? '' : option,
    }));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setProfileError('You must be signed in to update your profile.');
      return;
    }

    const trimmedName = profileForm.displayName.trim();
    if (!trimmedName) {
      setProfileError('Display name is required.');
      return;
    }

    const payload: Record<string, unknown> = {
      displayName: trimmedName,
      gender: profileForm.gender,
      activityLevel: profileForm.activityLevel,
      units: profileForm.units,
      budget: profileForm.budget,
      cookingLevel: profileForm.cookingLevel,
      mealPrep: profileForm.mealPrep,
      lifestyleDiets: profileForm.lifestyleDiets,
      medicalRestrictions: profileForm.medicalRestrictions,
      culturalDiets: profileForm.culturalDiets,
      goals: profileForm.goals,
    };

    if (profileForm.age) payload.age = Number(profileForm.age);
    if (profileForm.height) payload.height = Number(profileForm.height);
    if (profileForm.weight) payload.weight = Number(profileForm.weight);

    try {
      setProfileSaving(true);
      const idToken = await firebaseUser.getIdToken();
      const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001';

      const resp = await fetch(`${API_BASE}/api/users/${firebaseUser.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const message = await resp.text();
        throw new Error(message || 'Failed to update profile.');
      }

      if (refreshUser) {
        try {
          await refreshUser();
        } catch (err) {
          console.warn('Failed to refresh user after profile update', err);
        }
      }

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      setIsEditingProfile(false);
    } catch (error: any) {
      setProfileError(error?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    setChangingPassword(true);
    // @ts-ignore - changePassword method exists in AuthService
    const result = await AuthService.changePassword(currentPassword, newPassword);
    setChangingPassword(false);

    if (result.success) {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Hide form after 3 seconds
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(false);
      }, 3000);
    } else {
      setPasswordError(result.error || 'Failed to change password.');
    }
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Profile</h1>
        <p>Manage your personal information and preferences</p>
      </div>

      <div className={styles.profileContent}>
        <section className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>Account Information</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <label className={styles.settingLabel}>Email</label>
              <p className={styles.settingDescription}>Your account email address</p>
            </div>
            <div className={styles.settingValue}>
              <span>{user?.email || 'user@example.com'}</span>
            </div>
          </div>

          <div className={styles.profileDetailsSection}>
            {!isEditingProfile ? (
              <div className={styles.profileSummary}>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryItem}>
                    <p className={styles.summaryLabel}>Display Name</p>
                    <p className={styles.summaryValue}>{profileForm.displayName || '—'}</p>
                  </div>
                  <div className={styles.summaryItem}>
                    <p className={styles.summaryLabel}>Gender</p>
                    <p className={styles.summaryValue}>
                      {profileForm.gender === 'male' ? 'Male' : 
                       profileForm.gender === 'female' ? 'Female' : 
                       profileForm.gender === 'nonbinary' ? 'Non-binary' : 
                       profileForm.gender === 'prefer_not' ? 'Prefer not to say' : '—'}
                    </p>
                  </div>
                  <div className={styles.summaryItem}>
                    <p className={styles.summaryLabel}>Activity Level</p>
                    <p className={styles.summaryValue}>{ACTIVITY_OPTIONS.find(opt => opt.value === profileForm.activityLevel)?.label || '—'}</p>
                  </div>
                  <div className={styles.summaryItem}>
                    <p className={styles.summaryLabel}>Units</p>
                    <p className={styles.summaryValue}>{profileForm.units === 'imperial' ? 'Imperial (lbs, in)' : 'Metric (kg, cm)'}</p>
                  </div>
                  <div className={styles.summaryItem}>
                    <p className={styles.summaryLabel}>Age</p>
                    <p className={styles.summaryValue}>{profileForm.age || '—'}</p>
                  </div>
                  <div className={styles.summaryItem}>
                    <p className={styles.summaryLabel}>Height</p>
                    <p className={styles.summaryValue}>
                      {profileForm.height ? `${profileForm.height} ${profileForm.units === 'imperial' ? 'in' : 'cm'}` : '—'}
                    </p>
                  </div>
                  <div className={styles.summaryItem}>
                    <p className={styles.summaryLabel}>Weight</p>
                    <p className={styles.summaryValue}>
                      {profileForm.weight ? `${profileForm.weight} ${profileForm.units === 'imperial' ? 'lb' : 'kg'}` : '—'}
                    </p>
                  </div>
                  <div className={styles.summaryItem}>
                    <p className={styles.summaryLabel}>Cooking Level</p>
                    <p className={styles.summaryValue}>
                      {COOKING_LEVELS.find(opt => opt.value === profileForm.cookingLevel)?.label || '—'}
                    </p>
                  </div>
                  <div className={styles.summaryItem}>
                    <p className={styles.summaryLabel}>Meal Prep</p>
                    <p className={styles.summaryValue}>{profileForm.mealPrep || '—'}</p>
                  </div>
                  <div className={styles.summaryItem}>
                    <p className={styles.summaryLabel}>Weekly Budget</p>
                    <p className={styles.summaryValue}>$ {profileForm.budget}/week</p>
                  </div>
                </div>

                <div className={styles.summaryGroups}>
                  <div className={styles.summaryGroup}>
                    <p className={styles.summaryLabel}>Lifestyle & Ethical Diets</p>
                    <div className={styles.summaryChips}>
                      {profileForm.lifestyleDiets.length
                        ? profileForm.lifestyleDiets.map((item) => (
                            <span key={item} className={styles.summaryChip}>{item}</span>
                          ))
                        : <span className={styles.summaryPlaceholder}>None selected</span>}
                    </div>
                  </div>

                  <div className={styles.summaryGroup}>
                    <p className={styles.summaryLabel}>Medical & Health Restrictions</p>
                    <div className={styles.summaryChips}>
                      {profileForm.medicalRestrictions.length
                        ? profileForm.medicalRestrictions.map((item) => (
                            <span key={item} className={`${styles.summaryChip} ${styles.summaryChipWarning}`}>{item}</span>
                          ))
                        : <span className={styles.summaryPlaceholder}>None selected</span>}
                    </div>
                  </div>

                  <div className={styles.summaryGroup}>
                    <p className={styles.summaryLabel}>Cultural & Religious Diets</p>
                    <div className={styles.summaryChips}>
                      {profileForm.culturalDiets.length
                        ? profileForm.culturalDiets.map((item) => (
                            <span key={item} className={`${styles.summaryChip} ${styles.summaryChipPositive}`}>{item}</span>
                          ))
                        : <span className={styles.summaryPlaceholder}>None selected</span>}
                    </div>
                  </div>

                  <div className={styles.summaryGroup}>
                    <p className={styles.summaryLabel}>Goals</p>
                    <div className={styles.summaryChips}>
                      {profileForm.goals.length
                        ? profileForm.goals.map((item) => (
                            <span key={item} className={`${styles.summaryChip} ${styles.summaryChipPrimary}`}>{item}</span>
                          ))
                        : <span className={styles.summaryPlaceholder}>None selected</span>}
                    </div>
                  </div>
                </div>

                <div className={styles.profileActions}>
                  <button
                    type="button"
                    className={styles.profileSaveButton}
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            ) : (
              <form className={styles.profileForm} onSubmit={handleProfileSave}>
                <div className={styles.profileSubsection}>
                  <h3 className={styles.sectionSubtitle}>Personal Details</h3>
                  <div className={styles.formGroup}>
                    <label htmlFor="displayName" className={styles.formLabel}>
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={profileForm.displayName}
                      onChange={(e) => handleProfileInputChange('displayName', e.target.value)}
                      className={styles.formInput}
                      required
                      placeholder="What should we call you?"
                    />
                  </div>

                  <div className={styles.inlineInputs}>
                    <div className={styles.formGroup}>
                      <label htmlFor="gender" className={styles.formLabel}>
                        Gender
                      </label>
                      <select
                        id="gender"
                        value={profileForm.gender}
                        onChange={(e) => handleProfileInputChange('gender', e.target.value)}
                        className={styles.select}
                      >
                        <option value="">Select gender</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="nonbinary">Non-binary</option>
                        <option value="prefer_not">Prefer not to say</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="activityLevel" className={styles.formLabel}>
                        Activity Level
                      </label>
                      <select
                        id="activityLevel"
                        value={profileForm.activityLevel}
                        onChange={(e) => handleProfileInputChange('activityLevel', e.target.value as ActivityLevel)}
                        className={styles.select}
                      >
                        {ACTIVITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="units" className={styles.formLabel}>
                      Preferred Units
                    </label>
                    <select
                      id="units"
                      value={profileForm.units}
                      onChange={(e) => handleProfileInputChange('units', e.target.value as Units)}
                      className={styles.select}
                    >
                      <option value="imperial">Imperial (lbs, in)</option>
                      <option value="metric">Metric (kg, cm)</option>
                    </select>
                  </div>

                  <div className={styles.inlineInputs}>
                    <div className={styles.formGroup}>
                      <label htmlFor="age" className={styles.formLabel}>Age</label>
                      <input
                        id="age"
                        type="number"
                        min="0"
                        value={profileForm.age}
                        onChange={(e) => handleProfileInputChange('age', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="height" className={styles.formLabel}>Height ({profileForm.units === 'imperial' ? 'in' : 'cm'})</label>
                      <input
                        id="height"
                        type="number"
                        min="0"
                        value={profileForm.height}
                        onChange={(e) => handleProfileInputChange('height', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="weight" className={styles.formLabel}>Weight ({profileForm.units === 'imperial' ? 'lb' : 'kg'})</label>
                      <input
                        id="weight"
                        type="number"
                        min="0"
                        value={profileForm.weight}
                        onChange={(e) => handleProfileInputChange('weight', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.profileSubsection}>
                  <h3 className={styles.sectionSubtitle}>Cooking & Planning</h3>
                  <div className={styles.inlineInputs}>
                    <div className={styles.formGroup}>
                      <label htmlFor="cookingLevel" className={styles.formLabel}>Cooking Level</label>
                      <select
                        id="cookingLevel"
                        value={profileForm.cookingLevel}
                        onChange={(e) => handleProfileInputChange('cookingLevel', e.target.value)}
                        className={styles.select}
                      >
                        {COOKING_LEVELS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Meal Prep Frequency</label>
                      <div className={styles.chipGroup}>
                        {MEAL_PREP_OPTIONS.map((option) => (
                          <button
                            type="button"
                            key={option}
                            className={`${styles.chip} ${profileForm.mealPrep === option ? styles.chipActive : ''}`}
                            onClick={() => handleMealPrepSelect(option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.profileSubsection}>
                  <h3 className={styles.sectionSubtitle}>Weekly Budget</h3>
                  <div className={styles.sliderField}>
                    <input
                      type="range"
                      min={BUDGET_MIN}
                      max={BUDGET_MAX}
                      step={BUDGET_STEP}
                      value={profileForm.budget}
                      onChange={(e) => handleBudgetChange(Number(e.target.value))}
                      className={styles.sliderInput}
                    />
                    <div className={styles.sliderLabels}>
                      <span>$ {BUDGET_MIN}</span>
                      <span className={styles.currentBudget}>$ {profileForm.budget}/week</span>
                      <span>$ {BUDGET_MAX}+</span>
                    </div>
                  </div>
                </div>

                <div className={styles.profileSubsection}>
                  <h3 className={styles.sectionSubtitle}>Dietary Preferences & Restrictions</h3>
                  <div className={styles.chipSection}>
                    <p className={styles.chipLabel}>Lifestyle & Ethical Diets</p>
                    <div className={styles.chipGroup}>
                      {LIFESTYLE_OPTIONS.map((option) => (
                        <button
                          type="button"
                          key={option}
                          className={`${styles.chip} ${profileForm.lifestyleDiets.includes(option) ? styles.chipActive : ''}`}
                          onClick={() => togglePreference('lifestyleDiets', option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.chipSection}>
                    <p className={styles.chipLabel}>Medical & Health Restrictions</p>
                    <div className={styles.chipGroup}>
                      {MEDICAL_OPTIONS.map((option) => (
                        <button
                          type="button"
                          key={option}
                          className={`${styles.chip} ${profileForm.medicalRestrictions.includes(option) ? styles.chipActiveDestructive : ''}`}
                          onClick={() => togglePreference('medicalRestrictions', option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.chipSection}>
                    <p className={styles.chipLabel}>Cultural & Religious Diets</p>
                    <div className={styles.chipGroup}>
                      {CULTURAL_OPTIONS.map((option) => (
                        <button
                          type="button"
                          key={option}
                          className={`${styles.chip} ${profileForm.culturalDiets.includes(option) ? styles.chipActiveSecondary : ''}`}
                          onClick={() => togglePreference('culturalDiets', option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.profileSubsection}>
                  <h3 className={styles.sectionSubtitle}>Goals</h3>
                  <div className={styles.chipGroup}>
                    {GOAL_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={`${styles.chip} ${profileForm.goals.includes(option) ? styles.chipActive : ''}`}
                        onClick={() => togglePreference('goals', option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {profileError && (
                  <div className={styles.errorMessage} role="alert">
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className={styles.successMessage} role="alert">
                    Profile updated successfully!
                  </div>
                )}

                <div className={styles.profileActions}>
                  <button
                    type="submit"
                    className={styles.profileSaveButton}
                    disabled={profileSaving}
                  >
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button
                    type="button"
                    className={styles.profileSecondaryButton}
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileError(null);
                    }}
                    disabled={profileSaving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className={styles.passwordSection}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Password</label>
                <p className={styles.settingDescription}>Change your account password</p>
              </div>
              <div className={styles.settingValue}>
                <button
                  type="button"
                  className={styles.changePasswordButton}
                  onClick={() => {
                    setShowPasswordForm(!showPasswordForm);
                    setPasswordError(null);
                    setPasswordSuccess(false);
                  }}
                >
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>
            </div>

            {showPasswordForm && (
              <form className={styles.passwordForm} onSubmit={handlePasswordChange}>
                {passwordError && (
                  <div className={styles.errorMessage} role="alert">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className={styles.successMessage} role="alert">
                    Password changed successfully!
                  </div>
                )}
                
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword" className={styles.formLabel}>
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={styles.formInput}
                    required
                    disabled={changingPassword}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.formLabel}>
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.formInput}
                    required
                    minLength={6}
                    disabled={changingPassword}
                  />
                  <p className={styles.formHint}>Must be at least 6 characters</p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.formLabel}>
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.formInput}
                    required
                    disabled={changingPassword}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submitPasswordButton}
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
