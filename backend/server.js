require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configure Helmet so it doesn't block popup auth flows. By default Helmet sets
// Cross-Origin-Opener-Policy which can interfere with OAuth popup windows.
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  // Cross-Origin-Embedder-Policy can also cause issues for some popup flows —
  // disable it here to avoid COEP/COOP interactions while developing.
  crossOriginEmbedderPolicy: false,
  // Configure Content Security Policy to allow localhost connections for development
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'http://localhost:*', 'https://*'],
    },
  } : false, // Disable CSP in development to allow Chrome DevTools
}));

// CORS configuration: allow dev frontend origin and Authorization header for preflight
// basically specifying what the frontend can access so google doens't get mad and block us
const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.warn('MONGO_URI not set in environment; database will not be connected.');
} else {
  mongoose.connect(mongoUri, { autoIndex: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

// Initialize Firebase Admin for ID token verification
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
  } else {
    // Will use application default credentials if present
    admin.initializeApp();
  }
  console.log('Firebase Admin initialized');
} catch (err) {
  console.warn('Firebase Admin initialization failed:', err?.message || err);
}

// Simple Mongoose user schema (minimal, matches the important fields)
const { Schema } = mongoose;
const MinimalUserSchema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String },
  photoURL: { type: String },
  onboardingCompleted: { type: Boolean, default: false },
  profile: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});
const MinimalUser = mongoose.models.MinimalUser || mongoose.model('MinimalUser', MinimalUserSchema);

// Middleware to verify Firebase ID token from Authorization header
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decoded; // attach decoded token
    return next();
  } catch (err) {
    console.error('Token verification failed', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ message: 'NutritionU API is running!' });
});

// Create or upsert a minimal user record (requires valid Firebase ID token)
app.post('/api/users/create', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseUid = req.firebaseUser.uid;
    const { email, displayName, photoURL } = req.body;

    if (!firebaseUid) return res.status(400).json({ message: 'Invalid firebase UID' });

    const now = new Date();
    const update = {
      firebaseUid,
      email: email || req.firebaseUser.email,
      displayName: displayName || req.firebaseUser.name || req.firebaseUser.email?.split('@')[0],
      photoURL: photoURL || req.firebaseUser.picture,
      updatedAt: now,
      $setOnInsert: { createdAt: now }
    };

    const user = await MinimalUser.findOneAndUpdate({ firebaseUid }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    return res.status(201).json(user);
  } catch (err) {
    console.error('Error creating/updating user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile after onboarding (requires token)
app.patch('/api/users/:firebaseUid', verifyFirebaseToken, async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    if (req.firebaseUser.uid !== firebaseUid) return res.status(403).json({ message: 'Forbidden' });
    const updates = { profile: req.body, onboardingCompleted: true, updatedAt: new Date() };
    const user = await MinimalUser.findOneAndUpdate({ firebaseUid }, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
