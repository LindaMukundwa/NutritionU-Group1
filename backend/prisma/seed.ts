import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    // Create a test user with a profile
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        firebaseUid: 'test123',
        profile: {
          create: {
            onboardingCompleted: true,
            units: 'metric',
            extra: {
              displayName: 'Test User',
              age: 25,
              height: 170,
              weight: 70,
              activityLevel: 'moderately_active',
              medicalRestrictions: {
                none: true
              },
              nutritionGoals: {
                goals: 'Eat Healthier',
                calories: 2000
              }
            }
          }
        }
      }
    });

    // Create some sample recipes
    const recipes = await Promise.all([
      prisma.recipe.create({
        data: {
          title: 'Spaghetti Bolognese',
          description: 'Classic Italian pasta dish',
          imageUrl: 'https://example.com/spaghetti.jpg',
          mealType: 'dinner',
          totalTime: 45,
          estimatedCostPerServing: 5.99,
          nutritionInfo: {
            calories: 650,
            protein: 35,
            carbs: 70,
            fats: 22
          },
          ingredients: [
            { name: 'Spaghetti', amount: '400g' },
            { name: 'Ground Beef', amount: '500g' }
          ],
          instructions: {
            steps: [
              'Boil the pasta',
              'Cook the meat sauce',
              'Combine and serve'
            ]
          },
          dietaryTags: ['high-protein']
        }
      }),
      prisma.recipe.create({
        data: {
          title: 'Chicken Stir Fry',
          description: 'Quick and healthy stir fry',
          imageUrl: 'https://example.com/stirfry.jpg',
          mealType: 'dinner',
          totalTime: 30,
          estimatedCostPerServing: 4.99,
          nutritionInfo: {
            calories: 450,
            protein: 40,
            carbs: 35,
            fats: 15
          },
          ingredients: [
            { name: 'Chicken Breast', amount: '400g' },
            { name: 'Mixed Vegetables', amount: '300g' }
          ],
          instructions: {
            steps: [
              'Cut chicken into pieces',
              'Stir fry vegetables',
              'Add sauce and serve'
            ]
          },
          dietaryTags: ['low-carb', 'high-protein']
        }
      })
    ]);

    // Add one recipe as a favorite for the test user
    await prisma.favorite.create({
      data: {
        userId: user.id,
        recipeId: recipes[0].id
      }
    });

    console.log('✅ Seed data created successfully');
    
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });