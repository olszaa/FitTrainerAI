import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import {
  syncProfileToSupabase,
  syncWorkoutLogToSupabase,
  syncCustomPlanToSupabase,
  syncCustomExerciseToSupabase,
  fetchAllProfilesFromSupabase,
  fetchProfileFromSupabase,
  fetchWorkoutLogsFromSupabase,
  fetchCustomPlansFromSupabase,
  fetchCustomExercisesFromSupabase
} from '../services/supabaseService';

const STORAGE_KEY_USERS = 'fittrainer_users_list';
const STORAGE_KEY_ACTIVE_USER = 'fittrainer_active_user_id';
const DEFAULT_USER_ID = 'user-1';

// Sample initial mock logs
const INITIAL_LOGS = [
  {
    id: 'log-1',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    routineName: 'Push Day - Hypertrophy (Gym)',
    mode: 'GYM',
    durationMinutes: 52,
    caloriesBurned: 340,
    totalTonnageKg: 4250,
    exercises: [
      {
        exerciseId: 'bench-press',
        exerciseName: 'Barbell Bench Press',
        category: 'CHEST',
        sets: [
          { weight: 50, reps: 10, completed: true, type: 'Normal', rpe: 7 },
          { weight: 60, reps: 8, completed: true, type: 'Normal', rpe: 8 },
          { weight: 65, reps: 8, completed: true, type: 'Normal', rpe: 9 },
        ]
      },
      {
        exerciseId: 'dumbbell-incline-press',
        exerciseName: 'Incline Dumbbell Press',
        category: 'CHEST',
        sets: [
          { weight: 20, reps: 10, completed: true, type: 'Normal', rpe: 8 },
          { weight: 22, reps: 8, completed: true, type: 'Normal', rpe: 9 },
        ]
      },
      {
        exerciseId: 'lateral-raise',
        exerciseName: 'Dumbbell Lateral Raise',
        category: 'SHOULDERS',
        sets: [
          { weight: 8, reps: 15, completed: true, type: 'Normal', rpe: 7 },
          { weight: 10, reps: 12, completed: true, type: 'Normal', rpe: 9 },
        ]
      }
    ]
  },
  {
    id: 'log-2',
    date: new Date(Date.now() - 86400000 * 1).toISOString(), // Yesterday
    routineName: '7-Minute Full Body HIIT (Home)',
    mode: 'HOME',
    durationMinutes: 10,
    caloriesBurned: 95,
    totalTonnageKg: 0,
    exercises: [
      {
        exerciseId: 'jumping-jacks',
        exerciseName: 'Jumping Jacks',
        category: 'FULLBODY',
        sets: [{ weight: 0, reps: 30, completed: true, type: 'Normal' }]
      },
      {
        exerciseId: 'push-ups',
        exerciseName: 'Standard Push-Up',
        category: 'CHEST',
        sets: [{ weight: 0, reps: 20, completed: true, type: 'Normal' }]
      },
      {
        exerciseId: 'plank',
        exerciseName: 'Forearm Plank',
        category: 'ABS',
        sets: [{ weight: 0, reps: 60, completed: true, type: 'Normal' }]
      }
    ]
  }
];

// Initialize multi-user storage and migrate any existing legacy single-user data
export const initializeMultiUserStorage = () => {
  let users = null;
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEY_USERS);
    if (rawUsers) users = JSON.parse(rawUsers);
  } catch (e) {
    users = null;
  }

  if (!users || !Array.isArray(users) || users.length === 0) {
    // Read legacy profile or create default
    let legacyProfile = null;
    try {
      const rawProf = localStorage.getItem('fittrainer_user_profile');
      if (rawProf) legacyProfile = JSON.parse(rawProf);
    } catch (e) {}

    const primaryUser = {
      id: DEFAULT_USER_ID,
      name: legacyProfile?.name || 'คุณยท (Fitness Explorer)',
      avatar: legacyProfile?.avatar || '🏋️‍♂️',
      gender: legacyProfile?.gender || 'MALE',
      age: Number(legacyProfile?.age) || 28,
      weightKg: Number(legacyProfile?.weightKg) || 72,
      targetWeightKg: Number(legacyProfile?.targetWeightKg) || 75,
      heightCm: Number(legacyProfile?.heightCm) || 175,
      goal: legacyProfile?.goal || 'MUSCLE_BUILDING',
      gymLevel: legacyProfile?.gymLevel || 'INTERMEDIATE',
      targetDaysPerWeek: Number(legacyProfile?.targetDaysPerWeek) || 4,
      streakDays: Number(legacyProfile?.streakDays) || 4,
      createdAt: new Date().toISOString(),
      weightHistory: legacyProfile?.weightHistory || [
        { date: new Date(Date.now() - 86400000 * 14).toISOString().slice(0, 10), weightKg: 73.2 },
        { date: new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10), weightKg: 72.6 },
        { date: new Date().toISOString().slice(0, 10), weightKg: 72.0 },
      ]
    };

    users = [primaryUser];
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY_ACTIVE_USER, DEFAULT_USER_ID);

    // Save scoped profile for user-1
    localStorage.setItem(`fittrainer_user_profile_${DEFAULT_USER_ID}`, JSON.stringify(primaryUser));

    // Migrate legacy logs
    const legacyLogs = localStorage.getItem('fittrainer_workout_logs');
    if (legacyLogs) {
      localStorage.setItem(`fittrainer_workout_logs_${DEFAULT_USER_ID}`, legacyLogs);
    } else {
      localStorage.setItem(`fittrainer_workout_logs_${DEFAULT_USER_ID}`, JSON.stringify(INITIAL_LOGS));
    }

    // Migrate legacy custom plans
    const legacyPlans = localStorage.getItem('fittrainer_custom_plans');
    if (legacyPlans) {
      localStorage.setItem(`fittrainer_custom_plans_${DEFAULT_USER_ID}`, legacyPlans);
    }

    // Migrate legacy chat
    const legacyChat = localStorage.getItem('fittrainer_ai_chat_history');
    if (legacyChat) {
      localStorage.setItem(`fittrainer_ai_chat_${DEFAULT_USER_ID}`, legacyChat);
    }
  }

  return users;
};

// --- Multi-User Management APIs ---

export const getUsersList = () => {
  initializeMultiUserStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getActiveUserId = () => {
  initializeMultiUserStorage();
  const id = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
  if (id) return id;
  const users = getUsersList();
  const firstId = users[0]?.id || DEFAULT_USER_ID;
  localStorage.setItem(STORAGE_KEY_ACTIVE_USER, firstId);
  return firstId;
};

export const setActiveUserId = (userId) => {
  localStorage.setItem(STORAGE_KEY_ACTIVE_USER, userId);
  return userId;
};

export const createNewUser = (userData) => {
  const users = getUsersList();
  const newId = `user-${Date.now()}`;
  const newUser = {
    id: newId,
    username: userData.username?.trim() || userData.name?.trim() || `user_${Date.now().toString().slice(-4)}`,
    name: userData.name?.trim() || userData.username?.trim() || `นักกีฬาคนที่ ${users.length + 1}`,
    email: userData.email?.trim() || '',
    pinCode: userData.password?.trim() || userData.pinCode?.trim() || '',
    avatar: userData.avatar || '🏋️‍♂️',
    gender: userData.gender || 'MALE',
    age: Number(userData.age) || 25,
    weightKg: Number(userData.weightKg) || 70,
    targetWeightKg: Number(userData.targetWeightKg) || 70,
    heightCm: Number(userData.heightCm) || 175,
    goal: userData.goal || 'MUSCLE_BUILDING',
    gymLevel: userData.gymLevel || 'INTERMEDIATE',
    targetDaysPerWeek: Number(userData.targetDaysPerWeek) || 4,
    streakDays: 1,
    createdAt: new Date().toISOString(),
    weightHistory: [
      { date: new Date().toISOString().slice(0, 10), weightKg: Number(userData.weightKg) || 70 }
    ]
  };

  const updatedUsers = [...users, newUser];
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
  localStorage.setItem(`fittrainer_user_profile_${newId}`, JSON.stringify(newUser));
  localStorage.setItem(`fittrainer_workout_logs_${newId}`, JSON.stringify([]));
  localStorage.setItem(`fittrainer_custom_plans_${newId}`, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEY_ACTIVE_USER, newId);

  // Auto-sync new user profile immediately to Supabase Cloud
  syncProfileToSupabase(newUser);

  return { newUser, updatedUsers };
};

// Sync all registered profiles from Supabase Cloud to local device
export const syncCloudProfilesToLocal = async () => {
  try {
    const cloudProfiles = await fetchAllProfilesFromSupabase();
    if (!cloudProfiles || !cloudProfiles.length) return getUsersList();

    const localUsers = getUsersList();
    const userMap = new Map();

    localUsers.forEach((u) => userMap.set(u.id, u));

    cloudProfiles.forEach((cp) => {
      userMap.set(cp.id, {
        ...userMap.get(cp.id),
        ...cp,
        hasPin: Boolean(cp.pinCode && String(cp.pinCode).trim().length === 4)
      });
      const profileKey = `fittrainer_user_profile_${cp.id}`;
      if (!localStorage.getItem(profileKey)) {
        localStorage.setItem(profileKey, JSON.stringify(cp));
      }
    });

    const mergedUsers = Array.from(userMap.values());
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(mergedUsers));
    return mergedUsers;
  } catch (e) {
    console.warn('syncCloudProfilesToLocal error:', e);
    return getUsersList();
  }
};

// Pull down user logs, plans, and custom exercises from Supabase to local device
export const syncUserDataFromCloudToLocal = async (userId) => {
  if (!userId) return;
  try {
    const [profile, logs, plans, customExs] = await Promise.all([
      fetchProfileFromSupabase(userId),
      fetchWorkoutLogsFromSupabase(userId),
      fetchCustomPlansFromSupabase(userId),
      fetchCustomExercisesFromSupabase(userId)
    ]);

    if (profile) {
      localStorage.setItem(`fittrainer_user_profile_${userId}`, JSON.stringify(profile));
    }
    if (Array.isArray(logs) && logs.length > 0) {
      localStorage.setItem(`fittrainer_workout_logs_${userId}`, JSON.stringify(logs));
    }
    if (Array.isArray(plans) && plans.length > 0) {
      localStorage.setItem(`fittrainer_custom_plans_${userId}`, JSON.stringify(plans));
    }
    if (Array.isArray(customExs) && customExs.length > 0) {
      localStorage.setItem(`fittrainer_custom_exercises_${userId}`, JSON.stringify(customExs));
    }

    return { profile, logs, plans, customExs };
  } catch (e) {
    console.warn('syncUserDataFromCloudToLocal error:', e);
    return null;
  }
};

export const deleteUser = (userId) => {
  const users = getUsersList();
  if (users.length <= 1) {
    throw new Error('ไม่สามารถลบผู้ใช้งานคนสุดท้ายได้');
  }

  const updatedUsers = users.filter((u) => u.id !== userId);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));

  // Clean up scoped data
  localStorage.removeItem(`fittrainer_user_profile_${userId}`);
  localStorage.removeItem(`fittrainer_workout_logs_${userId}`);
  localStorage.removeItem(`fittrainer_custom_plans_${userId}`);
  localStorage.removeItem(`fittrainer_ai_chat_${userId}`);

  // If deleted user was active, switch to first user
  let activeId = getActiveUserId();
  if (activeId === userId) {
    activeId = updatedUsers[0].id;
    setActiveUserId(activeId);
  }

  return { activeId, updatedUsers };
};

// --- Scoped Data APIs (Accepting optional userId) ---

export const getWorkoutLogs = (userId = getActiveUserId()) => {
  const key = `fittrainer_workout_logs_${userId}`;
  const data = localStorage.getItem(key);
  if (!data) {
    // If it's default user, return initial sample logs
    if (userId === DEFAULT_USER_ID) {
      localStorage.setItem(key, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveWorkoutLog = (newLog, userId = getActiveUserId()) => {
  const key = `fittrainer_workout_logs_${userId}`;
  const logs = getWorkoutLogs(userId);
  const updatedLogs = [newLog, ...logs];
  localStorage.setItem(key, JSON.stringify(updatedLogs));
  syncWorkoutLogToSupabase(newLog, userId);
  return updatedLogs;
};

export const getCustomPlans = (userId = getActiveUserId()) => {
  const key = `fittrainer_custom_plans_${userId}`;
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveCustomPlan = (plan, userId = getActiveUserId()) => {
  const key = `fittrainer_custom_plans_${userId}`;
  const plans = getCustomPlans(userId);
  const existingIndex = plans.findIndex((p) => p.id === plan.id);
  let updated;
  if (existingIndex >= 0) {
    updated = [...plans];
    updated[existingIndex] = plan;
  } else {
    updated = [...plans, plan];
  }
  localStorage.setItem(key, JSON.stringify(updated));
  syncCustomPlanToSupabase(plan, userId);
  return updated;
};

export const deleteCustomPlan = (planId, userId = getActiveUserId()) => {
  const key = `fittrainer_custom_plans_${userId}`;
  const plans = getCustomPlans(userId);
  const updated = plans.filter((p) => p.id !== planId);
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
};

export const getUserProfile = (userId = getActiveUserId()) => {
  initializeMultiUserStorage();
  const key = `fittrainer_user_profile_${userId}`;
  const data = localStorage.getItem(key);
  if (!data) {
    const users = getUsersList();
    const found = users.find((u) => u.id === userId);
    if (found) {
      localStorage.setItem(key, JSON.stringify(found));
      return found;
    }
    return {
      id: userId,
      name: 'Fitness Explorer',
      avatar: '🏋️‍♂️',
      weightKg: 70,
      heightCm: 175,
      streakDays: 1,
      weightHistory: [{ date: new Date().toISOString().slice(0, 10), weightKg: 70 }]
    };
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return { id: userId, name: 'Fitness Explorer', avatar: '🏋️‍♂️', weightKg: 70, heightCm: 175, streakDays: 1 };
  }
};

export const saveUserProfile = (profile, userId = getActiveUserId()) => {
  const key = `fittrainer_user_profile_${userId}`;
  const profileToSave = { ...profile, id: userId };
  localStorage.setItem(key, JSON.stringify(profileToSave));
  syncProfileToSupabase(profileToSave);

  // Sync users list summary so Navbar user switcher reflects updated name / avatar / weight
  const users = getUsersList();
  const userIdx = users.findIndex((u) => u.id === userId);
  if (userIdx >= 0) {
    users[userIdx] = {
      ...users[userIdx],
      name: profileToSave.name,
      avatar: profileToSave.avatar || users[userIdx].avatar || '🏋️‍♂️',
      weightKg: profileToSave.weightKg,
      targetWeightKg: profileToSave.targetWeightKg,
      goal: profileToSave.goal,
      streakDays: profileToSave.streakDays,
      hasPin: Boolean(profileToSave.pinCode && profileToSave.pinCode.trim().length === 4),
    };
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }

  return profileToSave;
};

export const getAIChatHistory = (userId = getActiveUserId()) => {
  const key = `fittrainer_ai_chat_${userId}`;
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveAIChatHistory = (messages, userId = getActiveUserId()) => {
  const key = `fittrainer_ai_chat_${userId}`;
  localStorage.setItem(key, JSON.stringify(messages));
};

// --- Custom Exercises Storage APIs ---
export const getCustomExercises = (userId = getActiveUserId()) => {
  const key = `fittrainer_custom_exercises_${userId}`;
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveCustomExercise = (exercise, userId = getActiveUserId()) => {
  const key = `fittrainer_custom_exercises_${userId}`;
  const customExercises = getCustomExercises(userId);
  const existingIdx = customExercises.findIndex((ex) => ex.id === exercise.id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...customExercises];
    updated[existingIdx] = exercise;
  } else {
    updated = [exercise, ...customExercises];
  }
  localStorage.setItem(key, JSON.stringify(updated));
  syncCustomExerciseToSupabase(exercise, userId);
  return updated;
};

export const deleteCustomExercise = (exerciseId, userId = getActiveUserId()) => {
  const key = `fittrainer_custom_exercises_${userId}`;
  const customExercises = getCustomExercises(userId);
  const updated = customExercises.filter((ex) => ex.id !== exerciseId);
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
};

export const getAllExercises = (userId = getActiveUserId()) => {
  const customExercises = getCustomExercises(userId);
  return [...customExercises, ...EXERCISE_DATABASE];
};

// --- User PIN Verification ---
export const verifyUserPin = (userId, inputPin) => {
  const profile = getUserProfile(userId);
  if (!profile.pinCode || !profile.pinCode.trim()) return true; // No PIN set
  return profile.pinCode.trim() === (inputPin || '').trim();
};

// --- User Rank & Level Helper ---
export const getUserRank = (userId = getActiveUserId()) => {
  const logs = getWorkoutLogs(userId);
  const totalWorkouts = logs.length;
  let totalTonnage = 0;
  logs.forEach((log) => {
    totalTonnage += log.totalTonnageKg || 0;
  });

  if (totalWorkouts >= 50 || totalTonnage >= 50000) {
    return { title: 'Titan Legend', icon: '🏆', level: 5, badgeBg: 'from-amber-400 to-yellow-500 text-slate-950' };
  } else if (totalWorkouts >= 25 || totalTonnage >= 25000) {
    return { title: 'Platinum Athlete', icon: '💎', level: 4, badgeBg: 'from-cyan-400 to-blue-500 text-slate-950' };
  } else if (totalWorkouts >= 10 || totalTonnage >= 10000) {
    return { title: 'Gold Muscle', icon: '🥇', level: 3, badgeBg: 'from-yellow-400 to-amber-500 text-slate-950' };
  } else if (totalWorkouts >= 3 || totalTonnage >= 2000) {
    return { title: 'Silver Lifter', icon: '🥈', level: 2, badgeBg: 'from-slate-300 to-slate-400 text-slate-950' };
  }
  return { title: 'Beginner Rookie', icon: '🌱', level: 1, badgeBg: 'from-lime-400 to-emerald-500 text-slate-950' };
};

// --- User Achievement Badges Calculation ---
export const getUserAchievements = (userId = getActiveUserId()) => {
  const logs = getWorkoutLogs(userId);
  const profile = getUserProfile(userId);
  const customPlans = getCustomPlans(userId);
  const customExercises = getCustomExercises(userId);

  const totalWorkouts = logs.length;
  let totalTonnage = 0;
  let totalMinutes = 0;
  logs.forEach((log) => {
    totalTonnage += log.totalTonnageKg || 0;
    totalMinutes += log.durationMinutes || 0;
  });

  const streakDays = profile.streakDays || 0;

  return [
    {
      id: 'first_step',
      title: 'ก้าวแรกสู่นักกีฬา (First Step)',
      description: 'บันทึกการออกกำลังกายครั้งแรกเสร็จสิ้น',
      icon: '🚀',
      unlocked: totalWorkouts >= 1,
      progress: Math.min(100, (totalWorkouts / 1) * 100)
    },
    {
      id: 'streak_3',
      title: 'วินัยเริ่มก่อตัว (3-Day Streak)',
      description: 'ออกกำลังกายต่อเนื่อง 3 วัน',
      icon: '🔥',
      unlocked: streakDays >= 3,
      progress: Math.min(100, (streakDays / 3) * 100)
    },
    {
      id: 'streak_7',
      title: 'ไฟแห่งความมุ่งมั่น (7-Day Streak)',
      description: 'ออกกำลังกายต่อเนื่องครบ 7 วัน',
      icon: '⚡',
      unlocked: streakDays >= 7,
      progress: Math.min(100, (streakDays / 7) * 100)
    },
    {
      id: 'heavy_lifter',
      title: 'นักยกพละกำลัง (Heavy Lifter)',
      description: 'ยกน้ำหนักรวมสะสมทะลุ 5,000 kg',
      icon: '🏋️‍♂️',
      unlocked: totalTonnage >= 5000,
      progress: Math.min(100, (totalTonnage / 5000) * 100)
    },
    {
      id: 'titan_lifter',
      title: 'ไททันพลังมหาศาล (Titan Lifter)',
      description: 'ยกน้ำหนักรวมสะสมทะลุ 25,000 kg',
      icon: '👑',
      unlocked: totalTonnage >= 25000,
      progress: Math.min(100, (totalTonnage / 25000) * 100)
    },
    {
      id: 'time_crusher',
      title: 'ชั่วโมงบินทรงคุณค่า (Time Crusher)',
      description: 'ซ้อมสะสมรวมกันมากกว่า 300 นาที (5 ชั่วโมง)',
      icon: '⏱️',
      unlocked: totalMinutes >= 300,
      progress: Math.min(100, (totalMinutes / 300) * 100)
    },
    {
      id: 'architect',
      title: 'สถาปนิกการซ้อม (Routine Creator)',
      description: 'สร้างตารางฝึก หรือสร้างท่าฝึกเฉพาะตัวอย่างน้อย 1 รายการ',
      icon: '📋',
      unlocked: customPlans.length > 0 || customExercises.length > 0,
      progress: (customPlans.length > 0 || customExercises.length > 0) ? 100 : 0
    }
  ];
};

// --- User Data Backup (Export) ---
export const exportUserData = (userId = getActiveUserId()) => {
  const profile = getUserProfile(userId);
  const workoutLogs = getWorkoutLogs(userId);
  const customPlans = getCustomPlans(userId);
  const customExercises = getCustomExercises(userId);

  const exportPayload = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    profile,
    workoutLogs,
    customPlans,
    customExercises
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportPayload, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `FitTrainerAI_User_${profile.name || userId}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// --- User Data Restore (Import) ---
export const importUserData = (jsonData, targetUserId = getActiveUserId()) => {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
  }

  const { profile, workoutLogs, customPlans, customExercises } = jsonData;

  if (!profile || !profile.name) {
    throw new Error('ไม่พบข้อมูลโปรไฟล์ผู้ใช้งานในไฟล์นี้');
  }

  const userId = targetUserId || profile.id || `user-${Date.now()}`;
  const profileToSave = { ...profile, id: userId };

  localStorage.setItem(`fittrainer_user_profile_${userId}`, JSON.stringify(profileToSave));
  if (Array.isArray(workoutLogs)) {
    localStorage.setItem(`fittrainer_workout_logs_${userId}`, JSON.stringify(workoutLogs));
  }
  if (Array.isArray(customPlans)) {
    localStorage.setItem(`fittrainer_custom_plans_${userId}`, JSON.stringify(customPlans));
  }
  if (Array.isArray(customExercises)) {
    localStorage.setItem(`fittrainer_custom_exercises_${userId}`, JSON.stringify(customExercises));
  }

  // Update Users summary list
  const users = getUsersList();
  const existingIdx = users.findIndex((u) => u.id === userId);
  if (existingIdx >= 0) {
    users[existingIdx] = {
      ...users[existingIdx],
      name: profileToSave.name,
      avatar: profileToSave.avatar || '🏋️‍♂️',
      weightKg: profileToSave.weightKg,
      targetWeightKg: profileToSave.targetWeightKg,
      goal: profileToSave.goal,
      streakDays: profileToSave.streakDays || 1,
      hasPin: Boolean(profileToSave.pinCode && profileToSave.pinCode.trim().length === 4)
    };
  } else {
    users.push({
      id: userId,
      name: profileToSave.name,
      avatar: profileToSave.avatar || '🏋️‍♂️',
      weightKg: profileToSave.weightKg,
      targetWeightKg: profileToSave.targetWeightKg,
      goal: profileToSave.goal,
      streakDays: profileToSave.streakDays || 1,
      hasPin: Boolean(profileToSave.pinCode && profileToSave.pinCode.trim().length === 4)
    });
  }
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

  return profileToSave;
};

// --- Auth Session Management APIs ---
const STORAGE_KEY_AUTH_SESSION = 'fittrainer_auth_session';

export const getAuthSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const setAuthSession = (userId) => {
  const session = {
    userId,
    loggedInAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY_AUTH_SESSION, JSON.stringify(session));
  return session;
};

export const clearAuthSession = () => {
  localStorage.removeItem(STORAGE_KEY_AUTH_SESSION);
};



