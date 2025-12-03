import express from 'express';
import cors from 'cors';
import userRoutes from './routes/UserRoutes.ts';
import recipeRoutes from './routes/RecipeRoutes.ts';
import chatbotRoutes from './routes/ChatbotRoutes.ts';
import mealPlanRoutes from './routes/MealPlanRoutes.ts';
import groceryListRoutes from './routes/GroceryListRoutes.ts';


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Enable CORS so the frontend (vite dev server) can call the API.
// Allow Authorization header and common methods. Use VITE/CORS env var if present.
const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Routes
app.get('/', (_, res) => {
  res.send('Welcome to the NutritionU API!');
});
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/chatbot', chatbotRoutes); // Open AI chat communcations
app.use('/api', mealPlanRoutes); // Meal plan routes
app.use('/api/grocery', groceryListRoutes);

// Start the server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();