import styles from "../Dashboard/Dashboard.module.css"

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
    <div className={styles.mealSection}>
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
              style={{ backgroundColor: `${color}15`, borderColor: `${color}40` }}
              onClick={() => onMealClick(meal)}
            >
              <div className={styles.mealCardContent}>
                <div className={styles.mealCardMain}>
                  <h4 className={styles.mealCardTitle}>{meal.name}</h4>
                  <div className={styles.mealCardMeta}>
                    <span>⏱ {meal.time}</span>
                    <span>💲 {meal.cost}</span>
                    <span>⚡ {meal.calories} cal</span>
                  </div>
                </div>
                <button
                  className={styles.deleteMealButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteMeal(selectedDay, mealType, index)
                  }}
                >
                  🗑️
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
