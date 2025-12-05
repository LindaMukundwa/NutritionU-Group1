import type { Request, Response } from 'express';
import prisma from '../lib/prisma.ts';

const operationLocks = new Map<string, number>();
const OPERATION_DELAY_MS = 500; // 500ms delay between operations

// Helper function to check and enforce delay
const enforceOperationDelay = (itemId: string): boolean => {
  const now = Date.now();
  const lastOperation = operationLocks.get(itemId);
  
  if (lastOperation && (now - lastOperation) < OPERATION_DELAY_MS) {
    return false; 
  }
  
  operationLocks.set(itemId, now);
  return true; // Allow to continue
};

// Create a new grocery list for a user
export const createGroceryList = async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.params;
    const { name, mealPlanId } = req.body;

    // Verify user exists by firebaseUid
    const user = await prisma.user.findUnique({
      where: { firebaseUid }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If mealPlanId is provided, verify it exists and belongs to the user
    if (mealPlanId) {
      const mealPlanIdInt = parseInt(mealPlanId);
      if (isNaN(mealPlanIdInt)) {
        return res.status(400).json({ error: 'Invalid meal plan ID' });
      }

      const mealPlan = await prisma.mealPlan.findFirst({
        where: {
          id: mealPlanIdInt,
          userId: user.id
        }
      });

      if (!mealPlan) {
        return res.status(404).json({ error: 'Meal plan not found or does not belong to user' });
      }
    }

    const newGroceryList = await prisma.groceryList.create({
      data: {
        name: name || `Grocery List ${new Date().toLocaleDateString()}`,
        userId: user.id,
        mealPlanId: mealPlanId ? parseInt(mealPlanId) : null
      },
      include: {
        items: true
      }
    });

    res.status(201).json(newGroceryList);
  } catch (error) {
    console.error('Error creating grocery list:', error);
    res.status(500).json({ error: 'Failed to create grocery list' });
  }
};

// Get all grocery lists for a user
export const getUserGroceryLists = async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.params;

    // Find user by firebaseUid
    const user = await prisma.user.findUnique({
      where: { firebaseUid }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const groceryLists = await prisma.groceryList.findMany({
      where: { userId: user.id },
      include: {
        items: true,
        mealPlan: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(groceryLists);
  } catch (error) {
    console.error('Error fetching user grocery lists:', error);
    res.status(500).json({ error: 'Failed to fetch grocery lists' });
  }
};

// Get a specific grocery list with all items
export const getGroceryList = async (req: Request, res: Response) => {
  try {
    const { groceryListId } = req.params;

    const groceryList = await prisma.groceryList.findUnique({
      where: { id: groceryListId },
      include: {
        items: {
          orderBy: { name: 'asc' }
        },
        mealPlan: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        },
        user: {
          select: {
            id: true,
            firebaseUid: true,
            displayName: true,
            email: true
          }
        }
      }
    });

    if (!groceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    res.status(200).json(groceryList);
  } catch (error) {
    console.error('Error fetching grocery list:', error);
    res.status(500).json({ error: 'Failed to fetch grocery list' });
  }
};

// Update grocery list metadata (name, etc.)
export const updateGroceryList = async (req: Request, res: Response) => {
  try {
    const { groceryListId } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Valid name is required' });
    }

    // Check if grocery list exists
    const existingGroceryList = await prisma.groceryList.findUnique({
      where: { id: groceryListId }
    });

    if (!existingGroceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    const updatedGroceryList = await prisma.groceryList.update({
      where: { id: groceryListId },
      data: {
        name: name.trim()
      },
      include: {
        items: true
      }
    });

    res.status(200).json(updatedGroceryList);
  } catch (error) {
    console.error('Error updating grocery list:', error);
    res.status(500).json({ error: 'Failed to update grocery list' });
  }
};

// Delete entire grocery list and all items
export const deleteGroceryList = async (req: Request, res: Response) => {
  try {
    const { groceryListId } = req.params;

    // Check if grocery list exists
    const existingGroceryList = await prisma.groceryList.findUnique({
      where: { id: groceryListId }
    });

    if (!existingGroceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    // Delete grocery list (items will be deleted automatically due to cascade)
    await prisma.groceryList.delete({
      where: { id: groceryListId }
    });

    res.status(200).json({ message: 'Grocery list deleted successfully' });
  } catch (error) {
    console.error('Error deleting grocery list:', error);
    res.status(500).json({ error: 'Failed to delete grocery list' });
  }
};

// Add a new item to grocery list
export const addGroceryItem = async (req: Request, res: Response) => {
  try {
    const { groceryListId } = req.params;
    const { name, quantity, source } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    if (!quantity || typeof quantity !== 'string' || quantity.trim().length === 0) {
      return res.status(400).json({ error: 'Item quantity is required' });
    }

    // Check if grocery list exists
    const existingGroceryList = await prisma.groceryList.findUnique({
      where: { id: groceryListId }
    });

    if (!existingGroceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    const newGroceryItem = await prisma.groceryItem.create({
      data: {
        name: name.trim(),
        quantity: quantity.trim(),
        source: source?.trim() || null,
        groceryListId
      }
    });

    res.status(201).json(newGroceryItem);
  } catch (error) {
    console.error('Error adding grocery item:', error);
    res.status(500).json({ error: 'Failed to add grocery item' });
  }
};

// Update an existing grocery item
export const updateGroceryItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { name, quantity, source, checked } = req.body;

    // Check if item exists
    const existingItem = await prisma.groceryItem.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Grocery item not found' });
    }

    // Check required fields if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ error: 'Valid item name is required' });
    }

    if (quantity !== undefined && (typeof quantity !== 'string' || quantity.trim().length === 0)) {
      return res.status(400).json({ error: 'Valid item quantity is required' });
    }

    if (checked !== undefined && typeof checked !== 'boolean') {
      return res.status(400).json({ error: 'Checked status must be a boolean' });
    }

    // Build update data object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (quantity !== undefined) updateData.quantity = quantity.trim();
    if (source !== undefined) updateData.source = source?.trim() || null;
    if (checked !== undefined) updateData.checked = checked;

    const updatedGroceryItem = await prisma.groceryItem.update({
      where: { id: itemId },
      data: updateData
    });

    res.status(200).json(updatedGroceryItem);
  } catch (error) {
    console.error('Error updating grocery item:', error);
    res.status(500).json({ error: 'Failed to update grocery item' });
  }
};

// Delete a specific grocery item
export const deleteGroceryItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    // Enforce delay
    if (!enforceOperationDelay(itemId)) {
      return res.status(429).json({ error: 'Please wait before performing another action on this item' });
    }

    const existingItem = await prisma.groceryItem.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Grocery item not found' });
    }

    await prisma.groceryItem.delete({
      where: { id: itemId }
    });
    console.log(`Grocery item deleted: ${existingItem.name} (ID: ${itemId})`);
    res.status(200).json({ message: 'Grocery item deleted successfully' });
  } catch (error) {
    console.error('Error deleting grocery item:', error);
    res.status(500).json({ error: 'Failed to delete grocery item' });
  }
};

// Toggle checked status of an item
export const toggleGroceryItemChecked = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    // Enforce delay
    if (!enforceOperationDelay(itemId)) {
      return res.status(429).json({ error: 'Please wait before performing another action on this item' });
    }

    const existingItem = await prisma.groceryItem.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Grocery item not found' });
    }

    const updatedGroceryItem = await prisma.groceryItem.update({
      where: { id: itemId },
      data: {
        checked: !existingItem.checked
      }
    });

    res.status(200).json(updatedGroceryItem);
  } catch (error) {
    console.error('Error toggling grocery item:', error);
    res.status(500).json({ error: 'Failed to toggle grocery item' });
  }
};

// Clear all checked items from a grocery list
export const clearCheckedItems = async (req: Request, res: Response) => {
  try {
    const { groceryListId } = req.params;

    // Check if grocery list exists
    const existingGroceryList = await prisma.groceryList.findUnique({
      where: { id: groceryListId }
    });

    if (!existingGroceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    const deletedItems = await prisma.groceryItem.deleteMany({
      where: {
        groceryListId,
        checked: true
      }
    });

    res.status(200).json({ 
      message: 'Checked items cleared successfully',
      deletedCount: deletedItems.count
    });
  } catch (error) {
    console.error('Error clearing checked items:', error);
    res.status(500).json({ error: 'Failed to clear checked items' });
  }
};

// Generate grocery items from a meal plan
export const generateGroceryListFromMealPlan = async (req: Request, res: Response) => {
  try {
    const { groceryListId, mealPlanId } = req.params;

    const mealPlanIdInt = parseInt(mealPlanId);
    if (isNaN(mealPlanIdInt)) {
      return res.status(400).json({ error: 'Invalid meal plan ID' });
    }

    // Check if grocery list exists
    const existingGroceryList = await prisma.groceryList.findUnique({
      where: { id: groceryListId },
      include: { user: true }
    });

    if (!existingGroceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    // Check if meal plan exists and belongs to the same user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: mealPlanIdInt,
        userId: existingGroceryList.userId
      },
      include: {
        items: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                ingredients: true
              }
            }
          }
        }
      }
    });

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found or does not belong to user' });
    }

    // Extract ingredients from all recipes in the meal plan
    const ingredientMap = new Map<string, { quantity: string; source: string }>();

    mealPlan.items.forEach(mealPlanItem => {
      const recipe = mealPlanItem.recipe;
      const ingredients = recipe.ingredients as any[];

      if (Array.isArray(ingredients)) {
        ingredients.forEach(ingredient => {
          const ingredientName = ingredient.name || ingredient;
          const ingredientQuantity = ingredient.quantity || '1 serving';
          
          if (typeof ingredientName === 'string') {
            const key = ingredientName.toLowerCase().trim();
            
            if (ingredientMap.has(key)) {
            } else {
              ingredientMap.set(key, {
                quantity: ingredientQuantity,
                source: recipe.title
              });
            }
          }
        });
      }
    });

    const groceryItemsData = Array.from(ingredientMap.entries()).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
      quantity: data.quantity,
      source: data.source,
      groceryListId,
      checked: false
    }));

    if (groceryItemsData.length === 0) {
      return res.status(400).json({ error: 'No ingredients found in meal plan recipes' });
    }

    const createdItems = await prisma.groceryItem.createMany({
      data: groceryItemsData
    });

    await prisma.groceryList.update({
      where: { id: groceryListId },
      data: { mealPlanId: mealPlanIdInt }
    });

    res.status(201).json({
      message: 'Grocery items generated successfully',
      itemsCreated: createdItems.count
    });
  } catch (error) {
    console.error('Error generating grocery list from meal plan:', error);
    res.status(500).json({ error: 'Failed to generate grocery list from meal plan' });
  }
};

// Duplicate an existing grocery list
export const duplicateGroceryList = async (req: Request, res: Response) => {
  try {
    const { groceryListId } = req.params;
    const { name } = req.body;

    const originalGroceryList = await prisma.groceryList.findUnique({
      where: { id: groceryListId },
      include: {
        items: true
      }
    });

    if (!originalGroceryList) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    // Create new grocery list
    const duplicatedGroceryList = await prisma.groceryList.create({
      data: {
        name: name || `${originalGroceryList.name} (Copy)`,
        userId: originalGroceryList.userId,
        mealPlanId: null 
      }
    });

    // Create duplicate items if any exist
    if (originalGroceryList.items.length > 0) {
      const duplicatedItemsData = originalGroceryList.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        source: item.source,
        checked: false,
        groceryListId: duplicatedGroceryList.id
      }));

      await prisma.groceryItem.createMany({
        data: duplicatedItemsData
      });
    }

    const completeDuplicatedList = await prisma.groceryList.findUnique({
      where: { id: duplicatedGroceryList.id },
      include: {
        items: true
      }
    });

    res.status(201).json(completeDuplicatedList);
  } catch (error) {
    console.error('Error duplicating grocery list:', error);
    res.status(500).json({ error: 'Failed to duplicate grocery list' });
  }
};