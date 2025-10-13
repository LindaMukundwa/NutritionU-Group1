import React, { useState } from 'react';
import Button from '../ui/Button';
import { Card, CardContent, CardDescription, CardTitle } from '../ui/Card';
import Label from '../ui/Label';
import Badge from '../ui/Badge';
import Progress from '../ui/Progress';
import styles from './OnboardingPage.module.css';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    budget: 100,
    cookingLevel: '',
    lifestyleDiets: [] as string[],
    medicalRestrictions: [] as string[],
    culturalDiets: [] as string[],
    goals: [] as string[],
    mealPrep: '',
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const lifestyleDiets = ["Vegetarian", "Vegan", "Pescatarian", "Flexitarian", "Mediterranean", "Paleo", "Keto", "Whole30"];
  const medicalRestrictions = ["Gluten", "Dairy", "Nuts", "Peanuts", "Soy", "Eggs", "Shellfish", "Wheat", "Sesame", "Corn", "Sulfites", "FODMAP", "Histamine", "Sodium (Low)", "Sugar (Low)"];
  const culturalDiets = ["Halal", "Kosher", "Jain", "Hindu (No Beef)", "Buddhist (Vegetarian)"];
  const goalOptions = ["Save Money", "Eat Healthier", "Save Time", "Learn to Cook", "Lose Weight", "Gain Muscle"];

  const nextStep = () => setStep(Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(Math.max(step - 1, 1));

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

  return (
    <div className={styles.container}>
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
            {/* Step 1: Cooking Experience */}
            {step === 1 && (
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

            {/* Step 2: Budget */}
            {step === 2 && (
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

            {/* Step 3: Dietary Preferences */}
            {step === 3 && (
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

            {/* Step 4: Goals */}
            {step === 4 && (
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

                  <Card className={styles.completionCard}>
                    <CardContent className={styles.completionContent}>
                      <h3 className={styles.completionTitle}>You're all set! 🎉</h3>
                      <p className={styles.completionText}>
                        We'll use this information to create personalized meal plans just for you.
                      </p>
                    </CardContent>
                  </Card>
                </div>
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
                onClick={step === totalSteps ? () => console.log('Complete!') : nextStep}
                className={styles.nextButton}
              >
                {step === totalSteps ? "Complete Setup" : "Continue →"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
