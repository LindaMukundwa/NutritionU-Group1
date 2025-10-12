import React from 'react';
import styles from './Progress.module.css';

interface ProgressProps {
  value: number;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, className = '' }) => {
  const progressClass = `${styles.progress} ${className}`;
  
  return (
    <div className={progressClass}>
      <div 
        className={styles.progressBar}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

export default Progress;
