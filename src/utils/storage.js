import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import {
  syncProfileToSupabase,
  syncWorkoutLogToSupabase,
  syncCustomPlanToSupabase,
  syncCustomExerciseToSupabase,
  deleteCustomPlanFromSupabase,
  deleteCustomExerciseFromSupabase,
  fetchAllProfilesFromSupabase,
  fetchProfileFromSupabase,
  fetchWorkoutLogsFromSupabase,
  fetchCustomPlansFromSupabase,
  fetchCustomExercisesFromSupabase,
  searchProfileFromSupabase,
  deleteProfileFromSupabase
} from '../services/supabaseService';

export { syncProfileToSupabase, searchProfileFromSupabase };

// --- Pure Cloud Architecture & In-Memory Session Cache ---
// All primary data lives 100% in Supabase Cloud.
// LocalStorage is strictly reserved for the ephemeral session token: 'fittrainer_auth_session'.
// All legacy/mock localStorage tables are purged to eliminate ghost data.

const STORAGE_KEY_AUTH_SESSION = 'fittrainer_auth_session';

// In-memory runtime store for zero-latency component rendering during session
const _runtimeMemory = {
  users: [],
  profiles: {},
  workoutLogs: {},
  customPlans: {},
  customExercises: {},
  aiChat: {}
};

/**
 * Purges all obsolete local storage keys from previous local-database implementations.
 * Preserves ONLY 'fittrainer_auth_session'.
 */
export const purgeLegacyLocalStorage = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key === STORAGE_KEY_AUTH_SESSION) continue;

      if (
        key.startsWith('fittrainer_workout_logs_') ||
        key.startsWith('fittrainer_custom_plans_') ||
        key.startsWith('fittrainer_custom_exercises_') ||
        key.startsWith('fittrainer_ai_chat_') ||
        key.startsWith('fittrainer_user_profile_') ||
        key.startsWith('fittrainer_')
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('purgeLegacyLocalStorage error:', e);
  }
};

// Immediately purge on module evaluation
purgeLegacyLocalStorage();

// --- Auth Session Management APIs (The ONLY persistent localStorage entry) ---

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
  if (!userId) {
    clearAuthSession();
    return null;
  }
  const session = {
    userId,
    loggedInAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(STORAGE_KEY_AUTH_SESSION, JSON.stringify(session));
  } catch (e) {
    console.warn('setAuthSession error:', e);
  }
  return session;
};

export const clearAuthSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH_SESSION);
  } catch (e) {
    console.warn('clearAuthSession error:', e);
  }
};

// --- Multi-User Management APIs (Powered by Supabase Cloud) ---

export const getUsersList = () => {
  return _runtimeMemory.users || [];
};

export const getActiveUserId = () => {
  const session = getAuthSession();
  return session?.userId || null;
};

export const setActiveUserId = (userId) => {
  if (userId) {
    setAuthSession(userId);
  } else {
    clearAuthSession();
  }
  return userId;
};

export const checkDuplicateUser = async (userData) => {
  if (!userData) return { isDuplicate: false };

  const targetUsername = (userData.username || '').trim().toLowerCase();
  const targetName = (userData.name || '').trim().toLowerCase();
  const targetEmail = (userData.email || '').trim().toLowerCase();

  const localUsers = getUsersList();

  // 1. Check local runtime memory users
  for (const u of localUsers) {
    const uUsername = (u.username || '').trim().toLowerCase();
    const uName = (u.name || '').trim().toLowerCase();
    const uEmail = (u.email || '').trim().toLowerCase();

    if (targetUsername && (uUsername === targetUsername || uName === targetUsername)) {
      return {
        isDuplicate: true,
        field: 'username',
        message: `ชื่อผู้ใช้งาน (Username) "${userData.username}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`
      };
    }

    if (targetEmail && uEmail && uEmail === targetEmail) {
      return {
        isDuplicate: true,
        field: 'email',
        message: `อีเมล (Email) "${userData.email}" ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น`
      };
    }

    if (targetName && uName === targetName && !targetUsername) {
      return {
        isDuplicate: true,
        field: 'name',
        message: `ชื่อสมาชิก "${userData.name}" มีอยู่ในระบบแล้ว`
      };
    }
  }

  // 2. Deep check in Supabase Cloud DB if configured
  try {
    if (targetUsername) {
      const cloudMatches = await searchProfileFromSupabase(targetUsername);
      if (cloudMatches && cloudMatches.length > 0) {
        const match = cloudMatches.find(
          (c) =>
            (c.username || '').trim().toLowerCase() === targetUsername ||
            (c.name || '').trim().toLowerCase() === targetUsername
        );
        if (match) {
          return {
            isDuplicate: true,
            field: 'username',
            message: `ชื่อผู้ใช้งาน (Username) "${userData.username}" มีอยู่ในระบบ Cloud แล้ว`
          };
        }
      }
    }

    if (targetEmail) {
      const cloudEmailMatches = await searchProfileFromSupabase(targetEmail);
      if (cloudEmailMatches && cloudEmailMatches.length > 0) {
        const match = cloudEmailMatches.find(
          (c) => (c.email || '').trim().toLowerCase() === targetEmail
        );
        if (match) {
          return {
            isDuplicate: true,
            field: 'email',
            message: `อีเมล (Email) "${userData.email}" ถูกใช้งานแล้วในระบบ Cloud`
          };
        }
      }
    }
  } catch (e) {
    console.warn('Duplicate check cloud warning:', e);
  }

  return { isDuplicate: false };
};

export const createNewUser = async (userData) => {
  const newId = `user-${Date.now()}`;
  const newUser = {
    id: newId,
    username: userData.username?.trim() || userData.name?.trim() || `user_${Date.now().toString().slice(-4)}`,
    name: userData.name?.trim() || userData.username?.trim() || 'สมาชิกใหม่',
    email: userData.email?.trim() || '',
    pinCode: userData.password?.trim() || userData.pinCode?.trim() || '',
    avatar: userData.avatar || '🏋️‍♂️',
    customAvatarUrl: userData.customAvatarUrl || null,
    gender: userData.gender || 'MALE',
    age: Number(userData.age) || 26,
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

  // Populate runtime memory
  _runtimeMemory.users.push(newUser);
  _runtimeMemory.profiles[newId] = newUser;
  _runtimeMemory.workoutLogs[newId] = [];
  _runtimeMemory.customPlans[newId] = [];
  _runtimeMemory.customExercises[newId] = [];
  setAuthSession(newId);

  // Sync profile directly to Supabase Cloud
  await syncProfileToSupabase(newUser);

  return { newUser, updatedUsers: _runtimeMemory.users };
};

// Sync all registered profiles from Supabase Cloud to local runtime memory
export const syncCloudProfilesToLocal = async () => {
  try {
    const cloudProfiles = await fetchAllProfilesFromSupabase();
    if (!cloudProfiles || !cloudProfiles.length) {
      return _runtimeMemory.users;
    }

    _runtimeMemory.users = cloudProfiles.map((cp) => ({
      ...cp,
      hasPin: Boolean(cp.pinCode && String(cp.pinCode).trim().length > 0)
    }));

    cloudProfiles.forEach((cp) => {
      _runtimeMemory.profiles[cp.id] = {
        ...cp,
        hasPin: Boolean(cp.pinCode && String(cp.pinCode).trim().length > 0)
      };
    });

    return _runtimeMemory.users;
  } catch (e) {
    console.warn('syncCloudProfilesToLocal error:', e);
    return _runtimeMemory.users;
  }
};

// Pull down user logs, plans, and custom exercises from Supabase to local runtime memory
export const syncUserDataFromCloudToLocal = async (userId) => {
  if (!userId) return null;

  try {
    const [profile, logs, plans, customExs] = await Promise.all([
      fetchProfileFromSupabase(userId),
      fetchWorkoutLogsFromSupabase(userId),
      fetchCustomPlansFromSupabase(userId),
      fetchCustomExercisesFromSupabase(userId)
    ]);

    if (profile) {
      const formattedProfile = {
        ...profile,
        hasPin: Boolean(profile.pinCode && String(profile.pinCode).trim().length > 0)
      };
      _runtimeMemory.profiles[userId] = formattedProfile;
      const existingIdx = _runtimeMemory.users.findIndex((u) => u.id === userId);
      if (existingIdx >= 0) {
        _runtimeMemory.users[existingIdx] = formattedProfile;
      } else {
        _runtimeMemory.users.push(formattedProfile);
      }
    }
    if (Array.isArray(logs)) {
      _runtimeMemory.workoutLogs[userId] = logs;
    }
    if (Array.isArray(plans)) {
      _runtimeMemory.customPlans[userId] = plans;
    }
    if (Array.isArray(customExs)) {
      _runtimeMemory.customExercises[userId] = customExs;
    }

    return {
      profile: _runtimeMemory.profiles[userId] || profile,
      logs: _runtimeMemory.workoutLogs[userId] || [],
      plans: _runtimeMemory.customPlans[userId] || [],
      customExs: _runtimeMemory.customExercises[userId] || []
    };
  } catch (e) {
    console.warn('syncUserDataFromCloudToLocal error:', e);
    return null;
  }
};

export const deleteUser = async (userId) => {
  if (!userId) return { activeId: getActiveUserId(), updatedUsers: getUsersList() };

  // Remove from runtime memory
  _runtimeMemory.users = _runtimeMemory.users.filter((u) => u.id !== userId);
  delete _runtimeMemory.profiles[userId];
  delete _runtimeMemory.workoutLogs[userId];
  delete _runtimeMemory.customPlans[userId];
  delete _runtimeMemory.customExercises[userId];
  delete _runtimeMemory.aiChat[userId];

  // Permanently delete profile and linked records from Supabase Cloud
  try {
    await deleteProfileFromSupabase(userId);
  } catch (err) {
    console.warn('Supabase cloud user delete warning:', err);
  }

  // Update active session if active user was deleted
  let activeId = getActiveUserId();
  if (activeId === userId) {
    activeId = _runtimeMemory.users.length > 0 ? _runtimeMemory.users[0].id : null;
    if (activeId) {
      setAuthSession(activeId);
    } else {
      clearAuthSession();
    }
  }

  return { activeId, updatedUsers: _runtimeMemory.users };
};

// --- Scoped Data APIs (Supabase Cloud + In-Memory) ---

export const getWorkoutLogs = (userId = getActiveUserId()) => {
  if (!userId) return [];
  return _runtimeMemory.workoutLogs[userId] || [];
};

export const saveWorkoutLog = (newLog, userId = getActiveUserId()) => {
  if (!userId) return [];
  const currentLogs = _runtimeMemory.workoutLogs[userId] || [];
  const updatedLogs = [newLog, ...currentLogs];
  _runtimeMemory.workoutLogs[userId] = updatedLogs;

  // Sync to Supabase Cloud directly
  syncWorkoutLogToSupabase(newLog, userId);
  return updatedLogs;
};

export const importWorkoutLogs = async (jsonData, userId = getActiveUserId()) => {
  let logsToImport = [];

  if (Array.isArray(jsonData)) {
    logsToImport = jsonData;
  } else if (jsonData && typeof jsonData === 'object') {
    if (Array.isArray(jsonData.workoutLogs)) {
      logsToImport = jsonData.workoutLogs;
    } else if (Array.isArray(jsonData.logs)) {
      logsToImport = jsonData.logs;
    }
  }

  if (!logsToImport || logsToImport.length === 0) {
    throw new Error('ไม่พบข้อมูลประวัติการออกกำลังกายในไฟล์ JSON นี้');
  }

  const effectiveUserId = userId || getActiveUserId();
  const existingLogs = getWorkoutLogs(effectiveUserId);
  const existingMap = new Map();

  existingLogs.forEach((l) => {
    if (l && l.id) existingMap.set(l.id, l);
  });

  let newCount = 0;
  const syncPromises = [];

  logsToImport.forEach((log) => {
    if (!log) return;
    const logId = log.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const formattedLog = {
      ...log,
      id: logId,
      user_id: effectiveUserId,
      date: log.date || new Date().toISOString(),
      routineName: log.routineName || log.routine_name || log.name || 'Workout Session',
      mode: log.mode || 'GYM',
      durationMinutes: Number(log.durationMinutes ?? log.duration_minutes) || 0,
      caloriesBurned: Number(log.caloriesBurned ?? log.calories_burned) || 0,
      totalTonnageKg: Number(log.totalTonnageKg ?? log.total_tonnage_kg) || 0,
      exercises: Array.isArray(log.exercises) ? log.exercises : (Array.isArray(log.exercises_data) ? log.exercises_data : [])
    };

    if (!existingMap.has(logId)) {
      newCount++;
    }
    existingMap.set(logId, formattedLog);

    // Sync to Supabase Cloud
    syncPromises.push(syncWorkoutLogToSupabase(formattedLog, effectiveUserId));
  });

  // Wait for all logs to sync up to Supabase Cloud
  await Promise.all(syncPromises);

  // Sort by date descending
  const mergedLogs = Array.from(existingMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  _runtimeMemory.workoutLogs[effectiveUserId] = mergedLogs;

  return { mergedLogs, count: logsToImport.length, newCount };
};

export const getCustomPlans = (userId = getActiveUserId()) => {
  if (!userId) return [];
  return _runtimeMemory.customPlans[userId] || [];
};

export const saveCustomPlan = (plan, userId = getActiveUserId()) => {
  if (!userId) return [];
  const plans = _runtimeMemory.customPlans[userId] || [];
  const existingIndex = plans.findIndex((p) => p.id === plan.id);
  let updated;
  if (existingIndex >= 0) {
    updated = [...plans];
    updated[existingIndex] = plan;
  } else {
    updated = [...plans, plan];
  }
  _runtimeMemory.customPlans[userId] = updated;

  // Sync to Supabase Cloud
  syncCustomPlanToSupabase(plan, userId);
  return updated;
};

export const deleteCustomPlan = (planId, userId = getActiveUserId()) => {
  if (!userId) return [];
  const plans = _runtimeMemory.customPlans[userId] || [];
  const updated = plans.filter((p) => p.id !== planId);
  _runtimeMemory.customPlans[userId] = updated;

  // Delete from Supabase Cloud
  deleteCustomPlanFromSupabase(planId, userId);
  return updated;
};

export const getUserProfile = (userId = getActiveUserId()) => {
  if (!userId) return null;
  if (_runtimeMemory.profiles[userId]) return _runtimeMemory.profiles[userId];
  const found = _runtimeMemory.users.find((u) => u.id === userId);
  if (found) return found;

  return {
    id: userId,
    name: 'สมาชิก',
    avatar: '🏋️‍♂️',
    weightKg: 70,
    heightCm: 175,
    streakDays: 1,
    weightHistory: [{ date: new Date().toISOString().slice(0, 10), weightKg: 70 }]
  };
};

export const saveUserProfile = (profile, userId = getActiveUserId()) => {
  if (!userId) return profile;
  const profileToSave = { ...profile, id: userId };
  _runtimeMemory.profiles[userId] = profileToSave;

  // Update in users list
  const existingIdx = _runtimeMemory.users.findIndex((u) => u.id === userId);
  if (existingIdx >= 0) {
    _runtimeMemory.users[existingIdx] = {
      ..._runtimeMemory.users[existingIdx],
      name: profileToSave.name,
      avatar: profileToSave.avatar || _runtimeMemory.users[existingIdx].avatar || '🏋️‍♂️',
      customAvatarUrl: profileToSave.customAvatarUrl,
      weightKg: profileToSave.weightKg,
      targetWeightKg: profileToSave.targetWeightKg,
      goal: profileToSave.goal,
      streakDays: profileToSave.streakDays,
      hasPin: Boolean(profileToSave.pinCode && profileToSave.pinCode.trim().length > 0)
    };
  }

  // Sync directly to Supabase Cloud
  syncProfileToSupabase(profileToSave);

  return profileToSave;
};

export const getAIChatHistory = (userId = getActiveUserId()) => {
  if (!userId) return [];
  return _runtimeMemory.aiChat[userId] || [];
};

export const saveAIChatHistory = (messages, userId = getActiveUserId()) => {
  if (!userId) return;
  _runtimeMemory.aiChat[userId] = messages;
};

// --- Custom Exercises Storage APIs ---
export const getCustomExercises = (userId = getActiveUserId()) => {
  if (!userId) return [];
  return _runtimeMemory.customExercises[userId] || [];
};

export const saveCustomExercise = (exercise, userId = getActiveUserId()) => {
  if (!userId) return [];
  const customExercises = _runtimeMemory.customExercises[userId] || [];
  const existingIdx = customExercises.findIndex((ex) => ex.id === exercise.id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...customExercises];
    updated[existingIdx] = exercise;
  } else {
    updated = [exercise, ...customExercises];
  }
  _runtimeMemory.customExercises[userId] = updated;

  // Sync to Supabase Cloud
  syncCustomExerciseToSupabase(exercise, userId);
  return updated;
};

export const deleteCustomExercise = (exerciseId, userId = getActiveUserId()) => {
  if (!userId) return [];
  const customExercises = _runtimeMemory.customExercises[userId] || [];
  const updated = customExercises.filter((ex) => ex.id !== exerciseId);
  _runtimeMemory.customExercises[userId] = updated;

  // Delete from Supabase Cloud
  deleteCustomExerciseFromSupabase(exerciseId, userId);
  return updated;
};

export const getAllExercises = (userId = getActiveUserId()) => {
  const customExercises = getCustomExercises(userId) || [];
  return [...customExercises, ...EXERCISE_DATABASE].filter(
    (ex) => ex && typeof ex === 'object' && ex.id
  );
};

// --- User PIN Verification ---
export const verifyUserPin = (userId, inputPin) => {
  const profile = getUserProfile(userId);
  if (!profile || !profile.pinCode || !profile.pinCode.trim()) return true; // No PIN set
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
  const profile = getUserProfile(userId) || {};
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
    version: '3.0',
    exportDate: new Date().toISOString(),
    profile,
    workoutLogs,
    customPlans,
    customExercises
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportPayload, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `FitTrainerAI_Cloud_${profile?.name || userId}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// --- User Data Restore (Import directly to Supabase Cloud) ---
export const importUserData = async (jsonData, targetUserId = getActiveUserId()) => {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
  }

  const { profile, workoutLogs, customPlans, customExercises } = jsonData;

  if (!profile || !profile.name) {
    throw new Error('ไม่พบข้อมูลโปรไฟล์ผู้ใช้งานในไฟล์นี้');
  }

  const userId = targetUserId || profile.id || `user-${Date.now()}`;
  const profileToSave = { ...profile, id: userId };

  _runtimeMemory.profiles[userId] = profileToSave;

  // Sync profile directly to Supabase Cloud
  await syncProfileToSupabase(profileToSave);

  if (Array.isArray(workoutLogs)) {
    const formattedLogs = workoutLogs.map((l) => ({
      ...l,
      user_id: userId,
      routineName: l.routineName || l.routine_name || l.name || 'Workout Session',
      durationMinutes: Number(l.durationMinutes ?? l.duration_minutes) || 0,
      caloriesBurned: Number(l.caloriesBurned ?? l.calories_burned) || 0,
      totalTonnageKg: Number(l.totalTonnageKg ?? l.total_tonnage_kg) || 0,
      exercises: Array.isArray(l.exercises) ? l.exercises : (Array.isArray(l.exercises_data) ? l.exercises_data : [])
    }));
    _runtimeMemory.workoutLogs[userId] = formattedLogs;

    // Upload each log to Supabase Cloud
    await Promise.all(formattedLogs.map((log) => syncWorkoutLogToSupabase(log, userId)));
  }

  if (Array.isArray(customPlans)) {
    _runtimeMemory.customPlans[userId] = customPlans;
    await Promise.all(customPlans.map((plan) => syncCustomPlanToSupabase(plan, userId)));
  }

  if (Array.isArray(customExercises)) {
    _runtimeMemory.customExercises[userId] = customExercises;
    await Promise.all(customExercises.map((ex) => syncCustomExerciseToSupabase(ex, userId)));
  }

  // Update Users summary in memory
  const existingIdx = _runtimeMemory.users.findIndex((u) => u.id === userId);
  const userSummary = {
    id: userId,
    name: profileToSave.name,
    avatar: profileToSave.avatar || '🏋️‍♂️',
    customAvatarUrl: profileToSave.customAvatarUrl,
    weightKg: profileToSave.weightKg,
    targetWeightKg: profileToSave.targetWeightKg,
    goal: profileToSave.goal,
    streakDays: profileToSave.streakDays || 1,
    hasPin: Boolean(profileToSave.pinCode && profileToSave.pinCode.trim().length > 0)
  };

  if (existingIdx >= 0) {
    _runtimeMemory.users[existingIdx] = userSummary;
  } else {
    _runtimeMemory.users.push(userSummary);
  }

  return profileToSave;
};
