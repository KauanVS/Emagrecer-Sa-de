import { CaloricCalculation } from './types';

export function calculateCaloricDetails(data: CaloricCalculation) {
  const { gender, age, weight, height, activityLevel, goal } = data;

  // Harris-Benedict Equation (Revised)
  let tmb = 0;
  if (gender === 'male') {
    tmb = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    tmb = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }

  // Activity Multipliers
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const multiplier = multipliers[activityLevel] || 1.2;
  const vet = tmb * multiplier;

  // Deficits
  let deficit = 0;
  if (goal === 'healthy_loss') {
    deficit = 450;
  } else if (goal === 'moderate_loss') {
    deficit = 250;
  } else {
    deficit = 0;
  }

  const targetCalories = Math.max(1200, Math.round(vet - deficit));

  // Water target (ml)
  const waterMl = Math.round(weight * 35);

  // Macronutrients (Recommended for fat loss + muscle retention)
  // Protein: ~1.8g per kg
  const proteinGrams = Math.round(weight * 1.8);
  const proteinKcal = proteinGrams * 4;

  // Fat: ~0.8g per kg
  const fatGrams = Math.round(weight * 0.8);
  const fatKcal = fatGrams * 9;

  // Carbs: The remaining calories
  const remainingKcal = targetCalories - (proteinKcal + fatKcal);
  const carbGrams = Math.max(20, Math.round(remainingKcal / 4));

  return {
    tmb: Math.round(tmb),
    vet: Math.round(vet),
    targetCalories,
    waterMl,
    proteinGrams,
    fatGrams,
    carbGrams,
    proteinPercent: Math.round((proteinKcal / targetCalories) * 100),
    fatPercent: Math.round((fatKcal / targetCalories) * 100),
    carbPercent: Math.round(((carbGrams * 4) / targetCalories) * 100),
  };
}
