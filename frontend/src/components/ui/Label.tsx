import React from 'react';
import styles from './Label.module.css';

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

const Label: React.FC<LabelProps> = ({ children, className = '', htmlFor }) => {
  const labelClass = `${styles.label} ${className}`;
  
  return (
    <label className={labelClass} htmlFor={htmlFor}>
      {children}
    </label>
  );
};

export default Label;
