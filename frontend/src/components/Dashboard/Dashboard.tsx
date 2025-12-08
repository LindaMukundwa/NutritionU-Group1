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
import { useMealPlan } from '../../hooks/useMealPlan';
import { useCountUp } from '../../hooks/useCountUp';
import type { User } from "firebase/auth"
import { mealPlanService } from "../../../services/mealPlanService"
import { Icon } from '../ui/Icon';
import { DatePicker } from '../ui/DatePicker';

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
  recipeId?: number;  // Added for backend persistence
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
  aiEnhanced?: boolean;
  aiReasoning?: string;
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

  return (
    <div className={styles.dateNavigation}>
      <button className={styles.navButton} onClick={goToPreviousDay} title="Previous day">
        ‹
      </button>
      <DatePicker value={selectedDay} onChange={setSelectedDay} />
      <button className={styles.navButton} onClick={goToNextDay} title="Next day">
        ›
      </button>
    </div>
  );
}

type DashboardProps = {}

function RecipeModal({
  recipe,
  onClose,
  onAddToGroceryList
}: {
  recipe: any;
  onClose: () => void;
  onAddToGroceryList?: (recipe: any) => void;
}) {
  if (!recipe) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Keep the header as it was */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{recipe.name}</h2>
            <div className={styles.modalMeta}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="clock" size={13} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '1rem', fontWeight: '500' }}>{recipe.time || recipe.cookTime}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '1rem', fontWeight: '500' }}>$ {recipe.cost.replace('$', '')}</span>
              </span>
            </div>
          </div>
          <button className={styles.modalCloseButton} onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* NUTRITION GRID - 4 columns with calories */}
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
                {recipe.calories}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0', fontWeight: '500', textTransform: 'uppercase' }}>
                Calories
              </p>
            </div>
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
          </div>
          {/* END OF NUTRITION GRID */}

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
            <button
              className={styles.primaryButton}
              onClick={() => {
                if (onAddToGroceryList) {
                  onAddToGroceryList(recipe);
                }
              }}
            >
              <Icon name="shopping-cart" size={18} />
              <span style={{ marginLeft: '6px' }}>Add to Grocery List</span>
            </button>
            <button className={styles.secondaryButton}>
              <Icon name="edit" size={18} />
              <span style={{ marginLeft: '6px' }}>Edit Recipe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MealContent({
  weeklyMealPlan,
  setWeeklyMealPlan,
  setPendingRecipeForGrocery,
  setShowGroceryList,
}: {
  weeklyMealPlan: WeeklyMealPlan;
  setWeeklyMealPlan: React.Dispatch<React.SetStateAction<WeeklyMealPlan>>;
  setPendingRecipeForGrocery: React.Dispatch<React.SetStateAction<any>>;
  setShowGroceryList: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [recipesFromApi, setRecipesFromApi] = React.useState<any[] | null>(null)
  const [searchError, setSearchError] = React.useState<string | null>(null)
  const [showFilters, setShowFilters] = React.useState(false)
  const [selectedRecipe, setSelectedRecipe] = React.useState(null)
  const [showRecipeModal, setShowRecipeModal] = React.useState(false)
  const [showAddToPlanModal, setShowAddToPlanModal] = React.useState(false)
  const [mealToAdd, setMealToAdd] = React.useState<any>(null)
  const { user } = useAuth();
  const [isGeneratingRecipe, setIsGeneratingRecipe] = React.useState(false); // Add this line
  const [selectedFilters, setSelectedFilters] = React.useState({
    category: "All",
    maxTime: 60,
    maxPrice: 10,
    dietary: [] as string[],
  })
  const filterDropdownRef = React.useRef<HTMLDivElement>(null)
  const filterButtonRef = React.useRef<HTMLDivElement>(null)

  // Click-outside handler for filter dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both dropdown and button
      if (
        filterDropdownRef.current && 
        !filterDropdownRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false)
      }
    }

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilters])

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

      <div className={styles.searchBarContainer} ref={filterButtonRef}>
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
          <div className={styles.filterDropdown} ref={filterDropdownRef}>
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
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setShowRecipeModal(false)}
          onAddToGroceryList={(recipe) => {
            setPendingRecipeForGrocery(recipe);
            setShowGroceryList(true);
            setShowRecipeModal(false);
          }}
        />
      )}

      {showAddToPlanModal && mealToAdd && !isGeneratingRecipe && (
        <AddToPlanModal
          isOpen={showAddToPlanModal}
          onClose={() => {
            setShowAddToPlanModal(false);
            setIsGeneratingRecipe(false);
          }}
          onAddToPlan={async (dateString, mealType) => {
            if (!user?.firebaseUid) {
              alert('Please log in to save meals');
              setShowAddToPlanModal(false);
              return;
            }

            setIsGeneratingRecipe(true);

            try {
              const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

              // Step 1: Save recipe to backend
              const recipeData = {
                title: mealToAdd.name || mealToAdd.title,
                description: mealToAdd.description || `Delicious ${mealToAdd.name || mealToAdd.title}`,
                totalTime: parseInt(mealToAdd.time) || 0,
                estimatedCostPerServing: parseFloat(mealToAdd.price?.replace('$', '') || mealToAdd.cost?.replace('$', '')) || 0,
                nutritionInfo: {
                  calories: mealToAdd.calories,
                  protein: mealToAdd.recipe.nutrition.protein,
                  carbs: mealToAdd.recipe.nutrition.carbs,
                  fat: mealToAdd.recipe.nutrition.fat,
                  fiber: mealToAdd.recipe.nutrition.fiber,
                },
                ingredients: mealToAdd.recipe.ingredients.map((ing: string) => ({
                  name: ing,
                  amount: 1,
                  unit: { type: 'metric', value: 'serving' },
                })),
                instructions: mealToAdd.recipe.instructions.map((inst: string, idx: number) => ({
                  stepNumber: idx + 1,
                  instruction: inst,
                  equipment: [],
                })),
              };

              const recipeResponse = await fetch(`${API_BASE}/api/recipes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recipeData),
              });

              if (!recipeResponse.ok) {
                throw new Error('Failed to save recipe');
              }

              const savedRecipe = await recipeResponse.json();
              console.log('[Dashboard] ✅ Recipe saved from AddToPlanModal:', savedRecipe);

              // Step 2: Generate enhanced instructions and ingredients via chatbot
              let enhancedIngredients = mealToAdd.recipe.ingredients;
              let enhancedInstructions = mealToAdd.recipe.instructions;

              try {
                const chatbotResponse = await fetch(`${API_BASE}/api/chatbot/instructions-ingredients`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    query: `${mealToAdd.name || mealToAdd.title} with approximately ${mealToAdd.calories} calories, ${mealToAdd.recipe.nutrition.protein}g protein, ${mealToAdd.recipe.nutrition.carbs}g carbs, and ${mealToAdd.recipe.nutrition.fat}g fat.`
                  }),
                });

                if (chatbotResponse.ok) {
                  const data = await chatbotResponse.json() as { ingredients?: string[]; instructions?: string[] };
                  console.log('[Dashboard] ✅ Chatbot generated content:', data);

                  if (data.ingredients && data.ingredients.length > 0) {
                    enhancedIngredients = data.ingredients;
                  }
                  if (data.instructions && data.instructions.length > 0) {
                    enhancedInstructions = data.instructions;
                  }

                  // Step 3: Update recipe with enhanced content
                  const updateResponse = await fetch(`${API_BASE}/api/recipes/${savedRecipe.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ingredients: enhancedIngredients.map((ing: string) => ({
                        name: ing,
                        amount: 1,
                        unit: { type: 'metric', value: 'serving' },
                      })),
                      instructions: enhancedInstructions.map((inst: string, idx: number) => ({
                        stepNumber: idx + 1,
                        instruction: inst,
                        equipment: [],
                      })),
                    }),
                  });

                  if (updateResponse.ok) {
                    console.log('[Dashboard] ✅ Recipe updated with chatbot content');
                  }
                } else {
                  console.log('[Dashboard] ⚠️ Chatbot API failed, using original content');
                }
              } catch (chatbotError) {
                console.error('[Dashboard] Chatbot error:', chatbotError);
                console.log('[Dashboard] Using original recipe content');
              }

              // Step 4: Create meal with recipeId and enhanced content
              const plannerMeal: Meal = {
                recipeId: savedRecipe.id,
                name: mealToAdd.name || mealToAdd.title,
                calories: mealToAdd.calories,
                time: typeof mealToAdd.time === 'string' ? mealToAdd.time : `${mealToAdd.time} min`,
                cost: mealToAdd.cost || mealToAdd.price,
                recipe: {
                  ingredients: enhancedIngredients,
                  instructions: enhancedInstructions,
                  nutrition: mealToAdd.recipe.nutrition,
                },
              };

              console.log('[Dashboard] Created planner meal with enhanced content:', plannerMeal);

              // Step 5: Update local state (auto-save will persist to backend)
              const mealTypeKey = mealType as keyof DayMealPlan;
              setWeeklyMealPlan((prev) => {
                const dayPlan = getOrCreateDayPlan(prev, dateString);
                const newPlan = {
                  ...prev,
                  [dateString]: {
                    ...dayPlan,
                    [mealTypeKey]: [...dayPlan[mealTypeKey], plannerMeal],
                  },
                };
                console.log('[Dashboard] Updated meal plan from modal:', newPlan);
                return newPlan;
              });
              setIsGeneratingRecipe(false);
              setShowAddToPlanModal(false);
            } catch (error) {
              console.error('[Dashboard] Error adding meal from modal:', error);
              setIsGeneratingRecipe(false);
              alert('Failed to add meal. Please try again.');
            }
          }}
          mealTitle={mealToAdd.title || mealToAdd.name}
        />
      )}

      {isGeneratingRecipe && (
        <div className={styles.modalOverlay}>
          <div className={styles.loadingModal}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingMessage}>Generating enhanced recipe with AI...</p>
            <p className={styles.loadingSubtext}>This may take a few moments</p>
          </div>
        </div>
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
  onOpenGroceryList,
  setPendingRecipeForGrocery,
  setShowGroceryList,
}: {
  selectedDay: string;
  setSelectedDay: React.Dispatch<React.SetStateAction<string>>;
  weeklyMealPlan: WeeklyMealPlan;
  setWeeklyMealPlan: React.Dispatch<React.SetStateAction<WeeklyMealPlan>>;
  availableMeals: any[];
  onOpenGroceryList: () => void;
  setPendingRecipeForGrocery: React.Dispatch<React.SetStateAction<any>>;
  setShowGroceryList: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user } = useAuth();
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

  const handleDeleteMeal = async (dateString: string, mealType: string, mealIndex: number) => {
    const mealTypeKey = mealType as keyof DayMealPlan;
    const dayPlan = getOrCreateDayPlan(weeklyMealPlan, dateString);
    const mealToDelete = dayPlan[mealTypeKey][mealIndex];

    // If meal has an itemId, delete it via API first
    if (mealToDelete.recipeId) {
      try {
        await mealPlanService.removeMealPlanItem(mealToDelete.recipeId);
      } catch (error) {
        console.error('Failed to delete meal from backend:', error);
        // Optionally show error to user
        return;
      }
    }

    // Update local state
    setWeeklyMealPlan((prev) => {
      const dayPlan = getOrCreateDayPlan(prev, dateString);
      return {
        ...prev,
        [dateString]: {
          ...dayPlan,
          [mealTypeKey]: dayPlan[mealTypeKey].filter((_, index) => index !== mealIndex),
        },
      };
    });
  };

  const handleAddMeal = (mealType: string) => {
    setAddMealType(mealType)
    setShowAddMealModal(true)
  }

  /**
   * Handles adding a meal to the meal planner.
   * 
   * Security: Validates user authentication before making API calls
   * 
   * This function performs the following steps:
   * 1. Validates user is authenticated
   * 2. Saves the recipe to backend to get its ID
   * 3. Generates enhanced instructions and ingredients via chatbot API
   * 4. Adds the meal with recipeId to the weekly meal plan
   * 5. Auto-save will persist changes to database
   */
  const handleAddMealToPlanner = async (meal: Meal) => {
    if (!user?.firebaseUid) {
      alert('Please log in to save meals');
      return;
    }

    setIsAddingMeal(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

      // Step 1: Save recipe to backend to get its ID
      const recipeData = {
        title: meal.name,
        description: `Delicious ${meal.name}`,
        totalTime: parseInt(meal.time.replace(' min', '')) || 0,
        estimatedCostPerServing: parseFloat(meal.cost.replace('$', '')) || 0,
        nutritionInfo: {
          calories: meal.calories,
          protein: meal.recipe.nutrition.protein,
          carbs: meal.recipe.nutrition.carbs,
          fat: meal.recipe.nutrition.fat,
          fiber: meal.recipe.nutrition.fiber,
        },
        ingredients: meal.recipe.ingredients.map((ing) => ({
          name: ing,
          amount: 1,
          unit: { type: 'metric', value: 'serving' },
        })),
        instructions: meal.recipe.instructions.map((inst, idx) => ({
          stepNumber: idx + 1,
          instruction: inst,
          equipment: [],
        })),
      };

      const recipeResponse = await fetch(`${API_BASE}/api/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });

      if (!recipeResponse.ok) {
        throw new Error('Failed to save recipe');
      }

      const savedRecipe = await recipeResponse.json();
      console.log('[Dashboard] ✅ Recipe saved to backend:', savedRecipe);
      console.log('[Dashboard] Recipe ID:', savedRecipe.id);

      // Step 2: Optionally enhance with chatbot-generated content
      let enhancedMeal = meal;
      try {
        const chatbotResponse = await fetch(`${API_BASE}/api/chatbot/instructions-ingredients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `${meal.name} with approximately ${meal.calories} calories, ${meal.recipe.nutrition.protein}g protein, ${meal.recipe.nutrition.carbs}g carbs, and ${meal.recipe.nutrition.fat}g fat.`
          }),
        });

        if (chatbotResponse.ok) {
          const data = await chatbotResponse.json() as { ingredients?: string[]; instructions?: string[] };

          // Update the recipe in the database with generated content
          const updateResponse = await fetch(`${API_BASE}/api/recipes/${savedRecipe.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ingredients: data.ingredients,
              instructions: data.instructions
            }),
          });

          if (updateResponse.ok) {
            console.log('[Dashboard] ✅ Recipe updated with generated content');
          }

          enhancedMeal = {
            ...meal,
            recipe: {
              ingredients: data.ingredients || meal.recipe.ingredients,
              instructions: data.instructions || meal.recipe.instructions,
              nutrition: meal.recipe.nutrition,
            },
          };
        }

      } catch (chatbotErr) {
        console.warn('Chatbot enhancement failed, using original meal data:', chatbotErr);
      }

      // Step 3: Add to meal plan with recipe ID
      const mealTypeKey = addMealType as keyof DayMealPlan;
      const mealWithRecipeId = {
        ...enhancedMeal,
        recipeId: savedRecipe.id,
      };
      console.log('[Dashboard] Adding meal to planner:', mealWithRecipeId);
      console.log('[Dashboard] Selected day:', selectedDay);
      console.log('[Dashboard] Meal type:', addMealType);

      setWeeklyMealPlan((prev) => {
        const dayPlan = getOrCreateDayPlan(prev, selectedDay);
        const newPlan = {
          ...prev,
          [selectedDay]: {
            ...dayPlan,
            [mealTypeKey]: [
              ...dayPlan[mealTypeKey],
              mealWithRecipeId
            ],
          },
        };
        console.log('[Dashboard] Updated meal plan:', newPlan);
        return newPlan;
      });

      setShowAddMealModal(false);

    } catch (error) {
      console.error('Error adding meal to planner:', error);
      alert('Failed to add meal. Please try again.');
    } finally {
      setIsAddingMeal(false);
    }
  };

  const handleGenerateMealPlan = async (startDate: string, endDate: string, preferences: any) => {
  if (!user?.firebaseUid) {
    alert('Please log in to generate meal plans');
    return;
  }

  try {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
    
    // Step 1: Generate the meal plan
    const response = await fetch(`${API_BASE}/api/users/${user.firebaseUid}/meal-plans/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate,
        endDate,
        preferences: {
          dailyCalories: user?.nutritionGoals?.calories || preferences.dailyCalories,
          proteinGoal: user?.nutritionGoals?.protein || preferences.proteinGoal,
          carbsGoal: user?.nutritionGoals?.carbs || preferences.carbsGoal,
          fatGoal: user?.nutritionGoals?.fats || preferences.fatGoal,
          fiberGoal: preferences.fiberGoal,
          dietaryRestrictions: user?.medicalRestrictions ? 
            Object.entries(user.medicalRestrictions)
              .filter(([_, value]) => value)
              .map(([key, _]) => key) : 
            preferences.dietaryRestrictions,
          mealsPerDay: preferences.mealsPerDay
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate meal plan');
    }

    const result = await response.json();
    console.log('[handleGenerateMealPlan] Initial meal plan generated:', result);

    // Step 2: Enhance recipes with detailed instructions and ingredients using OpenAI
    const enhancedItems = await Promise.all(
      result.mealPlan.items.map(async (item: any) => {
        try {
          console.log(`[handleGenerateMealPlan] Enhancing recipe: ${item.recipe.title}`);
          
          // Create a detailed query for the OpenAI API
          const recipeQuery = {
            recipeName: item.recipe.title,
            description: item.recipe.description,
            macros: {
              calories: item.recipe.nutritionInfo.calories,
              protein: item.recipe.nutritionInfo.protein,
              carbs: item.recipe.nutritionInfo.carbs,
              fat: item.recipe.nutritionInfo.fat,
              fiber: item.recipe.nutritionInfo.fiber
            },
            mealType: item.mealType,
            servings: item.recipe.servings || 1
          };

          // Call the OpenAI instructions-ingredients endpoint
          const enhancementResponse = await fetch(`${API_BASE}/api/chatbot/instructions-ingredients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query: `${recipeQuery.recipeName} - ${recipeQuery.description}. Target macros: ${recipeQuery.macros.calories} calories, ${recipeQuery.macros.protein}g protein, ${recipeQuery.macros.carbs}g carbs, ${recipeQuery.macros.fat}g fat. Serves ${recipeQuery.servings}.` 
            })
          });

          if (enhancementResponse.ok) {
            const enhancedRecipe = await enhancementResponse.json();
            console.log(`[handleGenerateMealPlan] ✅ Enhanced recipe: ${item.recipe.title}`);
            
            // Update the recipe with AI-generated content
            return {
              ...item,
              recipe: {
                ...item.recipe,
                ingredients: enhancedRecipe.ingredients.map((ing: string, index: number) => ({
                  name: ing,
                  amount: 1, // AI provides formatted strings like "2 eggs"
                  unit: { type: 'metric', value: 'serving' }
                })),
                instructions: enhancedRecipe.instructions.map((instruction: string, index: number) => ({
                  stepNumber: index + 1,
                  instruction: instruction,
                  equipment: []
                })),
                aiEnhanced: true,
                aiReasoning: enhancedRecipe.reasoning
              }
            };
          } else {
            console.warn(`[handleGenerateMealPlan] ⚠️ Failed to enhance recipe: ${item.recipe.title}`);
            return item; // Return original if enhancement fails
          }
        } catch (enhancementError) {
          console.error(`[handleGenerateMealPlan] ❌ Error enhancing recipe ${item.recipe.title}:`, enhancementError);
          return item; // Return original if enhancement fails
        }
      })
    );

    console.log('[handleGenerateMealPlan] All recipes enhanced with AI-generated instructions and ingredients');

    // Step 3: Convert enhanced API response back to frontend format
    const newPlan: WeeklyMealPlan = {};
    
    enhancedItems.forEach((item: any) => {
      const dateString = item.date.split('T')[0];
      const meal: Meal = {
        recipeId: item.recipe.id,
        name: item.recipe.title,
        calories: item.recipe.nutritionInfo.calories,
        time: `${item.recipe.totalTime} min`,
        cost: `$${item.recipe.estimatedCostPerServing.toFixed(2)}`,
        recipe: {
          ingredients: item.recipe.ingredients.map((ing: any) => 
            typeof ing === 'string' ? ing : `${ing.amount} ${ing.unit?.value || ''} ${ing.name}`.trim()
          ),
          instructions: item.recipe.instructions.map((inst: any) => 
            typeof inst === 'string' ? inst : inst.instruction
          ),
          nutrition: item.recipe.nutritionInfo
        },
        // Add AI enhancement metadata
        aiEnhanced: item.recipe.aiEnhanced || false,
        aiReasoning: item.recipe.aiReasoning || null
      };

      if (!newPlan[dateString]) {
        newPlan[dateString] = {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        };
      }

      newPlan[dateString][item.mealType as keyof DayMealPlan].push(meal);
    });

    setWeeklyMealPlan(newPlan);
    
    // Step 4: Show enhanced success message
    const enhancedCount = enhancedItems.filter(item => item.recipe.aiEnhanced).length;
    const totalCount = enhancedItems.length;
    
    alert(
      `Successfully generated ${result.summary.totalMealsGenerated} meals for ${result.summary.daysPlanned} days!\n` +
      `✨ ${enhancedCount}/${totalCount} recipes enhanced with AI-generated instructions and ingredients.`
    );
    
  } catch (error) {
    console.error('Error generating enhanced meal plan:', error);
    alert('Failed to generate meal plan. Please try again.');
  }
};

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
            <Icon name="sparkles" size={18} />
            <span style={{ marginLeft: '6px' }}>Generate Meal Plan</span>
          </button>
          <DateNavigation selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
        </div>
      </div>

      <div className={styles.plannerContent}>
        <PlannerMealCard
          mealType="breakfast"
          meals={currentDayPlan.breakfast}
          color="oklch(0.7 0.05 264)"
          label="Breakfast"
          selectedDay={selectedDay}
          onMealClick={handleMealClick}
          onDeleteMeal={handleDeleteMeal}
          onAddMeal={handleAddMeal}
        />
        <PlannerMealCard
          mealType="lunch"
          meals={currentDayPlan.lunch}
          color="oklch(0.70 0.10 180)"
          label="Lunch"
          selectedDay={selectedDay}
          onMealClick={handleMealClick}
          onDeleteMeal={handleDeleteMeal}
          onAddMeal={handleAddMeal}
        />
        <PlannerMealCard
          mealType="dinner"
          meals={currentDayPlan.dinner}
          color="oklch(0.60 0.15 260)"
          label="Dinner"
          selectedDay={selectedDay}
          onMealClick={handleMealClick}
          onDeleteMeal={handleDeleteMeal}
          onAddMeal={handleAddMeal}
        />
        <PlannerMealCard
          mealType="snacks"
          meals={currentDayPlan.snacks}
          color="oklch(0.70 0.12 150)"
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
        <button className={styles.primaryButton} onClick={onOpenGroceryList}>
          <Icon name="shopping-cart" size={18} />
          <span style={{ marginLeft: '6px' }}>Add to Grocery List</span>
        </button>
      </div>

      {showRecipeModal && selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setShowRecipeModal(false)}
          onAddToGroceryList={(recipe) => {
            setPendingRecipeForGrocery(recipe);
            setShowGroceryList(true);
            setShowRecipeModal(false);
          }}
        />
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
  weeklyMealPlan,
  userData
}: {
  selectedDay: string;
  setSelectedDay: React.Dispatch<React.SetStateAction<string>>;
  weeklyMealPlan: WeeklyMealPlan;
  userData: any
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
      calories: userData?.nutritionGoals?.calories || 2000,
      protein: userData?.nutritionGoals?.protein || 120,
      carbs: userData?.nutritionGoals?.carbs || 250,
      fat: userData?.nutritionGoals?.fats || 78,
      fiber: 25 // Currently hardcoded because its not implemented 
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
        <div className={`${styles.nutritionItem} ${styles.nutritionItemCalories}`}>
          <div className={styles.nutritionHeader}>
            <div className={styles.nutritionLabel}>
              <span className={styles.nutritionIcon}>
                <Icon name="zap" size={18} />
              </span>
              <span>Calories</span>
            </div>
            <span className={styles.nutritionValue}>
              {Math.round(nutritionData.calories.consumed)} / {nutritionData.calories.target}
            </span>
          </div>
          {renderProgressBar(nutritionData.calories.consumed, nutritionData.calories.target, "oklch(0.7 0.05 264)")}
        </div>

        <div className={styles.nutritionItem}>
          <div className={styles.nutritionHeader}>
            <div className={styles.nutritionLabel}>
              <span className={styles.nutritionIcon}>
                <Icon name="drumstick" size={18} />
              </span>
              <span>Protein</span>
            </div>
            <span className={styles.nutritionValue}>
              {nutritionData.protein.consumed}g / {nutritionData.protein.target}g
            </span>
          </div>
          {renderProgressBar(nutritionData.protein.consumed, nutritionData.protein.target, "oklch(0.60 0.15 260)")}
        </div>

        <div className={styles.nutritionItem}>
          <div className={styles.nutritionHeader}>
            <div className={styles.nutritionLabel}>
              <span className={styles.nutritionIcon}>
                <Icon name="wheat" size={18} />
              </span>
              <span>Carbohydrates</span>
            </div>
            <span className={styles.nutritionValue}>
              {Math.round(nutritionData.carbs.consumed)}g / {nutritionData.carbs.target}g
            </span>
          </div>
          {renderProgressBar(nutritionData.carbs.consumed, nutritionData.carbs.target, "oklch(0.70 0.10 180)")}
        </div>

        <div className={styles.nutritionItem}>
          <div className={styles.nutritionHeader}>
            <div className={styles.nutritionLabel}>
              <span className={styles.nutritionIcon}>
                <Icon name="droplet" size={18} />
              </span>
              <span>Fat</span>
            </div>
            <span className={styles.nutritionValue}>
              {nutritionData.fat.consumed}g / {nutritionData.fat.target}g
            </span>
          </div>
          {renderProgressBar(nutritionData.fat.consumed, nutritionData.fat.target, "oklch(0.70 0.12 150)")}
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

  // State for adding ingredients for an individual recipe
  const [pendingRecipeForGrocery, setPendingRecipeForGrocery] = useState<any>(null);

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
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="alert" size={16} />
            Failed to sync meal plan. Changes are saved locally.
          </span>
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
            setPendingRecipeForGrocery={setPendingRecipeForGrocery}
            setShowGroceryList={setShowGroceryList}
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
            setPendingRecipeForGrocery={setPendingRecipeForGrocery}
            setShowGroceryList={setShowGroceryList}
          />
        )}
        {activeTab === "nutrition" && (
          <NutritionContent
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            weeklyMealPlan={weeklyMealPlan}
            userData={user}
          />
        )}
        {activeTab === "ai-assistant" && <AIAssistantContent />}
      </div>

      {/* Grocery List Modal */}
      <GroceryList
        weeklyMealPlan={weeklyMealPlan}
        isOpen={showGroceryList}
        onClose={() => {
          setShowGroceryList(false);
          setPendingRecipeForGrocery(null);
        }}
        pendingRecipe={pendingRecipeForGrocery}
      />
    </div>
  );
}

const Dashboard: FC<DashboardProps> = () => {
  const { user } = useAuth();
  const [showGroceryList, setShowGroceryList] = useState(false);
  // Get meal plan data and the count method
  const { getTotalMealsCount } = useMealPlan(user?.firebaseUid);

  // Call the method to get total meals
  const totalMeals = getTotalMealsCount();

  // Get display name from user or use default
  const displayName = user?.displayName || 'there';

  const dashboardSummary: SummaryCardData[] = [
    {
      title: "Weekly Budget",
      value: user?.budget?.value ?? 100,
      subtext: "",
      icon: "circle-dollar",
      progressBar: {
        current: 75, // TODO: Make dynamic
        total: user?.budget?.value ?? 100,
      },
    },
    {
      title: "Meals Planned",
      value: totalMeals ?? 0,
      subtext: "This week",
      icon: "soup",
    },
    {
      title: "Avg. Calories",
      value: user?.nutritionGoals?.calories ?? 2000,
      subtext: "",
      icon: "zap",
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

  const renderSummaryCard = (card: SummaryCardData, index: number) => {
    // Determine if icon is a lucide icon name or a simple string (like "$")
    const isLucideIcon = card.icon !== "$";
    
    // Use counter animation for numeric values with slight delay per card
    const animatedValue = useCountUp(
      typeof card.value === 'number' ? card.value : 0,
      1200,
      0
    );
    
    const displayValue = typeof card.value === 'number' ? animatedValue : card.value;

    return (
      <div key={card.title} className={styles.summaryCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>{card.title}</div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.cardValue}>{displayValue}</div>
          <div className={styles.iconBackground}>
            {isLucideIcon ? (
              <Icon name={card.icon as any} size={20} />
            ) : (
              card.icon
            )}
          </div>
        </div>

        {card.progressBar ? (
          renderProgressBar(card.progressBar.current, card.progressBar.total)
        ) : (
          <div className={styles.cardSubtext}>{card.subtext}</div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.Dashboard}>
      {/* Top Navigation Bar */}
      <TopNavBar
        userEmail={user?.email || ""}
        onOpenGroceryList={() => setShowGroceryList(true)}
      />

      {/* Top Section with Gradient Background - includes Header + Summary Cards */}
      <div className={styles.topSectionWrapper}>
        {/* Header/Greeting Section */}
        <div className={styles.header}>
          <h1 className={styles.greeting}>
            Good morning, {displayName}
          </h1>
          <p className={styles.prompt}>Ready to plan some delicious meals for this week?</p>
        </div>

        {/* Summary Cards Section */}
        <div className={styles.summaryGrid}>{dashboardSummary.map((card, index) => renderSummaryCard(card, index))}</div>
      </div>

      {/* Dashboard Content Switcher Section */}
      <DashboardContentSwitcher
        showGroceryList={showGroceryList}
        setShowGroceryList={setShowGroceryList}
      />
    </div>
  )
}

export default Dashboard
