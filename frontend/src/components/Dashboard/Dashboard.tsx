"use client"

"use client"

import React, { type FC, useState } from "react"
import styles from "./Dashboard.module.css"
import AssistantContent from "./AssistantContent/AssistantContent"
import MealContentCard from "./MealContentCard/MealContentCard"
import SearchBar from "./SearchBar/SearchBar"
<<<<<<< HEAD
=======
import PlannerMealCard from "./PlannerContentCard/PlannerContentCard"
>>>>>>> 8cfda1c (Merge with Linda)

interface SummaryCardData {
  title: string;
  value: string | number;
  subtext: string;
  icon: string; 
  progressBar?: {
    current: number
    total: number
  }
}

type DashboardProps = {}

// --- Shell components for each content area ---
// --- Shell components for each content area ---
function MealContent() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showFilters, setShowFilters] = React.useState(false)
  const [selectedFilters, setSelectedFilters] = React.useState({
    category: "All",
    maxTime: "Any",
    maxPrice: "Any",
    dietary: [] as string[],
  })

  const sampleMeals = [
    {
      imageUrl: undefined,
      title: "Mediterranean Chickpea Bowl",
      description: "A nutritious bowl packed with chickpeas, fresh vegetables, and tahini dressing",
      time: 25,
      price: 4.5,
      time: 25,
      price: 4.5,
      calories: 420,
      rating: 4.5,
      tags: ["High Protein", "Budget-Friendly", "Vegetarian"],
      category: "Lunch",
    },
    {
    },
    {
      imageUrl: undefined,
      title: "Avocado Toast with Eggs",
      description: "Crispy whole grain bread topped with mashed avocado and sunny-side-up eggs",
      time: 15,
      price: 3.2,
      time: 15,
      price: 3.2,
      calories: 350,
      rating: 4.2,
      tags: ["Quick", "High Fiber", "Vegetarian"],
      category: "Breakfast",
    },
    {
    },
    {
      imageUrl: undefined,
      title: "Teriyaki Chicken Bowl",
      description: "Grilled chicken with teriyaki sauce served over rice with steamed vegetables",
      time: 30,
      price: 5.8,
      time: 30,
      price: 5.8,
      calories: 520,
      rating: 4.7,
      tags: ["High Protein"],
      category: "Dinner",
    },
    {
    },
    {
      imageUrl: undefined,
      title: "Greek Yogurt Parfait",
      description: "Creamy yogurt layered with granola, fresh berries, and honey",
      time: 10,
      price: 2.8,
      time: 10,
      price: 2.8,
      calories: 280,
      rating: 4.6,
      tags: ["Quick", "High Protein", "Vegetarian"],
      category: "Breakfast",
    },
    {
      imageUrl: undefined,
      title: "Veggie Wrap",
      description: "Whole wheat wrap filled with hummus, fresh vegetables, and feta cheese",
      time: 12,
      price: 3.5,
      time: 12,
      price: 3.5,
      calories: 320,
      rating: 4.3,
      tags: ["Quick", "Vegetarian", "Budget-Friendly"],
      category: "Lunch",
    },
    {
    },
    {
      imageUrl: undefined,
      title: "Trail Mix Energy Bites",
      description: "No-bake energy balls with oats, peanut butter, and dark chocolate chips",
      time: 5,
      price: 1.5,
      time: 5,
      price: 1.5,
      calories: 180,
      rating: 4.8,
      tags: ["Quick", "Budget-Friendly"],
      category: "Snacks",
    },
  ]

  const filteredMeals = sampleMeals.filter((meal) => {
    const matchesSearch = meal.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedFilters.category === "All" || meal.category === selectedFilters.category
    const matchesTime = selectedFilters.maxTime === "Any" || meal.time <= Number.parseInt(selectedFilters.maxTime)
    const matchesPrice = selectedFilters.maxPrice === "Any" || meal.price <= Number.parseFloat(selectedFilters.maxPrice)
    const matchesTime = selectedFilters.maxTime === "Any" || meal.time <= Number.parseInt(selectedFilters.maxTime)
    const matchesPrice = selectedFilters.maxPrice === "Any" || meal.price <= Number.parseFloat(selectedFilters.maxPrice)
    const matchesDietary =
      selectedFilters.dietary.length === 0 || selectedFilters.dietary.every((diet) => meal.tags.includes(diet))

    return matchesSearch && matchesCategory && matchesTime && matchesPrice && matchesDietary
  })

  const handleFilterClick = () => {
    setShowFilters(!showFilters)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedFilters({ ...selectedFilters, category })
  }

  const handleTimeChange = (maxTime: string) => {
    setSelectedFilters({ ...selectedFilters, maxTime })
  }

  const handlePriceChange = (maxPrice: string) => {
    setSelectedFilters({ ...selectedFilters, maxPrice })
  }

  const handleDietaryToggle = (dietary: string) => {
    const newDietary = selectedFilters.dietary.includes(dietary)
      ? selectedFilters.dietary.filter((d) => d !== dietary)
      : [...selectedFilters.dietary, dietary]
    setSelectedFilters({ ...selectedFilters, dietary: newDietary })
  }

  const handleClearFilters = () => {
    setSelectedFilters({
      category: "All",
      maxTime: "Any",
      maxPrice: "Any",
      dietary: [],
    })
  }

  return (
    <div>
      <h2 className={styles.greeting}>Meal Recommendations</h2>
      <p className={styles.prompt}>Discover delicious recipes tailored to your preferences.</p>

      <div className={styles.searchBarContainer}>
        <SearchBar
          placeholder="Search for Recipes"
          value={searchQuery}
          onChange={setSearchQuery}
          onFilterClick={handleFilterClick}
        />

        {showFilters && (
          <div className={styles.filterDropdown}>
            <div className={styles.filterHeader}>
              <h3 className={styles.filterTitle}>Filter Meals</h3>
              <button onClick={handleClearFilters} className={styles.clearButton}>
                Clear All
              </button>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Meal Type</label>
              <div className={styles.filterOptions}>
                {["All", "Breakfast", "Lunch", "Dinner", "Snacks"].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`${styles.filterOption} ${selectedFilters.category === category ? styles.filterOptionActive : ""}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Max Cooking Time</label>
              <div className={styles.filterOptions}>
                {["Any", "15", "30", "45"].map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeChange(time)}
                    className={`${styles.filterOption} ${selectedFilters.maxTime === time ? styles.filterOptionActive : ""}`}
                  >
                    {time === "Any" ? "Any" : `${time} min`}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Max Price</label>
              <div className={styles.filterOptions}>
                {["Any", "3", "5", "7"].map((price) => (
                  <button
                    key={price}
                    onClick={() => handlePriceChange(price)}
                    className={`${styles.filterOption} ${selectedFilters.maxPrice === price ? styles.filterOptionActive : ""}`}
                  >
                    {price === "Any" ? "Any" : `$${price}`}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Dietary Preferences</label>
              <div className={styles.filterCheckboxes}>
                {["Vegetarian", "High Protein", "Quick", "Budget-Friendly"].map((dietary) => (
                  <label key={dietary} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedFilters.dietary.includes(dietary)}
                      onChange={() => handleDietaryToggle(dietary)}
                      className={styles.checkbox}
                    />
                    <span>{dietary}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.mealScrollContainer}>
        {filteredMeals.map((meal, index) => (
          <MealContentCard
            key={index}
            imageUrl={meal.imageUrl}
            title={meal.title}
            description={meal.description}
            time={`${meal.time} min`}
            price={`$${meal.price.toFixed(2)}`}
            time={`${meal.time} min`}
            price={`$${meal.price.toFixed(2)}`}
            calories={meal.calories}
            rating={meal.rating}
            tags={meal.tags}
          />
        ))}
      </div>

      {filteredMeals.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          <p>No meals found matching your criteria</p>
          <p style={{ fontSize: "0.875rem", marginTop: "8px" }}>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

<<<<<<< HEAD
function PlannerContent() {
=======
function PlannerContent({ 
  selectedDay, 
  setSelectedDay, 
  weeklyMealPlan, 
  setWeeklyMealPlan 
}: { 
  selectedDay: keyof WeeklyMealPlan
  setSelectedDay: React.Dispatch<React.SetStateAction<keyof WeeklyMealPlan>>
  weeklyMealPlan: WeeklyMealPlan
  setWeeklyMealPlan: React.Dispatch<React.SetStateAction<WeeklyMealPlan>>
}) {
  const [selectedRecipe, setSelectedRecipe] = useState<Meal | null>(null)
  const [showRecipeModal, setShowRecipeModal] = useState(false)

  const handleMealClick = (meal: any) => {
    if (meal && meal.recipe) {
      setSelectedRecipe(meal)
      setShowRecipeModal(true)
    }
  }

  const handleDeleteMeal = (day: string, mealType: string, mealIndex: number) => {
    const dayKey = day as keyof WeeklyMealPlan
    const mealTypeKey = mealType as keyof DayMealPlan
    setWeeklyMealPlan((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [mealTypeKey]: prev[dayKey][mealTypeKey].filter((_: Meal, index: number) => index !== mealIndex),
      },
    }))
  }

  const handleAddMeal = (mealType: string) => {
    console.log(`Add meal to ${mealType}`)
    // You can implement a modal or form to add meals here
  }

  const days = Object.keys(weeklyMealPlan) as Array<keyof WeeklyMealPlan>
  const currentDayIndex = days.indexOf(selectedDay)

  const goToPreviousDay = () => {
    const prevIndex = currentDayIndex > 0 ? currentDayIndex - 1 : days.length - 1
    setSelectedDay(days[prevIndex])
  }

  const goToNextDay = () => {
    const nextIndex = currentDayIndex < days.length - 1 ? currentDayIndex + 1 : 0
    setSelectedDay(days[nextIndex])
  }

  const calculateDailyTotals = () => {
    const dayPlan = weeklyMealPlan[selectedDay]
    const totalCalories =
      dayPlan.breakfast.reduce((sum, meal) => sum + meal.calories, 0) +
      dayPlan.lunch.reduce((sum, meal) => sum + meal.calories, 0) +
      dayPlan.dinner.reduce((sum, meal) => sum + meal.calories, 0) +
      dayPlan.snacks.reduce((sum, snack) => sum + snack.calories, 0)

    const totalCost =
      dayPlan.breakfast.reduce((sum, meal) => sum + Number.parseFloat(meal.cost.replace("$", "")), 0) +
      dayPlan.lunch.reduce((sum, meal) => sum + Number.parseFloat(meal.cost.replace("$", "")), 0) +
      dayPlan.dinner.reduce((sum, meal) => sum + Number.parseFloat(meal.cost.replace("$", "")), 0) +
      dayPlan.snacks.reduce((sum, snack) => sum + Number.parseFloat(snack.cost.replace("$", "")), 0)

    return { totalCalories, totalCost: totalCost.toFixed(2) }
  }

  const { totalCalories, totalCost } = calculateDailyTotals()

function PlannerContent() {
  return (
    <div>
      <div className={styles.plannerHeader}>
        <div>
          <h2 className={styles.greeting}>Daily Meal Planner</h2>
          <p className={styles.prompt}>Click on any meal to view the full recipe</p>
        </div>
        <div className={styles.dayNavigation}>
          <button className={styles.navButton} onClick={goToPreviousDay}>
            ‹
          </button>
          <div className={styles.dayButtons}>
            {days.map((day) => (
              <button
                key={day}
                className={`${styles.dayButton} ${selectedDay === day ? styles.dayButtonActive : ""}`}
                onClick={() => setSelectedDay(day)}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          <button className={styles.navButton} onClick={goToNextDay}>
            ›
          </button>
        </div>
      </div>

      <div className={styles.plannerContent}>
        <PlannerMealCard
          mealType="breakfast"
          meals={weeklyMealPlan[selectedDay].breakfast}
          color="#f97316"
          label="Breakfast"
          selectedDay={selectedDay}
          onMealClick={handleMealClick}
          onDeleteMeal={handleDeleteMeal}
          onAddMeal={handleAddMeal}
        />
        <PlannerMealCard
          mealType="lunch"
          meals={weeklyMealPlan[selectedDay].lunch}
          color="#22c55e"
          label="Lunch"
          selectedDay={selectedDay}
          onMealClick={handleMealClick}
          onDeleteMeal={handleDeleteMeal}
          onAddMeal={handleAddMeal}
        />
        <PlannerMealCard
          mealType="dinner"
          meals={weeklyMealPlan[selectedDay].dinner}
          color="#3b82f6"
          label="Dinner"
          selectedDay={selectedDay}
          onMealClick={handleMealClick}
          onDeleteMeal={handleDeleteMeal}
          onAddMeal={handleAddMeal}
        />
        <PlannerMealCard
          mealType="snacks"
          meals={weeklyMealPlan[selectedDay].snacks}
          color="#a855f7"
          label="Snacks"
          selectedDay={selectedDay}
          onMealClick={handleMealClick}
          onDeleteMeal={handleDeleteMeal}
          onAddMeal={handleAddMeal}
        />
      </div>

      <div className={styles.plannerFooter}>
        <div className={styles.dailyTotals}>
          <span className={styles.totalItem}>
            <strong>{totalCalories}</strong> total calories
          </span>
          <span className={styles.totalItem}>
            <strong>${totalCost}</strong> daily cost
          </span>
        </div>
        <button className={styles.primaryButton}>🛒 Add to Grocery List</button>
      </div>

      {showRecipeModal && selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setShowRecipeModal(false)} />
      )}
    </div>
  )
}

function NutritionContent({ selectedDay, weeklyMealPlan }: { selectedDay: keyof WeeklyMealPlan; weeklyMealPlan: WeeklyMealPlan }) {
  // Calculate nutrition data based on the selected day's meals
  const calculateNutritionData = () => {
    const dayPlan = weeklyMealPlan[selectedDay];
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    // Sum up nutrition from all meals in the day
    const mealTypes: (keyof DayMealPlan)[] = ['breakfast', 'lunch', 'dinner', 'snacks'];
    
    mealTypes.forEach(mealType => {
      dayPlan[mealType].forEach(meal => {
        totalCalories += meal.calories;
        totalProtein += meal.recipe.nutrition.protein;
        totalCarbs += meal.recipe.nutrition.carbs;
        totalFat += meal.recipe.nutrition.fat;
        totalFiber += meal.recipe.nutrition.fiber;
      });
    });

    // Target values (you can customize these based on user goals)
    const targets = {
      calories: 2000,
      protein: 120,
      carbs: 250,
      fat: 78,
      fiber: 25
    };

    return {
      calories: { consumed: totalCalories, target: targets.calories },
      protein: { consumed: totalProtein, target: targets.protein },
      carbs: { consumed: totalCarbs, target: targets.carbs },
      fat: { consumed: totalFat, target: targets.fat },
      fiber: { consumed: totalFiber, target: targets.fiber },
    };
  };

  const nutritionData = calculateNutritionData();

  const renderProgressBar = (consumed: number, target: number, color: string) => {
    const percentage = Math.min((consumed / target) * 100, 100);
    return (
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarFill} style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    );
  };

  return (
    <div>
      <h2 className={styles.greeting}>Today's Nutrition - {selectedDay}</h2>
      <p className={styles.prompt}>Nutrition data based on your {selectedDay.toLowerCase()} meal plan</p>

      <div className={styles.nutritionTracker}>
        <div className={styles.nutritionItem}>
          <div className={styles.nutritionHeader}>
            <div className={styles.nutritionLabel}>
              <span className={styles.nutritionIcon}>⚡</span>
              <span>Calories</span>
            </div>
            <span className={styles.nutritionValue}>
              {nutritionData.calories.consumed} / {nutritionData.calories.target}
            </span>
          </div>
          {renderProgressBar(nutritionData.calories.consumed, nutritionData.calories.target, "#f97316")}
        </div>

        <div className={styles.nutritionItem}>
          <div className={styles.nutritionHeader}>
            <div className={styles.nutritionLabel}>
              <span className={styles.nutritionIcon}>💪</span>
              <span>Protein</span>
            </div>
            <span className={styles.nutritionValue}>
              {nutritionData.protein.consumed}g / {nutritionData.protein.target}g
            </span>
          </div>
          {renderProgressBar(nutritionData.protein.consumed, nutritionData.protein.target, "#ef4444")}
        </div>

        <div className={styles.nutritionItem}>
          <div className={styles.nutritionHeader}>
            <div className={styles.nutritionLabel}>
              <span className={styles.nutritionIcon}>🍎</span>
              <span>Carbohydrates</span>
            </div>
            <span className={styles.nutritionValue}>
              {nutritionData.carbs.consumed}g / {nutritionData.carbs.target}g
            </span>
          </div>
          {renderProgressBar(nutritionData.carbs.consumed, nutritionData.carbs.target, "#22c55e")}
        </div>

        <div className={styles.nutritionItem}>
          <div className={styles.nutritionHeader}>
            <div className={styles.nutritionLabel}>
              <span className={styles.nutritionIcon}>💧</span>
              <span>Fat</span>
            </div>
            <span className={styles.nutritionValue}>
              {nutritionData.fat.consumed}g / {nutritionData.fat.target}g
            </span>
          </div>
          {renderProgressBar(nutritionData.fat.consumed, nutritionData.fat.target, "#eab308")}
        </div>

        <div className={styles.nutritionItem}>
          <div className={styles.nutritionHeader}>
            <div className={styles.nutritionLabel}>
              <span className={styles.nutritionIcon}>🌾</span>
              <span>Fiber</span>
            </div>
            <span className={styles.nutritionValue}>
              {nutritionData.fiber.consumed}g / {nutritionData.fiber.target}g
            </span>
          </div>
          {renderProgressBar(nutritionData.fiber.consumed, nutritionData.fiber.target, "#3b82f6")}
        </div>
      </div>
    </div>
  );
}

function AIAssistantContent() {
  return (
    <div>
      <h2 className={styles.greeting}>AI Assistant</h2>
      <p className={styles.prompt}>Content for AI nutrition assistant will go here.</p>
    </div>
  )
}

function DashboardContentSwitcher() {
  const [activeTab, setActiveTab] = useState("meals");
  const [selectedDay, setSelectedDay] = useState<keyof WeeklyMealPlan>("Monday");
  const [weeklyMealPlan, setWeeklyMealPlan] = useState<WeeklyMealPlan>({
    Monday: {
      breakfast: [
        {
          name: "Greek Yogurt Bowl",
          calories: 320,
          time: "10 min",
          cost: "$3.50",
          recipe: {
            ingredients: ["1 cup Greek yogurt", "1/2 cup granola", "1/2 cup mixed berries", "1 tbsp honey"],
            instructions: [
              "Add Greek yogurt to a bowl",
              "Top with granola and mixed berries",
              "Drizzle with honey",
              "Enjoy immediately",
            ],
            nutrition: { protein: 20, carbs: 45, fat: 8, fiber: 6 },
          },
        },
      ],
      lunch: [
        {
          name: "Mediterranean Chickpea Bowl",
          calories: 420,
          time: "25 min",
          cost: "$4.50",
          recipe: {
            ingredients: [
              "1 cup chickpeas",
              "1 cup mixed greens",
              "1/2 cup cherry tomatoes",
              "1/4 cup cucumber",
              "2 tbsp tahini dressing",
              "1/4 cup feta cheese",
            ],
            instructions: [
              "Drain and rinse chickpeas",
              "Chop vegetables into bite-sized pieces",
              "Combine all ingredients in a bowl",
              "Drizzle with tahini dressing",
              "Top with feta cheese",
            ],
            nutrition: { protein: 18, carbs: 52, fat: 14, fiber: 12 },
          },
        },
      ],
      dinner: [
        {
          name: "Grilled Salmon with Roasted Vegetables",
          calories: 380,
          time: "30 min",
          cost: "$8.50",
          recipe: {
            ingredients: [
              "6 oz salmon fillet",
              "1 tbsp olive oil",
              "1 lemon",
              "2 cloves garlic",
              "Fresh herbs",
              "Salt and pepper",
            ],
            instructions: [
              "Preheat grill to medium-high heat",
              "Season salmon with salt, pepper, and herbs",
              "Brush with olive oil and minced garlic",
              "Grill for 4-5 minutes per side",
              "Squeeze fresh lemon juice before serving",
            ],
            nutrition: { protein: 34, carbs: 2, fat: 22, fiber: 0 },
          },
        },
      ],
      snacks: [
        {
          name: "Apple & Almond Butter",
          calories: 180,
          time: "2 min",
          cost: "$2.00",
          recipe: {
            ingredients: ["1 medium apple", "2 tbsp almond butter"],
            instructions: ["Slice apple into wedges", "Serve with almond butter for dipping"],
            nutrition: { protein: 4, carbs: 24, fat: 9, fiber: 5 },
          },
        },
        {
          name: "Greek Yogurt",
          calories: 120,
          time: "1 min",
          cost: "$1.50",
          recipe: {
            ingredients: ["1 cup Greek yogurt", "1 tsp honey"],
            instructions: ["Add yogurt to bowl", "Drizzle with honey"],
            nutrition: { protein: 15, carbs: 12, fat: 3, fiber: 0 },
          },
        },
      ],
    },
    Tuesday: {
      breakfast: [
        {
          name: "Overnight Oats",
          calories: 290,
          time: "5 min prep",
          cost: "$2.50",
          recipe: {
            ingredients: ["1/2 cup oats", "1/2 cup milk", "1/2 banana", "1 tbsp chia seeds", "Cinnamon"],
            instructions: [
              "Mix oats, milk, and chia seeds in a jar",
              "Refrigerate overnight",
              "Top with sliced banana and cinnamon in the morning",
            ],
            nutrition: { protein: 12, carbs: 48, fat: 6, fiber: 8 },
          },
        },
      ],
      lunch: [
        {
          name: "Quick Chicken Stir Fry",
          calories: 380,
          time: "15 min",
          cost: "$6.20",
          recipe: {
            ingredients: [
              "6 oz chicken breast",
              "2 cups mixed vegetables",
              "2 tbsp soy sauce",
              "1 tbsp sesame oil",
              "Garlic and ginger",
            ],
            instructions: [
              "Cut chicken into bite-sized pieces",
              "Heat sesame oil in a wok or large pan",
              "Cook chicken until golden brown",
              "Add vegetables and stir fry for 5 minutes",
              "Add soy sauce, garlic, and ginger",
              "Serve hot",
            ],
            nutrition: { protein: 38, carbs: 28, fat: 12, fiber: 4 },
          },
        },
      ],
      dinner: [],
      snacks: [
        {
          name: "Trail Mix",
          calories: 200,
          time: "1 min",
          cost: "$1.50",
          recipe: {
            ingredients: ["1/4 cup mixed nuts", "2 tbsp dried cranberries", "1 tbsp dark chocolate chips"],
            instructions: ["Mix all ingredients together", "Portion into small bags for easy snacking"],
            nutrition: { protein: 6, carbs: 18, fat: 14, fiber: 3 },
          },
        },
      ],
    },
    Wednesday: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
    Thursday: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
    Friday: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
    Saturday: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
    Sunday: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
<<<<<<< HEAD
  })

  const handleMealClick = (meal: any) => {
    if (meal && meal.recipe) {
      setSelectedRecipe(meal)
      setShowRecipeModal(true)
    }
  }

  const handleDeleteMeal = (day: string, mealType: string, mealIndex: number) => {
    const dayKey = day as keyof WeeklyMealPlan
    const mealTypeKey = mealType as keyof DayMealPlan
    setWeeklyMealPlan((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [mealTypeKey]: prev[dayKey][mealTypeKey].filter((_: Meal, index: number) => index !== mealIndex),
      },
    }))
  }

  const handleAddMeal = (mealType: string) => {
    console.log(`Add meal to ${mealType}`)
    // You can implement a modal or form to add meals here
  }

  const days = Object.keys(weeklyMealPlan) as Array<keyof WeeklyMealPlan>
  const currentDayIndex = days.indexOf(selectedDay)

  const goToPreviousDay = () => {
    const prevIndex = currentDayIndex > 0 ? currentDayIndex - 1 : days.length - 1
    setSelectedDay(days[prevIndex])
  }

  const goToNextDay = () => {
    const nextIndex = currentDayIndex < days.length - 1 ? currentDayIndex + 1 : 0
    setSelectedDay(days[nextIndex])
  }

  const calculateDailyTotals = () => {
    const dayPlan = weeklyMealPlan[selectedDay]
    const totalCalories =
      dayPlan.breakfast.reduce((sum, meal) => sum + meal.calories, 0) +
      dayPlan.lunch.reduce((sum, meal) => sum + meal.calories, 0) +
      dayPlan.dinner.reduce((sum, meal) => sum + meal.calories, 0) +
      dayPlan.snacks.reduce((sum, snack) => sum + snack.calories, 0)

    const totalCost =
      dayPlan.breakfast.reduce((sum, meal) => sum + Number.parseFloat(meal.cost.replace("$", "")), 0) +
      dayPlan.lunch.reduce((sum, meal) => sum + Number.parseFloat(meal.cost.replace("$", "")), 0) +
      dayPlan.dinner.reduce((sum, meal) => sum + Number.parseFloat(meal.cost.replace("$", "")), 0) +
      dayPlan.snacks.reduce((sum, snack) => sum + Number.parseFloat(snack.cost.replace("$", "")), 0)

    return { totalCalories, totalCost: totalCost.toFixed(2) }
  }

  const { totalCalories, totalCost } = calculateDailyTotals()

>>>>>>> 8cfda1c (Merge with Linda)
  return (
    <div>
      <h2 className={styles.greeting}>Meal Planner</h2>
      <p className={styles.prompt}>Content for meal planning will go here.</p>
      <h2 className={styles.greeting}>Meal Planner</h2>
      <p className={styles.prompt}>Content for meal planning will go here.</p>
    </div>
  )
}

function NutritionContent() {
  return (
    <div>
      <h2 className={styles.greeting}>Nutrition Tracker</h2>
      <p className={styles.prompt}>Content for nutrition tracking will go here.</p>
      <h2 className={styles.greeting}>Nutrition Tracker</h2>
      <p className={styles.prompt}>Content for nutrition tracking will go here.</p>
    </div>
  )
}

function AIAssistantContent() {
  return (
    <div>
      <AssistantContent />
    </div>
  )
}

// --- Dashboard Content Switcher ---
// --- Dashboard Content Switcher ---
function DashboardContentSwitcher() {
  const [activeTab, setActiveTab] = useState("meals")

  const tabs = [
    { id: "meals", label: "Meals" },
    { id: "planner", label: "Planner" },
    { id: "nutrition", label: "Nutrition" },
    { id: "ai-assistant", label: "AI Assistant" },
  ]

  return (
    <div className={styles.contentSwitcher}>
      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "meals" && <MealContent />}
        {activeTab === "planner" && <PlannerContent />}
        {activeTab === "nutrition" && <NutritionContent />}
        {activeTab === "ai-assistant" && <AIAssistantContent />}
      </div>
    </div>
  )
}

const Dashboard: FC<DashboardProps> = () => {
  const dashboardSummary: SummaryCardData[] = [
    {
      title: "Weekly Budget",
      value: "$65/100",
      subtext: "",
      icon: "$",
      progressBar: {
        current: 65,
        total: 100,
      },
    },
    {
      title: "Meals Planned",
      value: 12,
      subtext: "This week",
      icon: "🍴",
    },
    {
      title: "Avg. Calories",
      value: 1850,
      subtext: "",
      icon: "👨‍👧‍👦",
      progressBar: {
        current: 75,
        total: 100,
      },
    },
  ]

  // Helper function to render the progress bar
  // Helper function to render the progress bar
  const renderProgressBar = (current: number, total: number) => {
    const percentage = (current / total) * 100
    return (
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarFill} style={{ width: `${percentage}%` }} />
      </div>
    )
  }

  const renderSummaryCard = (card: SummaryCardData) => (
    <div key={card.title} className={styles.summaryCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{card.title}</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardValue}>{card.value}</div>
        <div className={styles.iconBackground}>{card.icon}</div>
      </div>

      {card.progressBar ? (
        renderProgressBar(card.progressBar.current, card.progressBar.total)
      ) : (
        <div className={styles.cardSubtext}>{card.subtext}</div>
      )}
    </div>
  )

  return (
    <div className={styles.Dashboard}>
      {/* Header/Greeting Section */}
      <div className={styles.header}>
        <h1 className={styles.greeting}>Good morning, Jessica! 👋</h1>
        <p className={styles.prompt}>Ready to plan some delicious meals for this week?</p>
      </div>

      {/* Summary Cards Section */}
      <div className={styles.summaryGrid}>{dashboardSummary.map(renderSummaryCard)}</div>

      {/* Dashboard Content Switcher Section */}
      <DashboardContentSwitcher />
    </div>
  )
}

export default Dashboard