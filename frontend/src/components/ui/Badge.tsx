import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'cultural' | 'goals';
  className?: string;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick 
}) => {
  const badgeClass = `${styles.badge} ${styles[variant]} ${className}`;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <span className={badgeClass} onClick={handleClick}>
      {children}
    </span>
  );
};

export default Badge;
