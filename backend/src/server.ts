import express from 'express';
import { connectDB } from './db.ts';
import userRoutes from './routes/UserRoutes.ts';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (_, res) => {
  res.send('Welcome to the NutritionU API!');
});
app.use('/api/users', userRoutes);

// Start the server
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();