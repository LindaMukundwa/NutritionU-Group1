import { useState, useEffect } from 'react';
import MealContentCard from '../../components/Dashboard/MealContentCard/MealContentCard';
import { recipeService, type Recipe } from '../../../services/recipeService';
import styles from './Recipes.module.css';

export default function Recipes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const results = await recipeService.searchRecipes(searchQuery);
      setRecipes(results);
      
      if (results.length === 0) {
        setError('No recipes found. Try a different search term.');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecipe = (recipeId: string) => {
    // Navigate to recipe detail page
    console.log('View recipe:', recipeId);
    // Example: navigate(`/recipes/${recipeId}`);
  };

  const handleAddToPlan = (recipeId: string) => {
    // Add recipe to meal plan
    console.log('Add to plan:', recipeId);
    // Still need to implement add to meal plan functionality
  };

  return (
    <div className={styles.recipesPage}>
      <div className={styles.header}>
        <h1>Search Recipes</h1>
        <p>Find delicious recipes from FatSecret's database</p>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search recipes (e.g., chicken pasta, vegan pizza)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className={styles.searchInput}
        />
        <button 
          onClick={handleSearch} 
          disabled={loading || !searchQuery.trim()}
          className={styles.searchButton}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          <p>Searching recipes...</p>
        </div>
      ) : (
        <div className={styles.recipesGrid}>
          {recipes.map((recipe) => (
            <MealContentCard
              key={recipe._id}
              recipeId={recipe._id}
              imageUrl={recipe.imageUrl}
              title={recipe.title}
              description={recipe.description}
              totalTime={recipe.totalTime}
              estimatedCostPerServing={recipe.estimatedCostPerServing}
              nutritionInfo={recipe.nutritionInfo}
              dietaryTags={recipe.dietaryTags}
              onViewRecipe={handleViewRecipe}
              onAddToPlan={handleAddToPlan}
            />
          ))}
        </div>
      )}

      {!loading && recipes.length === 0 && !error && (
        <div className={styles.emptyState}>
          <p>Start searching to find recipes!</p>
        </div>
      )}
    </div>
  );
}