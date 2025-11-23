import { type FC, useState } from "react"
import styles from "./MealContentCard.module.css"
import React from 'react'

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
    <div className={styles.MealContentCard}>
      {/* Image Section */}
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className={styles.mealImage} />
        ) : (
          <div className={styles.imagePlaceholder}>
            {title.charAt(0).toUpperCase()}
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
            <svg
              className={styles.detailIcon}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4V8L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className={styles.detailText}>{totalTime} min</span>
          </div>

          {/* Price */}
          <div className={styles.detailItem}>
            <svg
              className={styles.detailIcon}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 1V15M10.5 3.5H6.75C6.15326 3.5 5.58097 3.73705 5.15901 4.15901C4.73705 4.58097 4.5 5.15326 4.5 5.75C4.5 6.34674 4.73705 6.91903 5.15901 7.34099C5.58097 7.76295 6.15326 8 6.75 8H9.25C9.84674 8 10.419 8.23705 10.841 8.65901C11.2629 9.08097 11.5 9.65326 11.5 10.25C11.5 10.8467 11.2629 11.419 10.841 11.841C10.419 12.2629 9.84674 12.5 9.25 12.5H4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.detailText}>
              ${estimatedCostPerServing.toFixed(2)}
            </span>
          </div>

          {/* Calories */}
          <div className={styles.detailItem}>
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