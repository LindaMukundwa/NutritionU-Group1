import React from "react"
import styles from "../Dashboard.module.css"
import { Icon } from "../../ui/Icon"

interface Meal {
  name: string
  calories: number
  time: string
  cost: string
  recipe: {
    ingredients: string[]
    instructions: string[]
    nutrition: {
      protein: number
      carbs: number
      fat: number
      fiber: number
    }
  }
}

interface PlannerMealCardProps {
  mealType: string
  meals: Meal[]
  color: string
  label: string
  selectedDay: string
  onMealClick: (meal: Meal) => void
  onDeleteMeal: (day: string, mealType: string, mealIndex: number) => void
  onAddMeal: (mealType: string) => void
}

export default function PlannerMealCard({
  mealType,
  meals,
  color,
  label,
  selectedDay,
  onMealClick,
  onDeleteMeal,
  onAddMeal,
}: PlannerMealCardProps) {
  return (
    <div 
      className={styles.mealSection}
      style={{ 
        '--meal-color': color,
        borderLeftColor: color
      } as React.CSSProperties}
    >
      <div className={styles.mealSectionHeader}>
        <h3 className={styles.mealSectionTitle}>
          <div className={styles.mealColorDot} style={{ backgroundColor: color }} />
          <span>{label}</span>
        </h3>
        <button className={styles.addMealButton} onClick={() => onAddMeal(mealType)}>
          <span className={styles.plusIcon}>+</span>
          Add {label}
        </button>
      </div>
      {meals.length > 0 ? (
        <div className={styles.mealCards}>
          {meals.map((meal, index) => (
            <div
              key={index}
              className={styles.mealCard}
              style={{ 
                backgroundColor: color.includes('oklch') 
                  ? color.replace(')', ' / 0.15)') 
                  : `${color}40`,
                borderColor: color.includes('oklch')
                  ? color.replace(')', ' / 0.5)')
                  : `${color}80`
              }}
              onClick={() => onMealClick(meal)}
            >
              <div className={styles.mealCardContent}>
                <div className={styles.mealCardMain}>
                  <h4 className={styles.mealCardTitle}>{meal.name}</h4>
                  <div className={styles.mealCardMeta}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon name="clock" size={14} /> {meal.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {meal.cost}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon name="zap" size={14} /> {meal.calories} cal
                    </span>
                  </div>
                </div>
                <button
                  className={styles.deleteMealButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteMeal(selectedDay, mealType, index)
                  }}
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyMealCard}>
          <p className={styles.emptyMealText}>No {label.toLowerCase()} planned</p>
        </div>
      )}
    </div>
  )
}
