/*
  Warnings:

  - A unique constraint covering the columns `[mealPlanId,date,mealType]` on the table `MealPlanItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MealPlanItem_mealPlanId_date_mealType_key" ON "MealPlanItem"("mealPlanId", "date", "mealType");
