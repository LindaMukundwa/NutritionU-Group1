import React, { useState, useEffect } from 'react';
import styles from './GroceryList.module.css';

interface Meal {
  name: string;
  calories: number;
  time: string;
  cost: string;
  recipe: {
    ingredients: string[];
    instructions: string[];
    nutrition: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
  };
}

interface DayMealPlan {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
}

interface WeeklyMealPlan {
  [dateString: string]: DayMealPlan;
}

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  source: 'planned' | 'manual';
  meals?: string[]; // Which meals this ingredient comes from
}

interface GroceryListProps {
  weeklyMealPlan: WeeklyMealPlan;
  isOpen: boolean;
  onClose: () => void;
}

const GroceryList: React.FC<GroceryListProps> = ({ weeklyMealPlan, isOpen, onClose }) => {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [manualEntry, setManualEntry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const categories = ['all', 'produce', 'protein', 'dairy', 'grains', 'pantry', 'other'];

  // Generate grocery list from planned meals
  const generateFromPlannedMeals = () => {
    const ingredientMap = new Map<string, { quantity: string; meals: Set<string> }>();

    Object.entries(weeklyMealPlan).forEach(([date, dayPlan]) => {
      const mealTypes: (keyof DayMealPlan)[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

      mealTypes.forEach((mealType) => {
        dayPlan[mealType].forEach((meal) => {
          meal.recipe.ingredients.forEach((ingredient) => {
            // Parse ingredient to separate quantity and name
            const parts = ingredient.trim().split(' ');
            const quantity = parts.slice(0, 2).join(' '); // e.g., "1 cup"
            const name = parts.slice(2).join(' '); // e.g., "chickpeas"

            const key = name.toLowerCase();
            if (ingredientMap.has(key)) {
              const existing = ingredientMap.get(key)!;
              existing.meals.add(meal.name);
            } else {
              ingredientMap.set(key, {
                quantity,
                meals: new Set([meal.name]),
              });
            }
          });
        });
      });
    });

    // Convert to grocery items
    const newItems: GroceryItem[] = Array.from(ingredientMap.entries()).map(
      ([name, { quantity, meals }], index) => ({
        id: `planned-${index}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        quantity,
        category: categorizeIngredient(name),
        checked: false,
        source: 'planned',
        meals: Array.from(meals),
      })
    );

    setGroceryItems((prev) => {
      // Keep manual items and replace planned items
      const manualItems = prev.filter((item) => item.source === 'manual');
      return [...newItems, ...manualItems];
    });
  };

  // Simple categorization logic
  const categorizeIngredient = (name: string): string => {
    const lowerName = name.toLowerCase();

    if (
      lowerName.includes('chicken') ||
      lowerName.includes('beef') ||
      lowerName.includes('fish') ||
      lowerName.includes('salmon') ||
      lowerName.includes('tofu') ||
      lowerName.includes('egg')
    ) {
      return 'protein';
    }
    if (
      lowerName.includes('milk') ||
      lowerName.includes('cheese') ||
      lowerName.includes('yogurt') ||
      lowerName.includes('butter')
    ) {
      return 'dairy';
    }
    if (
      lowerName.includes('lettuce') ||
      lowerName.includes('tomato') ||
      lowerName.includes('cucumber') ||
      lowerName.includes('avocado') ||
      lowerName.includes('berries') ||
      lowerName.includes('apple') ||
      lowerName.includes('banana') ||
      lowerName.includes('vegetable')
    ) {
      return 'produce';
    }
    if (
      lowerName.includes('rice') ||
      lowerName.includes('bread') ||
      lowerName.includes('pasta') ||
      lowerName.includes('oat') ||
      lowerName.includes('tortilla')
    ) {
      return 'grains';
    }
    if (
      lowerName.includes('oil') ||
      lowerName.includes('sauce') ||
      lowerName.includes('spice') ||
      lowerName.includes('salt') ||
      lowerName.includes('pepper') ||
      lowerName.includes('honey')
    ) {
      return 'pantry';
    }
    return 'other';
  };

  // Add manual item
  const handleAddManualItem = () => {
    if (!manualEntry.trim()) return;

    const parts = manualEntry.trim().split(',');
    const name = parts[0]?.trim() || manualEntry;
    const quantity = parts[1]?.trim() || '';

    const newItem: GroceryItem = {
      id: `manual-${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      quantity,
      category: categorizeIngredient(name),
      checked: false,
      source: 'manual',
    };

    setGroceryItems((prev) => [...prev, newItem]);
    setManualEntry('');
    setShowAddForm(false);
  };

  // Toggle item checked status
  const toggleItemChecked = (id: string) => {
    setGroceryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Delete item
  const deleteItem = (id: string) => {
    setGroceryItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear checked items
  const clearCheckedItems = () => {
    setGroceryItems((prev) => prev.filter((item) => !item.checked));
  };

  // Filter items by category
  const filteredItems =
    selectedCategory === 'all'
      ? groceryItems
      : groceryItems.filter((item) => item.category === selectedCategory);

  // Group items by category
  const itemsByCategory = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  // Calculate stats
  const totalItems = groceryItems.length;
  const checkedItems = groceryItems.filter((item) => item.checked).length;
  const plannedItems = groceryItems.filter((item) => item.source === 'planned').length;

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Grocery List</h2>
          <button className={styles.modalCloseButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.groceryList}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Grocery List</h2>
          <p className={styles.subtitle}>
            {checkedItems} of {totalItems} items checked • {plannedItems} from meal plan
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.generateButton} onClick={generateFromPlannedMeals}>
            🔄 Generate from Meal Plan
          </button>
          <button className={styles.addButton} onClick={() => setShowAddForm(!showAddForm)}>
            ➕ Add Item
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className={styles.addForm}>
          <input
            type="text"
            className={styles.addInput}
            placeholder="Item name, quantity (e.g., Milk, 1 gallon)"
            value={manualEntry}
            onChange={(e) => setManualEntry(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddManualItem()}
          />
          <button className={styles.addSubmitButton} onClick={handleAddManualItem}>
            Add
          </button>
          <button className={styles.cancelButton} onClick={() => setShowAddForm(false)}>
            Cancel
          </button>
        </div>
      )}

      <div className={styles.categoryFilter}>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.categoryButton} ${selectedCategory === category ? styles.categoryButtonActive : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {groceryItems.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🛒</div>
          <h3 className={styles.emptyTitle}>Your grocery list is empty</h3>
          <p className={styles.emptyText}>
            Generate a list from your meal plan or add items manually
          </p>
        </div>
      ) : (
        <div className={styles.itemsContainer}>
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <div key={category} className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)} ({items.length})
              </h3>
              <div className={styles.itemsList}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.groceryItem} ${item.checked ? styles.checkedItem : ''}`}
                  >
                    <label className={styles.itemCheckbox}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleItemChecked(item.id)}
                      />
                      <span className={styles.checkboxCustom}></span>
                    </label>
                    <div className={styles.itemContent}>
                      <div className={styles.itemName}>{item.name}</div>
                      {item.quantity && <div className={styles.itemQuantity}>{item.quantity}</div>}
                      {item.meals && item.meals.length > 0 && (
                        <div className={styles.itemMeals}>
                          From: {item.meals.slice(0, 2).join(', ')}
                          {item.meals.length > 2 && ` +${item.meals.length - 2} more`}
                        </div>
                      )}
                    </div>
                    <button
                      className={styles.deleteButton}
                      onClick={() => deleteItem(item.id)}
                      title="Delete item"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {checkedItems > 0 && (
        <div className={styles.footer}>
          <button className={styles.clearButton} onClick={clearCheckedItems}>
            🗑️ Clear Checked Items ({checkedItems})
          </button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default GroceryList;
