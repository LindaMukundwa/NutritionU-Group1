require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ message: 'NutritionU API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});