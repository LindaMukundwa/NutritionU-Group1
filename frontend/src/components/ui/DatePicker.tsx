import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './DatePicker.module.css';
import { Icon } from './Icon';

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  className?: string;
  buttonStyle?: React.CSSProperties;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value + 'T00:00:00'));
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update dropdown position when opened and on scroll
  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dropdownWidth = 280;
        // Center the dropdown under the button
        const centerLeft = rect.left + (rect.width / 2) - (dropdownWidth / 2);
        
        setDropdownPosition({
          top: rect.bottom + 8,
          left: centerLeft
        });
      }
    };

    if (isOpen) {
      updatePosition();
      // Update position smoothly on scroll and resize
      let rafId: number;
      const handleUpdate = () => {
        rafId = requestAnimationFrame(updatePosition);
      };
      
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const handleDateClick = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const isSelectedDate = (day: number) => {
    const selectedDate = new Date(value + 'T00:00:00');
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewDate.getMonth() &&
      selectedDate.getFullYear() === viewDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    );
  };

  return (
    <div className={`${styles.datePickerContainer} ${className || ''}`} ref={containerRef}>
      <button
        className={styles.dateButton}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className={styles.dateText}>{formatDisplayDate(value)}</span>
        <Icon name="calendar" size={16} />
      </button>

      {isOpen && createPortal(
        <div 
          className={styles.calendarDropdown} 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: '280px'
          }}
        >
          <div className={styles.calendarHeader}>
            <button
              className={styles.navButton}
              onClick={goToPreviousMonth}
              type="button"
            >
              <Icon name="chevron-left" size={18} />
            </button>
            <div className={styles.monthYear}>
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button
              className={styles.navButton}
              onClick={goToNextMonth}
              type="button"
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </div>

          <div className={styles.calendarBody}>
            <div className={styles.daysHeader}>
              {DAYS.map(day => (
                <div key={day} className={styles.dayName}>
                  {day}
                </div>
              ))}
            </div>

            <div className={styles.daysGrid}>
              {generateCalendarDays().map((day, index) => (
                <div key={index} className={styles.dayCell}>
                  {day && (
                    <button
                      className={`${styles.dayButton} ${
                        isSelectedDate(day) ? styles.selected : ''
                      } ${isToday(day) ? styles.today : ''}`}
                      onClick={() => handleDateClick(day)}
                      type="button"
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
