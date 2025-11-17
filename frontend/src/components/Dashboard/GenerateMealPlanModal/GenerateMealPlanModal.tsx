import React, { useState } from 'react';
import styles from './GenerateMealPlanModal.module.css';

interface GenerateMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (startDate: string, endDate: string, preferences: UserPreferences) => void;
}

interface UserPreferences {
  dailyCalories: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  fiberGoal: number;
  dietaryRestrictions: string[];
  mealsPerDay: number;
}

const GenerateMealPlanModal: React.FC<GenerateMealPlanModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  // Mock user preferences (these would come from the backend/onboarding in production)
  const [userPreferences] = useState<UserPreferences>({
    dailyCalories: 2000,
    proteinGoal: 120,
    carbsGoal: 250,
    fatGoal: 78,
    fiberGoal: 25,
    dietaryRestrictions: ['Vegetarian'],
    mealsPerDay: 3,
  });

  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 6);
    return weekLater.toISOString().split('T')[0];
  });

  const [includeSnacks, setIncludeSnacks] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number>(7);

  // Quick date range presets
  const setDateRangePreset = (days: number) => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days - 1);
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(futureDate.toISOString().split('T')[0]);
    setSelectedPreset(days);
  };

  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const preferences = {
      ...userPreferences,
      mealsPerDay: includeSnacks ? 4 : 3,
    };
    
    onGenerate(startDate, endDate, preferences);
    setIsGenerating(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Generate Meal Plan</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Date Range Selection */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📅 Select Date Range</h3>
            <div className={styles.dateRangePresets}>
              <button 
                onClick={() => setDateRangePreset(7)} 
                className={`${styles.presetButton} ${selectedPreset === 7 ? styles.active : ''}`}
              >
                1 Week
              </button>
              <button 
                onClick={() => setDateRangePreset(14)} 
                className={`${styles.presetButton} ${selectedPreset === 14 ? styles.active : ''}`}
              >
                2 Weeks
              </button>
              <button 
                onClick={() => setDateRangePreset(30)} 
                className={`${styles.presetButton} ${selectedPreset === 30 ? styles.active : ''}`}
              >
                1 Month
              </button>
            </div>
            <div className={styles.dateInputs}>
              <div className={styles.dateInputGroup}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setSelectedPreset(0); // Clear preset selection when manually changing date
                  }}
                  className={styles.dateInput}
                />
              </div>
              <div className={styles.dateInputGroup}>
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setSelectedPreset(0); // Clear preset selection when manually changing date
                  }}
                  min={startDate}
                  className={styles.dateInput}
                />
              </div>
            </div>
            <div className={styles.daysCount}>
              Will generate meals for <strong>{calculateDays()} days</strong>
            </div>
          </div>

          {/* User Goals Summary */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🎯 Your Daily Goals</h3>
            <div className={styles.goalsGrid}>
              <div className={styles.goalCard}>
                <div className={styles.goalValue}>{userPreferences.dailyCalories}</div>
                <div className={styles.goalLabel}>Calories</div>
              </div>
              <div className={styles.goalCard}>
                <div className={styles.goalValue}>{userPreferences.proteinGoal}g</div>
                <div className={styles.goalLabel}>Protein</div>
              </div>
              <div className={styles.goalCard}>
                <div className={styles.goalValue}>{userPreferences.carbsGoal}g</div>
                <div className={styles.goalLabel}>Carbs</div>
              </div>
              <div className={styles.goalCard}>
                <div className={styles.goalValue}>{userPreferences.fatGoal}g</div>
                <div className={styles.goalLabel}>Fat</div>
              </div>
              <div className={styles.goalCard}>
                <div className={styles.goalValue}>{userPreferences.fiberGoal}g</div>
                <div className={styles.goalLabel}>Fiber</div>
              </div>
            </div>
            {userPreferences.dietaryRestrictions.length > 0 && (
              <div className={styles.restrictions}>
                <strong>Dietary Restrictions:</strong>{' '}
                {userPreferences.dietaryRestrictions.join(', ')}
              </div>
            )}
          </div>

          {/* Meal Options */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🍽️ Meal Options</h3>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeSnacks}
                onChange={(e) => setIncludeSnacks(e.target.checked)}
                className={styles.checkbox}
              />
              <span>Include snacks (in addition to breakfast, lunch, and dinner)</span>
            </label>
          </div>

          {/* Info Box */}
          <div className={styles.infoBox}>
            <div className={styles.infoIcon}>ℹ️</div>
            <div className={styles.infoText}>
              The meal plan will be automatically generated to meet your daily nutritional goals 
              while respecting your dietary restrictions. Meals will be selected from our recipe 
              database and optimized for variety and balance.
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose} disabled={isGenerating}>
            Cancel
          </button>
          <button
            className={styles.generateButton}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className={styles.spinner}></span>
                Generating...
              </>
            ) : (
              <>
                ✨ Generate Meal Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateMealPlanModal;
