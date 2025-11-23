import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// IMPORTANT: The project is migrating from MongoDB -> Postgres (Prisma).
// This file keeps a backward-compatible helper to connect to MongoDB only
// if a MONGODB_URI is provided. Do NOT keep credentials in source.
const MONGODB_URI = process.env.MONGODB_URI;

// If no MONGODB_URI is set, we skip connecting to MongoDB. New code should
// use the Prisma client instead (see backend/src/lib/prisma.ts).
export async function connectDB(): Promise<void> {
  if (!MONGODB_URI) {
    console.log('ℹ️  MONGODB_URI not provided — skipping MongoDB connection (using Prisma).');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    // Don't exit the process here; allow the server to start so you can
    // run migrations or inspect the problem. If you rely on MongoDB, set
    // MONGODB_URI in your environment.
  }
}