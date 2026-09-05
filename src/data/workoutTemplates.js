export const WORKOUT_TEMPLATES = [
  // --- 6-DAY UPPER & CORE SPLIT (USER REQUESTED FEATURED PLAN) ---
  {
    id: '6d-upper-day1-push-a',
    name: 'Day 1: Push A (Chest & Triceps)',
    nameTh: 'วันที่ 1: อก + หลังแขน + คาร์ดิโอ (Push A)',
    category: 'GYM',
    splitTag: '6-Day Upper Split',
    targetMuscles: ['Chest', 'Triceps', 'Cardio'],
    description: 'เน้นอกกลาง อกบน อกฉีก หลังแขน และคาร์ดิโอ Battle Rope 15 นาที',
    estimatedMinutes: 55,
    exercises: [
      { exerciseId: 'db-bench-press', targetSets: 4, targetReps: '8-10', restSeconds: 30, defaultWeight: 22 },
      { exerciseId: 'incline-barbell-press', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 45 },
      { exerciseId: 'db-chest-fly', targetSets: 3, targetReps: '12-15', restSeconds: 30, defaultWeight: 12 },
      { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '12-15', restSeconds: 30, defaultWeight: 25 },
      { exerciseId: 'overhead-db-extension', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 14 },
      { exerciseId: 'battle-rope-cardio', targetSets: 8, targetReps: '30s', cardioWorkSec: 30, cardioRestSec: 15, cardioRounds: 8, restSeconds: 15, defaultWeight: 0 },
    ]
  },
  {
    id: '6d-upper-day2-pull-a',
    name: 'Day 2: Pull A (Back & Biceps)',
    nameTh: 'วันที่ 2: หลัง + หน้าแขน + คาร์ดิโอ (Pull A)',
    category: 'GYM',
    splitTag: '6-Day Upper Split',
    targetMuscles: ['Back', 'Biceps', 'Cardio'],
    description: 'พายดึงปีกหลัง หลังกลาง ม้วนหน้าแขนค้อน และคาร์ดิโอ Cable Rowing 15 นาที',
    estimatedMinutes: 55,
    exercises: [
      { exerciseId: 'lat-pulldown', targetSets: 4, targetReps: '10-12', restSeconds: 30, defaultWeight: 45 },
      { exerciseId: 'seated-row', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 40 },
      { exerciseId: 'chest-supported-db-row', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 16 },
      { exerciseId: 'cable-bicep-curl', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 20 },
      { exerciseId: 'db-hammer-curl', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 12 },
      { exerciseId: 'cable-rowing-cardio', targetSets: 8, targetReps: '30s', cardioWorkSec: 30, cardioRestSec: 15, cardioRounds: 8, restSeconds: 15, defaultWeight: 0 },
    ]
  },
  {
    id: '6d-upper-day3-shoulders-core-a',
    name: 'Day 3: Shoulders & Core A',
    nameTh: 'วันที่ 3: ไหล่ + ท้อง + คาร์ดิโอ (Shoulders & Core A)',
    category: 'GYM',
    splitTag: '6-Day Upper Split',
    targetMuscles: ['Shoulders', 'Abs', 'Cardio'],
    description: 'ดันไหล่ กางไหล่ข้าง ยกไหล่ เคเบิลครันช์ แพลงก์ และ Battle Rope 15 นาที',
    estimatedMinutes: 50,
    exercises: [
      { exerciseId: 'seated-db-shoulder-press', targetSets: 3, targetReps: '8-10', restSeconds: 30, defaultWeight: 16 },
      { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '12-15', restSeconds: 30, defaultWeight: 8 },
      { exerciseId: 'upright-row', targetSets: 3, targetReps: '12-15', restSeconds: 30, defaultWeight: 25 },
      { exerciseId: 'cable-crunch', targetSets: 3, targetReps: '15-20', restSeconds: 30, defaultWeight: 30 },
      { exerciseId: 'plank', targetSets: 3, targetReps: '45-60 วินาที', restSeconds: 30, defaultWeight: 0 },
      { exerciseId: 'battle-rope-cardio', targetSets: 8, targetReps: '30s', cardioWorkSec: 30, cardioRestSec: 15, cardioRounds: 8, restSeconds: 15, defaultWeight: 0 },
    ]
  },
  {
    id: '6d-upper-day4-push-b',
    name: 'Day 4: Push B (Chest & Triceps)',
    nameTh: 'วันที่ 4: อก + หลังแขน + คาร์ดิโอ (Push B)',
    category: 'GYM',
    splitTag: '6-Day Upper Split',
    targetMuscles: ['Chest', 'Triceps', 'Cardio'],
    description: 'Barbell Bench Press, Incline DB Press, Pullover, Skull Crusher และ Cable Rowing',
    estimatedMinutes: 55,
    exercises: [
      { exerciseId: 'bench-press', targetSets: 4, targetReps: '8-10', restSeconds: 30, defaultWeight: 60 },
      { exerciseId: 'dumbbell-incline-press', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 20 },
      { exerciseId: 'db-pullover', targetSets: 3, targetReps: '12', restSeconds: 30, defaultWeight: 18 },
      { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '12-15', restSeconds: 30, defaultWeight: 25 },
      { exerciseId: 'db-skull-crusher', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 12 },
      { exerciseId: 'cable-rowing-cardio', targetSets: 8, targetReps: '30s', cardioWorkSec: 30, cardioRestSec: 15, cardioRounds: 8, restSeconds: 15, defaultWeight: 0 },
    ]
  },
  {
    id: '6d-upper-day5-pull-b',
    name: 'Day 5: Pull B (Back & Biceps)',
    nameTh: 'วันที่ 5: หลัง + หน้าแขน + คาร์ดิโอ (Pull B)',
    category: 'GYM',
    splitTag: '6-Day Upper Split',
    targetMuscles: ['Back', 'Biceps', 'Cardio'],
    description: 'High Lat Pulldown, Seated Row, KB Row, Barbell Curl, Cable Curl และ Battle Rope',
    estimatedMinutes: 55,
    exercises: [
      { exerciseId: 'cable-high-pulldown', targetSets: 4, targetReps: '10-12', restSeconds: 30, defaultWeight: 40 },
      { exerciseId: 'seated-row', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 40 },
      { exerciseId: 'one-arm-kb-row', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 16 },
      { exerciseId: 'barbell-curl', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 20 },
      { exerciseId: 'cable-bicep-curl', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 20 },
      { exerciseId: 'battle-rope-cardio', targetSets: 8, targetReps: '30s', cardioWorkSec: 30, cardioRestSec: 15, cardioRounds: 8, restSeconds: 15, defaultWeight: 0 },
    ]
  },
  {
    id: '6d-upper-day6-shoulders-core-b',
    name: 'Day 6: Shoulders & Core B',
    nameTh: 'วันที่ 6: ไหล่ + ท้อง + คาร์ดิโอ (Shoulders & Core B)',
    category: 'GYM',
    splitTag: '6-Day Upper Split',
    targetMuscles: ['Shoulders', 'Abs', 'Cardio'],
    description: 'Seated DB Press, Lateral Raise, Rear Fly, Cable Crunch, Russian Twist และ Cable Rowing',
    estimatedMinutes: 50,
    exercises: [
      { exerciseId: 'seated-db-shoulder-press', targetSets: 3, targetReps: '8-10', restSeconds: 30, defaultWeight: 16 },
      { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '15', restSeconds: 30, defaultWeight: 8 },
      { exerciseId: 'rear-delt-fly', targetSets: 3, targetReps: '15', restSeconds: 30, defaultWeight: 8 },
      { exerciseId: 'cable-crunch', targetSets: 3, targetReps: '15-20', restSeconds: 30, defaultWeight: 30 },
      { exerciseId: 'russian-twist', targetSets: 3, targetReps: '20', restSeconds: 30, defaultWeight: 10 },
      { exerciseId: 'cable-rowing-cardio', targetSets: 8, targetReps: '30s', cardioWorkSec: 30, cardioRestSec: 15, cardioRounds: 8, restSeconds: 15, defaultWeight: 0 },
    ]
  },

  // --- PRESET GYM PPL ROUTINES ---
  {
    id: 'ppl-push',
    name: 'Push Day - Hypertrophy (Gym)',
    nameTh: 'วันเล่นแรงดัน อก ไหล่ หลังแขน (ยิม)',
    category: 'GYM',
    targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
    description: 'โปรแกรมฝึกสร้างกล้ามเนื้ออก ไหล่ และหลังแขน สำหรับสายยิมเน้นความคุ้มค่า',
    estimatedMinutes: 60,
    exercises: [
      { exerciseId: 'bench-press', targetSets: 4, targetReps: '8-10', restSeconds: 30, defaultWeight: 60 },
      { exerciseId: 'dumbbell-incline-press', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 20 },
      { exerciseId: 'overhead-press', targetSets: 3, targetReps: '8-10', restSeconds: 30, defaultWeight: 35 },
      { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '12-15', restSeconds: 30, defaultWeight: 8 },
      { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '12-15', restSeconds: 30, defaultWeight: 25 },
    ]
  },
  {
    id: 'ppl-pull',
    name: 'Pull Day - Back & Biceps (Gym)',
    nameTh: 'วันเล่นแรงดึง หลัง ปีก หน้าแขน (ยิม)',
    category: 'GYM',
    targetMuscles: ['Back', 'Biceps'],
    description: 'เน้นความกว้างของปีกหลัง ความหนาของหลังกลาง และการเกร็งหน้าแขนเต็มพิกัด',
    estimatedMinutes: 55,
    exercises: [
      { exerciseId: 'lat-pulldown', targetSets: 4, targetReps: '10-12', restSeconds: 30, defaultWeight: 45 },
      { exerciseId: 'bent-over-row', targetSets: 4, targetReps: '8-10', restSeconds: 30, defaultWeight: 50 },
      { exerciseId: 'dumbbell-row', targetSets: 3, targetReps: '10-12', restSeconds: 30, defaultWeight: 18 },
      { exerciseId: 'barbell-curl', targetSets: 4, targetReps: '10-12', restSeconds: 30, defaultWeight: 20 },
    ]
  },
  {
    id: 'ppl-legs',
    name: 'Leg Day - Quads & Glutes (Gym)',
    nameTh: 'วันเล่นขา ขาหน้า ก้น หลังขา (ยิม)',
    category: 'GYM',
    targetMuscles: ['Legs', 'Glutes', 'Core'],
    description: 'โปรแกรมเพิ่มความแข็งแรงขา สควอทหนักๆ พัฒนาร่างกายส่วนล่าง',
    estimatedMinutes: 60,
    exercises: [
      { exerciseId: 'barbell-squat', targetSets: 4, targetReps: '6-8', restSeconds: 30, defaultWeight: 80 },
      { exerciseId: 'romanian-deadlift', targetSets: 4, targetReps: '8-10', restSeconds: 30, defaultWeight: 65 },
      { exerciseId: 'goblet-squat', targetSets: 3, targetReps: '12-15', restSeconds: 30, defaultWeight: 24 },
      { exerciseId: 'plank', targetSets: 3, targetReps: '60 วินาที', restSeconds: 30, defaultWeight: 0 },
    ]
  },

  // --- HOME ROUTINES ---
  {
    id: 'home-7min-hiit',
    name: '7-Minute Full Body HIIT (Home)',
    nameTh: '7 นาที เผาผลาญไขมันทั่วร่าง (ที่บ้าน)',
    category: 'HOME',
    targetMuscles: ['Full Body', 'Cardio', 'Abs'],
    description: 'ออกกำลังกายที่บ้านไม่ต้องใช้อุปกรณ์ ประหยัดเวลา เผาผลาญแคลอรีรวดเร็ว',
    estimatedMinutes: 7,
    workTimeSec: 30,
    restTimeSec: 15,
    exercises: [
      { exerciseId: 'jumping-jacks', targetSets: 1, targetReps: '30 วินาที', restSeconds: 15, defaultWeight: 0 },
      { exerciseId: 'push-ups', targetSets: 1, targetReps: '30 วินาที', restSeconds: 15, defaultWeight: 0 },
      { exerciseId: 'crunches', targetSets: 1, targetReps: '30 วินาที', restSeconds: 15, defaultWeight: 0 },
      { exerciseId: 'walking-lunges', targetSets: 1, targetReps: '30 วินาที', restSeconds: 15, defaultWeight: 0 },
      { exerciseId: 'chair-dips', targetSets: 1, targetReps: '30 วินาที', restSeconds: 15, defaultWeight: 0 },
      { exerciseId: 'plank', targetSets: 1, targetReps: '30 วินาที', restSeconds: 15, defaultWeight: 0 },
      { exerciseId: 'burpees', targetSets: 1, targetReps: '30 วินาที', restSeconds: 15, defaultWeight: 0 },
    ]
  },
  {
    id: 'home-abs-shred',
    name: '10-Minute Six-Pack Shredder (Home)',
    nameTh: '10 นาที รีดไขมันหน้าท้อง สร้างซิกแพค (ที่บ้าน)',
    category: 'HOME',
    targetMuscles: ['Abs', 'Core'],
    description: 'โปรแกรมเน้นกล้ามเนื้อหน้าท้อง upper, lower & core ไม่ใช้อุปกรณ์',
    estimatedMinutes: 10,
    workTimeSec: 40,
    restTimeSec: 20,
    exercises: [
      { exerciseId: 'crunches', targetSets: 2, targetReps: '40 วินาที', restSeconds: 20, defaultWeight: 0 },
      { exerciseId: 'leg-raises', targetSets: 2, targetReps: '40 วินาที', restSeconds: 20, defaultWeight: 0 },
      { exerciseId: 'plank', targetSets: 2, targetReps: '40 วินาที', restSeconds: 20, defaultWeight: 0 },
    ]
  },
  {
    id: 'home-upper-body',
    name: 'Home Dumbbell & Bodyweight Upper (Home)',
    nameTh: 'สร้างกล้ามเนื้อส่วนบน ดัมเบล + บอดี้เวท (ที่บ้าน)',
    category: 'HOME',
    targetMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
    description: 'สำหรับคนมีดัมเบล 1 คู่ที่บ้าน หรือใช้เฉพาะน้ำหนักตัวสร้างกล้ามส่วนบน',
    estimatedMinutes: 30,
    exercises: [
      { exerciseId: 'push-ups', targetSets: 4, targetReps: '12-15', restSeconds: 60, defaultWeight: 0 },
      { exerciseId: 'dumbbell-incline-press', targetSets: 4, targetReps: '12-15', restSeconds: 60, defaultWeight: 12 },
      { exerciseId: 'dumbbell-row', targetSets: 4, targetReps: '12-15', restSeconds: 60, defaultWeight: 14 },
      { exerciseId: 'lateral-raise', targetSets: 3, targetReps: '15', restSeconds: 45, defaultWeight: 6 },
      { exerciseId: 'chair-dips', targetSets: 3, targetReps: '15', restSeconds: 45, defaultWeight: 0 },
    ]
  }
];
