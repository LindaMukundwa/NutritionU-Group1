import React, { useState } from 'react';
import styles from './AddToPlanModal.module.css';

interface AddToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToPlan: (day: string, mealType: string) => void;
  mealTitle: string;
}

const AddToPlanModal: React.FC<AddToPlanModalProps> = ({
  isOpen,
  onClose,
  onAddToPlan,
  mealTitle,
}) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedMealType, setSelectedMealType] = useState('breakfast');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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
              {days.map((day) => (
                <button
                  key={day}
                  className={`${styles.dayButton} ${selectedDay === day ? styles.dayButtonActive : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {day.slice(0, 3)}
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
            Add to {selectedDay}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlanModal;
