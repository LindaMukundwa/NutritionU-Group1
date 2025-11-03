import React, { useState, useEffect } from 'react';
import styles from './AddMealModal.module.css';
import { recipeService } from '../../../../services/recipeService';
import MealContentCard from '../MealContentCard/MealContentCard';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: any) => void;
  mealType: string;
  availableMeals: any[]; // The demo meals from MealContent
}

const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
  mealType,
  availableMeals,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Filter meals that are marked as favorites (liked)
  const favoriteMeals = availableMeals.filter(meal => meal.isLiked !== false);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSearchError(null);
      setActiveTab('search');
    }
  }, [isOpen]);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await recipeService.searchRecipes(query);
      const mappedResults = results.map((r: any) => ({
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
          ingredients: r.ingredients?.map((i: any) => `${i.amount} ${i.unit.value} ${i.name}`) || [],
          instructions: r.instructions?.map((ins: any) => ins.instruction) || [],
          nutrition: {
            protein: r.nutritionInfo?.protein || 0,
            carbs: r.nutritionInfo?.carbs || 0,
            fat: r.nutritionInfo?.fat || 0,
            fiber: r.nutritionInfo?.fiber || 0,
          },
        },
      }));
      setSearchResults(mappedResults);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Failed to search recipes. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddMealClick = (meal: any) => {
    // Convert meal format to planner format
    const plannerMeal = {
      name: meal.name || meal.title,
      calories: meal.calories,
      time: typeof meal.time === 'string' ? meal.time : `${meal.time} min`,
      cost: meal.cost || meal.price,
      recipe: meal.recipe,
    };
    onAddMeal(plannerMeal);
    onClose();
  };

  if (!isOpen) return null;

  const displayMeals = activeTab === 'search' 
    ? (searchResults.length > 0 ? searchResults : availableMeals)
    : favoriteMeals;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add {mealType}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            className={`${styles.tabButton} ${activeTab === 'search' ? styles.active : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Search Meals
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'favorites' ? styles.active : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            ❤️ Favorites ({favoriteMeals.length})
          </button>
        </div>

        {/* Search Bar (only visible in search tab) */}
        {activeTab === 'search' && (
          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              <svg
                className={styles.searchIcon}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search for meals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                className={styles.searchButton}
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            {searchError && (
              <div className={styles.errorMessage}>{searchError}</div>
            )}
          </div>
        )}

        {/* Meals Grid */}
        <div className={styles.mealsContainer}>
          {displayMeals.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {activeTab === 'favorites'
                  ? 'No favorite meals yet. Like meals to add them to your favorites!'
                  : searchQuery
                  ? 'No meals found. Try a different search term.'
                  : 'Search for meals or browse your favorites.'}
              </p>
            </div>
          ) : (
            <div className={styles.mealsGrid}>
              {displayMeals.map((meal, index) => (
                <div key={meal.id || index} className={styles.mealCardWrapper}>
                  <MealContentCard
                    recipeId={String(meal.id || index)}
                    imageUrl={meal.imageUrl}
                    title={meal.title || meal.name}
                    description={meal.description}
                    totalTime={typeof meal.time === 'string' ? parseInt(meal.time) : meal.time}
                    estimatedCostPerServing={
                      typeof meal.price === 'string'
                        ? parseFloat(meal.price.replace('$', ''))
                        : meal.estimatedCostPerServing || 5
                    }
                    nutritionInfo={{
                      calories: meal.calories,
                      protein: meal.recipe?.nutrition?.protein,
                      carbs: meal.recipe?.nutrition?.carbs,
                      fat: meal.recipe?.nutrition?.fat,
                    }}
                    dietaryTags={meal.tags}
                    onAddToPlan={() => handleAddMealClick(meal)}
                    onViewRecipe={() => {
                      // Optional: could open recipe modal here
                      console.log('View recipe:', meal);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMealModal;
