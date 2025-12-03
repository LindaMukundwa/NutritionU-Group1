import React, { useState, useEffect } from 'react';
import styles from './AddMealModal.module.css';
import { recipeService } from '../../../../services/recipeService';
import MealContentCard from '../MealContentCard/MealContentCard';
import SearchBar from '../SearchBar/SearchBar';
import { Icon } from '../../ui/Icon';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: any) => void;
  mealType: string;
  availableMeals: any[]; // The demo meals from MealContent
  isAddingMeal: boolean
}

const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
  mealType,
  availableMeals,
  isAddingMeal
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  console.log('isAddingMeal:', isAddingMeal);

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
  };

  if (!isOpen) return null;

  // Filter available meals based on search query (like the Meals page does)
  const filteredAvailableMeals = availableMeals.filter(meal =>
    meal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meal.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter favorites based on search query
  const filteredFavorites = favoriteMeals.filter(meal =>
    meal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meal.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine which meals to display
  const displayMeals = activeTab === 'search'
    ? (searchResults.length > 0 ? searchResults : filteredAvailableMeals)
    : filteredFavorites;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {isAddingMeal && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}>
              Adding meal...
            </div>
          </div>
        )}
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add {mealType}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            className={`${styles.tabButton} ${activeTab === 'search' ? styles.active : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Icon name="search" size={16} />
            <span style={{ marginLeft: '6px' }}>Search Meals</span>
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'favorites' ? styles.active : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Icon name="heart" size={16} />
            <span style={{ marginLeft: '6px' }}>Favorites ({favoriteMeals.length})</span>
          </button>
        </div>

        {/* Search Bar (visible in both tabs) */}
        <div className={styles.searchContainer}>
          <SearchBar
            placeholder={activeTab === 'search' ? 'Search for meals...' : 'Search favorites...'}
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={activeTab === 'search' ? handleSearch : undefined}
          />
          {searchError && activeTab === 'search' && (
            <div className={styles.errorMessage}>{searchError}</div>
          )}
        </div>

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
                      setSelectedRecipe(meal);
                      setShowRecipeModal(true);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recipe Modal */}
      {showRecipeModal && selectedRecipe && (
        <div className={styles.recipeModalOverlay} onClick={() => setShowRecipeModal(false)}>
          <div className={styles.recipeModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.recipeModalHeader}>
              <div>
                <h2 className={styles.recipeModalTitle}>{selectedRecipe.name || selectedRecipe.title}</h2>
                <div className={styles.recipeModalMeta}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="clock" size={13} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '1rem', fontWeight: '500' }}>{selectedRecipe.time || selectedRecipe.cookTime}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '500' }}>
                      {selectedRecipe.cost || selectedRecipe.price}
                    </span>
                  </span>
                </div>
              </div>
              <button className={styles.recipeModalCloseButton} onClick={() => setShowRecipeModal(false)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className={styles.recipeModalBody}>
              {/* Nutrition Grid */}
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
                    {selectedRecipe.calories}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0', fontWeight: '500', textTransform: 'uppercase' }}>
                    Calories
                  </p>
                </div>
                <div style={{ textAlign: 'center', padding: '8px' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5c6bcc', margin: '0 0 4px 0' }}>
                    {selectedRecipe.recipe?.nutrition?.protein || 0}g
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0', fontWeight: '500', textTransform: 'uppercase' }}>
                    Protein
                  </p>
                </div>
                <div style={{ textAlign: 'center', padding: '8px' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5c6bcc', margin: '0 0 4px 0' }}>
                    {selectedRecipe.recipe?.nutrition?.carbs || 0}g
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0', fontWeight: '500', textTransform: 'uppercase' }}>
                    Carbs
                  </p>
                </div>
                <div style={{ textAlign: 'center', padding: '8px' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5c6bcc', margin: '0 0 4px 0' }}>
                    {selectedRecipe.recipe?.nutrition?.fat || 0}g
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0', fontWeight: '500', textTransform: 'uppercase' }}>
                    Fat
                  </p>
                </div>
              </div>

              {/* Ingredients */}
              <div className={styles.recipeSection}>
                <h3 className={styles.recipeSectionTitle}>Ingredients</h3>
                <ul className={styles.ingredientsList}>
                  {selectedRecipe.recipe?.ingredients?.map((ingredient: string, index: number) => (
                    <li key={index} className={styles.ingredientItem}>
                      <span className={styles.bullet}>•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className={styles.recipeSection}>
                <h3 className={styles.recipeSectionTitle}>Instructions</h3>
                <ol className={styles.instructionsList}>
                  {selectedRecipe.recipe?.instructions?.map((instruction: string, index: number) => (
                    <li key={index} className={styles.instructionItem}>
                      <span className={styles.stepNumber}>{index + 1}</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Actions */}
              <div className={styles.recipeModalActions}>
                <button
                  className={styles.primaryButton}
                  onClick={() => {
                    handleAddMealClick(selectedRecipe);
                    setShowRecipeModal(false);
                  }}
                >
                  <Icon name="plus" size={18} />
                  <span style={{ marginLeft: '6px' }}>Add to Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMealModal;
