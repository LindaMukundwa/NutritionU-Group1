# NutritionU 🥗

**A smart meal planning platform that helps you organize your nutrition, discover recipes, and maintain healthy eating habits.**

<img width="150" height="150" align="center" alt="Untitled design (1)" src="https://github.com/user-attachments/assets/b134afbf-bd35-4378-bbf4-505075d1954e" />

NutritionU is a full-stack web application that combines meal planning, recipe discovery, and personalized nutrition tracking. Built with modern web technologies and deployed on cloud infrastructure for reliable, scalable performance.

---

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [How It Works](#-how-it-works)
- [Installation & Setup](#-installation--setup)
- [Deployment](#-deployment)
- [Privacy Policy](#-privacy-policy)
- [Development](#-development)
- [Contributing](#-contributing)

---

## ✨ Features

### 🍽️ Meal Planning
- **Weekly Meal Planner**: Organize your meals for the entire week (breakfast, lunch, dinner, snacks)
- **Auto-Save**: Changes automatically save to the cloud after 2 seconds
- **Persistent Storage**: Your meal plans survive page refreshes and browser restarts
- **Date Navigation**: Easily browse different weeks

### 🔍 Recipe Discovery
- **Recipe Search**: Find recipes from a comprehensive database
- **Nutritional Information**: View calories, macros (protein, carbs, fats), and other nutrients
- **Ingredient Lists**: See full ingredient lists and preparation instructions
- **Add to Planner**: One-click addition of recipes to your meal plan

### 📊 Nutrition Tracking
- **Personalized Goals**: Set custom nutrition goals based on your needs
- **Daily Calorie Tracking**: Monitor your caloric intake across all meals
- **Macro Distribution**: Track protein, carbohydrates, and fats
- **Budget Management**: Set and track a grocery budget

### 🛒 Grocery List
- **Auto-Generated Lists**: Automatically compile ingredients from your meal plan
- **Week-Based**: Organize groceries by the week
- **Easy Management**: Check off items as you shop

### 🤖 AI Assistant
- **Nutrition Guidance**: Get personalized nutrition advice
- **Recipe Recommendations**: Receive meal suggestions based on your preferences
- **Smart Chatbot**: Ask questions about nutrition, meal prep, and healthy eating

---

## 🏗️ System Architecture

NutritionU follows a modern three-tier architecture:

```
┌─────────────────┐
│   Frontend      │  React + TypeScript (Vercel)
│   (Vite)        │  
└────────┬────────┘
         │ HTTPS/JSON
         ▼
┌─────────────────┐
│   Backend       │  Express + TypeScript (Railway)
│   (Node.js)     │  
└────────┬────────┘
         │ Prisma ORM
         ▼
┌─────────────────┐
│   Database      │  PostgreSQL (Neon)
│   (Cloud)       │  
└─────────────────┘
```

### Frontend Layer
- **Framework**: React 19.1.1 with TypeScript 5.8.3
- **Build Tool**: Vite 7.1.7 for fast development and optimized builds
- **Authentication**: Firebase Auth for secure user management
- **State Management**: React Context API for global auth state
- **Deployment**: Vercel (automatic deployments on push)

### Backend Layer
- **Runtime**: Node.js 20 with Express 5.1.0
- **Language**: TypeScript 5.9.3
- **ORM**: Prisma 6.19.0 for type-safe database access
- **Deployment**: Railway (containerized via Docker)
- **API**: RESTful endpoints for users, recipes, and meal plans

### Database Layer
- **Database**: PostgreSQL (Neon cloud hosting)
- **Tables**: User, Recipe, MealPlan, MealPlanItem, Favorite
- **Migrations**: Managed via Prisma Migrate
- **Connections**: Pooled connections for optimal performance

---

## 🔄 How It Works

### User Authentication Flow
1. User signs up/logs in via **Firebase Authentication**
2. Firebase returns a unique `firebaseUid` token
3. Backend creates a corresponding User record in PostgreSQL
4. Frontend stores auth state in React Context
5. All API requests include the Firebase auth token

### Adding a Meal to Your Plan
```
User finds recipe → Clicks "Add to Planner"
         ↓
Recipe saved to database (PostgreSQL)
         ↓
Local state updated (React)
         ↓
Auto-save triggered (2-second debounce)
         ↓
MealPlanItem created in database
         ↓
Meal persists across sessions 
```

### Data Persistence Mechanism
- **Optimistic Updates**: UI updates immediately for good UX
- **Debounced Saves**: Changes batch together to reduce API calls
- **Background Sync**: Data saves to cloud without blocking the UI
- **Automatic Recovery**: On page load, the latest data fetches from the database

### Weekly Meal Plan Loading
```
1. User logs in with Firebase
2. Dashboard component mounts
3. Calculate current week (Monday-Sunday)
4. Fetch meal plans: GET /api/users/{userId}/meal-plans/range?startDate=X&endDate=Y
5. Backend queries PostgreSQL with Prisma:
   - Find MealPlan for the date range
   - Include related MealPlanItems
   - Include nested Recipe data
6. Convert backend format to frontend format
7. Populate weeklyMealPlan state
8. Render meals in calendar view ✅
```

### Data Format Conversion
**Backend Format** (Normalized Database):
```json
{
  "id": 1,
  "userId": 42,
  "startDate": "2025-12-02",
  "endDate": "2025-12-08",
  "items": [
    {
      "id": 1,
      "recipeId": 123,
      "date": "2025-12-06",
      "mealType": "breakfast",
      "recipe": { "title": "Oatmeal Bowl", "calories": 350 }
    }
  ]
}
```

**Frontend Format** (Optimized for Rendering):
```json
{
  "2025-12-06": {
    "breakfast": [
      { "recipeId": 123, "name": "Oatmeal Bowl", "calories": 350 }
    ],
    "lunch": [],
    "dinner": [],
    "snacks": []
  }
}
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 7.1.7 | Build tool |
| Firebase | 11.0.2 | Authentication |
| CSS Modules | - | Component styling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 | Runtime |
| Express | 5.1.0 | Web framework |
| TypeScript | 5.9.3 | Type safety |
| Prisma | 6.19.0 | ORM |
| tsx | 4.19.2 | TS execution |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary database |
| Neon | Cloud hosting |
| Prisma Schema | Data modeling |

### DevOps
| Tool | Purpose |
|------|---------|
| Docker | Backend containerization |
| Railway | Backend deployment |
| Vercel | Frontend deployment |
| Git/GitHub | Version control |

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Git
- PostgreSQL (for local development)

### Local Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/LindaMukundwa/NutritionU-Group1.git
cd NutritionU-Group1
```

2. **Set up the backend:**
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and other secrets

# Run database migrations
npx prisma migrate dev

# Seed the database to check it works (optional)
npx prisma db seed

# Start the development server
npm run dev
```

3. **Set up the frontend:**
```bash
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Firebase config and API base URL

# Start the development server
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nutritionu"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
OPENAI_API_KEY="your-openai-key"  # This is for the AI assistant
```

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE="http://localhost:3001"
VITE_FIREBASE_API_KEY="your-firebase-key"
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="your-app-id"
```

---

## 🚀 Deployment

### Production Architecture
```
GitHub Repository
      ↓ (push to main)
      ├─→ Vercel (auto-deploy frontend)
      └─→ Railway (auto-deploy backend)
            ↓
        Neon Database (PostgreSQL)
```

### Backend Deployment (Railway)

1. **Create a Railway project**
2. **Connect your GitHub repository**
3. **Configure the service:**
   - Root Directory: `backend`
   - Builder: Dockerfile
   - Start Command: `npm start`

4. **Set environment variables:**
   ```
   DATABASE_URL=postgresql://...  (from Neon)
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://nutritionu.vercel.app
   ```

5. **Deploy:**
   - Railway automatically builds and deploys on git push
   - Uses the `backend/Dockerfile` for containerization

### Frontend Deployment (Vercel)

1. **Import project to Vercel**
2. **Configure build settings:**
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set environment variables:**
   - Add all `VITE_*` variables from your `.env` file
   - Set `VITE_API_BASE` to your Railway backend URL

4. **Deploy:**
   - Vercel automatically deploys on git push to main
   - Preview deployments created for pull requests

### Database Setup (Neon)

1. **Create a Neon account** at https://neon.tech
2. **Create a new project**
3. **Copy the connection string**
4. **Run migrations:**
   ```bash
   cd backend
   DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
   ```

---

## 🔒 Privacy Policy

### Data We Collect

**Account Information:**
- Email address (via Firebase Authentication)
- Display name
- Firebase UID (unique identifier)

**User-Generated Content:**
- Meal plans and scheduled meals
- Favorite recipes
- Nutrition goals and preferences
- Budget settings

**Recipe Data:**
- Recipe titles, ingredients, and instructions
- Nutritional information (calories, macros, etc.)
- Cooking directions

### How We Use Your Data

1. **Service Delivery**: To provide meal planning, recipe discovery, and nutrition tracking features
2. **Personalization**: To customize your experience based on your goals and preferences
3. **Data Persistence**: To save your meal plans across devices and sessions
4. **Analytics**: To improve the application and understand usage patterns which is aggregated and anonymized

### Data Storage & Security

**Storage Location:**
- Authentication data: Firebase (Google Cloud Platform)
- Application data: Neon PostgreSQL (AWS, encrypted at rest)
- User sessions: Encrypted tokens, HTTPS-only transmission

**Security Measures:**
- All data transmitted over HTTPS/TLS
- Database connections use SSL
- Authentication tokens expire after inactivity
- Password hashing via Firebase using bcrypt
- CORS restrictions to prevent unauthorized access
- Environment variables for sensitive credentials

### Data Retention

- **Active accounts**: Data retained indefinitely while account is active
- **Inactive accounts**: Data may be archived after 2 years of inactivity
- **Deleted accounts**: All user data permanently deleted within 30 days

### Your Rights

You have the right to:
- **Access**: View all data we store about you
- **Correction**: Update incorrect information
- **Deletion**: Request complete account and data deletion
- **Export**: Download your data in JSON format
- **Opt-out**: Disable optional features (e.g., AI assistant)

### Third-Party Services

We use the following third-party services:
- **Firebase (Google)**: Authentication and user management
- **Neon**: Database hosting
- **Railway**: Backend application hosting
- **Vercel**: Frontend application hosting
- **OpenAI**: AI assistant feature and meal plan personalization

Each service has its own privacy policy. We do not sell your data to third parties.

### Data Sharing

We **do not** share your personal data with third parties except:
- When required by law
- To protect our rights or safety
- With your explicit consent

### Cookies

We use minimal cookies:
- **Authentication token**: To keep you logged in
- **Session data**: Temporary, cleared on logout


### Changes to Privacy Policy

We may update this policy periodically. Users will be notified of significant changes via email or with in app notifications.

### Contact

For privacy concerns or data requests:
- Email: Linda.Mukundwa1@marist.edu
- GitHub Issues: https://github.com/LindaMukundwa/NutritionU-Group1/issues

---

## 💻 Development

### Creating a New Component

Use the React component generator:
```bash
cd frontend
npx generate-react-cli component ComponentName
```

This creates a new component with:
- `ComponentName.tsx` (component file)
- `ComponentName.module.css` (scoped styles)
- TypeScript types and props

### Database Changes

**Creating a migration:**
```bash
cd backend

# 1. Edit prisma/schema.prisma
# 2. Generate migration
npx prisma migrate dev --name describe_your_change

# 3. Migration is auto-applied to local database
```

**Applying to production:**
```bash
# Migrations auto-apply on Railway deployment
# Or manually:
npx prisma migrate deploy
```

### Project Structure

```
NutritionU-Group1/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Context providers
│   │   ├── pages/         # Page components
│   │   └── config/        # Firebase config
│   ├── services/          # API service layer
│   └── public/            # Static assets
│
├── backend/               # Express backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # API routes
│   │   ├── models/        # Data models
│   │   └── services/      # Business logic
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/    # Migration history
│   └── Dockerfile         # Container config
│
├── shared/                # Shared TypeScript types
│   └── types/
│
└── docs/                  # Documentation
```

### API Endpoints

**User Routes:**
- `POST /api/users` - Create user
- `GET /api/users/:firebaseUid` - Get user by Firebase UID
- `PUT /api/users/:firebaseUid` - Update user

**Recipe Routes:**
- `GET /api/recipes` - Search recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create recipe

**Meal Plan Routes:**
- `POST /api/users/:userId/meal-plans` - Create/update meal plan
- `GET /api/users/:userId/meal-plans/range` - Get plans by date range
- `GET /api/users/:userId/meal-plans/current-week` - Get current week
- `PUT /api/meal-plans/:id` - Update meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/helpful-feature
   ```
3. **Make your changes and commit:**
   ```bash
   git commit -m "Adding helpful feature"
   ```
4. **Push to your fork:**
   ```bash
   git push origin feature/helpful-feature
   ```
5. **Open a Pull Request**

### Code Style

- **TypeScript**: Use strict type checking
- **React**: Functional components with hooks
- **CSS**: Use CSS Modules for component styles
- **Commits**: Follow conventional commit format

### Testing

Before submitting:
```bash
# Frontend
cd frontend
npm run build  # Ensure it builds
npm run dev 

# Backend
cd backend
npm run build  # Ensure TypeScript compiles
npx prisma validate  # Validate schema
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Firebase** for authentication infrastructure
- **Neon** for cloud PostgreSQL hosting
- **Railway** for seamless backend deployment
- **Vercel** for frontend hosting
- **Prisma** for excellent database tooling
- **FatSecret API** for recipe and nutrition data

---

## Support

- **Issues**: https://github.com/LindaMukundwa/NutritionU-Group1/issues
- **Discussions**: https://github.com/LindaMukundwa/NutritionU-Group1/discussions
- **Email**: Linda.Mukundwa1@marist.edu

---

**Built with ❤️ by the NutritionU Team**
