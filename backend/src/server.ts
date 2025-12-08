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
// Enable CORS for multiple origins (development + production)
const allowedOrigins = [
  'http://localhost:5173',  // Local development
  'http://localhost:3000',  // Alternative local port
  'https://nutritionu.vercel.app',  // Production frontend
  process.env.CORS_ORIGIN,  // Custom origin from env
].filter(Boolean);  // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
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