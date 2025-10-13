import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const cardClass = `${styles.card} ${className}`;
  
  return (
    <div className={cardClass} onClick={onClick}>
      {children}
    </div>
  );
};

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  const contentClass = `${styles.cardContent} ${className}`;
  
  return (
    <div className={contentClass}>
      {children}
    </div>
  );
};

const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  const titleClass = `${styles.cardTitle} ${className}`;
  
  return (
    <h3 className={titleClass}>
      {children}
    </h3>
  );
};

const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => {
  const descClass = `${styles.cardDescription} ${className}`;
  
  return (
    <p className={descClass}>
      {children}
    </p>
  );
};

export { Card, CardContent, CardTitle, CardDescription };
