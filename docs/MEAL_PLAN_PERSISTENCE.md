# Meal Plan Persistence Implementation Guide

## Overview
This implementation adds full backend persistence for meal plans, ensuring user data is saved to the PostgreSQL database and maintained across page refreshes.

## What Was Added

### Backend Changes

#### 1. New Controller: `MealPlanController.ts`
Location: `backend/src/controllers/MealPlanController.ts`

Endpoints created:
- `POST /api/users/:userId/meal-plans` - Create a new meal plan
- `GET /api/users/:userId/meal-plans` - Get all meal plans for a user
- `GET /api/users/:userId/meal-plans/current` - Get current week's meal plan
- `GET /api/meal-plans/:mealPlanId` - Get specific meal plan
- `PUT /api/meal-plans/:mealPlanId` - Update a meal plan
- `DELETE /api/meal-plans/:mealPlanId` - Delete a meal plan
- `POST /api/meal-plans/:mealPlanId/items` - Add item to meal plan
- `DELETE /api/meal-plans/items/:itemId` - Remove item from meal plan

#### 2. New Routes: `MealPlanRoutes.ts`
Location: `backend/src/routes/MealPlanRoutes.ts`
- Defines all meal plan API routes

#### 3. Updated Server: `server.ts`
- Added meal plan routes to the Express app

#### 4. Updated Prisma Schema
- Added cascade delete to `MealPlan` and `MealPlanItem` relationships
- Ensures data integrity when users or recipes are deleted

### Frontend Changes

#### 1. New Service: `mealPlanService.ts`
Location: `frontend/services/mealPlanService.ts`
- Handles all API calls for meal plans
- Type-safe interfaces for MealPlan and MealPlanItem

#### 2. New Hook: `useMealPlan.ts`
Location: `frontend/src/hooks/useMealPlan.ts`
- Custom React hook for managing meal plan state
- Auto-saves changes to backend (debounced for 2 seconds)
- Loads meal plan on component mount
- Handles conversion between frontend and backend data formats

## How to Integrate into Dashboard

### Step 1: Update Dashboard Component

Replace the current `useState` for `weeklyMealPlan` with the `useMealPlan` hook:

\`\`\`typescript
// In Dashboard.tsx or DashboardContentSwitcher component
import { useMealPlan } from '../../hooks/useMealPlan';
import { useAuth } from '../../contexts/AuthContext';

function DashboardContentSwitcher() {
  const { user } = useAuth();
  const { 
    weeklyMealPlan, 
    setWeeklyMealPlan, 
    loading, 
    error,
    saveMealPlan // Optional: for manual save button
  } = useMealPlan(user?.firebaseUid);

  // Show loading state
  if (loading) {
    return <div>Loading your meal plan...</div>;
  }

  // Show error if any
  if (error) {
    console.error(error);
  }

  // Rest of your component...
}
\`\`\`

### Step 2: Recipe Management

The current implementation requires recipe IDs. You have two options:

**Option A: Store recipes first, then create meal plans**
When a user adds a meal to their plan:
1. First, save the recipe to the database using the recipe endpoints
2. Then, add the meal plan item with the returned recipe ID

**Option B: Enhance the meal plan service**
Create a combined service that:
1. Checks if recipe exists in DB (by external ID or title)
2. Creates recipe if it doesn't exist
3. Then creates the meal plan item

### Step 3: Migration Command

After making the schema changes, run:

\`\`\`bash
cd backend
npx prisma migrate dev --name add_cascade_deletes
\`\`\`

### Step 4: Start the Backend

Make sure your backend server is running:

\`\`\`bash
cd backend
npm run dev
\`\`\`

## Data Flow

1. **User loads Dashboard** → `useMealPlan` hook calls API → Loads current week's meal plan
2. **User modifies meal plan** → State updates locally → Auto-saves to DB after 2 seconds
3. **User refreshes page** → Hook loads saved data from DB → UI reflects saved state

## Important Notes

### Recipe ID Requirement
The current implementation requires each meal to have a recipe ID. You'll need to:
- Create recipes in the database before adding them to meal plans
- OR modify the Meal interface to include more recipe data
- OR create a temporary recipe when adding to meal plan

### Environment Variables
Make sure `VITE_API_BASE` is set in your `.env` file:
\`\`\`
VITE_API_BASE=http://localhost:3001
\`\`\`

### Error Handling
The hook provides error state. Consider showing user-friendly messages:
\`\`\`typescript
{error && (
  <div className="error-message">
    Failed to sync meal plan. Your changes are saved locally.
    <button onClick={saveMealPlan}>Retry</button>
  </div>
)}
\`\`\`

## Next Steps

1. **Run the migration** to update your database schema
2. **Test the endpoints** using a tool like Postman or Thunder Client
3. **Update Dashboard** to use the `useMealPlan` hook
4. **Implement recipe storage** before meal plan items (or modify the service)
5. **Add loading and error states** to improve UX
6. **Consider adding optimistic updates** for better perceived performance

## Testing Checklist

- [ ] Create a meal plan via API
- [ ] Load meal plan on Dashboard mount
- [ ] Add meals to existing plan
- [ ] Remove meals from plan
- [ ] Refresh page - data persists
- [ ] Multiple users have separate meal plans
- [ ] Delete user - their meal plans are deleted (cascade)

## Future Enhancements

1. **Offline Support**: Use IndexedDB or localStorage as cache
2. **Conflict Resolution**: Handle simultaneous edits from multiple devices
3. **History**: Track meal plan versions for undo/redo
4. **Sharing**: Allow users to share meal plans
5. **Templates**: Pre-made meal plan templates
