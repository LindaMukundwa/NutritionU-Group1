import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); 

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set.');
  process.exit(1);
}
// Function to connect to MongoDB
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}