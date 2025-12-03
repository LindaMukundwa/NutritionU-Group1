import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './GroceryList.module.css';

// Types based on your Prisma schema
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

interface MealPlan {
  id: number;
  startDate: string;
  endDate: string;
}

interface GroceryListData {
  id: string;
  name: string;
  userId: number;
  mealPlanId: number | null;
  createdAt: string;
  updatedAt: string;
  items: GroceryItem[];
  mealPlan?: MealPlan;
}

interface GroceryListProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyMealPlan: any;
  pendingRecipe?: any;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

const GroceryList: React.FC<GroceryListProps> = ({
  isOpen,
  onClose,
  weeklyMealPlan,
  pendingRecipe
}) => {
  const { user } = useAuth();
  const [groceryLists, setGroceryLists] = useState<GroceryListData[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingListName, setEditingListName] = useState(false);
  const [tempListName, setTempListName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Categories for organizing items
  const categories = ['All', 'Produce', 'Meat', 'Dairy', 'Pantry', 'Other'];

  // Fetch user's grocery lists
  const fetchGroceryLists = async () => {
    if (!user?.firebaseUid) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/grocery/users/${user.firebaseUid}/grocery-lists`);

      if (!response.ok) {
        throw new Error(`Failed to fetch grocery lists: ${response.status}`);
      }

      const data = await response.json();
      setGroceryLists(data);

      // Auto-select the first list or create one if none exist
      if (data.length > 0 && !selectedListId) {
        setSelectedListId(data[0].id);
      } else if (data.length === 0) {
        // Create a default list
        await createGroceryList('My Grocery List');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch grocery lists');
    } finally {
      setLoading(false);
    }
  };

  // Create new grocery list
  const createGroceryList = async (name: string, mealPlanId?: number) => {
    if (!user?.firebaseUid) return;

    try {
      const response = await fetch(`${API_BASE_URL}/grocery/users/${user.firebaseUid}/grocery-lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, mealPlanId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create grocery list');
      }

      const newList = await response.json();
      setGroceryLists(prev => [newList, ...prev]);
      setSelectedListId(newList.id);
      setNewListName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create grocery list');
    }
  };

  // Add grocery item
  // Add grocery item
  const addGroceryItem = async (listId: string) => {
    
    if (!newItemName.trim() || !newItemQuantity.trim()) {
      console.log("❌ Empty name or quantity, returning early");
      return;
    }
  
    try {
      // Check for duplicate item names (case-insensitive)
      const currentList = groceryLists.find(list => list.id === listId);
      const existingItemNames = currentList?.items.map(item =>
        item.name.toLowerCase().trim()
      ) || [];
  
  
      if (existingItemNames.includes(newItemName.toLowerCase().trim())) {
        // Silently skip duplicate - just clear the form and return
        setNewItemName('');
        setNewItemQuantity('');
        setShowAddForm(false);
        return;
      }
  
      const response = await fetch(`${API_BASE_URL}/grocery/grocery-lists/${listId}/items`, {
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
        const errorText = await response.text();
        throw new Error('Failed to add grocery item');
      }
  
      const newItem = await response.json();
      
      setGroceryLists(prev => prev.map(list =>
        list.id === listId ? {
          ...list,
          items: [...list.items, newItem]
        } : list
      ));
  
      setNewItemName('');
      setNewItemQuantity('');
      setShowAddForm(false);
      setError(null);
      
      console.log("🔵 Function completed successfully");
    } catch (err) {
      console.error("❌ Error in addGroceryItem:", err);
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  // Toggle item checked status
  const toggleItemChecked = async (itemId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grocery/grocery-lists/items/${itemId}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle item');
      }

      const updatedItem = await response.json();
      setGroceryLists(prev => prev.map(list => ({
        ...list,
        items: list.items.map(item =>
          item.id === itemId ? updatedItem : item
        )
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle item');
    }
  };

  // Delete grocery item
  const deleteGroceryItem = async (itemId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grocery/grocery-lists/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete grocery item');
      }

      setGroceryLists(prev => prev.map(list => ({
        ...list,
        items: list.items.filter(item => item.id !== itemId)
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  // Clear checked items
  const clearCheckedItems = async (listId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grocery/grocery-lists/${listId}/checked-items`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear checked items');
      }

      setGroceryLists(prev => prev.map(list =>
        list.id === listId ? {
          ...list,
          items: list.items.filter(item => !item.checked)
        } : list
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear checked items');
    }
  };

  // Generate grocery list from meal plan
const generateFromMealPlan = async () => {
  if (!selectedListId || !weeklyMealPlan) return;

  console.log("🔵 Starting generateFromMealPlan");
  console.log("📋 Weekly meal plan:", weeklyMealPlan);

  try {
    // Extract ingredients with their source recipes and count occurrences
    const ingredientMap = new Map<string, { count: number; sources: string[]; recipeIds: Set<number> }>();
    
    Object.values(weeklyMealPlan).forEach((dayPlan: any) => {
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
        dayPlan[mealType]?.forEach((meal: any) => {
          console.log(`🍽️ Processing meal: ${meal.name} (ID: ${meal.recipeId})`);
          console.log(`📦 Ingredients:`, meal.recipe?.ingredients);
          
          if (meal.recipe?.ingredients && meal.name && meal.recipeId) {
            meal.recipe.ingredients.forEach((ingredient: string) => {
              const ingredientKey = ingredient.toLowerCase().trim();
              
              if (ingredientMap.has(ingredientKey)) {
                const existing = ingredientMap.get(ingredientKey)!;
                
                // Only increment count if this is a different recipe ID
                if (!existing.recipeIds.has(meal.recipeId)) {
                  console.log(`➕ Incrementing ${ingredientKey} from count ${existing.count} to ${existing.count + 1}`);
                  existing.count += 1;
                  existing.recipeIds.add(meal.recipeId);
                  
                  // Add source if it's not already included
                  if (!existing.sources.includes(meal.name)) {
                    existing.sources.push(meal.name);
                  }
                } else {
                  console.log(`⏭️ Skipping ${ingredientKey} - same recipe ID ${meal.recipeId}`);
                  // If same recipe ID, don't increment but still track the recipe name if different
                  if (!existing.sources.includes(meal.name)) {
                    existing.sources.push(meal.name);
                  }
                }
              } else {
                console.log(`🆕 Adding new ingredient: ${ingredientKey} (count: 1)`);
                ingredientMap.set(ingredientKey, {
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

    console.log("📊 Final ingredient map:", Array.from(ingredientMap.entries()));

    // Get current grocery list to check for existing items
    const currentList = groceryLists.find(list => list.id === selectedListId);
    const existingItemNames = currentList?.items.map(item => 
      item.name.toLowerCase().trim()
    ) || [];

    console.log("🔍 Existing items in grocery list:", existingItemNames);

    // Filter out ingredients that already exist in the grocery list
    const newIngredients = Array.from(ingredientMap.entries()).filter(([ingredientKey]) => 
      !existingItemNames.includes(ingredientKey)
    );

    console.log("🆕 New ingredients to add:", newIngredients);

    // Silently skip if no new ingredients
    if (newIngredients.length === 0) {
      console.log("⚠️ No new ingredients to add");
      return;
    }

    // Collect all the new items that will be added
    const newItemsToAdd: GroceryItem[] = [];
    let addedCount = 0;

    for (const [ingredientKey, data] of newIngredients) {
      try {
        // Find the original ingredient name (with proper capitalization)
        const originalIngredient = Object.values(weeklyMealPlan)
          .flatMap((dayPlan: any) => 
            ['breakfast', 'lunch', 'dinner', 'snacks'].flatMap(mealType =>
              dayPlan[mealType]?.flatMap((meal: any) => 
                meal.recipe?.ingredients || []
              ) || []
            )
          )
          .find((ing: string) => ing.toLowerCase().trim() === ingredientKey);

        const quantity = data.count === 1 ? '1 serving' : `${data.count} servings`;
        
        // Use the first recipe as primary source, but could show multiple sources
        const primarySource = data.sources[0];
        const sourceText = data.sources.length > 1 
          ? `${primarySource} (+${data.sources.length - 1} more)`
          : primarySource;

        console.log(`📤 Adding ingredient to API:`, {
          name: originalIngredient || ingredientKey,
          quantity: quantity,
          source: sourceText,
          count: data.count,
          sources: data.sources,
          recipeIds: Array.from(data.recipeIds)
        });

        const response = await fetch(`${API_BASE_URL}/grocery/grocery-lists/${selectedListId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: originalIngredient || ingredientKey,
            quantity: quantity,
            source: sourceText,
          }),
        });

        console.log(`📥 API Response for ${ingredientKey}:`, response.status, response.ok);

        if (response.ok) {
          const newItem = await response.json();
          console.log(`✅ Successfully added item:`, newItem);
          newItemsToAdd.push(newItem);
          addedCount++;
        } else {
          const errorText = await response.text();
          console.error(`❌ API Error for ${ingredientKey}:`, errorText);
        }
      } catch (itemError) {
        console.error(`❌ Failed to add ingredient: ${ingredientKey}`, itemError);
      }
    }

    console.log(`📊 Total items to add to frontend: ${newItemsToAdd.length}`);

    // Update the frontend state immediately with the new items
    if (addedCount > 0) {
      setGroceryLists(prev => prev.map(list => 
        list.id === selectedListId ? {
          ...list,
          items: [...list.items, ...newItemsToAdd]
        } : list
      ));
      setError(null);
      console.log(`✅ Successfully added ${addedCount} items from meal plan to frontend`);
    }

  } catch (err) {
    console.error('❌ Error in generateFromMealPlan:', err);
    setError('Failed to generate grocery list from meal plan');
  }
};

  // Add ingredients from pending recipe
  const addRecipeIngredients = async (listId: string) => {
    if (!pendingRecipe?.recipe?.ingredients) return;

    const ingredients: string[] = pendingRecipe.recipe.ingredients;

    try {
      // Get current grocery list to check for existing items
      const currentList = groceryLists.find(list => list.id === listId);
      const existingItemNames = currentList?.items.map(item =>
        item.name.toLowerCase().trim()
      ) || [];

      // Filter out ingredients that already exist
      const newIngredients = ingredients.filter(ingredient =>
        !existingItemNames.includes(ingredient.toLowerCase().trim())
      );

      // Add only new ingredients as separate items
      let addedCount = 0;
      for (const ingredient of newIngredients) {
        try {
          const response = await fetch(`${API_BASE_URL}/grocery/grocery-lists/${listId}/items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: ingredient.trim(),
              quantity: '1 serving',
              source: pendingRecipe.name,
            }),
          });

          if (response.ok) {
            addedCount++;
          }
        } catch (itemError) {
          console.error(`Failed to add ingredient: ${ingredient}`, itemError);
        }
      }

      // Refresh the grocery lists to show new items
      if (addedCount > 0) {
        await fetchGroceryLists();
      }

    } catch (err) {
      setError('Failed to add recipe ingredients');
    }
  };

  // Categorize items based on common patterns
  const categorizeItem = (itemName: string): string => {
    const name = itemName.toLowerCase();

    if (name.includes('apple') || name.includes('banana') || name.includes('lettuce') ||
      name.includes('tomato') || name.includes('onion') || name.includes('carrot')) {
      return 'Produce';
    }
    if (name.includes('chicken') || name.includes('beef') || name.includes('pork') ||
      name.includes('fish') || name.includes('meat')) {
      return 'Meat';
    }
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') ||
      name.includes('butter') || name.includes('cream')) {
      return 'Dairy';
    }
    if (name.includes('flour') || name.includes('sugar') || name.includes('salt') ||
      name.includes('oil') || name.includes('spice') || name.includes('sauce')) {
      return 'Pantry';
    }

    return 'Other';
  };

  // Group items by category
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
      fetchGroceryLists();
    }
  }, [isOpen, user?.firebaseUid]);

  // Auto-add pending recipe ingredients when modal opens with a recipe
  useEffect(() => {
    if (isOpen && pendingRecipe && selectedListId) {
      addRecipeIngredients(selectedListId);
    }
  }, [isOpen, pendingRecipe, selectedListId]);

  if (!isOpen) return null;

  const selectedList = groceryLists.find(list => list.id === selectedListId);
  const checkedItems = selectedList?.items.filter(item => item.checked) || [];
  const uncheckedItems = selectedList?.items.filter(item => !item.checked) || [];
  const groupedItems = selectedList ? groupItemsByCategory(uncheckedItems) : {};

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Grocery Lists</h2>
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
              <div className={styles.emptyText}>Fetching your grocery lists</div>
            </div>
          )}

          {error && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⚠️</div>
              <div className={styles.emptyTitle}>Error</div>
              <div className={styles.emptyText}>{error}</div>
              <button
                onClick={fetchGroceryLists}
                className={styles.generateButton}
                style={{ marginTop: '1rem' }}
              >
                Retry
              </button>
            </div>
          )}

          {selectedList && !loading && !error && (
            <>
              {/* Header Section */}
              <div className={styles.header}>
                <div>
                  <h1 className={styles.title}>
                    {editingListName ? (
                      <input
                        type="text"
                        value={tempListName}
                        onChange={(e) => setTempListName(e.target.value)}
                        className={styles.addInput}
                        style={{ fontSize: '1.25rem', fontWeight: 600 }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            await fetch(`${API_BASE_URL}/grocery/grocery-lists/${selectedList.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ name: tempListName.trim() }),
                            });
                            setGroceryLists(prev => prev.map(list =>
                              list.id === selectedList.id ? { ...list, name: tempListName.trim() } : list
                            ));
                            setEditingListName(false);
                          }
                          if (e.key === 'Escape') setEditingListName(false);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span onClick={() => {
                        setEditingListName(true);
                        setTempListName(selectedList.name);
                      }}>
                        {selectedList.name}
                      </span>
                    )}
                  </h1>
                  <p className={styles.subtitle}>
                    {selectedList.items.length} items • {checkedItems.length} completed
                  </p>
                </div>

                <div className={styles.headerActions}>
                  {groceryLists.length > 1 && (
                    <select
                      value={selectedListId || ''}
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className={styles.dateRangeButton}
                    >
                      {groceryLists.map(list => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    onClick={generateFromMealPlan}
                    className={styles.generateButton}
                  >
                    📅 From Meal Plan
                  </button>

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={styles.addButton}
                  >
                    + Add Item
                  </button>

                  <button
                    onClick={() => {
                      const name = prompt('New list name:');
                      if (name?.trim()) createGroceryList(name.trim());
                    }}
                    className={styles.addButton}
                  >
                    + New List
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
                    onKeyDown={(e) => e.key === 'Enter' && addGroceryItem(selectedList.id)}
                  />
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    className={styles.addInput}
                    style={{ flex: '0 0 120px' }}
                    onKeyDown={(e) => e.key === 'Enter' && addGroceryItem(selectedList.id)}
                  />
                  <button
                    onClick={() => addGroceryItem(selectedList.id)}
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
                    className={`${styles.categoryButton} ${selectedCategory === category ? styles.categoryButtonActive : ''
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Items Container */}
              {selectedList.items.length === 0 ? (
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
                    onClick={() => clearCheckedItems(selectedList.id)}
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
}

const GroceryItemRow: React.FC<GroceryItemRowProps> = ({
  item,
  onToggleChecked,
  onDelete
}) => {
  return (
    <div className={`${styles.groceryItem} ${item.checked ? styles.checkedItem : ''}`}>
      <label className={styles.itemCheckbox}>
        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => onToggleChecked(item.id)}
        />
        <span className={styles.checkboxCustom}></span>
      </label>

      <div className={styles.itemContent}>
        <div className={styles.itemName}>{item.name}</div>
        <div className={styles.itemQuantity}>{item.quantity}</div>
        {item.source && (
          <div className={styles.itemMeals}>from {item.source}</div>
        )}
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className={styles.deleteButton}
        title="Delete item"
      >
        ×
      </button>
    </div>
  );
};

export default GroceryList;