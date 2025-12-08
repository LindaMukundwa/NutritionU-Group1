import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Sparkles } from 'lucide-react';
import styles from './GroceryList.module.css';

// Types based on Prisma schema
interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  source: string | null;
  checked: boolean;
  groceryListId: string;
  createdAt: string;
  updatedAt: string;
}

interface GroceryListData {
  id: string;
  name: string;
  userId: number;
  mealPlanId: number | null;
  createdAt: string;
  updatedAt: string;
  items: GroceryItem[];
}

interface GroceryListProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyMealPlan: any;
  pendingRecipe?: any;
  setPendingRecipeForGrocery: React.Dispatch<React.SetStateAction<any>>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const GroceryList: React.FC<GroceryListProps> = ({
  isOpen,
  onClose,
  weeklyMealPlan,
  pendingRecipe,
  setPendingRecipeForGrocery
}) => {
  const { user } = useAuth();
  const [groceryList, setGroceryList] = useState<GroceryListData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const isProcessingRecipe = useRef(false);
  const lastProcessedRecipeId = useRef<string | null>(null);

  // Helper to build API URLs consistently
  const getApiUrl = (path: string) => `${API_BASE_URL}/api${path}`;

  // Categories for organizing items
  const categories = ['All', 'Produce', 'Meat', 'Dairy', 'Pantry', 'Other'];

  // Helper function to get the start of the current week (Sunday)
  const getCurrentWeekStart = (): Date => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  // Helper function to format week range for display
  const formatWeekRange = (weekStart: Date): string => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    };

    return `${weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}`;
  };

  // Fetch or create the current week's grocery list
  const fetchCurrentWeekGroceryList = async () => {
    if (!user?.firebaseUid) return;

    try {
      setLoading(true);
      setError(null);
      const weekStart = getCurrentWeekStart();
      const weekName = `Week of ${formatWeekRange(weekStart)}`;

      console.log('Looking for list with name:', weekName);

      // Get all user's grocery lists
      const response = await fetch(`${API_BASE_URL}/api/grocery/users/${user.firebaseUid}/grocery-lists`);

      if (response.ok) {
        const allLists = await response.json();
        console.log('All lists:', allLists);

        // Find the list for current week by name
        const currentWeekList = allLists.find((list: GroceryListData) =>
          list.name === weekName
        );

        if (currentWeekList) {
          console.log('Found existing weekly list:', currentWeekList);
          setGroceryList(currentWeekList);
        } else {
          console.log('No list found for current week, creating new one');
          // No list exists for this week, create one
          await createWeeklyGroceryList();
        }
      } else if (response.status === 404) {
        console.log('No lists exist, creating first one');
        // No lists exist at all, create first one
        await createWeeklyGroceryList();
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch grocery lists: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('Error fetching grocery lists:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch grocery lists');
    } finally {
      setLoading(false);
    }
  };

  // Fetch complete grocery list by ID (including items)
  const fetchGroceryListById = async (listId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery/grocery-lists/${listId}`);

      if (response.ok) {
        const listData = await response.json();
        setGroceryList(listData);
      } else {
        throw new Error(`Failed to fetch grocery list details: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching grocery list by ID:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch grocery list details');
    }
  };

  // Create a new weekly grocery list
  // Create a new weekly grocery list
  const createWeeklyGroceryList = async () => {
    if (!user?.firebaseUid) return;

    try {
      const weekStart = getCurrentWeekStart();
      const listName = `Week of ${formatWeekRange(weekStart)}`;

      console.log('Creating weekly grocery list with name:', listName);

      const response = await fetch(`${API_BASE_URL}/api/grocery/users/${user.firebaseUid}/grocery-lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: listName
          // Don't include weekStartDate or mealPlanId - backend doesn't expect weekStartDate
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create list failed:', response.status, errorText);
        throw new Error(`Failed to create grocery list: ${response.status} - ${errorText}`);
      }

      const newList = await response.json();
      console.log('Created grocery list:', newList);

      setGroceryList(newList);
      setError(null);

    } catch (err) {
      console.error('Error creating grocery list:', err);
      setError(err instanceof Error ? err.message : 'Failed to create grocery list');
    }
  };

  // Add grocery item
  const addGroceryItem = async () => {
    if (!newItemName.trim() || !newItemQuantity.trim() || !groceryList) {
      return;
    }

    try {
      // Check for duplicate item names (case-insensitive)
      const existingItemNames = groceryList.items.map(item =>
        item.name.toLowerCase().trim()
      );

      if (existingItemNames.includes(newItemName.toLowerCase().trim())) {
        // Silently skip duplicate - just clear the form and return
        setNewItemName('');
        setNewItemQuantity('');
        setShowAddForm(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/grocery/grocery-lists/${groceryList.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItemName.trim(),
          quantity: newItemQuantity.trim(),
          source: pendingRecipe?.name || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add grocery item');
      }

      const newItem = await response.json();

      setGroceryList(prev => prev ? {
        ...prev,
        items: [...prev.items, newItem]
      } : null);

      setNewItemName('');
      setNewItemQuantity('');
      setShowAddForm(false);
      setError(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  // Toggle item checked status
  const toggleItemChecked = async (itemId: string) => {
    try {
      setUpdatingItemId(itemId);
      const response = await fetch(`${API_BASE_URL}/api/grocery/grocery-lists/items/${itemId}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle item');
      }

      const updatedItem = await response.json();
      setGroceryList(prev => prev ? {
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? updatedItem : item
        )
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Delete grocery item
  const deleteGroceryItem = async (itemId: string) => {
    // Prevent deletion if already updating this item
    if (updatingItemId === itemId) {
      return;
    }

    try {
      setUpdatingItemId(itemId);

      const response = await fetch(`${API_BASE_URL}/api/grocery/grocery-lists/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete grocery item');
      }

      // Only update state AFTER successful deletion
      setGroceryList(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      } : null);

      setError(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');

      // Optionally refetch to ensure UI is in sync
      if (groceryList?.id) {
        await fetchGroceryListById(groceryList.id);
      }
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Clear checked items
  const clearCheckedItems = async () => {
    if (!groceryList) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery/grocery-lists/${groceryList.id}/checked-items`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear checked items');
      }

      setGroceryList(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => !item.checked)
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear checked items');
    }
  };

  // Generate grocery list from meal plan
const generateFromMealPlan = async () => {
  if (!groceryList || !weeklyMealPlan) return;

  try {
    // Get all of the ingredients
    const ingredientMap = new Map<string, { 
      originalIngredient: string;
      count: number; 
      sources: string[]; 
      recipeIds: Set<number> 
    }>();

    Object.values(weeklyMealPlan).forEach((dayPlan: any) => {
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
        dayPlan[mealType]?.forEach((meal: any) => {
          if (meal.recipe?.ingredients && meal.name && meal.recipeId) {
            meal.recipe.ingredients.forEach((ingredient: string) => {
              const ingredientKey = ingredient.toLowerCase().trim();

              if (ingredientMap.has(ingredientKey)) {
                const existing = ingredientMap.get(ingredientKey)!;

                // Only increment count if this is a different recipe ID
                if (!existing.recipeIds.has(meal.recipeId)) {
                  existing.count += 1;
                  existing.recipeIds.add(meal.recipeId);

                  // Add source if it's not already included
                  if (!existing.sources.includes(meal.name)) {
                    existing.sources.push(meal.name);
                  }
                }
              } else {
                ingredientMap.set(ingredientKey, {
                  originalIngredient: ingredient,
                  count: 1,
                  sources: [meal.name],
                  recipeIds: new Set([meal.recipeId])
                });
              }
            });
          }
        });
      });
    });

    // Simplify all ingredients via open AI API
    const allIngredients = Array.from(ingredientMap.values()).map(data => data.originalIngredient);
    
    console.log('Simplifying meal plan ingredients...', allIngredients);
    const simplifyResponse = await fetch(`${API_BASE_URL}/api/grocery/grocery-lists/simplify-ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients: allIngredients }),
    });

    if (!simplifyResponse.ok) {
      throw new Error('Failed to simplify ingredients');
    }

    const { simplifiedIngredients } = await simplifyResponse.json();
    console.log('Simplified meal plan ingredients:', simplifiedIngredients);

    // Create a map of simplified names to their metadata
    const simplifiedMap = new Map<string, {
      simplifiedName: string;
      count: number;
      sources: string[];
    }>();

    let index = 0;
    for (const [originalKey, data] of ingredientMap.entries()) {
      const simplifiedName = simplifiedIngredients[index];
      const simplifiedKey = simplifiedName.toLowerCase().trim();

      if (simplifiedMap.has(simplifiedKey)) {
        // Merge if simplified name already exists
        const existing = simplifiedMap.get(simplifiedKey)!;
        existing.count += data.count;
        existing.sources = [...new Set([...existing.sources, ...data.sources])];
      } else {
        simplifiedMap.set(simplifiedKey, {
          simplifiedName,
          count: data.count,
          sources: data.sources
        });
      }
      index++;
    }

    // Get existing items for comparison
    const existingItemsMap = new Map(
      groceryList.items.map(item => [item.name.toLowerCase().trim(), item])
    );

    // Process all ingredients - update existing or add new
    const newItemsToAdd: GroceryItem[] = [];
    let addedCount = 0;
    let updatedCount = 0;

    for (const [simplifiedKey, data] of simplifiedMap.entries()) {
      try {
        const quantity = data.count === 1 ? '1 serving' : `${data.count} servings`;

        // Use the first recipe as primary source
        const primarySource = data.sources[0];
        const sourceText = data.sources.length > 1
          ? `${primarySource} (+${data.sources.length - 1} more)`
          : primarySource;

        const existingItem = existingItemsMap.get(simplifiedKey);

        if (existingItem) {
          // Update existing item quantity and source
          const response = await fetch(`${API_BASE_URL}/api/grocery/grocery-lists/items/${existingItem.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: data.simplifiedName,
              quantity: quantity,
              source: sourceText,
            }),
          });

          if (response.ok) {
            const updatedItem = await response.json();

            // Update frontend state for this item
            setGroceryList(prev => prev ? {
              ...prev,
              items: prev.items.map(item =>
                item.id === existingItem.id ? updatedItem : item
              )
            } : null);
            updatedCount++;
          }
        } else {
          // Add new item
          const response = await fetch(`${API_BASE_URL}/api/grocery/grocery-lists/${groceryList.id}/items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: data.simplifiedName,
              quantity: quantity,
              source: sourceText,
            }),
          });

          if (response.ok) {
            const newItem = await response.json();
            newItemsToAdd.push(newItem);
            addedCount++;
          }
        }
      } catch (itemError) {
        console.error(`Failed to process ingredient: ${simplifiedKey}`, itemError);
      }
    }

    // Add new items to frontend state
    if (addedCount > 0) {
      setGroceryList(prev => prev ? {
        ...prev,
        items: [...prev.items, ...newItemsToAdd]
      } : null);
    }

    if (addedCount > 0 || updatedCount > 0) {
      setError(null);
      console.log(`Meal plan processed: ${addedCount} added, ${updatedCount} updated`);
    }

  } catch (err) {
    console.error('Error in generateFromMealPlan:', err);
    setError('Failed to generate grocery list from meal plan');
  }
};

const addRecipeIngredients = async () => {
  if (!pendingRecipe?.recipe?.ingredients || !groceryList) return;

  const ingredients: string[] = pendingRecipe.recipe.ingredients;

  try {
    // Step 1: Simplify ingredients via API
    console.log('Simplifying ingredients...', ingredients);
    const simplifyResponse = await fetch(`${API_BASE_URL}/api/grocery/grocery-lists/simplify-ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!simplifyResponse.ok) {
      throw new Error('Failed to simplify ingredients');
    }

    const { simplifiedIngredients } = await simplifyResponse.json();
    console.log('Simplified ingredients:', simplifiedIngredients);

    // Step 2: Get existing items map for comparison (using simplified names)
    const existingItemsMap = new Map(
      groceryList.items.map(item => [item.name.toLowerCase().trim(), item])
    );

    // Track what we're adding/updating
    const newItemsToAdd: GroceryItem[] = [];
    let addedCount = 0;
    let updatedCount = 0;

    // Step 3: Process each simplified ingredient
    for (let i = 0; i < simplifiedIngredients.length; i++) {
      const simplifiedName = simplifiedIngredients[i];
      const originalIngredient = ingredients[i];
      
      try {
        const ingredientKey = simplifiedName.toLowerCase().trim();
        const existingItem = existingItemsMap.get(ingredientKey);

        if (existingItem) {
          // UPDATE existing item - increment quantity
          const currentQuantity = parseInt(existingItem.quantity) || 1;
          const newQuantity = currentQuantity + 1;

          // Build source string - avoid duplicates
          const existingSources = existingItem.source ? existingItem.source.split(', ') : [];
          const newSource = existingSources.includes(pendingRecipe.name)
            ? existingItem.source
            : existingSources.concat(pendingRecipe.name).join(', ');

          const response = await fetch(`${API_BASE_URL}/grocery/grocery-lists/items/${existingItem.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: simplifiedName, // Use simplified name
              quantity: newQuantity.toString(),
              source: newSource,
              checked: existingItem.checked,
            }),
          });

          if (!response.ok) {
            console.error(`Failed to update item: ${simplifiedName}`);
            continue;
          }

          const updatedItem = await response.json();
          updatedCount++;
          console.log(`Updated: ${simplifiedName} (quantity: ${newQuantity})`);

        } else {
          // CREATE new item with simplified name
          const newItem: GroceryItem = {
            id: `temp-${Date.now()}-${i}`,
            name: simplifiedName, // Use simplified name
            quantity: '1',
            source: pendingRecipe.name,
            checked: false,
            groceryListId: groceryList.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          newItemsToAdd.push(newItem);
          console.log(`Prepared to add: ${simplifiedName}`);
        }
      } catch (itemError) {
        console.error(`Error processing ingredient ${simplifiedName}:`, itemError);
      }
    }

    // Step 4: Batch create new items
    if (newItemsToAdd.length > 0) {
      for (const newItem of newItemsToAdd) {
        try {
          const response = await fetch(`${API_BASE_URL}/grocery/grocery-lists/${groceryList.id}/items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: newItem.name,
              quantity: newItem.quantity,
              source: newItem.source,
            }),
          });

          if (response.ok) {
            addedCount++;
            console.log(`Added: ${newItem.name}`);
          } else {
            console.error(`Failed to add item: ${newItem.name}`);
          }
        } catch (error) {
          console.error(`Error adding item ${newItem.name}:`, error);
        }
      }
    }

    // Step 5: Refresh the grocery list
    await fetchGroceryListById(groceryList.id);
    console.log(`Recipe ingredients processed: ${addedCount} added, ${updatedCount} updated`);

  } catch (error) {
    console.error('Error adding recipe ingredients:', error);
    // Optionally show error toast to user
  }
};

  // Categorize items based on common patterns
  const categorizeItem = (itemName: string): string => {
    const name = itemName.toLowerCase();

    if (name.includes('apple') || name.includes('banana') || name.includes('lettuce') ||
      name.includes('tomato') || name.includes('onion') || name.includes('carrot') ||
      name.includes('cucumber') || name.includes('avocado') || name.includes('berries') ||
      name.includes('vegetable') || name.includes('fruit')) {
      return 'Produce';
    }
    if (name.includes('chicken') || name.includes('beef') || name.includes('pork') ||
      name.includes('fish') || name.includes('meat') || name.includes('salmon') ||
      name.includes('tofu') || name.includes('egg')) {
      return 'Meat';
    }
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') ||
      name.includes('butter') || name.includes('cream')) {
      return 'Dairy';
    }
    if (name.includes('flour') || name.includes('sugar') || name.includes('salt') ||
      name.includes('oil') || name.includes('spice') || name.includes('sauce') ||
      name.includes('rice') || name.includes('bread') || name.includes('pasta') ||
      name.includes('oat') || name.includes('honey') || name.includes('nuts') || name.includes('granola')) {
      return 'Pantry';
    }

    return 'Other';
  };


  // Add groupItemsByCategory function
  const groupItemsByCategory = (items: GroceryItem[]) => {
    const grouped: { [key: string]: GroceryItem[] } = {};

    items.forEach(item => {
      const category = categorizeItem(item.name);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    return grouped;
  };

  useEffect(() => {
    if (isOpen && user?.firebaseUid) {
      fetchCurrentWeekGroceryList();
    }
  }, [isOpen, user?.firebaseUid]);

  // Auto-add pending recipe ingredients when modal opens with a recipe
  useEffect(() => {
    // Only process if we have a new recipe that hasn't been processed yet
    const recipeId = pendingRecipe?.id || pendingRecipe?.name;
    
    if (isOpen && 
        pendingRecipe && 
        groceryList && 
        !isProcessingRecipe.current &&
        recipeId !== lastProcessedRecipeId.current) {
      
      isProcessingRecipe.current = true;
      lastProcessedRecipeId.current = recipeId;
      
      const processRecipe = async () => {
        try {
          await addRecipeIngredients();
        } catch (err) {
          console.error('Failed to process recipe:', err);
        } finally {
          setPendingRecipeForGrocery(null);
          isProcessingRecipe.current = false;
        }
      };
      
      processRecipe();
    }
    
    // Reset tracking when modal closes
    if (!isOpen) {
      isProcessingRecipe.current = false;
      lastProcessedRecipeId.current = null;
    }
  }, [isOpen, pendingRecipe, groceryList]);

  if (!isOpen) return null;

  const checkedItems = groceryList?.items.filter(item => item.checked) || [];
  const uncheckedItems = groceryList?.items.filter(item => !item.checked) || [];
  const groupedItems = groceryList ? groupItemsByCategory(uncheckedItems) : {};

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Grocery List</h2>
          <button className={styles.modalCloseButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Main Content */}
        <div className={styles.groceryList}>
          {loading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⏳</div>
              <div className={styles.emptyTitle}>Loading...</div>
              <div className={styles.emptyText}>Fetching your grocery list</div>
            </div>
          )}

          {error && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⚠️</div>
              <div className={styles.emptyTitle}>Error</div>
              <div className={styles.emptyText}>{error}</div>
              <button
                onClick={fetchCurrentWeekGroceryList}
                className={styles.generateButton}
                style={{ marginTop: '1rem' }}
              >
                Retry
              </button>
            </div>
          )}

          {groceryList && !loading && !error && (
            <>
              {/* Header Section */}
              <div className={styles.header}>
                <div>
                  <h1 className={styles.title}>{groceryList.name}</h1>
                  <p className={styles.subtitle}>
                    {groceryList.items.length} items • {checkedItems.length} completed
                  </p>
                </div>

                <div className={styles.headerActions}>
                  <button
                    onClick={generateFromMealPlan}
                    className={styles.generateButton}
                  >
                    <Sparkles size={16} /> From Meal Plan
                  </button>

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={styles.addButton}
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              {/* Add Form */}
              {showAddForm && (
                <div className={styles.addForm}>
                  <input
                    type="text"
                    placeholder="Item name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className={styles.addInput}
                    onKeyDown={(e) => e.key === 'Enter' && addGroceryItem()}
                  />
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    className={styles.addInput}
                    style={{ flex: '0 0 120px' }}
                    onKeyDown={(e) => e.key === 'Enter' && addGroceryItem()}
                  />
                  <button
                    onClick={addGroceryItem}
                    disabled={!newItemName.trim() || !newItemQuantity.trim()}
                    className={styles.addSubmitButton}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Category Filter */}
              <div className={styles.categoryFilter}>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`${styles.categoryButton} ${selectedCategory === category ? styles.categoryButtonActive : ''}`}
                  >
                    {category}
                  </button>
                ))}
              </div>


              {/* Items Container */}
              {groceryList && groceryList.items.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🛒</div>
                  <div className={styles.emptyTitle}>No items yet</div>
                  <div className={styles.emptyText}>
                    Add items manually or generate from your meal plan
                  </div>
                </div>
              ) : (
                <div className={styles.itemsContainer}>
                  {/* Unchecked Items by Category */}
                  {Object.entries(groupedItems).map(([category, items]) => {
                    if (selectedCategory !== 'All' && category !== selectedCategory) return null;
                    if (items.length === 0) return null;

                    return (
                      <div key={category} className={styles.categorySection}>
                        <h3 className={styles.categoryTitle}>{category}</h3>
                        <div className={styles.itemsList}>
                          {items.map(item => (
                            <GroceryItemRow
                              key={item.id}
                              item={item}
                              onToggleChecked={toggleItemChecked}
                              onDelete={deleteGroceryItem}
                              isUpdating={updatingItemId === item.id}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Checked Items */}
                  {checkedItems.length > 0 && (selectedCategory === 'All') && (
                    <div className={styles.categorySection}>
                      <h3 className={styles.categoryTitle}>Completed ({checkedItems.length})</h3>
                      <div className={styles.itemsList}>
                        {checkedItems.map(item => (
                          <GroceryItemRow
                            key={item.id}
                            item={item}
                            onToggleChecked={toggleItemChecked}
                            onDelete={deleteGroceryItem}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              {checkedItems.length > 0 && (
                <div className={styles.footer}>
                  <button
                    onClick={clearCheckedItems}
                    className={styles.clearButton}
                  >
                    🗑️ Clear Completed Items
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Individual grocery item component
interface GroceryItemRowProps {
  item: GroceryItem;
  onToggleChecked: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  isUpdating?: boolean;
}

const GroceryItemRow: React.FC<GroceryItemRowProps> = ({
  item,
  onToggleChecked,
  onDelete,
  isUpdating
}) => {
  return (
    <div className={`${styles.groceryItem} ${item.checked ? styles.checkedItem : ''} ${isUpdating ? styles.updating : ''}`}>
      <label className={styles.itemCheckbox}>
        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => onToggleChecked(item.id)}
          disabled={isUpdating}
        />
        <span className={styles.checkboxCustom}></span>
      </label>

      <div className={styles.itemContent}>
        <div className={styles.itemName}>{item.name}</div>
        <div className={styles.itemQuantity}>Quantity: {item.quantity}</div>
        {item.source && (
          <div className={styles.itemMeals}>For: {item.source}</div>
        )}
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className={styles.deleteButton}
        disabled={isUpdating}
        title="Delete item"
      >
        ×
      </button>
    </div>
  );
};

export default GroceryList;