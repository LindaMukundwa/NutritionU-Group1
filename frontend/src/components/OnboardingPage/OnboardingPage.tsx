import React, { useState } from 'react';
import Button from '../ui/Button';
import { Card, CardContent, CardDescription, CardTitle } from '../ui/Card';
import Label from '../ui/Label';
import Badge from '../ui/Badge';
import Progress from '../ui/Progress';
import styles from './OnboardingPage.module.css';
import { auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Icon } from '../ui/Icon';


/**
 * The `OnboardingPage` component is a multi-step form designed to collect user information 
 * for setting up a personalized profile. This information is used to generate tailored 
 * meal plans and nutritional recommendations. The onboarding process includes six steps:
 * 
 * 1. **Personal Information**: Collects age, height, weight, units (imperial/metric), 
 *    and activity level.
 * 2. **Cooking Experience**: Gathers the user's cooking skill level and meal prep preferences.
 * 3. **Budget**: Allows the user to specify their weekly food budget.
 * 4. **Dietary Preferences**: Captures lifestyle diets, medical restrictions, and cultural diets.
 * 5. **Goals**: Identifies the user's goals (e.g., save money, eat healthier, lose weight).
 * 6. **Macro Recommendations**: Provides AI-generated macro suggestions and allows manual adjustments.
 * 
 * The component includes:
 * - **State Management**: Tracks the current step, form data, loading states, and errors.
 * - **Dynamic Navigation**: Handles transitions between steps, including API calls for macro suggestions.
 * - **Error Handling**: Displays error messages and retry options for failed macro generation.
 * - **Customization**: Allows users to manually adjust macros and dietary preferences.
 * - **Final Submission**: Sends the collected data to the backend and navigates to the dashboard.
 * 
 * @component
 * @returns {JSX.Element} The rendered onboarding page.
 * 
 * @remarks
 * - The component uses `useState` for state management and `useNavigate` for navigation.
 * - API calls are made to fetch macro suggestions and save user data.
 * - The progress bar dynamically updates based on the current step.
 * - The component includes accessibility features such as keyboard navigation and labels.
 * 
 * @dependencies
 * - React hooks: `useState`, `useNavigate`
 * - External components: `Card`, `CardContent`, `Progress`, `Badge`, `Button`
 * - Utility functions: `toggleArrayItem`, `incrementMacro`
 * 
 * @example
 * ```tsx
 * import OnboardingPage from './OnboardingPage';
 * 
 * function App() {
 *   return <OnboardingPage />;
 * }
 * 
 * export default App;
 * ```
 */
export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: undefined as number | undefined,
    height: undefined as number | undefined,
    weight: undefined as number | undefined,
    units: 'imperial' as 'imperial' | 'metric',
    activityLevel: '' as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | '',
    budget: 100,
    cookingLevel: '',
    lifestyleDiets: [] as string[],
    medicalRestrictions: [] as string[],
    culturalDiets: [] as string[],
    goals: [] as string[],
    mealPrep: '',
    macros: {
      calories: 2000,
      fats: 65,
      carbs: 250,
      protein: 150
    }
  });


  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  // Add loading state for macro population on onboarding card 6
  const [isLoadingMacros, setIsLoadingMacros] = useState(false);
  const [macroSuggestions, setMacroSuggestions] = useState<Record<string, any> | null>(null);
  const [macroError, setMacroError] = useState(false);

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary - Little to no exercise' },
    { value: 'lightly_active', label: 'Lightly Active - excercise 1-3 days/week' },
    { value: 'moderately_active', label: 'Moderately Active - excercise 3-5 days/week' },
    { value: 'very_active', label: 'Very Active - excercise 6-7 days/week' }
  ];
  const lifestyleDiets = ["Vegetarian", "Vegan", "Pescatarian", "Flexitarian", "Mediterranean", "Paleo", "Keto", "Whole30"];
  const medicalRestrictions = ["Gluten", "Dairy", "Nuts", "Peanuts", "Soy", "Eggs", "Shellfish", "Wheat", "Sesame", "Corn", "Sulfites", "FODMAP", "Histamine", "Sodium (Low)", "Sugar (Low)"];
  const culturalDiets = ["Halal", "Kosher", "Jain", "Hindu (No Beef)", "Buddhist (Vegetarian)"];
  const goalOptions = ["Save Money", "Eat Healthier", "Save Time", "Learn to Cook", "Lose Weight", "Gain Muscle"];

  const nextStep = () => setStep(Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(Math.max(step - 1, 1));
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';


  const handleComplete = async () => {
    // Finalize onboarding: send profile to backend and navigate to dashboard
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        console.error('No authenticated firebase user found');
        navigate('/auth');
        return;
      }

      setSubmitting(true);
      const idToken = await firebaseUser.getIdToken();
      // make sure we are sending the firebase uid to the backend
      const resp = await fetch(`${API_BASE}/api/users/${firebaseUser.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('Failed to save onboarding:', resp.status, text);
        setSubmitting(false);
        return;
      }

      // Refresh AuthContext so PrivateRoute sees the latest user
      try {
        if (refreshUser) await refreshUser();
      } catch (err) {
        console.warn('refreshUser failed', err);
      }

      // Optionally refresh AuthContext here by fetching the user from backend
      // but for now navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error completing onboarding', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Method to dynamically add functionality between card when onboarding
  const handleNext = async () => {
    if (step === 5 && !macroError) {
      setIsLoadingMacros(true);
      try {
        const suggestions = await getMacroSuggestions(formData);

        setMacroSuggestions(suggestions);

        setFormData(prev => ({
          ...prev,
          macros: {
            calories: suggestions.calories || prev.macros.calories,
            fats: suggestions.fats?.grams || prev.macros.fats,
            carbs: suggestions.carbs?.grams || prev.macros.carbs,
            protein: suggestions.protein?.grams || prev.macros.protein
          }
        }));

        console.log('Updated formData.macros:', formData.macros);

        setStep(step + 1);
      } catch (error) {
        console.error('Error fetching macros:', error);
        return;
      } finally {
        setIsLoadingMacros(false);
      }
    } else {
      // Reset error and advance to next step for manual entry
      setMacroError(false);
      setStep(step + 1);
    }
  };

  const handleRetryMacros = async () => {
    setIsLoadingMacros(true);
    try {
      const suggestions = await getMacroSuggestions(formData);
      console.log('API suggestions received:', suggestions);

      setMacroSuggestions(suggestions);

      setFormData(prev => ({
        ...prev,
        macros: {
          calories: suggestions.calories || prev.macros.calories,
          fats: suggestions.fats?.grams || prev.macros.fats,
          carbs: suggestions.carbs?.grams || prev.macros.carbs,
          protein: suggestions.protein?.grams || prev.macros.protein
        }
      }));

      console.log('Updated formData.macros:', formData.macros);

      // Only advance if successful
      setStep(step + 1);
    } catch (error) {
      console.error('Error fetching macros:', error);
      // Don't advance - stay on current step with error showing
    } finally {
      setIsLoadingMacros(false);
    }
  };

  // Get macro suggestions for onboarding card 6
  const getMacroSuggestions = async (formData: any): Promise<Record<string, any>> => {
    try {
      setMacroError(false);

      const payload = {
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        units: formData.units,
        activityLevel: formData.activityLevel,
        budget: formData.budget,
        cookingLevel: formData.cookingLevel,
        lifestyleDiets: formData.lifestyleDiets,
        medicalRestrictions: formData.medicalRestrictions,
        culturalDiets: formData.culturalDiets,
        goals: formData.goals,
        mealPrep: formData.mealPrep
      };

      console.log('Sending payload to API:', payload);
      console.log('API URL:', `${API_BASE}/api/chatbot/macros`);

      const response = await fetch(`${API_BASE}/api/chatbot/macros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        setMacroError(true);
        throw new Error(`Failed to fetch macro suggestions: ${response.status} - ${responseText}`);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Full error:', error);
      setMacroError(true);
      throw error;
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const handleBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, budget: parseInt(event.target.value) });
  };


  // Modify formdata when a user decides to changes their macros
  const handleMacroChange = (key: keyof typeof formData.macros, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      macros: {
        ...prev.macros,
        [key]: Math.max(0, numValue)
      }
    }));
  };

  // 
  const incrementMacro = (key: keyof typeof formData.macros, amount: number) => {
    setFormData(prev => ({
      ...prev,
      macros: {
        ...prev.macros,
        [key]: Math.max(0, (prev.macros[key] || 0) + amount)
      }
    }));
  };

  return (

    <div className={styles.container}>

      {isLoadingMacros && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Calculating your personalized macros...</p>
          </div>
        </div>
      )}

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Let's Set Up Your Profile</h1>
          <p className={styles.subtitle}>This will help us create the perfect meal plans for you</p>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressLabels}>
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} />
        </div>

        <Card>
          <CardContent className={styles.cardContent}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <CardTitle className={styles.stepTitle}>Tell us about yourself</CardTitle>
                  <CardDescription>This helps us determine your nutritional needs</CardDescription>
                </div>

                <div className={styles.personalInfoSection}>
                  {/* Unit Selection */}
                  <div className={styles.unitSelection}>
                    <Label className={styles.unitLabel}>Units</Label>
                    <div className={styles.unitOptions}>
                      <Card
                        className={`${styles.unitCard} ${formData.units === 'imperial' ? styles.selected : ''}`}
                        onClick={() => setFormData({ ...formData, units: 'imperial' })}
                      >
                        <CardContent className={styles.unitCardContent}>
                          <div className={styles.unitOption}>
                            <div className={`${styles.radio} ${formData.units === 'imperial' ? styles.radioSelected : ''}`} />
                            <span>Imperial (ft/in, lbs)</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        className={`${styles.unitCard} ${formData.units === 'metric' ? styles.selected : ''}`}
                        onClick={() => setFormData({ ...formData, units: 'metric' })}
                      >
                        <CardContent className={styles.unitCardContent}>
                          <div className={styles.unitOption}>
                            <div className={`${styles.radio} ${formData.units === 'metric' ? styles.radioSelected : ''}`} />
                            <span>Metric (cm, kg)</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <Label>Age (years)</Label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={formData.age || ''}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                        className={styles.numberInput}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <Label>Height ({formData.units === 'imperial' ? 'ft' : 'cm'})</Label>
                      <input
                        type="number"
                        min={formData.units === 'imperial' ? '3' : '50'}
                        max={formData.units === 'imperial' ? '8' : '300'}
                        step={formData.units === 'imperial' ? '0.1' : '1'}
                        value={formData.height || ''}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className={styles.numberInput}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <Label>Weight ({formData.units === 'imperial' ? 'lbs' : 'kg'})</Label>
                      <input
                        type="number"
                        min={formData.units === 'imperial' ? '50' : '20'}
                        max={formData.units === 'imperial' ? '1000' : '500'}
                        value={formData.weight || ''}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseInt(e.target.value) : undefined })}
                        className={styles.numberInput}
                      />
                    </div>
                  </div>

                  <div className={styles.activityLevelSection}>
                    <Label className={styles.activityLevelLabel}>Activity Level</Label>
                    <div className={styles.activityLevelOptions}>
                      {activityLevels.map((option) => (
                        <Card
                          key={option.value}
                          className={`${styles.activityLevelCard} ${formData.activityLevel === option.value ? styles.selected : ''}`}
                          onClick={() => setFormData({ ...formData, activityLevel: option.value as any })}
                        >
                          <CardContent className={styles.activityLevelCardContent}>
                            <div className={styles.activityLevelOption}>
                              <div className={`${styles.radio} ${formData.activityLevel === option.value ? styles.radioSelected : ''}`} />
                              <span>{option.label}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Cooking Experience */}
            {step === 2 && (
              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <CardTitle className={styles.stepTitle}>What's your cooking experience?</CardTitle>
                  <CardDescription>This helps us recommend the right recipes for you</CardDescription>
                </div>

                <div className={styles.cookingSection}>
                  <Label>Cooking Level</Label>
                  <select
                    value={formData.cookingLevel}
                    onChange={(e) => setFormData({ ...formData, cookingLevel: e.target.value })}
                    className={styles.select}
                  >
                    <option value="">Select your cooking level</option>
                    <option value="beginner">Beginner - Starting from scratch</option>
                    <option value="intermediate">Intermediate - Comfortable with recipes</option>
                    <option value="advanced">Advanced - Confident experimenting</option>
                  </select>

                  <div className={styles.mealPrepSection}>
                    <Label className={styles.mealPrepLabel}>How often do you want to meal prep?</Label>
                    <div className={styles.mealPrepOptions}>
                      {["Never - I prefer cooking daily", "Once a week", "Several times a week", "I'm flexible"].map((option) => (
                        <Card
                          key={option}
                          className={`${styles.mealPrepCard} ${formData.mealPrep === option ? styles.selected : ''}`}
                          onClick={() => setFormData({ ...formData, mealPrep: option })}
                        >
                          <CardContent className={styles.mealPrepCardContent}>
                            <div className={styles.mealPrepOption}>
                              <div className={`${styles.radio} ${formData.mealPrep === option ? styles.radioSelected : ''}`} />
                              <span>{option}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Budget */}
            {step === 3 && (
              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <CardTitle className={styles.stepTitle}>What's your weekly food budget?</CardTitle>
                  <CardDescription>We'll help you create meal plans that fit your budget</CardDescription>
                </div>

                <div className={styles.budgetSection}>
                  <Label>Weekly Food Budget</Label>
                  <div className={styles.sliderContainer}>
                    <input
                      type="range"
                      min="25"
                      max="300"
                      step="25"
                      value={formData.budget}
                      onChange={handleBudgetChange}
                      className={styles.slider}
                    />
                    <div className={styles.sliderLabels}>
                      <span>$25</span>
                      <span className={styles.currentValue}>${formData.budget}/week</span>
                      <span>$300+</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Dietary Preferences */}
            {step === 4 && (
              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <CardTitle className={styles.stepTitle}>Dietary preferences & restrictions</CardTitle>
                  <CardDescription>Select any that apply to you</CardDescription>
                </div>

                <div className={styles.dietarySection}>
                  <div className={styles.dietaryGroup}>
                    <Label className={styles.dietaryLabel}>Lifestyle & Ethical Diets</Label>
                    <div className={styles.badgeContainer}>
                      {lifestyleDiets.map((option) => (
                        <Badge
                          key={option}
                          variant={formData.lifestyleDiets.includes(option) ? "default" : "outline"}
                          onClick={() =>
                            toggleArrayItem(formData.lifestyleDiets, option, (items) =>
                              setFormData({ ...formData, lifestyleDiets: items })
                            )
                          }
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className={styles.dietaryGroup}>
                    <Label className={styles.dietaryLabel}>Medical & Health Restrictions</Label>
                    <div className={styles.badgeContainer}>
                      {medicalRestrictions.map((option) => (
                        <Badge
                          key={option}
                          variant={formData.medicalRestrictions.includes(option) ? "destructive" : "outline"}
                          onClick={() =>
                            toggleArrayItem(formData.medicalRestrictions, option, (items) =>
                              setFormData({ ...formData, medicalRestrictions: items })
                            )
                          }
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className={styles.dietaryGroup}>
                    <Label className={styles.dietaryLabel}>Cultural & Religious Diets</Label>
                    <div className={styles.badgeContainer}>
                      {culturalDiets.map((option) => (
                        <Badge
                          key={option}
                          variant={formData.culturalDiets.includes(option) ? "secondary" : "outline"}
                          onClick={() =>
                            toggleArrayItem(formData.culturalDiets, option, (items) =>
                              setFormData({ ...formData, culturalDiets: items })
                            )
                          }
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Goals */}
            {step === 5 && (
              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <CardTitle className={styles.stepTitle}>What are your goals?</CardTitle>
                  <CardDescription>This helps us personalize your experience</CardDescription>
                </div>

                <div className={styles.goalsSection}>
                  <div className={styles.badgeContainer}>
                    {goalOptions.map((option) => (
                      <Badge
                        key={option}
                        variant={formData.goals.includes(option) ? "goals" : "outline"}
                        onClick={() =>
                          toggleArrayItem(formData.goals, option, (items) =>
                            setFormData({ ...formData, goals: items })
                          )
                        }
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className={styles.macrosSection}>
                <div className={styles.stepHeader}>
                  <h2 className={styles.stepTitle}>Personalized Macro Recommendations</h2>
                  <p className={styles.subtitle}>Customize your daily nutritional targets</p>
                </div>

                {isLoadingMacros ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Calculating your personalized macros...</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.macrosGrid}>
                      {/* Calories */}
                      <div className={styles.macroCard}>
                        <label className={styles.macroLabel}>Calories</label>
                        <div className={styles.macroInputGroup}>
                          <button
                            type="button"
                            className={styles.macroButton}
                            onClick={() => incrementMacro('calories', -50)}
                          >
                            ↓
                          </button>
                          <input
                            type="number"
                            value={formData.macros.calories}
                            onChange={(e) => handleMacroChange('calories', e.target.value)}
                            className={styles.macroInput}
                            min="0"
                          />
                          <button
                            type="button"
                            className={styles.macroButton}
                            onClick={() => incrementMacro('calories', 50)}
                          >
                            ↑
                          </button>
                        </div>
                        <span className={styles.macroUnit}>kcal</span>
                      </div>

                      {/* Fats */}
                      <div className={styles.macroCard}>
                        <label className={styles.macroLabel}>Fats</label>
                        <div className={styles.macroInputGroup}>
                          <button
                            type="button"
                            className={styles.macroButton}
                            onClick={() => incrementMacro('fats', -5)}
                          >
                            ↓
                          </button>
                          <input
                            type="number"
                            value={formData.macros.fats}
                            onChange={(e) => handleMacroChange('fats', e.target.value)}
                            className={styles.macroInput}
                            min="0"
                          />
                          <button
                            type="button"
                            className={styles.macroButton}
                            onClick={() => incrementMacro('fats', 5)}
                          >
                            ↑
                          </button>
                        </div>
                        <span className={styles.macroUnit}>g</span>
                      </div>

                      {/* Carbs */}
                      <div className={styles.macroCard}>
                        <label className={styles.macroLabel}>Carbs</label>
                        <div className={styles.macroInputGroup}>
                          <button
                            type="button"
                            className={styles.macroButton}
                            onClick={() => incrementMacro('carbs', -10)}
                          >
                            ↓
                          </button>
                          <input
                            type="number"
                            value={formData.macros.carbs}
                            onChange={(e) => handleMacroChange('carbs', e.target.value)}
                            className={styles.macroInput}
                            min="0"
                          />
                          <button
                            type="button"
                            className={styles.macroButton}
                            onClick={() => incrementMacro('carbs', 10)}
                          >
                            ↑
                          </button>
                        </div>
                        <span className={styles.macroUnit}>g</span>
                      </div>

                      {/* Protein */}
                      <div className={styles.macroCard}>
                        <label className={styles.macroLabel}>Protein</label>
                        <div className={styles.macroInputGroup}>
                          <button
                            type="button"
                            className={styles.macroButton}
                            onClick={() => incrementMacro('protein', -5)}
                          >
                            ↓
                          </button>
                          <input
                            type="number"
                            value={formData.macros.protein}
                            onChange={(e) => handleMacroChange('protein', e.target.value)}
                            className={styles.macroInput}
                            min="0"
                          />
                          <button
                            type="button"
                            className={styles.macroButton}
                            onClick={() => incrementMacro('protein', 5)}
                          >
                            ↑
                          </button>
                        </div>
                        <span className={styles.macroUnit}>g</span>

                      </div>

                    </div>
                    {/* Add the rationale display here */}
                    {macroSuggestions?.rationale && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">AI Thought Process:</h4>
                        <p className="text-sm text-blue-800 whitespace-pre-line">{macroSuggestions.rationale}</p>
                      </div>
                    )}

                    <Card className={styles.completionCard}>
                      <CardContent className={styles.completionContent}>
                        <h3 className={styles.completionTitle}>
                          You're all set! <Icon name="party" size={24} style={{ display: 'inline-block', marginLeft: '4px' }} />
                        </h3>
                        <p className={styles.completionText}>
                          We'll use this information to create personalized meal plans just for you.
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}

            {macroError && (
              <div className={styles.errorSection}>
                <p className={styles.errorMessage}>Error generating macros.</p>
                <div className={styles.errorActions}>
                  <button
                    onClick={handleRetryMacros}
                    className={styles.retryButton}
                  >
                    Retry
                  </button>
                </div>
                <p className={styles.errorHelp}>Or click Continue to enter macros manually</p>
              </div>
            )}

            {/* Navigation */}
            <div className={styles.navigation}>
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className={styles.backButton}
              >
                ← Back
              </Button>

              <Button
                onClick={step === totalSteps ? handleComplete : handleNext}
                className={styles.nextButton}
                disabled={submitting}
              >
                {step === totalSteps ? (submitting ? 'Saving...' : 'Complete Setup') : 'Continue →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
