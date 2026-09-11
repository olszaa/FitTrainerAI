import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Activity,
  Flame,
  Scale,
  Target,
  Trophy,
  Save,
  CheckCircle2,
  Calendar,
  Zap,
  TrendingUp,
  HeartPulse,
  Sparkles,
  Plus,
  Trash2,
  Users,
  Check,
  UserPlus,
  Play,
  Pause,
  Sliders,
  RotateCcw,
  Cpu,
  Layers,
  ArrowRight,
  ChevronRight,
  Crop,
  Maximize2,
  Lock,
  ShieldCheck
} from 'lucide-react';
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE
} from '../utils/fitnessCalculators';
import MuscleHeatmap from './MuscleHeatmap';

const AVATAR_OPTIONS = ['🏋️‍♂️', '🏃‍♀️', '🥊', '⚡', '🧘', '🦾', '🥇', '🎯', '🔥', '🚴'];

export default function BodyAndMuscles({
  workoutLogs = [],
  userProfile,
  onSaveProfile,
  usersList = [],
  activeUserId,
  onSwitchUser,
  onCreateUser,
  onDeleteUser,
  initialSubTab = 'PROFILE'
}) {
  const [subTab, setSubTab] = useState(initialSubTab); // 'PROFILE' | 'MUSCLES' | 'USERS'
  const [successMsg, setSuccessMsg] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(() => sessionStorage.getItem('fittrainer_admin_session') === 'true');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminPassError, setAdminPassError] = useState('');

  // 3D Mannequin Video State
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlayingMorph, setIsPlayingMorph] = useState(false);
  const [morphBmiDisplay, setMorphBmiDisplay] = useState(null);
  const [isCropSide, setIsCropSide] = useState(true); // Default true: crop side borders to focus on mannequin

  // Form state
  const [form, setForm] = useState({
    name: userProfile?.name || 'คุณยท',
    avatar: userProfile?.avatar || '🏋️‍♂️',
    gender: userProfile?.gender || 'MALE',
    age: userProfile?.age || 28,
    weightKg: userProfile?.weightKg || 72,
    targetWeightKg: userProfile?.targetWeightKg || 75,
    heightCm: userProfile?.heightCm || 175,
    goal: userProfile?.goal || 'MUSCLE_BUILDING',
    gymLevel: userProfile?.gymLevel || 'INTERMEDIATE',
    targetDaysPerWeek: userProfile?.targetDaysPerWeek || 4,
    streakDays: userProfile?.streakDays || 4,
    weightHistory: userProfile?.weightHistory || [
      { date: new Date().toISOString().slice(0, 10), weightKg: userProfile?.weightKg || 72 }
    ]
  });

  const [newLogWeight, setNewLogWeight] = useState(userProfile?.weightKg || 72);

  // New user creation state
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    avatar: '🏋️‍♂️',
    gender: 'MALE',
    age: 26,
    weightKg: 68,
    targetWeightKg: 70,
    heightCm: 172,
    goal: 'MUSCLE_BUILDING',
    gymLevel: 'BEGINNER',
    targetDaysPerWeek: 4,
  });

  // Sync when userProfile prop changes
  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || 'คุณยท',
        avatar: userProfile.avatar || '🏋️‍♂️',
        gender: userProfile.gender || 'MALE',
        age: userProfile.age || 28,
        weightKg: userProfile.weightKg || 72,
        targetWeightKg: userProfile.targetWeightKg || 75,
        heightCm: userProfile.heightCm || 175,
        goal: userProfile.goal || 'MUSCLE_BUILDING',
        gymLevel: userProfile.gymLevel || 'INTERMEDIATE',
        targetDaysPerWeek: userProfile.targetDaysPerWeek || 4,
        streakDays: userProfile.streakDays || 4,
        weightHistory: userProfile.weightHistory || [
          { date: new Date().toISOString().slice(0, 10), weightKg: userProfile.weightKg || 72 }
        ]
      });
      setNewLogWeight(userProfile.weightKg || 72);
    }
  }, [userProfile, activeUserId]);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Derived metrics
  const bmi = calculateBMI(form.weightKg, form.heightCm);
  const bmiCat = getBMICategory(bmi);
  const bmr = calculateBMR(form.weightKg, form.heightCm, form.age, form.gender);
  const tdee = calculateTDEE(bmr, 'MODERATE');
  const cutCalories = Math.round(tdee - 500);
  const bulkCalories = Math.round(tdee + 300);
  const weightDiff = (Number(form.targetWeightKg) - Number(form.weightKg)).toFixed(1);

  // Video source based on gender
  const videoSrc = form.gender === 'FEMALE' ? '/videos/FemaleMannequin.mp4' : '/videos/MaleMannequin.mp4';

  // Sync video seek position to BMI (range 10.0 to 60.0)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoLoaded || isPlayingMorph) return;

    const clampedBmi = Math.max(10, Math.min(60, bmi));
    const duration = video.duration || 6.042;
    const progress = (clampedBmi - 10) / 50;
    const targetTime = Math.max(0.01, Math.min(duration - 0.05, progress * duration));

    try {
      video.currentTime = targetTime;
      setMorphBmiDisplay(bmi);
    } catch (e) {
      console.warn('Video seek error:', e);
    }
  }, [bmi, form.gender, videoLoaded, isPlayingMorph]);

  // Animation morph loop (plays from BMI 10 to 60)
  useEffect(() => {
    let animFrame;
    const video = videoRef.current;
    if (!video) return;

    if (isPlayingMorph) {
      video.playbackRate = 1.0;
      video.play().catch(() => {});

      const updateMorphDisplay = () => {
        if (!video) return;
        const duration = video.duration || 6.042;
        const currentProgress = video.currentTime / duration;
        const liveBmi = Math.round((10 + currentProgress * 50) * 10) / 10;
        setMorphBmiDisplay(liveBmi);

        if (video.currentTime >= duration - 0.1 || video.ended) {
          setIsPlayingMorph(false);
          const currentBmi = calculateBMI(form.weightKg, form.heightCm);
          const progress = (Math.max(10, Math.min(60, currentBmi)) - 10) / 50;
          video.currentTime = progress * duration;
          setMorphBmiDisplay(currentBmi);
        } else {
          animFrame = requestAnimationFrame(updateMorphDisplay);
        }
      };

      animFrame = requestAnimationFrame(updateMorphDisplay);
    } else {
      video.pause();
    }

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isPlayingMorph, form.weightKg, form.heightCm]);

  const togglePlayMorph = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlayingMorph) {
      setIsPlayingMorph(false);
    } else {
      video.currentTime = 0.05;
      setIsPlayingMorph(true);
    }
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSaveProfile(form);
    setSuccessMsg('✅ บันทึกข้อมูลสรีระและเป้าหมายสำเร็จ!');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleAddWeightLog = () => {
    const parsedWeight = parseFloat(newLogWeight);
    if (!parsedWeight || isNaN(parsedWeight)) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const updatedHistory = [
      { date: todayStr, weightKg: parsedWeight },
      ...(form.weightHistory || []).filter((item) => item.date !== todayStr)
    ];

    const updated = {
      ...form,
      weightKg: parsedWeight,
      weightHistory: updatedHistory
    };

    setForm(updated);
    onSaveProfile(updated);
    setSuccessMsg(`⚖️ บันทึกน้ำหนัก ${parsedWeight} kg สำเร็จ!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateNewUser = (e) => {
    e.preventDefault();
    if (!newUserForm.name.trim()) {
      alert('กรุณากรอกชื่อผู้ใช้');
      return;
    }
    onCreateUser(newUserForm);
    setIsCreatingUser(false);
    setNewUserForm({
      name: '',
      avatar: '🏋️‍♂️',
      gender: 'MALE',
      age: 26,
      weightKg: 68,
      targetWeightKg: 70,
      heightCm: 172,
      goal: 'MUSCLE_BUILDING',
      gymLevel: 'BEGINNER',
      targetDaysPerWeek: 4,
    });
    setSuccessMsg('✨ สร้างและสลับไปยังผู้ใช้ใหม่สำเร็จ!');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* ========================================================================= */}
      {/* TOP HEADER: PHYSIQUE & MUSCLE ANATOMY DASHBOARD */}
      {/* ========================================================================= */}
      <div className="relative glass-panel border-cyan-500/40 rounded-3xl p-5 sm:p-6 overflow-hidden neon-border-cyan bg-gradient-to-r from-slate-950 via-[#0e1320] to-slate-950 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 mb-1 font-black text-[11px] uppercase tracking-widest">
              <Cpu className="w-4 h-4 animate-pulse text-cyan-400" />
              <span>3D PHYSIQUE & ANATOMY SUITE • SCI-FI SPORTS MEDICINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <span>สรีระ & กล้ามเนื้อ (Physique & Muscles)</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold uppercase">
                3D Mannequin
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              ศูนย์กลางจัดการข้อมูลสรีระส่วนบุคคล ดัชนีมวลกาย (BMI 10 - 60) หุ่นจำลอง 3D สด สไลเดอร์ปรับน้ำหนัก/ส่วนสูง และแผนภูมิวิเคราะห์ความล้ากล้ามเนื้อ
            </p>
          </div>

          {/* User Quick Switcher Summary */}
          <div className="flex items-center space-x-2.5 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-lime-400 p-[2px] shadow-md shadow-cyan-500/20 flex items-center justify-center text-xl bg-[#0b0d12]">
              <span>{form.avatar || '🏋️‍♂️'}</span>
            </div>
            <div className="text-xs">
              <div className="flex items-center space-x-1.5 font-black text-white">
                <span>{form.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {form.weightKg} kg
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                BMI: <strong className="text-cyan-400 font-bold">{bmi}</strong> ({bmiCat.label})
              </div>
            </div>
          </div>
        </div>

        {/* Unified Sub-Nav Switcher */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-bold w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSubTab('PROFILE')}
              className={`py-2 px-3 sm:px-4 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                subTab === 'PROFILE'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>👤 สรีระ & เป้าหมาย</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('MUSCLES')}
              className={`py-2 px-3 sm:px-4 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                subTab === 'MUSCLES'
                  ? 'bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-950 font-black shadow-lg shadow-lime-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>🧬 วิเคราะห์กล้ามเนื้อ</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('USERS')}
              className={`py-2 px-3 sm:px-4 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                subTab === 'USERS'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black shadow-lg shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>👥 จัดการผู้ใช้ ({usersList.length})</span>
            </button>
          </div>

          {/* Quick Action indicator */}
          {subTab === 'PROFILE' && (
            <button
              type="button"
              onClick={handleSave}
              className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Success Toast */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold flex items-center space-x-2 shadow-lg animate-fade-in text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PERSONAL PROFILE & FITNESS GOALS (WITH 3D MANNEQUIN & SLIDERS) */}
      {/* ========================================================================= */}
      {subTab === 'PROFILE' && (
        <div className="space-y-6">
          
          {/* --- 3D MANNEQUIN VIDEO VISUALIZER (BMI 10 - 60) & TRIPLE SLIDERS (SIDE-BY-SIDE) --- */}
          <div className="glass-panel border-cyan-500/40 rounded-3xl p-4 sm:p-6 relative overflow-hidden bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 neon-border-cyan shadow-2xl">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center space-x-2">
                    <span>3D Mannequin จำลองสรีระตามดัชนีมวลกาย (BMI 10 - 60)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    วิดีโอ 3D จำลองรูปร่างสรีระตามค่า BMI 10 ถึง 60 ({form.gender === 'FEMALE' ? 'FemaleMannequin.mp4' : 'MaleMannequin.mp4'})
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Crop Side Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsCropSide(!isCropSide)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                    isCropSide
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-extrabold shadow-sm'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="คลิกเพื่อสลับระหว่างโหมดตัดขอบข้าง (Focus) กับแสดงเต็มกรอบ (Full Frame)"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>{isCropSide ? '✂️ ตัดขอบข้าง (โฟกัสหุ่น)' : '↔️ ขอบเดิม (เต็มกรอบ)'}</span>
                </button>

                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {form.gender === 'FEMALE' ? '👩 โมเดลหญิง' : '👨 โมเดลชาย'}
                </span>

                <button
                  type="button"
                  onClick={togglePlayMorph}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md ${
                    isPlayingMorph
                      ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black active:scale-95'
                  }`}
                >
                  {isPlayingMorph ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-slate-950" />
                      <span>หยุด</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>▶️ ชม Morph (10➔60)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SIDE-BY-SIDE 2-COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* LEFT COLUMN: 3D MANNEQUIN VIDEO (SIDE-CROPPABLE) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="relative rounded-2xl overflow-hidden bg-black/95 border border-slate-800 flex items-center justify-center shadow-inner group w-full h-[380px] sm:h-[440px] lg:h-full min-h-[380px] lg:min-h-[440px]">
                  {/* Sci-Fi HUD Watermark */}
                  <div className="absolute top-3 left-3 z-20 flex items-center space-x-1.5 text-[9px] font-black tracking-widest text-cyan-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30 backdrop-blur-sm pointer-events-none">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>3D MORPH // {isCropSide ? 'CROPPED FOCUS' : 'FULL FRAME'}</span>
                  </div>

                  <div className="absolute top-3 right-3 z-20 flex items-center space-x-1.5 text-[10px] font-extrabold bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-700 backdrop-blur-sm pointer-events-none">
                    <span className="text-slate-400">ค่า BMI:</span>
                    <span className="text-cyan-400 font-black text-sm">
                      {isPlayingMorph ? (morphBmiDisplay || 10) : bmi}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${bmiCat.color}`}>
                      {bmiCat.label}
                    </span>
                  </div>

                  {/* HTML5 Video Element with side-crop mode */}
                  <video
                    ref={videoRef}
                    key={videoSrc}
                    src={videoSrc}
                    preload="auto"
                    playsInline
                    muted
                    onLoadedMetadata={() => {
                      setVideoLoaded(true);
                      if (videoRef.current) {
                        const duration = videoRef.current.duration || 6.042;
                        const clampedBmi = Math.max(10, Math.min(60, bmi));
                        const progress = (clampedBmi - 10) / 50;
                        videoRef.current.currentTime = Math.max(0.01, progress * duration);
                      }
                    }}
                    className={`w-full h-full cursor-pointer transition-all duration-500 ${
                      isCropSide
                        ? 'object-cover object-center scale-[1.14]'
                        : 'object-contain object-center scale-100'
                    }`}
                    onClick={togglePlayMorph}
                  />

                  {/* Bottom Video HUD Overlay */}
                  <div className="absolute bottom-2 inset-x-3 z-20 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 bg-slate-950/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 pointer-events-none">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-semibold text-slate-300">
                        {form.gender === 'FEMALE' ? 'FemaleMannequin.mp4' : 'MaleMannequin.mp4'}
                      </span>
                    </div>
                    <div>
                      {isCropSide ? '✂️ ตัดขอบข้างแล้ว (สรีระเต็มตา)' : '↔️ แสดงขนาดเต็มไฟล์'}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: SLIDERS CONTROL PANEL (PLACED DIRECTLY ON THE SIDE) */}
              <div className="lg:col-span-7 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-4">
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span className="font-black text-xs sm:text-sm text-white">
                      แถบสไลเดอร์ปรับค่าสรีระ (Interactive Sliders)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    เลื่อนเพื่อซิงก์หุ่น 3D แบบเรียลไทม์
                  </span>
                </div>

                {/* 1. Interactive BMI Slider (10 - 60) */}
                <div className="space-y-1.5 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5 font-black text-cyan-300">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>1. สไลเดอร์ปรับค่า BMI (10 - 60)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400 font-medium">ดัชนีมวลกาย:</span>
                      <span className="text-cyan-300 font-black text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30">
                        {bmi} kg/m²
                      </span>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="0.2"
                      value={bmi}
                      onChange={(e) => {
                        if (isPlayingMorph) setIsPlayingMorph(false);
                        const targetBmi = Number(e.target.value);
                        const heightM = (Number(form.heightCm) || 175) / 100;
                        const newWeight = Math.round(targetBmi * heightM * heightM * 10) / 10;
                        handleFieldChange('weightKg', newWeight);
                      }}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    
                    <div className="flex justify-between text-[9px] text-slate-400 pt-1 font-semibold">
                      <span className="text-sky-400">10 (ผอมมาก)</span>
                      <span className="text-sky-300">18.5</span>
                      <span className="text-emerald-400 font-bold">22.9 (สมส่วน)</span>
                      <span className="text-amber-400">24.9</span>
                      <span className="text-orange-400">29.9 (อ้วน 1)</span>
                      <span className="text-red-400">60 (อ้วนมาก)</span>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Weight Slider (30 - 160 kg) */}
                <div className="space-y-1.5 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5 font-black text-amber-300">
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      <span>2. สไลเดอร์ปรับน้ำหนักตัว (Weight)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleFieldChange('weightKg', Math.max(30, (Number(form.weightKg) - 0.5).toFixed(1)))}
                        className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs active:scale-95"
                      >
                        -
                      </button>
                      <span className="text-amber-300 font-black text-xs px-2.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30">
                        {form.weightKg} kg
                      </span>
                      <button
                        type="button"
                        onClick={() => handleFieldChange('weightKg', (Number(form.weightKg) + 0.5).toFixed(1))}
                        className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="30"
                      max="160"
                      step="0.5"
                      value={form.weightKg}
                      onChange={(e) => {
                        if (isPlayingMorph) setIsPlayingMorph(false);
                        handleFieldChange('weightKg', Number(e.target.value));
                      }}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 pt-1 font-semibold">
                      <span>30 kg</span>
                      <span>50 kg</span>
                      <span>70 kg</span>
                      <span>90 kg</span>
                      <span>110 kg</span>
                      <span>130 kg</span>
                      <span>160 kg</span>
                    </div>
                  </div>
                </div>

                {/* 3. Interactive Height Slider (120 - 220 cm) */}
                <div className="space-y-1.5 pb-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5 font-black text-emerald-300">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>3. สไลเดอร์ปรับส่วนสูง (Height)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleFieldChange('heightCm', Math.max(120, Number(form.heightCm) - 1))}
                        className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs active:scale-95"
                      >
                        -
                      </button>
                      <span className="text-emerald-300 font-black text-xs px-2.5 py-0.5 rounded-md bg-emerald-400/10 border border-emerald-400/30">
                        {form.heightCm} cm
                      </span>
                      <button
                        type="button"
                        onClick={() => handleFieldChange('heightCm', Math.min(220, Number(form.heightCm) + 1))}
                        className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="120"
                      max="220"
                      step="1"
                      value={form.heightCm}
                      onChange={(e) => {
                        if (isPlayingMorph) setIsPlayingMorph(false);
                        handleFieldChange('heightCm', Number(e.target.value));
                      }}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 pt-1 font-semibold">
                      <span>120 cm</span>
                      <span>140 cm</span>
                      <span>160 cm</span>
                      <span>175 cm (มาตรฐาน)</span>
                      <span>190 cm</span>
                      <span>220 cm</span>
                    </div>
                  </div>
                </div>

                {/* Quick Diagnostics Strip */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[10px]">
                  <div className="bg-slate-950/80 p-2 rounded-xl text-center border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">BMI</span>
                    <span className="font-extrabold text-cyan-400">{bmi}</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-xl text-center border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">BMR</span>
                    <span className="font-extrabold text-amber-300">{bmr.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-xl text-center border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">TDEE</span>
                    <span className="font-extrabold text-lime-400">{tdee.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-xl text-center border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">เป้าหมาย</span>
                    <span className="font-extrabold text-purple-300">{form.targetWeightKg} kg</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* --- SECTION 2: HEALTH & METABOLIC DIAGNOSTICS CARDS --- */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* BMI Card */}
            <div className="glass-panel border-cyan-500/30 rounded-2xl p-4 bg-slate-900/80">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>ดัชนีมวลกาย (BMI)</span>
                <Scale className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">{bmi}</div>
              <div className={`text-xs font-bold mt-1 ${bmiCat.color}`}>
                {bmiCat.label}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">เกณฑ์ปกติ 18.5 - 22.9</div>
            </div>

            {/* BMR Card */}
            <div className="glass-panel border-amber-500/30 rounded-2xl p-4 bg-slate-900/80">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>BMR (ขณะพักผ่อน)</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">{bmr.toLocaleString()}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">kcal / วัน</div>
              <div className="text-[10px] text-slate-400 mt-1">พลังงานขั้นต่ำที่อวัยวะใช้</div>
            </div>

            {/* TDEE Card */}
            <div className="glass-panel border-lime-500/30 rounded-2xl p-4 bg-slate-900/80">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>TDEE (รวมกิจกรรม)</span>
                <Flame className="w-4 h-4 text-lime-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-lime-300">{tdee.toLocaleString()}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">kcal / วัน</div>
              <div className="text-[10px] text-slate-400 mt-1">
                Cut: ~{cutCalories.toLocaleString()} | Bulk: ~{bulkCalories.toLocaleString()}
              </div>
            </div>

            {/* Goal Weight Gap Card */}
            <div className="glass-panel border-purple-500/30 rounded-2xl p-4 bg-slate-900/80">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>เป้าหมายน้ำหนัก</span>
                <Target className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">{form.targetWeightKg} kg</div>
              <div className="text-xs font-bold text-purple-300 mt-1">
                {weightDiff > 0 ? `เพิ่มอีก +${weightDiff} kg` : weightDiff < 0 ? `ลดอีก ${weightDiff} kg` : 'ตรงเป้าหมายแล้ว!'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">เป้าหมาย: {form.goal}</div>
            </div>
          </div>

          {/* --- SECTION 3: PERSONAL DETAILS & FITNESS GOALS FORMS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Box: Basic Information Form */}
            <div className="glass-panel border-slate-800 rounded-3xl p-5 space-y-4 bg-slate-900/70">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-xs">
                <User className="w-4 h-4" />
                <span>ข้อมูลสรีระ & Avatar (Personal Details)</span>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">เลือกไอคอนประจำตัว (Avatar)</label>
                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleFieldChange('avatar', emoji)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                        form.avatar === emoji
                          ? 'bg-cyan-500/20 border-2 border-cyan-400 scale-110 shadow-md'
                          : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ชื่อ / นามแฝง</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="เช่น คุณยท"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-cyan-500 font-bold text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">เพศสรีระ (โมเดล 3D)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('gender', 'MALE')}
                      className={`py-2.5 rounded-xl font-bold border transition-all text-xs ${
                        form.gender === 'MALE'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-black'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      👨 ชาย (Male)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('gender', 'FEMALE')}
                      className={`py-2.5 rounded-xl font-bold border transition-all text-xs ${
                        form.gender === 'FEMALE'
                          ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-black'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      👩 หญิง (Female)
                    </button>
                  </div>
                </div>
              </div>

              {/* Numerical Fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] mb-1">อายุ (ปี)</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('age', Math.max(10, Number(form.age) - 1))}
                      className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => handleFieldChange('age', Math.max(10, Number(e.target.value) || 10))}
                      className="w-full bg-transparent text-center font-black text-white text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleFieldChange('age', Number(form.age) + 1)}
                      className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] mb-1">ส่วนสูง (cm)</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('heightCm', Math.max(100, Number(form.heightCm) - 1))}
                      className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={form.heightCm}
                      onChange={(e) => handleFieldChange('heightCm', Math.max(100, Number(e.target.value) || 100))}
                      className="w-full bg-transparent text-center font-black text-white text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleFieldChange('heightCm', Number(form.heightCm) + 1)}
                      className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] mb-1">น้ำหนักปัจจุบัน (kg)</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('weightKg', Math.max(30, (Number(form.weightKg) - 0.5).toFixed(1)))}
                      className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      value={form.weightKg}
                      onChange={(e) => handleFieldChange('weightKg', Math.max(30, Number(e.target.value) || 30))}
                      className="w-full bg-transparent text-center font-black text-cyan-300 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleFieldChange('weightKg', (Number(form.weightKg) + 0.5).toFixed(1))}
                      className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] mb-1">เป้าหมาย (kg)</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('targetWeightKg', Math.max(30, (Number(form.targetWeightKg) - 0.5).toFixed(1)))}
                      className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      value={form.targetWeightKg}
                      onChange={(e) => handleFieldChange('targetWeightKg', Math.max(30, Number(e.target.value) || 30))}
                      className="w-full bg-transparent text-center font-black text-lime-400 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleFieldChange('targetWeightKg', (Number(form.targetWeightKg) + 0.5).toFixed(1))}
                      className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Goals, Experience & Weight History Tracker */}
            <div className="space-y-4">
              
              {/* Goals & Experience */}
              <div className="glass-panel border-slate-800 rounded-3xl p-5 space-y-3.5 bg-slate-900/70">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-xs">
                  <Target className="w-4 h-4" />
                  <span>เป้าหมาย & ประสบการณ์ (Fitness Goals)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'MUSCLE_BUILDING', label: 'สร้างกล้ามเนื้อ', sub: 'Hypertrophy', icon: '🏋️‍♂️' },
                    { id: 'FAT_LOSS', label: 'ลดไขมัน / ลีน', sub: 'Cut & Tone', icon: '🔥' },
                    { id: 'STRENGTH', label: 'เพิ่มพละกำลัง', sub: 'Power', icon: '⚡' },
                    { id: 'ENDURANCE', label: 'สุขภาพ & อึด', sub: 'Stamina', icon: '🏃' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleFieldChange('goal', g.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        form.goal === g.id
                          ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-base mb-0.5">{g.icon}</div>
                      <div className="font-bold text-[11px] text-white">{g.label}</div>
                      <div className="text-[9px] text-slate-400">{g.sub}</div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">ระดับประสบการณ์</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'BEGINNER', label: '🌱 มือใหม่' },
                        { id: 'INTERMEDIATE', label: '⚔️ ปานกลาง' },
                        { id: 'ADVANCED', label: '🏆 ชำนาญ' },
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => handleFieldChange('gymLevel', lvl.id)}
                          className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                            form.gymLevel === lvl.id
                              ? 'bg-lime-400/20 border-lime-400 text-lime-300 font-black'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">วันฝึกต่อสัปดาห์</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[3, 4, 5, 6].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => handleFieldChange('targetDaysPerWeek', days)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            form.targetDaysPerWeek === days
                              ? 'bg-cyan-500 text-slate-950 font-black'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {days} วัน
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight History Tracker */}
              <div className="glass-panel border-slate-800 rounded-3xl p-5 space-y-3 bg-slate-900/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-xs">
                    <TrendingUp className="w-4 h-4" />
                    <span>บันทึกการเปลี่ยนแปลงน้ำหนัก (Weight Tracker)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    เป้าหมาย: <strong className="font-bold text-lime-400">{form.targetWeightKg} kg</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs whitespace-nowrap pl-1">น้ำหนักวันนี้:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={newLogWeight}
                    onChange={(e) => setNewLogWeight(e.target.value)}
                    className="w-24 bg-slate-900 border border-slate-700 text-center font-black text-cyan-300 rounded-lg py-1.5 text-xs outline-none"
                  />
                  <span className="text-slate-400 text-xs">kg</span>
                  <button
                    type="button"
                    onClick={handleAddWeightLog}
                    className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center space-x-1 shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>บันทึกวันนี้</span>
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {(form.weightHistory || []).map((log, idx) => {
                    const prevWeight = form.weightHistory[idx + 1]?.weightKg;
                    const diff = prevWeight ? (log.weightKg - prevWeight).toFixed(1) : null;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800/80"
                      >
                        <div className="flex items-center space-x-2 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{log.date}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-white">{log.weightKg} kg</span>
                          {diff !== null && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                diff > 0
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : diff < 0
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'text-slate-400'
                              }`}
                            >
                              {diff > 0 ? `+${diff}` : diff} kg
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="py-3 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-lime-400 hover:brightness-110 text-slate-950 font-black text-sm transition-all flex items-center space-x-2 shadow-xl shadow-cyan-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>💾 บันทึกข้อมูลสรีระ & เป้าหมาย (Save Changes)</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: 3D MUSCLE HEATMAP & RECOVERY DIAGNOSTICS */}
      {/* ========================================================================= */}
      {subTab === 'MUSCLES' && (
        <div className="animate-fade-in">
          <MuscleHeatmap workoutLogs={workoutLogs} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: MULTI-USER MANAGEMENT */}
      {/* ========================================================================= */}
      {subTab === 'USERS' && (
        <div className="space-y-6 animate-fade-in">
          {!isAdminAuth ? (
            <div className="glass-panel border-amber-400/40 rounded-3xl p-6 text-center space-y-4 max-w-md mx-auto my-6 bg-slate-900/90 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">เข้าสู่ระบบ Admin เพื่อจัดการสมาชิก</h4>
                <p className="text-xs text-slate-400 mt-1">
                  กรุณากรอกรหัสผ่านผู้ดูแลระบบเพื่อเข้าสู่เมนูจัดการสมาชิก
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPassInput.trim() === 'Code010906') {
                    sessionStorage.setItem('fittrainer_admin_session', 'true');
                    setIsAdminAuth(true);
                    setAdminPassError('');
                    setAdminPassInput('');
                  } else {
                    setAdminPassError('รหัสผ่าน Admin ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
                  }
                }}
                className="space-y-3"
              >
                <input
                  type="password"
                  placeholder="รหัสผ่าน Admin"
                  value={adminPassInput}
                  onChange={(e) => {
                    setAdminPassInput(e.target.value);
                    setAdminPassError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-center rounded-xl px-4 py-2.5 text-xs outline-none focus:border-amber-400 font-bold tracking-widest"
                  autoFocus
                />
                {adminPassError && (
                  <p className="text-xs text-rose-400 font-bold animate-bounce-short">{adminPassError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>🔓 ยืนยันปลดล็อก Admin</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel border-amber-400/30 rounded-3xl p-5 sm:p-6 bg-slate-900/80">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    <span>จัดการโปรไฟล์ผู้ใช้ ({usersList.length} คนในเครื่องนี้)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ข้อมูลการฝึก สถิติ แคลอรี และตารางฝึกจะถูกแยกเก็บอิสระตามแต่ละบุคคล
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingUser(!isCreatingUser)}
                    className="py-2 px-3.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition-all flex items-center space-x-1.5 shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isCreatingUser ? 'ยกเลิก' : '+ เพิ่มผู้ใช้ใหม่'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem('fittrainer_admin_session');
                      setIsAdminAuth(false);
                    }}
                    className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-bold border border-slate-700 transition-colors"
                    title="ออกจากโหมด Admin"
                  >
                    🔒 ล็อก Admin
                  </button>
                </div>
              </div>

            {/* Create New User Inline Form */}
            {isCreatingUser && (
              <form onSubmit={handleCreateNewUser} className="mt-4 p-4 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-3.5 animate-fade-in">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <UserPlus className="w-4 h-4" />
                  <span>สร้างโปรไฟล์ผู้ใช้ใหม่ (Create New Profile)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">ชื่อผู้ใช้ใหม่</label>
                    <input
                      type="text"
                      required
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      placeholder="เช่น โค้ชต้น, น้องแพร"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 outline-none focus:border-amber-400 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">เพศสรีระ</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewUserForm({ ...newUserForm, gender: 'MALE' })}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          newUserForm.gender === 'MALE'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        👨 ชาย
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewUserForm({ ...newUserForm, gender: 'FEMALE' })}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          newUserForm.gender === 'FEMALE'
                            ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        👩 หญิง
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">อายุ (ปี)</label>
                    <input
                      type="number"
                      value={newUserForm.age}
                      onChange={(e) => setNewUserForm({ ...newUserForm, age: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-center rounded-xl py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">ส่วนสูง (cm)</label>
                    <input
                      type="number"
                      value={newUserForm.heightCm}
                      onChange={(e) => setNewUserForm({ ...newUserForm, heightCm: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-center rounded-xl py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">น้ำหนัก (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newUserForm.weightKg}
                      onChange={(e) => setNewUserForm({ ...newUserForm, weightKg: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-center rounded-xl py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">เป้าหมาย (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newUserForm.targetWeightKg}
                      onChange={(e) => setNewUserForm({ ...newUserForm, targetWeightKg: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-center rounded-xl py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingUser(false)}
                    className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300"
                  >
                    + ยืนยันสร้างและสลับใช้งาน
                  </button>
                </div>
              </form>
            )}

            {/* Users Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
              {usersList.map((usr) => {
                const isActive = usr.id === activeUserId;
                return (
                  <div
                    key={usr.id}
                    className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-2xl">{usr.avatar || '🏋️‍♂️'}</span>
                          <div>
                            <div className="font-extrabold text-white text-sm flex items-center space-x-1.5">
                              <span>{usr.name}</span>
                              {isActive && (
                                <span className="text-[9px] px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                                  ใช้งานอยู่
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {usr.gender === 'FEMALE' ? 'หญิง' : 'ชาย'} • {usr.age} ปี • {usr.weightKg} kg
                            </div>
                          </div>
                        </div>

                        {!isActive && usersList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`คุณแน่ใจว่าต้องการลบโปรไฟล์ "${usr.name}" หรือไม่?`)) {
                                onDeleteUser(usr.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="ลบโปรไฟล์นี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        เป้าหมาย: <strong className="text-slate-200">{usr.goal || 'กล้ามเนื้อ'}</strong>
                      </span>

                      {isActive ? (
                        <span className="text-xs font-black text-cyan-400 flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>โปรไฟล์ปัจจุบัน</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchUser(usr.id);
                            setSubTab('PROFILE');
                          }}
                          className="py-1 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition-all"
                        >
                          สลับมาใช้นี้ ➔
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    )}

    </div>
  );
}
