// MealContentCard.tsx
import React, { type FC, useState } from 'react';
import styles from './MealContentCard.module.css';

interface MealContentCardProps {
  imageUrl?: string;
  title: string;
  description: string;
  time: string;
  price: string;
  calories: number;
  rating?: number;
  tags?: string[];
}

const MealContentCard: FC<MealContentCardProps> = ({
  imageUrl,
  title,
  description,
  time,
  price,
  calories,
  rating,
  tags = []
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
  };

  return (
    <div className={styles.MealContentCard}>
      {/* Image Section */}
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className={styles.mealImage} />
        ) : (
          <div className={styles.imagePlaceholder}>Meal Image</div>
        )}
        
        {/* Like Button */}
        <button 
          className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
          onClick={handleLikeToggle}
          aria-label={isLiked ? 'Unlike meal' : 'Like meal'}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>

      </div>

      {/* Content Section */}
      <div className={styles.content}>
        {/* Title and Rating Row */}
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{title}</h3>
          {rating && (
            <div className={styles.rating}>
              ⭐ {rating}
            </div>
          )}
        </div>

        {/* Description */}
        <p className={styles.description}>{description}</p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meal Details */}
        <div className={styles.mealDetails}>
          {/* Time */}
          <div className={styles.detailItem}>
            <span className={styles.detailIcon}>⏱</span>
            <span className={styles.detailText}>{time}</span>
          </div>

          {/* Price */}
          <div className={styles.detailItem}>
            <span className={styles.detailIcon}>💲</span>
            <span className={styles.detailText}>{price}</span>
          </div>

          {/* Calories */}
          <div className={styles.detailItem}>
            <span className={styles.detailText}>{calories} cal</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button className={styles.addButton}>+ Add to Plan</button>
          <button className={styles.viewButton}>View Recipe</button>
        </div>
      </div>
    </div>
  );
};

export default MealContentCard;