import React, { type FC, useState } from "react"
import { TopNavBar } from "../NavigationBar/TopNavBar"
import styles from "./Dashboard.module.css"
import AssistantContent from "./AssistantContent/AssistantContent"
import MealContentCard from "./MealContentCard/MealContentCard"
import SearchBar from "./SearchBar/SearchBar"
import { recipeService } from '../../../services/recipeService';
import PlannerMealCard from "./PlannerContentCard/PlannerContentCard"
import AddMealModal from "./AddMealModal/AddMealModal"
import AddToPlanModal from "./AddToPlanModal/AddToPlanModal"
import GroceryList from "./GroceryList/GroceryList"
import GenerateMealPlanModal from "./GenerateMealPlanModal/GenerateMealPlanModal"
import type { Recipe } from '../../../../shared/types/recipe';
import { useAuth } from '../../contexts/AuthContext';

// meal plan hook imports
import { useMealPlan } from '../../hooks/useMealPlan';

interface SummaryCardData {
  title: string;
  value: string | number;
  subtext: string;
  icon: string;
  progressBar?: {
    current: number;
    total: number;
  };
}

// Simplified Meal type for the planner (compatible with Recipe schema)
interface Meal {
  name: string;  // Maps to Recipe.title
  calories: number;  // Maps to Recipe.nutritionInfo.calories
  time: string;  // Maps to Recipe.totalTime
  cost: string;  // Maps to Recipe.estimatedCostPerServing
  recipe: {
    ingredients: string[];  // Simplified from Recipe.ingredients (just names)
    instructions: string[];  // Simplified from Recipe.instructions (just text)
    nutrition: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
  };
}

// Helper function to convert Recipe to Meal
function recipeToMeal(recipe: Recipe): Meal {
  return {
    name: recipe.title,
    calories: recipe.nutritionInfo.calories,
    time: `${recipe.totalTime} min`,
    cost: `$${recipe.estimatedCostPerServing.toFixed(2)}`,
    recipe: {
      ingredients: recipe.ingredients.map(ing => `${ing.amount} ${ing.unit.value} ${ing.name}`),
      instructions: recipe.instructions.map(step => step.instruction),
      nutrition: {
        protein: recipe.nutritionInfo.protein,
        carbs: recipe.nutritionInfo.carbs,
        fat: recipe.nutritionInfo.fat,
        fiber: recipe.nutritionInfo.fiber,
      },
    },
  };
}

interface DayMealPlan {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
}

// Use a Map-like structure with date strings as keys (YYYY-MM-DD format)
interface WeeklyMealPlan {
  [dateString: string]: DayMealPlan;
}

// Helper function to get date string in YYYY-MM-DD format
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to format date for display
function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

// Helper function to get day name
function getDayName(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

// Helper to get or create empty day plan
function getOrCreateDayPlan(plan: WeeklyMealPlan, dateString: string): DayMealPlan {
  if (!plan[dateString]) {
    return {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };
  }
  return plan[dateString];
}

// Reusable DateNavigation Component
function DateNavigation({
  selectedDay,
  setSelectedDay,
}: {
  selectedDay: string;
  setSelectedDay: React.Dispatch<React.SetStateAction<string>>;
}) {
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDay + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDay(getDateString(currentDate));
  };

  const goToNextDay = () => {
    const currentDate = new Date(selectedDay + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDay(getDateString(currentDate));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDay(e.target.value);
    }
  };

  return (
    <div className={styles.dateNavigation}>
      <button className={styles.navButton} onClick={goToPreviousDay} title="Previous day">
        ‹
      </button>
      <div className={styles.dateDisplay}>
        <span className={styles.dateText}>{formatDisplayDate(selectedDay)}</span>
        <input
          type="date"
          value={selectedDay}
          onChange={handleDateChange}
          className={styles.datePicker}
          title="Select a date"
        />
      </div>
      <button className={styles.navButton} onClick={goToNextDay} title="Next day">
        ›
      </button>
    </div>
  );
}

type DashboardProps = {}

function RecipeModal({ recipe, onClose }: { recipe: any; onClose: () => void }) {
  if (!recipe) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Keep the header as it was */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{recipe.name}</h2>
            <div className={styles.modalMeta}>
              <span>⏱ {recipe.time || recipe.cookTime}</span>
              <span>💲 {recipe.cost}</span>
              <span>⚡ {recipe.calories} cal</span>
            </div>
          </div>
          <button className={styles.modalCloseButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* FIXED NUTRITION GRID - just change this part */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5c6bcc', margin: '0 0 4px 0' }}>
                {recipe.recipe.nutrition.protein}g
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0', fontWeight: '500', textTransform: 'uppercase' }}>
                Protein
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5c6bcc', margin: '0 0 4px 0' }}>
                {recipe.recipe.nutrition.carbs}g
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0', fontWeight: '500', textTransform: 'uppercase' }}>
                Carbs
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5c6bcc', margin: '0 0 4px 0' }}>
                {recipe.recipe.nutrition.fat}g
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0', fontWeight: '500', textTransform: 'uppercase' }}>
                Fat
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5c6bcc', margin: '0 0 4px 0' }}>
                {recipe.recipe.nutrition.fiber}g
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0', fontWeight: '500', textTransform: 'uppercase' }}>
                Fiber
              </p>
            </div>
          </div>
          {/* END OF FIXED NUTRITION GRID */}

          {/* Keep the rest exactly as it was */}
          <div className={styles.recipeSection}>
            <h3 className={styles.sectionTitle}>Ingredients</h3>
            <ul className={styles.ingredientsList}>
              {recipe.recipe.ingredients.map((ingredient: string, index: number) => (
                <li key={index} className={styles.ingredientItem}>
                  <span className={styles.bullet}>•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.recipeSection}>
            <h3 className={styles.sectionTitle}>Instructions</h3>
            <ol className={styles.instructionsList}>
              {recipe.recipe.instructions.map((instruction: string, index: number) => (
                <li key={index} className={styles.instructionItem}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.modalActions}>
            <button className={styles.primaryButton}>🛒 Add to Grocery List</button>
            <button className={styles.secondaryButton}>✏️ Edit Recipe</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MealContent({
  weeklyMealPlan,
  setWeeklyMealPlan,
}: {
  weeklyMealPlan: WeeklyMealPlan;
  setWeeklyMealPlan: React.Dispatch<React.SetStateAction<WeeklyMealPlan>>;
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [recipesFromApi, setRecipesFromApi] = React.useState<any[] | null>(null)
  const [searchError, setSearchError] = React.useState<string | null>(null)
  const [showFilters, setShowFilters] = React.useState(false)
  const [selectedRecipe, setSelectedRecipe] = React.useState(null)
  const [showRecipeModal, setShowRecipeModal] = React.useState(false)
  const [showAddToPlanModal, setShowAddToPlanModal] = React.useState(false)
  const [mealToAdd, setMealToAdd] = React.useState<any>(null)
  const [selectedFilters, setSelectedFilters] = React.useState({
    category: "All",
    maxTime: 60,
    maxPrice: 10,
    dietary: [] as string[],
  })

  const sampleMeals = [
    {
      id: 1,
      imageUrl: undefined,
      title: "Mediterranean Chickpea Bowl",
      name: "Mediterranean Chickpea Bowl",
      description: "A nutritious bowl packed with chickpeas, fresh vegetables, and tahini dressing",
      time: "25 min",
      cookTime: "25 min",
      price: "$4.50",
      cost: "$4.50",
      calories: 420,
      rating: 4.5,
      tags: ["High Protein", "Budget-Friendly", "Vegetarian"],
      category: "Lunch",
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
    {
      id: 2,
      imageUrl: undefined,
      title: "Avocado Toast with Eggs",
      name: "Avocado Toast with Eggs",
      description: "Crispy whole grain bread topped with mashed avocado and sunny-side-up eggs",
      time: "15 min",
      cookTime: "15 min",
      price: "$3.20",
      cost: "$3.20",
      calories: 350,
      rating: 4.2,
      tags: ["Quick", "High Fiber", "Vegetarian"],
      category: "Breakfast",
      recipe: {
        ingredients: [
          "2 slices whole grain bread",
          "1 avocado",
          "2 eggs",
          "Salt and pepper",
          "Red pepper flakes (optional)",
        ],
        instructions: [
          "Toast bread until golden brown",
          "Mash avocado with salt and pepper",
          "Fry eggs sunny-side up",
          "Spread avocado on toast",
          "Top with eggs and red pepper flakes",
        ],
        nutrition: { protein: 16, carbs: 38, fat: 18, fiber: 10 },
      },
    },
    {
      id: 3,
      imageUrl: undefined,
      title: "Teriyaki Chicken Bowl",
      name: "Teriyaki Chicken Bowl",
      description: "Grilled chicken with teriyaki sauce served over rice with steamed vegetables",
      time: "30 min",
      cookTime: "30 min",
      price: "$5.80",
      cost: "$5.80",
      calories: 520,
      rating: 4.7,
      tags: ["High Protein"],
      category: "Dinner",
      recipe: {
        ingredients: [
          "6 oz chicken breast",
          "1 cup cooked rice",
          "2 cups mixed vegetables",
          "3 tbsp teriyaki sauce",
          "1 tbsp sesame seeds",
        ],
        instructions: [
          "Cook rice according to package directions",
          "Cut chicken into bite-sized pieces",
          "Cook chicken in a pan until golden",
          "Add teriyaki sauce and vegetables",
          "Serve over rice and garnish with sesame seeds",
        ],
        nutrition: { protein: 38, carbs: 62, fat: 12, fiber: 4 },
      },
    },
    {
      id: 4,
      imageUrl: undefined,
      title: "Greek Yogurt Parfait",
      name: "Greek Yogurt Parfait",
      description: "Creamy yogurt layered with granola, fresh berries, and honey",
      time: "10 min",
      cookTime: "10 min",
      price: "$2.80",
      cost: "$2.80",
      calories: 280,
      rating: 4.6,
      tags: ["Quick", "High Protein", "Vegetarian"],
      category: "Breakfast",
      recipe: {
        ingredients: ["1 cup Greek yogurt", "1/2 cup granola", "1/2 cup mixed berries", "1 tbsp honey"],
        instructions: [
          "Add Greek yogurt to a bowl or glass",
          "Layer with granola",
          "Top with mixed berries",
          "Drizzle with honey",
        ],
        nutrition: { protein: 20, carbs: 45, fat: 8, fiber: 6 },
      },
    },
    {
      id: 5,
      imageUrl: undefined,
      title: "Veggie Wrap",
      name: "Veggie Wrap",
      description: "Whole wheat wrap filled with hummus, fresh vegetables, and feta cheese",
      time: "12 min",
      cookTime: "12 min",
      price: "$3.50",
      cost: "$3.50",
      calories: 320,
      rating: 4.3,
      tags: ["Quick", "Vegetarian", "Budget-Friendly"],
      category: "Lunch",
      recipe: {
        ingredients: [
          "1 whole wheat tortilla",
          "3 tbsp hummus",
          "Mixed greens",
          "Sliced cucumber",
          "Sliced tomatoes",
          "Feta cheese",
        ],
        instructions: [
          "Spread hummus on tortilla",
          "Layer with greens and vegetables",
          "Sprinkle with feta cheese",
          "Roll tightly and slice in half",
        ],
        nutrition: { protein: 12, carbs: 42, fat: 10, fiber: 8 },
      },
    },
    {
      id: 6,
      imageUrl: undefined,
      title: "Trail Mix Energy Bites",
      name: "Trail Mix Energy Bites",
      description: "No-bake energy balls with oats, peanut butter, and dark chocolate chips",
      time: "5 min",
      cookTime: "5 min",
      price: "$1.50",
      cost: "$1.50",
      calories: 180,
      rating: 4.8,
      tags: ["Quick", "Budget-Friendly"],
      category: "Snacks",
      recipe: {
        ingredients: [
          "1 cup rolled oats",
          "1/2 cup peanut butter",
          "1/3 cup honey",
          "1/2 cup dark chocolate chips",
          "1/4 cup ground flaxseed",
        ],
        instructions: [
          "Mix all ingredients in a bowl",
          "Refrigerate for 30 minutes",
          "Roll into 1-inch balls",
          "Store in refrigerator",
        ],
        nutrition: { protein: 6, carbs: 24, fat: 9, fiber: 4 },
      },
    },
  ]

  // Use a local state copy of sample meals so we can populate images from the API on mount
  const [demoMeals, setDemoMeals] = React.useState<any[]>(sampleMeals)

  // On mount, fetch a small set of recipes and apply their images to the demo meals
  React.useEffect(() => {
    let mounted = true
    const loadDemoImages = async () => {
      try {
        // Fetch one recipe per sample meal title so images correspond to the meal name
        const promises = sampleMeals.map((m) => recipeService.searchRecipes(m.title, 1))
        const resultsArr = await Promise.all(promises)

        const updated = sampleMeals.map((m, i) => ({
          ...m,
          imageUrl: resultsArr[i] && resultsArr[i].length ? resultsArr[i][0].imageUrl : m.imageUrl,
        }))

        if (mounted) setDemoMeals(updated)
      } catch (err) {
        // Fail silently for demo purposes
        console.warn('Failed to load demo images for sample meals', err)
      }
    }

    loadDemoImages()
    return () => { mounted = false }
  }, [])

  const filteredMeals = demoMeals.filter((meal) => {
    const matchesSearch = meal.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedFilters.category === "All" || meal.category === selectedFilters.category
    const matchesTime = Number.parseInt(meal.time) <= selectedFilters.maxTime
    const matchesPrice = Number.parseFloat(meal.price.replace("$", "")) <= selectedFilters.maxPrice
    const matchesDietary =
      selectedFilters.dietary.length === 0 || selectedFilters.dietary.some((diet) => meal.tags.includes(diet))

    return matchesSearch && matchesCategory && matchesTime && matchesPrice && matchesDietary
  })

  const handleViewRecipe = (meal: any) => {
    setSelectedRecipe(meal)
    setShowRecipeModal(true)
  }

  const handleFilterClick = () => {
    setShowFilters(!showFilters)
  }

  const handleSearch = async () => {
    const q = searchQuery.trim()
    if (!q) return
    setSearchError(null)
    try {
      const results = await recipeService.searchRecipes(q)
      // Map API recipe shape to the meal shape used in this component
      const mapped = results.map((r) => ({
        id: r._id,
        imageUrl: r.imageUrl,
        title: r.title,
        name: r.title,
        description: r.description,
        time: String(r.totalTime || r.cookTime || 30),
        cookTime: String(r.cookTime || r.totalTime || 30),
        price: `$${(r.estimatedCostPerServing || 5).toFixed(2)}`,
        cost: `$${(r.estimatedCostPerServing || 5).toFixed(2)}`,
        calories: r.nutritionInfo?.calories || 0,
        rating: 4.5,
        tags: r.dietaryTags || [],
        category: r.mealType || 'Dinner',
        recipe: {
          ingredients: (r as any).ingredients ? (r as any).ingredients.map((i: any) => i.name || '') : [],
          instructions: (r as any).instructions ? (r as any).instructions.map((ins: any) => ins.instruction || '') : [],
          nutrition: {
            protein: r.nutritionInfo?.protein || 0,
            carbs: r.nutritionInfo?.carbs || 0,
            fat: r.nutritionInfo?.fat || 0,
            fiber: 0,
          }
        }
      }))
      setRecipesFromApi(mapped)
    } catch (err) {
      console.error('Recipe search failed', err)
      setRecipesFromApi([])
      setSearchError('Failed to load recipes')
    } finally {
      // no-op
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedFilters({ ...selectedFilters, category })
  }

  const handleTimeChange = (maxTime: number) => {
    setSelectedFilters({ ...selectedFilters, maxTime })
  }

  const handlePriceChange = (maxPrice: number) => {
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
      maxTime: 60,
      maxPrice: 10,
      dietary: [],
    })
  }

  // Choose API results when available, otherwise fall back to demoMeals (which may have images)
  const dataToShow: any[] = recipesFromApi !== null ? recipesFromApi : filteredMeals

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
          onSubmit={handleSearch}
        />

        {searchError && (
          <div style={{ color: '#dc2626', marginLeft: '12px' }}>{searchError}</div>
        )}

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
              <label className={styles.filterLabel}>Max Cooking Time: {selectedFilters.maxTime} min</label>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={selectedFilters.maxTime}
                onChange={(e) => handleTimeChange(Number.parseInt(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>5 min</span>
                <span>120 min</span>
              </div>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Max Price: ${selectedFilters.maxPrice}</label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={selectedFilters.maxPrice}
                onChange={(e) => handlePriceChange(Number.parseInt(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>$1</span>
                <span>$20</span>
              </div>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Dietary Preferences</label>
              <div className={styles.filterCheckboxes}>
                {["Vegetarian", "Vegan", "Pescatarian", "Mediterranean", "Paleo", "Keto", "Gluten-Free", "Dairy-Free", "High Protein"].map((dietary) => (
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
        {dataToShow.map((meal, index) => (
          <MealContentCard
            key={index}
            recipeId={meal.id.toString()}
            imageUrl={meal.imageUrl}
            title={meal.title}
            description={meal.description}
            totalTime={parseInt(meal.time)} // Convert "25 min" to just the number
            estimatedCostPerServing={parseFloat(meal.price.replace('$', ''))}
            nutritionInfo={{
              calories: meal.calories,
              protein: meal.recipe.nutrition.protein,
              carbs: meal.recipe.nutrition.carbs,
              fat: meal.recipe.nutrition.fat
            }}
            dietaryTags={meal.tags}
            onViewRecipe={() => handleViewRecipe(meal)}
            onAddToPlan={() => {
              setMealToAdd(meal);
              setShowAddToPlanModal(true);
            }}
          />
        ))}
      </div>

      {filteredMeals.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          <p>No meals found matching your criteria</p>
          <p style={{ fontSize: "0.875rem", marginTop: "8px" }}>Try adjusting your search or filters</p>
        </div>
      )}

      {showRecipeModal && selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setShowRecipeModal(false)} />
      )}

      {showAddToPlanModal && mealToAdd && (
        <AddToPlanModal
          isOpen={showAddToPlanModal}
          onClose={() => setShowAddToPlanModal(false)}
          onAddToPlan={(dateString, mealType) => {
            const plannerMeal: Meal = {
              name: mealToAdd.name || mealToAdd.title,
              calories: mealToAdd.calories,
              time: typeof mealToAdd.time === 'string' ? mealToAdd.time : `${mealToAdd.time} min`,
              cost: mealToAdd.cost || mealToAdd.price,
              recipe: mealToAdd.recipe,
            };

            const mealTypeKey = mealType as keyof DayMealPlan;

            setWeeklyMealPlan((prev) => {
              const dayPlan = getOrCreateDayPlan(prev, dateString);
              return {
                ...prev,
                [dateString]: {
                  ...dayPlan,
                  [mealTypeKey]: [...dayPlan[mealTypeKey], plannerMeal],
                },
              };
            });
          }}
          mealTitle={mealToAdd.title || mealToAdd.name}
        />
      )}
    </div>
  )
}

function PlannerContent({
  selectedDay,
  setSelectedDay,
  weeklyMealPlan,
  setWeeklyMealPlan,
  availableMeals,
  onOpenGroceryList
}: {
  selectedDay: string
  setSelectedDay: React.Dispatch<React.SetStateAction<string>>
  weeklyMealPlan: WeeklyMealPlan
  setWeeklyMealPlan: React.Dispatch<React.SetStateAction<WeeklyMealPlan>>
  availableMeals: any[]
  onOpenGroceryList: () => void
}) {
  const [selectedRecipe, setSelectedRecipe] = useState<Meal | null>(null)
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [showAddMealModal, setShowAddMealModal] = useState(false)
  const [addMealType, setAddMealType] = useState<string>('')
  const [showGenerateMealPlanModal, setShowGenerateMealPlanModal] = useState(false)
  const [isAddingMeal, setIsAddingMeal] = useState(false);

  const handleMealClick = (meal: any) => {
    if (meal && meal.recipe) {
      setSelectedRecipe(meal)
      setShowRecipeModal(true)
    }
  }

  const handleDeleteMeal = (dateString: string, mealType: string, mealIndex: number) => {
    const mealTypeKey = mealType as keyof DayMealPlan
    setWeeklyMealPlan((prev) => {
      const dayPlan = getOrCreateDayPlan(prev, dateString)
      return {
        ...prev,
        [dateString]: {
          ...dayPlan,
          [mealTypeKey]: dayPlan[mealTypeKey].filter((_: Meal, index: number) => index !== mealIndex),
        },
      }
    })
  }

  const handleAddMeal = (mealType: string) => {
    setAddMealType(mealType)
    setShowAddMealModal(true)
  }

  /**
   * Handles adding a meal to the meal planner by generating instructions and ingredients via API.
   * 
   * This function performs the following steps:
   * 1. Calls the chatbot API to generate cooking instructions and ingredients based on the meal's nutritional information
   * 2. Updates the meal object with the generated data (or keeps existing data if generation fails)
   * 3. Adds the updated meal to the appropriate meal type slot for the selected day in the weekly meal plan
   * 4. Closes the add meal modal on success
   * 
   * @param meal - The meal object to be added to the planner, containing name, calories, and recipe information
   * @throws Will log an error to console if the API call fails or returns a non-OK response
   * 
   * @remarks
   * - Uses the `addMealType` state variable to determine which meal slot (breakfast, lunch, dinner, snack) to populate
   * - Uses the `selectedDay` state variable to determine which day of the week to add the meal to
   * - Automatically creates a day plan if one doesn't exist for the selected day
   * - Does not throw errors to the caller; errors are caught and logged internally
   */
  const handleAddMealToPlanner = async (meal: Meal) => {
    // Add loading state
    setIsAddingMeal(true); // Use the state from component
    
    try {
      const response = await fetch('http://localhost:3001/api/chatbot/instructions-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `${meal.name} with approximately ${meal.calories} calories, ${meal.recipe.nutrition.protein}g protein, ${meal.recipe.nutrition.carbs}g carbs, and ${meal.recipe.nutrition.fat}g fat.`
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate instructions and ingredients');
      }
  
      const data = await response.json() as { ingredients?: string[]; instructions?: string[] };
      
      const updatedMeal = {
        ...meal,
        recipe: {
          ingredients: data.ingredients || meal.recipe.ingredients,
          instructions: data.instructions || meal.recipe.instructions,
          nutrition: meal.recipe.nutrition,
        },
      };
  
      const mealTypeKey = addMealType as keyof DayMealPlan;
      setWeeklyMealPlan((prev) => {
        const dayPlan = getOrCreateDayPlan(prev, selectedDay);
        return {
          ...prev,
          [selectedDay]: {
            ...dayPlan,
            [mealTypeKey]: [...dayPlan[mealTypeKey], updatedMeal],
          },
        };
      });
  
      setShowAddMealModal(false);
    } catch (error) {
      console.error('Error generating instructions and ingredients:', error);
      // Show error to user
    } finally {
      setIsAddingMeal(false);
    }
  };

  const handleGenerateMealPlan = (startDate: string, endDate: string, preferences: any) => {
    // This is a mock implementation - in production this would call an API
    // that uses AI to generate optimal meals based on nutritional goals
    
    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(endDate + 'T00:00:00')
    const newPlan: WeeklyMealPlan = { ...weeklyMealPlan }
    
    // Sample meals that match different nutritional profiles
    const breakfastOptions: Meal[] = [
      {
        name: 'Greek Yogurt Parfait',
        calories: 280,
        time: '10 min',
        cost: '$2.80',
        recipe: {
          ingredients: ['1 cup Greek yogurt', '1/2 cup granola', '1/2 cup mixed berries', '1 tbsp honey'],
          instructions: ['Layer yogurt with granola', 'Top with berries', 'Drizzle with honey'],
          nutrition: { protein: 20, carbs: 45, fat: 8, fiber: 6 },
        },
      },
      {
        name: 'Avocado Toast with Eggs',
        calories: 350,
        time: '15 min',
        cost: '$3.20',
        recipe: {
          ingredients: ['2 slices whole grain bread', '1 avocado', '2 eggs', 'Salt and pepper'],
          instructions: ['Toast bread', 'Mash avocado', 'Fry eggs', 'Assemble and season'],
          nutrition: { protein: 16, carbs: 38, fat: 18, fiber: 10 },
        },
      },
    ]
    
    const lunchOptions: Meal[] = [
      {
        name: 'Mediterranean Chickpea Bowl',
        calories: 420,
        time: '25 min',
        cost: '$4.50',
        recipe: {
          ingredients: ['1 cup chickpeas', '1 cup mixed greens', '1/2 cup cherry tomatoes', '1/4 cup feta cheese'],
          instructions: ['Rinse chickpeas', 'Chop vegetables', 'Combine ingredients', 'Add dressing'],
          nutrition: { protein: 18, carbs: 52, fat: 14, fiber: 12 },
        },
      },
      {
        name: 'Veggie Wrap',
        calories: 320,
        time: '12 min',
        cost: '$3.50',
        recipe: {
          ingredients: ['1 whole wheat tortilla', '3 tbsp hummus', 'Mixed greens', 'Sliced vegetables', 'Feta cheese'],
          instructions: ['Spread hummus', 'Layer vegetables', 'Add cheese', 'Roll tightly'],
          nutrition: { protein: 12, carbs: 42, fat: 10, fiber: 8 },
        },
      },
    ]
    
    const dinnerOptions: Meal[] = [
      {
        name: 'Teriyaki Chicken Bowl',
        calories: 520,
        time: '30 min',
        cost: '$5.80',
        recipe: {
          ingredients: ['6 oz chicken breast', '1 cup rice', '2 cups mixed vegetables', '3 tbsp teriyaki sauce'],
          instructions: ['Cook rice', 'Cut chicken', 'Cook chicken', 'Add sauce and vegetables', 'Serve'],
          nutrition: { protein: 38, carbs: 62, fat: 12, fiber: 4 },
        },
      },
      {
        name: 'Grilled Salmon with Vegetables',
        calories: 380,
        time: '25 min',
        cost: '$8.50',
        recipe: {
          ingredients: ['6 oz salmon fillet', '2 cups roasted vegetables', 'Olive oil', 'Lemon', 'Herbs'],
          instructions: ['Preheat grill', 'Season salmon', 'Grill salmon', 'Roast vegetables', 'Serve with lemon'],
          nutrition: { protein: 34, carbs: 15, fat: 22, fiber: 5 },
        },
      },
    ]
    
    const snackOptions: Meal[] = [
      {
        name: 'Trail Mix Energy Bites',
        calories: 180,
        time: '5 min',
        cost: '$1.50',
        recipe: {
          ingredients: ['1 cup rolled oats', '1/2 cup peanut butter', '1/3 cup honey', '1/2 cup chocolate chips'],
          instructions: ['Mix ingredients', 'Refrigerate', 'Roll into balls', 'Store in fridge'],
          nutrition: { protein: 6, carbs: 24, fat: 9, fiber: 4 },
        },
      },
    ]
    
    // Generate meals for each day in the range
    let currentDate = new Date(start)
    let breakfastIdx = 0
    let lunchIdx = 0
    let dinnerIdx = 0
    
    while (currentDate <= end) {
      const dateString = getDateString(currentDate)
      
      // Rotate through available meals to provide variety
      const dayPlan: DayMealPlan = {
        breakfast: [breakfastOptions[breakfastIdx % breakfastOptions.length]],
        lunch: [lunchOptions[lunchIdx % lunchOptions.length]],
        dinner: [dinnerOptions[dinnerIdx % dinnerOptions.length]],
        snacks: preferences.mealsPerDay === 4 ? [snackOptions[0]] : [],
      }
      
      newPlan[dateString] = dayPlan
      
      // Increment indices for variety
      breakfastIdx++
      lunchIdx++
      dinnerIdx++
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    setWeeklyMealPlan(newPlan)
  }

  // Generate dates for navigation (show 7 days starting from current week)
  const generateWeekDates = () => {
    const selectedDate = new Date(selectedDay + 'T00:00:00')
    const currentDayOfWeek = selectedDate.getDay() // 0 = Sunday, 6 = Saturday
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(startOfWeek.getDate() - currentDayOfWeek) // Go to Sunday

    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      dates.push(getDateString(date))
    }
    return dates
  }

  const weekDates = generateWeekDates()

  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDay + 'T00:00:00')
    currentDate.setDate(currentDate.getDate() - 1)
    setSelectedDay(getDateString(currentDate))
  }

  const goToNextDay = () => {
    const currentDate = new Date(selectedDay + 'T00:00:00')
    currentDate.setDate(currentDate.getDate() + 1)
    setSelectedDay(getDateString(currentDate))
  }

  const calculateDailyTotals = () => {
    const dayPlan = getOrCreateDayPlan(weeklyMealPlan, selectedDay)
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
  const currentDayPlan = getOrCreateDayPlan(weeklyMealPlan, selectedDay)

  return (
    <div>
      <div className={styles.plannerHeader}>
        <div>
          <h2 className={styles.greeting}>Daily Meal Planner</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            className={styles.primaryButton}
            onClick={() => setShowGenerateMealPlanModal(true)}
          >
            ✨ Generate Meal Plan
          </button>
          <DateNavigation selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
        </div>
      </div>

      <div className={styles.plannerContent}>
        <PlannerMealCard
          mealType="breakfast"
          meals={currentDayPlan.breakfast}
          color="#f97316"
          label="Breakfast"
          selectedDay={selectedDay}
          onMealClick={handleMealClick}
          onDeleteMeal={handleDeleteMeal}
          onAddMeal={handleAddMeal}
        />
        <PlannerMealCard
          mealType="lunch"
          meals={currentDayPlan.lunch}
          color="#22c55e"
          label="Lunch"
          selectedDay={selectedDay}
          onMealClick={handleMealClick}
          onDeleteMeal={handleDeleteMeal}
          onAddMeal={handleAddMeal}
        />
        <PlannerMealCard
          mealType="dinner"
          meals={currentDayPlan.dinner}
          color="#3b82f6"
          label="Dinner"
          selectedDay={selectedDay}
          onMealClick={handleMealClick}
          onDeleteMeal={handleDeleteMeal}
          onAddMeal={handleAddMeal}
        />
        <PlannerMealCard
          mealType="snacks"
          meals={currentDayPlan.snacks}
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
        <button className={styles.primaryButton} onClick={onOpenGroceryList}>🛒 Add to Grocery List</button>
      </div>

      {showRecipeModal && selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setShowRecipeModal(false)} />
      )}

      {showAddMealModal && (
        <AddMealModal
          isOpen={showAddMealModal}
          onClose={() => setShowAddMealModal(false)}
          onAddMeal={handleAddMealToPlanner}
          mealType={addMealType}
          availableMeals={availableMeals}
          isAddingMeal={isAddingMeal}
        />
      )}

      {showGenerateMealPlanModal && (
        <GenerateMealPlanModal
          isOpen={showGenerateMealPlanModal}
          onClose={() => setShowGenerateMealPlanModal(false)}
          onGenerate={handleGenerateMealPlan}
        />
      )}
    </div>
  )
}

function NutritionContent({
  selectedDay,
  setSelectedDay,
  weeklyMealPlan
}: {
  selectedDay: string;
  setSelectedDay: React.Dispatch<React.SetStateAction<string>>;
  weeklyMealPlan: WeeklyMealPlan;
}) {
  // Calculate nutrition data based on the selected day's meals
  const calculateNutritionData = () => {
    const dayPlan = getOrCreateDayPlan(weeklyMealPlan, selectedDay);

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
      <div className={styles.plannerHeader}>
        <div>
          <h2 className={styles.greeting}>Today's Nutrition</h2>
        </div>
        <DateNavigation selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
      </div>

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
      <AssistantContent />
    </div>
  )
}

function DashboardContentSwitcher({
  showGroceryList,
  setShowGroceryList
}: {
  showGroceryList: boolean;
  setShowGroceryList: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user } = useAuth(); // trying to implement user persistence
  const [activeTab, setActiveTab] = useState("meals");
  // Initialize to today's date
  const [selectedDay, setSelectedDay] = useState<string>(getDateString(new Date()));

  // Shared sample meals for both Meals tab and Planner modal
  const sampleMeals = [
    {
      id: 1,
      imageUrl: undefined,
      title: "Mediterranean Chickpea Bowl",
      name: "Mediterranean Chickpea Bowl",
      description: "A nutritious bowl packed with chickpeas, fresh vegetables, and tahini dressing",
      time: "25 min",
      cookTime: "25 min",
      price: "$4.50",
      cost: "$4.50",
      calories: 420,
      rating: 4.5,
      tags: ["High Protein", "Budget-Friendly", "Vegetarian"],
      category: "Lunch",
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
    {
      id: 2,
      imageUrl: undefined,
      title: "Avocado Toast with Eggs",
      name: "Avocado Toast with Eggs",
      description: "Crispy whole grain bread topped with mashed avocado and sunny-side-up eggs",
      time: "15 min",
      cookTime: "15 min",
      price: "$3.20",
      cost: "$3.20",
      calories: 350,
      rating: 4.2,
      tags: ["Quick", "High Fiber", "Vegetarian"],
      category: "Breakfast",
      recipe: {
        ingredients: [
          "2 slices whole grain bread",
          "1 avocado",
          "2 eggs",
          "Salt and pepper",
          "Red pepper flakes (optional)",
        ],
        instructions: [
          "Toast bread until golden brown",
          "Mash avocado with salt and pepper",
          "Fry eggs sunny-side up",
          "Spread avocado on toast",
          "Top with eggs and red pepper flakes",
        ],
        nutrition: { protein: 16, carbs: 38, fat: 18, fiber: 10 },
      },
    },
    {
      id: 3,
      imageUrl: undefined,
      title: "Teriyaki Chicken Bowl",
      name: "Teriyaki Chicken Bowl",
      description: "Grilled chicken with teriyaki sauce served over rice with steamed vegetables",
      time: "30 min",
      cookTime: "30 min",
      price: "$5.80",
      cost: "$5.80",
      calories: 520,
      rating: 4.7,
      tags: ["High Protein"],
      category: "Dinner",
      recipe: {
        ingredients: [
          "6 oz chicken breast",
          "1 cup cooked rice",
          "2 cups mixed vegetables",
          "3 tbsp teriyaki sauce",
          "1 tbsp sesame seeds",
        ],
        instructions: [
          "Cook rice according to package directions",
          "Cut chicken into bite-sized pieces",
          "Cook chicken in a pan until golden",
          "Add teriyaki sauce and vegetables",
          "Serve over rice and garnish with sesame seeds",
        ],
        nutrition: { protein: 38, carbs: 62, fat: 12, fiber: 4 },
      },
    },
    {
      id: 4,
      imageUrl: undefined,
      title: "Greek Yogurt Parfait",
      name: "Greek Yogurt Parfait",
      description: "Creamy yogurt layered with granola, fresh berries, and honey",
      time: "10 min",
      cookTime: "10 min",
      price: "$2.80",
      cost: "$2.80",
      calories: 280,
      rating: 4.6,
      tags: ["Quick", "High Protein", "Vegetarian"],
      category: "Breakfast",
      recipe: {
        ingredients: ["1 cup Greek yogurt", "1/2 cup granola", "1/2 cup mixed berries", "1 tbsp honey"],
        instructions: [
          "Add Greek yogurt to a bowl or glass",
          "Layer with granola",
          "Top with mixed berries",
          "Drizzle with honey",
        ],
        nutrition: { protein: 20, carbs: 45, fat: 8, fiber: 6 },
      },
    },
    {
      id: 5,
      imageUrl: undefined,
      title: "Veggie Wrap",
      name: "Veggie Wrap",
      description: "Whole wheat wrap filled with hummus, fresh vegetables, and feta cheese",
      time: "12 min",
      cookTime: "12 min",
      price: "$3.50",
      cost: "$3.50",
      calories: 320,
      rating: 4.3,
      tags: ["Quick", "Vegetarian", "Budget-Friendly"],
      category: "Lunch",
      recipe: {
        ingredients: [
          "1 whole wheat tortilla",
          "3 tbsp hummus",
          "Mixed greens",
          "Sliced cucumber",
          "Sliced tomatoes",
          "Feta cheese",
        ],
        instructions: [
          "Spread hummus on tortilla",
          "Layer with greens and vegetables",
          "Sprinkle with feta cheese",
          "Roll tightly and slice in half",
        ],
        nutrition: { protein: 12, carbs: 42, fat: 10, fiber: 8 },
      },
    },
    {
      id: 6,
      imageUrl: undefined,
      title: "Trail Mix Energy Bites",
      name: "Trail Mix Energy Bites",
      description: "No-bake energy balls with oats, peanut butter, and dark chocolate chips",
      time: "5 min",
      cookTime: "5 min",
      price: "$1.50",
      cost: "$1.50",
      calories: 180,
      rating: 4.8,
      tags: ["Quick", "Budget-Friendly"],
      category: "Snacks",
      recipe: {
        ingredients: [
          "1 cup rolled oats",
          "1/2 cup peanut butter",
          "1/3 cup honey",
          "1/2 cup dark chocolate chips",
          "1/4 cup ground flaxseed",
        ],
        instructions: [
          "Mix all ingredients in a bowl",
          "Refrigerate for 30 minutes",
          "Roll into 1-inch balls",
          "Store in refrigerator",
        ],
        nutrition: { protein: 6, carbs: 24, fat: 9, fiber: 4 },
      },
    },
  ];

  // Initialize meal plan with sample data using today's date and tomorrow's date
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayString = getDateString(today);
  const tomorrowString = getDateString(tomorrow);

  const {
    weeklyMealPlan,
    setWeeklyMealPlan,
    loading,
    error,
    saveMealPlan
  } = useMealPlan(user?.firebaseUid);

  // Show loading state while fetching data
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading your meal plan...</div>
      </div>
    );
  }

  // error message
  if (error) {
    console.error('Meal plan error:', error);
  }

  /* const [weeklyMealPlan, setWeeklyMealPlan] = useState<WeeklyMealPlan>({
    [todayString]: {
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
    [tomorrowString]: {
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
  }); */

  const tabs = [
    { id: "meals", label: "Meals" },
    { id: "planner", label: "Planner" },
    { id: "nutrition", label: "Nutrition" },
    { id: "ai-assistant", label: "AI Assistant" },
  ];

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

      {/* Error notification (optional) */}
      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          padding: '0.5rem', 
          marginBottom: '1rem',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>⚠️ Failed to sync meal plan. Changes are saved locally.</span>
          <button onClick={saveMealPlan} style={{ padding: '0.25rem 0.5rem' }}>
            Retry
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "meals" && (
          <MealContent
            weeklyMealPlan={weeklyMealPlan}
            setWeeklyMealPlan={setWeeklyMealPlan}
          />
        )}
        {activeTab === "planner" && (
          <PlannerContent
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            weeklyMealPlan={weeklyMealPlan}
            setWeeklyMealPlan={setWeeklyMealPlan}
            availableMeals={sampleMeals}
            onOpenGroceryList={() => setShowGroceryList(true)}
          />
        )}
        {activeTab === "nutrition" && (
          <NutritionContent
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            weeklyMealPlan={weeklyMealPlan}
          />
        )}
        {activeTab === "ai-assistant" && <AIAssistantContent />}
      </div>

      {/* Grocery List Modal */}
      <GroceryList
        weeklyMealPlan={weeklyMealPlan}
        isOpen={showGroceryList}
        onClose={() => setShowGroceryList(false)}
      />
    </div>
  );
}

const Dashboard: FC<DashboardProps> = () => {
  const { user } = useAuth();
  const [showGroceryList, setShowGroceryList] = useState(false);

  // Get display name from user or use default
  const displayName = user?.displayName || 'there';

  const dashboardSummary: SummaryCardData[] = [
    {
      title: "Weekly Budget",
      value: user?.budget?.default ?? 100,
      subtext: "",
      icon: "$",
      progressBar: {
        current: 50,
        total: user?.budget?.maximum ?? 100,
      },
    },
    {
      title: "Meals Planned",
      value: user?.mealPlans?.length ?? 0,
      subtext: "This week",
      icon: "🍴",
    },
    {
      title: "Avg. Calories",
      value: user?.nutritionGoals?.calories ?? 2000,
      subtext: "",
      icon: "⚡",
      progressBar: {
        current: 75,
        total: 100,
      },
    },
  ]

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
      {/* Top Navigation Bar */}
      <TopNavBar
        userEmail={user?.email || ""}
        onOpenGroceryList={() => setShowGroceryList(true)}
      />

      {/* Header/Greeting Section */}
      <div className={styles.header}>
        <h1 className={styles.greeting}>Good morning, {displayName} 👋</h1>
        <p className={styles.prompt}>Ready to plan some delicious meals for this week?</p>
      </div>

      {/* Summary Cards Section */}
      <div className={styles.summaryGrid}>{dashboardSummary.map(renderSummaryCard)}</div>

      {/* Dashboard Content Switcher Section */}
      <DashboardContentSwitcher
        showGroceryList={showGroceryList}
        setShowGroceryList={setShowGroceryList}
      />
    </div>
  )
}

export default Dashboard
