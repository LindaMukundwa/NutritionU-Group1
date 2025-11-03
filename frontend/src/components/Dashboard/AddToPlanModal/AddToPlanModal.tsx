import React, { useState } from 'react';
import styles from './AddToPlanModal.module.css';

interface AddToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToPlan: (dateString: string, mealType: string) => void;
  mealTitle: string;
}

// Helper function to get date string in YYYY-MM-DD format
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to format date for display
function formatDateDisplay(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

const AddToPlanModal: React.FC<AddToPlanModalProps> = ({
  isOpen,
  onClose,
  onAddToPlan,
  mealTitle,
}) => {
  // Generate next 7 days starting from today
  const generateNext7Days = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(getDateString(date));
    }
    return dates;
  };

  const availableDates = generateNext7Days();
  const [selectedDay, setSelectedDay] = useState(availableDates[0]);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', color: '#f97316' },
    { value: 'lunch', label: 'Lunch', color: '#22c55e' },
    { value: 'dinner', label: 'Dinner', color: '#3b82f6' },
    { value: 'snacks', label: 'Snacks', color: '#a855f7' },
  ];

  const handleAdd = () => {
    onAddToPlan(selectedDay, selectedMealType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Add to Meal Plan</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.mealTitle}>{mealTitle}</p>

          {/* Day Selection */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Select Day</label>
            <div className={styles.dayGrid}>
              {availableDates.map((dateString) => (
                <button
                  key={dateString}
                  className={`${styles.dayButton} ${selectedDay === dateString ? styles.dayButtonActive : ''}`}
                  onClick={() => setSelectedDay(dateString)}
                  title={formatDateDisplay(dateString)}
                >
                  {formatDateDisplay(dateString)}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Type Selection */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Select Meal Type</label>
            <div className={styles.mealTypeGrid}>
              {mealTypes.map((mealType) => (
                <button
                  key={mealType.value}
                  className={`${styles.mealTypeButton} ${
                    selectedMealType === mealType.value ? styles.mealTypeButtonActive : ''
                  }`}
                  onClick={() => setSelectedMealType(mealType.value)}
                  style={
                    selectedMealType === mealType.value
                      ? { borderColor: mealType.color, backgroundColor: `${mealType.color}15` }
                      : {}
                  }
                >
                  <div
                    className={styles.mealTypeDot}
                    style={{ backgroundColor: mealType.color }}
                  />
                  {mealType.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.addButton} onClick={handleAdd}>
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlanModal;
