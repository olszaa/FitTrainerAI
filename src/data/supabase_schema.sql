-- =========================================================================
-- FitTrainer AI - Supabase Database Schema Script
-- Run this SQL in your Supabase Project SQL Editor to setup all tables & RLS
-- =========================================================================

-- 1. Profiles Table (ผู้ใช้งานและข้อมูลสรีระ)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    username TEXT,
    name TEXT NOT NULL,
    email TEXT,
    avatar TEXT DEFAULT '🏋️‍♂️',
    custom_avatar_url TEXT,
    gender TEXT DEFAULT 'MALE',
    age INTEGER DEFAULT 28,
    weight_kg NUMERIC DEFAULT 72.0,
    target_weight_kg NUMERIC DEFAULT 75.0,
    height_cm NUMERIC DEFAULT 175.0,
    goal TEXT DEFAULT 'MUSCLE_BUILDING',
    gym_level TEXT DEFAULT 'INTERMEDIATE',
    target_days_per_week INTEGER DEFAULT 4,
    streak_days INTEGER DEFAULT 1,
    pin_code TEXT,
    motto TEXT,
    favorite_muscle TEXT,
    weight_history JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workout Logs Table (บันทึกการซ้อมออกกำลังกาย)
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    routine_name TEXT NOT NULL,
    mode TEXT DEFAULT 'GYM',
    duration_minutes INTEGER DEFAULT 0,
    calories_burned INTEGER DEFAULT 0,
    total_tonnage_kg NUMERIC DEFAULT 0,
    exercises_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Custom Plans Table (ตารางฝึกที่ผู้ใช้สร้างเอง)
CREATE TABLE IF NOT EXISTS public.custom_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    name_th TEXT,
    category TEXT DEFAULT 'GYM',
    description TEXT,
    exercises_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Custom Exercises Table (ท่าฝึกเฉพาะตัวที่ผู้ใช้สร้างเอง)
CREATE TABLE IF NOT EXISTS public.custom_exercises (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    name_th TEXT,
    category TEXT DEFAULT 'CHEST',
    muscle TEXT,
    secondary_muscles JSONB DEFAULT '[]'::jsonb,
    equipment TEXT DEFAULT 'DUMBBELL',
    is_gym BOOLEAN DEFAULT TRUE,
    is_home BOOLEAN DEFAULT TRUE,
    icon TEXT DEFAULT '🏋️‍♂️',
    image_url TEXT,
    instructions JSONB DEFAULT '[]'::jsonb,
    tips TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_workout_logs_user ON public.workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_plans_user ON public.custom_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_exercises_user ON public.custom_exercises(user_id);

-- Enable Row Level Security (RLS) and allow public anonymous access for simple multi-user setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;

-- Permissive policies for FitTrainer AI app
CREATE POLICY "Allow public read/write profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write workout_logs" ON public.workout_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write custom_plans" ON public.custom_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write custom_exercises" ON public.custom_exercises FOR ALL USING (true) WITH CHECK (true);
