import React, { useState } from 'react';
import styles from './AddToPlanModal.module.css';
import { Icon } from '../../ui/Icon';

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

// Helper function to format date for full display
function formatFullDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayString = getDateString(today);
  const tomorrowString = getDateString(tomorrow);
  
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const fullDate = date.toLocaleDateString('en-US', options);
  
  // Show "Today" or "Tomorrow" with the date in parentheses
  if (dateString === todayString) {
    return `Today (${fullDate})`;
  } else if (dateString === tomorrowString) {
    return `Tomorrow (${fullDate})`;
  }
  
  return fullDate;
}

const AddToPlanModal: React.FC<AddToPlanModalProps> = ({
  isOpen,
  onClose,
  onAddToPlan,
  mealTitle,
}) => {
  // Initialize with today's date
  const [selectedDay, setSelectedDay] = useState(getDateString(new Date()));
  const [selectedMealType, setSelectedMealType] = useState('breakfast');

  // Navigation functions
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDay + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDay(getDateString(currentDate));
  };

  const goToNextDay = () => {
    const currentDate = new Date(selectedDay + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDay(getDateString(currentDate));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDay(e.target.value);
    }
  };

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
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.mealTitle}>{mealTitle}</p>

          {/* Day Selection with Date Navigation */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Select Day</label>
            <div className={styles.dateNavigation}>
              <button className={styles.navButton} onClick={goToPreviousDay} title="Previous day">
                ‹
              </button>
              <div className={styles.dateDisplay}>
                <span className={styles.dateText}>{formatFullDate(selectedDay)}</span>
                <input
                  type="date"
                  value={selectedDay}
                  onChange={handleDateChange}
                  className={styles.datePicker}
                  title="Select a date"
                />
              </div>
              <button className={styles.navButton} onClick={goToNextDay} title="Next day">
                ›
              </button>
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
