import { type FC, useState, useEffect, useRef } from "react"
import styles from "./MealContentCard.module.css"
import React from 'react'
import { Icon } from '../../ui/Icon'

interface MealContentCardProps {
  recipeId: string;
  imageUrl?: string;
  title: string;
  description?: string;
  totalTime: number; // in minutes
  estimatedCostPerServing: number;
  nutritionInfo: {
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  dietaryTags?: string[];
  onViewRecipe?: (recipeId: string) => void;
  onAddToPlan?: (recipeId: string) => void;
}

const MealContentCard: FC<MealContentCardProps> = ({
  recipeId,
  imageUrl,
  title,
  description,
  totalTime,
  estimatedCostPerServing,
  nutritionInfo,
  dietaryTags = [],
  onViewRecipe,
  onAddToPlan,
}) => {
  // For demo purposes start cards as favorited so they can be filtered/shown as favorites
  const [isLiked, setIsLiked] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of card is visible
        rootMargin: '50px', // Start animation slightly before card enters viewport
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    // TODO: Save to favorites in backend
  };

  const handleAddToPlan = () => {
    if (onAddToPlan) {
      onAddToPlan(recipeId);
    }
  };

  const handleViewRecipe = () => {
    if (onViewRecipe) {
      onViewRecipe(recipeId);
    }
  };

  return (
    <div 
      ref={cardRef}
      className={`${styles.MealContentCard} ${isVisible ? styles.visible : ''}`}
    >
      {/* Image Section */}
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className={styles.mealImage} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <Icon name="utensils" size={48} />
          </div>
        )}

        {/* Like Button */}
        <button
          className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
          onClick={handleLikeToggle}
          aria-label={isLiked ? "Unlike meal" : "Like meal"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill={isLiked ? "#ef4444" : "none"}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 14L7.05 13.15C3.4 9.86 1 7.69 1 5.05C1 2.88 2.68 1.2 4.85 1.2C6.04 1.2 7.19 1.76 8 2.66C8.81 1.76 9.96 1.2 11.15 1.2C13.32 1.2 15 2.88 15 5.05C15 7.69 12.6 9.86 8.95 13.15L8 14Z"
              stroke={isLiked ? "#ef4444" : "#6b7280"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        {/* Title */}
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{title}</h3>
        </div>

        {/* Description */}
        {description && (
          <p className={styles.description}>{description}</p>
        )}

        {/* Tags */}
        {dietaryTags.length > 0 && (
          <div className={styles.tags}>
            {dietaryTags.slice(0, 3).map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
            {dietaryTags.length > 3 && (
              <span className={styles.tag}>+{dietaryTags.length - 3}</span>
            )}
          </div>
        )}

        {/* Meal Details */}
        <div className={styles.mealDetails}>
          {/* Time */}
          <div className={styles.detailItem}>
            <Icon name="clock" size={12} className={styles.detailIcon} />
            <span className={styles.detailText}>{totalTime} min</span>
          </div>

          {/* Price */}
          <div className={styles.detailItem}>
            <span className={styles.detailText}>
              $ {estimatedCostPerServing.toFixed(2)}
            </span>
          </div>

          {/* Calories */}
          <div className={styles.detailItem}>
            <Icon name="zap" size={12} className={styles.detailIcon} />
            <span className={styles.detailText}>
              {Math.round(nutritionInfo.calories)} cal
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button className={styles.addButton} onClick={handleAddToPlan}>
            + Add to Plan
          </button>
          <button className={styles.viewButton} onClick={handleViewRecipe}>
            View Recipe
          </button>
        </div>
      </div>
    </div>
  )
}

export default MealContentCard
