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
    name: userData.name?.trim() || `นักกีฬาคนที่ ${users.length + 1}`,
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

  return { newUser, updatedUsers };
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
