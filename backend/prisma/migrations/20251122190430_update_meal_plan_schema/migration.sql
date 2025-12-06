/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `MealPlanItem` table. All the data in the column will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,startDate]` on the table `MealPlan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `MealPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `MealPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `MealPlanItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "MealPlan" DROP CONSTRAINT "MealPlan_userId_fkey";

-- DropForeignKey
ALTER TABLE "MealPlanItem" DROP CONSTRAINT "MealPlanItem_mealPlanId_fkey";

-- DropForeignKey
ALTER TABLE "MealPlanItem" DROP CONSTRAINT "MealPlanItem_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- AlterTable: Handle existing data for MealPlan
-- Step 1: Add columns as nullable first
ALTER TABLE "MealPlan" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "MealPlan" ADD COLUMN "endDate" TIMESTAMP(3);

-- Step 2: Set default values for existing rows (this week's Monday to Sunday)
UPDATE "MealPlan" 
SET "startDate" = date_trunc('week', CURRENT_DATE) + INTERVAL '1 day',
    "endDate" = date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
WHERE "startDate" IS NULL;

-- Step 3: Make columns required
ALTER TABLE "MealPlan" ALTER COLUMN "startDate" SET NOT NULL;
ALTER TABLE "MealPlan" ALTER COLUMN "endDate" SET NOT NULL;

-- AlterTable: Handle existing data for MealPlanItem
-- Step 1: Add date column as nullable first
ALTER TABLE "MealPlanItem" ADD COLUMN "date" TIMESTAMP(3);
ALTER TABLE "MealPlanItem" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Calculate date from dayOfWeek for existing rows
UPDATE "MealPlanItem" 
SET "date" = date_trunc('week', CURRENT_DATE) + INTERVAL '1 day' + (COALESCE("dayOfWeek", 0) * INTERVAL '1 day')
WHERE "date" IS NULL;

-- Step 3: Make date column required and drop dayOfWeek
ALTER TABLE "MealPlanItem" ALTER COLUMN "date" SET NOT NULL;
ALTER TABLE "MealPlanItem" DROP COLUMN "dayOfWeek";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activityLevel" TEXT NOT NULL DEFAULT 'moderately_active',
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "bmi" DOUBLE PRECISION,
ADD COLUMN     "budget" JSONB,
ADD COLUMN     "culturalDiets" JSONB,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lifestyleDiets" JSONB,
ADD COLUMN     "medicalRestrictions" JSONB,
ADD COLUMN     "nutritionGoals" JSONB,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photoURL" TEXT,
ADD COLUMN     "planGenerationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "units" TEXT NOT NULL DEFAULT 'metric',
ADD COLUMN     "weight" DOUBLE PRECISION;

-- DropTable
DROP TABLE "Profile";

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_userId_startDate_key" ON "MealPlan"("userId", "startDate");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanItem" ADD CONSTRAINT "MealPlanItem_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanItem" ADD CONSTRAINT "MealPlanItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
