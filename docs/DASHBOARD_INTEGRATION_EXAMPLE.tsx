// Example: How to integrate useMealPlan into Dashboard.tsx

import { useMealPlan } from '../../hooks/useMealPlan';
import { useAuth } from '../../contexts/AuthContext';

function DashboardContentSwitcher({
  showGroceryList,
  setShowGroceryList
}: {
  showGroceryList: boolean;
  setShowGroceryList: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("meals");
  const [selectedDay, setSelectedDay] = useState<string>(getDateString(new Date()));
  
  // REPLACE THIS:
  // const [weeklyMealPlan, setWeeklyMealPlan] = useState<WeeklyMealPlan>({});
  
  // WITH THIS:
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

  // Optional: Show error message
  if (error) {
    console.error('Meal plan error:', error);
  }

  // Rest of your component remains the same!
  // The weeklyMealPlan and setWeeklyMealPlan work exactly as before,
  // but now they automatically save to the database.

  return (
    <div className={styles.contentSwitcher}>
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

      {/* Existing tabs and content */}
      <div className={styles.tabs}>
        <button 
          className={activeTab === "meals" ? styles.activeTab : ""}
          onClick={() => setActiveTab("meals")}
        >
          Meals
        </button>
        {/* ... other tabs ... */}
      </div>

      {/* Tab content */}
      {activeTab === "meals" && (
        <MealContent 
          weeklyMealPlan={weeklyMealPlan}
          setWeeklyMealPlan={setWeeklyMealPlan}
        />
      )}
      
      {/* ... rest of component ... */}
    </div>
  );
}

// IMPORTANT: Before adding meals to the plan, you need to ensure
// the meal has a recipe ID from the database. Here's how:

async function handleAddMealToPlanner(meal: Meal, mealType: string, selectedDay: string) {
  // 1. First, check if recipe exists or create it
  let recipeId = meal.id; // If meal already has a recipe ID
  
  if (!recipeId) {
    // Create the recipe in the database
    try {
      const response = await fetch(`${API_BASE}/api/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meal.name,
          totalTime: parseInt(meal.time),
          estimatedCostPerServing: parseFloat(meal.cost.replace('$', '')),
          nutritionInfo: {
            calories: meal.calories,
            ...meal.recipe.nutrition
          },
          ingredients: meal.recipe.ingredients,
          instructions: meal.recipe.instructions.map((inst, idx) => ({
            stepNumber: idx + 1,
            instruction: inst
          }))
        })
      });
      
      const createdRecipe = await response.json();
      recipeId = createdRecipe.id;
      meal.id = recipeId; // Update the meal with the new ID
    } catch (err) {
      console.error('Failed to create recipe:', err);
      return; // Don't add to plan if recipe creation failed
    }
  }
  
  // 2. Now add to the meal plan (this will auto-save via the hook)
  setWeeklyMealPlan((prev) => {
    const updated = { ...prev };
    const dayPlan = getOrCreateDayPlan(updated, selectedDay);
    dayPlan[mealType as keyof DayMealPlan].push(meal);
    return updated;
  });
}
