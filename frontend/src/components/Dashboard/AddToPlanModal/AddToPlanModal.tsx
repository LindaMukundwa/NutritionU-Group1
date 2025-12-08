import React, { useState } from 'react';
import styles from './AddToPlanModal.module.css';
import { Icon } from '../../ui/Icon';
import { DatePicker } from '../../ui/DatePicker';

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

// Helper function to format date for display (matches nutrition tab format)
function formatFullDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
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
    { value: 'breakfast', label: 'Breakfast', color: 'oklch(0.7 0.05 264)' },
    { value: 'lunch', label: 'Lunch', color: 'oklch(0.70 0.10 180)' },
    { value: 'dinner', label: 'Dinner', color: 'oklch(0.60 0.15 260)' },
    { value: 'snacks', label: 'Snacks', color: 'oklch(0.70 0.12 150)' },
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
              <h3 className={styles.modalTitle}>{mealTitle}</h3>
              <button className={styles.closeButton} onClick={onClose}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Date and Meal Type Stacked */}
              <div className={styles.selectionContainer}>
                {/* Date Selection */}
                <div className={styles.section}>
                  <label className={styles.sectionLabel}>Date</label>
                  <DatePicker
                    value={selectedDay}
                    onChange={setSelectedDay}
                  />
                </div>

                {/* Meal Type Selection */}
                <div className={styles.section}>
                  <label className={styles.sectionLabel}>Meal Type</label>
                  <div className={styles.mealTypeGrid}>
                    {mealTypes.map((type) => (
                      <button
                        key={type.value}
                        className={`${styles.mealTypeButton} ${
                          selectedMealType === type.value ? styles.mealTypeButtonActive : ''
                        }`}
                        data-meal-type={type.value}
                        onClick={() => setSelectedMealType(type.value)}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
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
