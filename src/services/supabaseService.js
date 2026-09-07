import { getSupabaseClient, isSupabaseConfigured } from '../utils/supabaseClient';

// Helper to check connection health
export const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'ยังไม่ได้ระบุ VITE_SUPABASE_URL หรือ ANON_KEY' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'ไม่สามารถสร้าง Supabase Client ได้' };
  }

  try {
    const { error } = await client.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: `ข้อผิดพลาดจาก Supabase: ${error.message}` };
    }
    return { success: true, message: 'เชื่อมต่อ Supabase Database สำเร็จแล้ว! ⚡' };
  } catch (e) {
    return { success: false, message: `ไม่สามารถเชื่อมต่อได้: ${e.message}` };
  }
};

// --- Profile Cloud Sync ---
export const syncProfileToSupabase = async (profile) => {
  if (!isSupabaseConfigured() || !profile?.id) return null;
  const client = getSupabaseClient();
  if (!client) return null;

  const payload = {
    id: profile.id,
    username: profile.username || profile.name || null,
    name: profile.name,
    email: profile.email || null,
    avatar: profile.avatar || '🏋️‍♂️',
    custom_avatar_url: profile.customAvatarUrl || null,
    gender: profile.gender || 'MALE',
    age: Number(profile.age) || 28,
    weight_kg: Number(profile.weightKg) || 72,
    target_weight_kg: Number(profile.targetWeightKg) || 75,
    height_cm: Number(profile.heightCm) || 175,
    goal: profile.goal || 'MUSCLE_BUILDING',
    gym_level: profile.gymLevel || 'INTERMEDIATE',
    target_days_per_week: Number(profile.targetDaysPerWeek) || 4,
    streak_days: Number(profile.streakDays) || 1,
    pin_code: profile.pinCode || null,
    motto: profile.motto || null,
    favorite_muscle: profile.favoriteMuscle || null,
    weight_history: profile.weightHistory || [],
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await client.from('profiles').upsert(payload).select();
    if (!error && data) return data;

    console.warn('Supabase Full Profile Sync Warning:', error?.message);

    // Fallback: Core payload without username/email if columns do not exist in DB schema
    const corePayload = {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar || '🏋️‍♂️',
      gender: profile.gender || 'MALE',
      age: Number(profile.age) || 28,
      weight_kg: Number(profile.weightKg) || 72,
      target_weight_kg: Number(profile.targetWeightKg) || 75,
      height_cm: Number(profile.heightCm) || 175,
      goal: profile.goal || 'MUSCLE_BUILDING',
      gym_level: profile.gymLevel || 'INTERMEDIATE',
      target_days_per_week: Number(profile.targetDaysPerWeek) || 4,
      streak_days: Number(profile.streakDays) || 1,
      pin_code: profile.pinCode || null,
      updated_at: new Date().toISOString()
    };
    const { data: coreData, error: coreError } = await client.from('profiles').upsert(corePayload).select();
    if (coreError) console.warn('Supabase Core Profile Sync Error:', coreError.message);
    return coreData;
  } catch (e) {
    console.warn('Supabase Profile Sync Exception:', e);
    return null;
  }
};

export const searchProfileFromSupabase = async (queryText) => {
  if (!isSupabaseConfigured() || !queryText?.trim()) return [];
  const client = getSupabaseClient();
  if (!client) return [];

  const search = queryText.trim().toLowerCase();

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${search}%,id.eq.${search}`);

    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        username: d.username || d.name,
        name: d.name,
        email: d.email || '',
        avatar: d.avatar || '🏋️‍♂️',
        customAvatarUrl: d.custom_avatar_url,
        gender: d.gender,
        age: d.age,
        weightKg: d.weight_kg,
        targetWeightKg: d.target_weight_kg,
        heightCm: d.height_cm,
        goal: d.goal,
        gymLevel: d.gym_level,
        targetDaysPerWeek: d.target_days_per_week,
        streakDays: d.streak_days,
        pinCode: d.pin_code,
        motto: d.motto,
        favoriteMuscle: d.favorite_muscle,
        weightHistory: d.weight_history || []
      }));
    }
  } catch (e) {
    console.warn('searchProfileFromSupabase error:', e);
  }
  return [];
};

export const fetchProfileFromSupabase = async (userId) => {
  if (!isSupabaseConfigured() || !userId) return null;
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();
    if (error) return null;
    if (!data) return null;

    return {
      id: data.id,
      username: data.username || data.name,
      name: data.name,
      email: data.email || '',
      avatar: data.avatar,
      customAvatarUrl: data.custom_avatar_url,
      gender: data.gender,
      age: data.age,
      weightKg: data.weight_kg,
      targetWeightKg: data.target_weight_kg,
      heightCm: data.height_cm,
      goal: data.goal,
      gymLevel: data.gym_level,
      targetDaysPerWeek: data.target_days_per_week,
      streakDays: data.streak_days,
      pinCode: data.pin_code,
      motto: data.motto,
      favoriteMuscle: data.favorite_muscle,
      weightHistory: data.weight_history || []
    };
  } catch (e) {
    return null;
  }
};

export const fetchAllProfilesFromSupabase = async () => {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client.from('profiles').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((d) => ({
      id: d.id,
      username: d.username || d.name,
      name: d.name,
      email: d.email || '',
      avatar: d.avatar || '🏋️‍♂️',
      customAvatarUrl: d.custom_avatar_url,
      gender: d.gender,
      age: d.age,
      weightKg: d.weight_kg,
      targetWeightKg: d.target_weight_kg,
      heightCm: d.height_cm,
      goal: d.goal,
      gymLevel: d.gym_level,
      targetDaysPerWeek: d.target_days_per_week,
      streakDays: d.streak_days,
      pinCode: d.pin_code,
      motto: d.motto,
      favoriteMuscle: d.favorite_muscle,
      weightHistory: d.weight_history || [],
      hasPin: Boolean(d.pin_code && String(d.pin_code).trim().length === 4)
    }));
  } catch (e) {
    console.warn('Fetch all profiles from Supabase error:', e);
    return [];
  }
};

// --- Workout Logs Cloud Sync ---
export const syncWorkoutLogToSupabase = async (log, userId) => {
  if (!isSupabaseConfigured() || !log?.id) return null;
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const payload = {
      id: log.id,
      user_id: userId,
      date: log.date || new Date().toISOString(),
      routine_name: log.routineName || 'Workout Session',
      mode: log.mode || 'GYM',
      duration_minutes: log.durationMinutes || 0,
      calories_burned: log.caloriesBurned || 0,
      total_tonnage_kg: log.totalTonnageKg || 0,
      exercises_data: log.exercises || []
    };

    const { data, error } = await client.from('workout_logs').upsert(payload).select();
    if (error) console.warn('Supabase Workout Log Sync Error:', error.message);
    return data;
  } catch (e) {
    return null;
  }
};

export const fetchWorkoutLogsFromSupabase = async (userId) => {
  if (!isSupabaseConfigured() || !userId) return [];
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error || !data) return [];

    return data.map((item) => ({
      id: item.id,
      date: item.date,
      routineName: item.routine_name,
      mode: item.mode,
      durationMinutes: item.duration_minutes,
      caloriesBurned: item.calories_burned,
      totalTonnageKg: item.total_tonnage_kg,
      exercises: item.exercises_data || []
    }));
  } catch (e) {
    return [];
  }
};

// --- Custom Plans Cloud Sync ---
export const syncCustomPlanToSupabase = async (plan, userId) => {
  if (!isSupabaseConfigured() || !plan?.id) return null;
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const payload = {
      id: plan.id,
      user_id: userId,
      name: plan.name || plan.nameTh || 'Custom Plan',
      name_th: plan.nameTh || plan.name,
      category: plan.category || 'GYM',
      description: plan.description || '',
      exercises_data: plan.exercises || [],
      updated_at: new Date().toISOString()
    };

    const { data, error } = await client.from('custom_plans').upsert(payload).select();
    if (error) console.warn('Supabase Custom Plan Sync Error:', error.message);
    return data;
  } catch (e) {
    return null;
  }
};

export const fetchCustomPlansFromSupabase = async (userId) => {
  if (!isSupabaseConfigured() || !userId) return [];
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client.from('custom_plans').select('*').eq('user_id', userId);
    if (error || !data) return [];

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      nameTh: item.name_th,
      category: item.category,
      description: item.description,
      exercises: item.exercises_data || [],
      isCustom: true
    }));
  } catch (e) {
    return [];
  }
};

// --- Custom Exercises Cloud Sync ---
export const syncCustomExerciseToSupabase = async (exercise, userId) => {
  if (!isSupabaseConfigured() || !exercise?.id) return null;
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const payload = {
      id: exercise.id,
      user_id: userId,
      name: exercise.name || exercise.nameTh,
      name_th: exercise.nameTh || exercise.name,
      category: exercise.category || 'CHEST',
      muscle: exercise.muscle || 'General',
      secondary_muscles: exercise.secondaryMuscles || [],
      equipment: exercise.equipment || 'DUMBBELL',
      is_gym: exercise.isGym !== false,
      is_home: exercise.isHome !== false,
      icon: exercise.icon || '🏋️‍♂️',
      image_url: exercise.imageUrl || null,
      instructions: exercise.instructions || [],
      tips: exercise.tips || null
    };

    const { data, error } = await client.from('custom_exercises').upsert(payload).select();
    if (error) console.warn('Supabase Custom Exercise Sync Error:', error.message);
    return data;
  } catch (e) {
    return null;
  }
};

export const fetchCustomExercisesFromSupabase = async (userId) => {
  if (!isSupabaseConfigured() || !userId) return [];
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client.from('custom_exercises').select('*').eq('user_id', userId);
    if (error || !data) return [];

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      nameTh: item.name_th,
      category: item.category,
      muscle: item.muscle,
      secondaryMuscles: item.secondary_muscles || [],
      equipment: item.equipment,
      isGym: item.is_gym,
      isHome: item.is_home,
      icon: item.icon,
      imageUrl: item.image_url,
      instructions: item.instructions || [],
      tips: item.tips,
      isCustom: true
    }));
  } catch (e) {
    return [];
  }
};

// --- Full Sync All Local Data to Supabase Cloud ---
export const syncAllLocalDataToSupabase = async (profile, logs, plans, customExercises) => {
  if (!isSupabaseConfigured() || !profile?.id) return { success: false, count: 0 };
  const userId = profile.id;

  try {
    await syncProfileToSupabase(profile);
    let count = 1;

    if (Array.isArray(logs)) {
      for (const log of logs) {
        await syncWorkoutLogToSupabase(log, userId);
        count++;
      }
    }

    if (Array.isArray(plans)) {
      for (const plan of plans) {
        await syncCustomPlanToSupabase(plan, userId);
        count++;
      }
    }

    if (Array.isArray(customExercises)) {
      for (const ex of customExercises) {
        await syncCustomExerciseToSupabase(ex, userId);
        count++;
      }
    }

    return { success: true, count };
  } catch (e) {
    return { success: false, message: e.message, count: 0 };
  }
};
