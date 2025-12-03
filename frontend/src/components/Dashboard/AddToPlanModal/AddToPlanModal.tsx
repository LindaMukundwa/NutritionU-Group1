import React, { useState } from 'react';
import styles from './AddToPlanModal.module.css';
import { Icon } from '../../ui/Icon';

interface AddToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToPlan: (dateString: string, mealType: string) => void;
  mealTitle: string;
  isLoading?: boolean;
  loadingMessage?: string
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
  isLoading = false,
  loadingMessage = "Adding meal..."
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
    { value: 'breakfast', label: 'Breakfast', color: '#FFB084' },
    { value: 'lunch', label: 'Lunch', color: '#7FD8A4' },
    { value: 'dinner', label: 'Dinner', color: '#84C9FF' },
    { value: 'snacks', label: 'Snacks', color: '#FFD88D' },
  ];

  const handleAdd = () => {
    onAddToPlan(selectedDay, selectedMealType);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingMessage}>{loadingMessage}</p>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add to Meal Plan</h3>
              <button className={styles.closeButton} onClick={onClose}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.mealTitle}>{mealTitle}</p>

              {/* Date Navigation */}
              <div className={styles.dateNavigation}>
                <button onClick={goToPreviousDay} className={styles.navButton}>
                  <Icon name="chevron-left" size={20} />
                </button>
                <input
                  type="date"
                  value={selectedDay}
                  onChange={handleDateChange}
                  className={styles.dateInput}
                />
                <button onClick={goToNextDay} className={styles.navButton}>
                  <Icon name="chevron-right" size={20} />
                </button>
              </div>

              {/* Meal Type Selection */}
              <div className={styles.mealTypeSection}>
                <label className={styles.sectionLabel}>Select Meal Type</label>
                <div className={styles.mealTypeGrid}>
                  {mealTypes.map((type) => (
                    <button
                      key={type.value}
                      className={`${styles.mealTypeButton} ${selectedMealType === type.value ? styles.selected : ''
                        }`}
                      style={{
                        borderColor: selectedMealType === type.value ? type.color : '#ddd',
                        backgroundColor: selectedMealType === type.value ? `${type.color}20` : 'white',
                      }}
                      onClick={() => setSelectedMealType(type.value)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={onClose}>
                Cancel
              </button>
              <button
                className={styles.addButton}
                onClick={handleAdd}
                disabled={!selectedMealType}
              >
                Add to Plan
              </button>
            </div>
            </>
          )}
        </div>
      </div>
    );
  };
  
  export default AddToPlanModal;

