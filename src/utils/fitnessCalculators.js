/**
 * Calculates 1 Rep Max (1RM) using Epley Formula
 * 1RM = Weight * (1 + Reps / 30)
 */
export const calculate1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 0) return 0;
  if (reps === 1) return Math.round(weight);
  const epley = weight * (1 + reps / 30);
  return Math.round(epley);
};

/**
 * Calculates barbell plates breakdown for target total weight (in kg)
 * Standard Olympic bar: 20kg
 * Available plates: 25, 20, 15, 10, 5, 2.5, 1.25
 */
export const calculateBarbellPlates = (targetWeightKg, barWeightKg = 20) => {
  if (targetWeightKg <= barWeightKg) {
    return { barWeight: barWeightKg, sideWeight: 0, platesPerSide: [] };
  }

  const sideWeightNeeded = (targetWeightKg - barWeightKg) / 2;
  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const platesPerSide = [];

  let current = sideWeightNeeded;
  for (const plate of availablePlates) {
    while (current >= plate) {
      platesPerSide.push(plate);
      current = Math.round((current - plate) * 100) / 100;
    }
  }

  const actualSideWeight = platesPerSide.reduce((sum, p) => sum + p, 0);
  const totalActualWeight = barWeightKg + actualSideWeight * 2;

  return {
    barWeight: barWeightKg,
    sideWeight: actualSideWeight,
    platesPerSide,
    totalActualWeight,
    remainder: Math.round((targetWeightKg - totalActualWeight) * 10) / 10
  };
};

/**
 * Estimates total calories burned during a workout session
 */
export const estimateCaloriesBurned = (durationMinutes, isGymMode = true, bodyWeightKg = 70) => {
  // MET for weight training ~ 5.5 METs, HIIT ~ 7-8 METs
  const met = isGymMode ? 5.5 : 7.0;
  const caloriesPerMinute = (met * 3.5 * (bodyWeightKg || 70)) / 200;
  return Math.round(caloriesPerMinute * durationMinutes);
};

/**
 * Calculates BMI (Body Mass Index)
 */
export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
};

/**
 * Returns Asian standard BMI classification
 */
export const getBMICategory = (bmi) => {
  if (bmi <= 0) return { label: '-', color: 'text-slate-400', bg: 'bg-slate-800', desc: '-' };
  if (bmi < 18.5) return { label: 'น้ำหนักน้อย (ผอม)', color: 'text-sky-400', bg: 'bg-sky-500/20', desc: 'ควรเสริมสารอาหารโปรตีนและเวทเทรนนิ่งเพื่อเพิ่มมวลกล้ามเนื้อ' };
  if (bmi < 23.0) return { label: 'สมส่วน (สุขภาพดี)', color: 'text-emerald-400', bg: 'bg-emerald-500/20', desc: 'เกณฑ์มาตรฐานสมส่วน แข็งแรง รักษาวินัยการออกกำลังกายต่อเนื่อง' };
  if (bmi < 25.0) return { label: 'น้ำหนักเกิน (ท้วม)', color: 'text-amber-400', bg: 'bg-amber-500/20', desc: 'แนะนำคุมสัดส่วนแคลอรี และเสริมคาร์ดิโอ 15-20 นาทีหลังเวท' };
  if (bmi < 30.0) return { label: 'โรคอ้วนระดับ 1', color: 'text-orange-400', bg: 'bg-orange-500/20', desc: 'ควรเน้น Caloric Deficit ร่วมกับเวทเทรนนิ่งและคาร์ดิโออย่างสม่ำเสมอ' };
  return { label: 'โรคอ้วนระดับ 2', color: 'text-red-400', bg: 'bg-red-500/20', desc: 'ควรปรับโปรแกรมโภชนาการอย่างเข้มข้นเพื่อสุขภาพระยะยาว' };
};

/**
 * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula
 */
export const calculateBMR = (weightKg, heightCm, age = 28, gender = 'MALE') => {
  if (!weightKg || !heightCm) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * (age || 28);
  return gender === 'FEMALE' ? Math.round(base - 161) : Math.round(base + 5);
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE)
 * Moderate exercise (3-5 days/week): 1.55
 */
export const calculateTDEE = (bmr, daysPerWeek = 4) => {
  let multiplier = 1.375; // light (1-3 days)
  if (daysPerWeek >= 6) multiplier = 1.725; // heavy (6-7 days)
  else if (daysPerWeek >= 4) multiplier = 1.55; // moderate (4-5 days)
  return Math.round(bmr * multiplier);
};

