import React, { useState, useEffect, useRef } from 'react';
import {
  X,
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
  Crop,
  Lock,
  Key,
  ShieldCheck,
  Download,
  Upload,
  Medal,
  Award,
  Star,
  FileText,
  Database,
  Cloud,
  Server,
  RefreshCw,
  Copy
} from 'lucide-react';
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE
} from '../utils/fitnessCalculators';
import {
  getUserRank,
  getUserAchievements,
  exportUserData,
  importUserData,
  getWorkoutLogs,
  getCustomPlans,
  getCustomExercises
} from '../utils/storage';
import {
  getSupabaseConfig,
  isSupabaseConfigured
} from '../utils/supabaseClient';
import {
  testSupabaseConnection,
  syncAllLocalDataToSupabase
} from '../services/supabaseService';

const AVATAR_OPTIONS = ['🏋️‍♂️', '🏃‍♀️', '🥊', '⚡', '🧘', '🦾', '🥇', '🎯', '🔥', '🚴'];

export default function UserProfileModal({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  usersList = [],
  activeUserId,
  onSwitchUser,
  onCreateUser,
  onDeleteUser,
  initialTab = 'PROFILE'
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab); // 'PROFILE' | 'ACHIEVEMENTS' | 'SECURITY' | 'SUPABASE' | 'USERS'
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  // Supabase Configuration State
  const supabaseConfig = getSupabaseConfig();
  const [supabaseStatus, setSupabaseStatus] = useState({ tested: false, loading: false, success: false, message: '' });
  const [syncingCloud, setSyncingCloud] = useState(false);

  // 3D Mannequin Video State
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlayingMorph, setIsPlayingMorph] = useState(false);
  const [morphBmiDisplay, setMorphBmiDisplay] = useState(null);
  const [isCropSide, setIsCropSide] = useState(true);

  // New User 3D Video State
  const newUserVideoRef = useRef(null);
  const [newUserVideoLoaded, setNewUserVideoLoaded] = useState(false);

  // Current user form state
  const [form, setForm] = useState({
    name: userProfile?.name || 'คุณยท',
    avatar: userProfile?.avatar || '🏋️‍♂️',
    customAvatarUrl: userProfile?.customAvatarUrl || '',
    motto: userProfile?.motto || '',
    favoriteMuscle: userProfile?.favoriteMuscle || '',
    pinCode: userProfile?.pinCode || '',
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

  // New user creation form state
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
    pinCode: ''
  });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || 'คุณยท',
        avatar: userProfile.avatar || '🏋️‍♂️',
        customAvatarUrl: userProfile.customAvatarUrl || '',
        motto: userProfile.motto || '',
        favoriteMuscle: userProfile.favoriteMuscle || '',
        pinCode: userProfile.pinCode || '',
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
  }, [userProfile]);

  const bmi = calculateBMI(form.weightKg, form.heightCm);
  const bmiCategory = getBMICategory(bmi);
  const bmr = calculateBMR(form.weightKg, form.heightCm, form.age, form.gender);
  const tdee = calculateTDEE(bmr, 'MODERATE');

  // Video sources and new user metrics
  const videoSrc = form.gender === 'FEMALE' ? '/videos/FemaleMannequin.mp4' : '/videos/MaleMannequin.mp4';
  const newUserBmi = calculateBMI(newUserForm.weightKg, newUserForm.heightCm);
  const newUserBmiCategory = getBMICategory(newUserBmi);
  const newUserVideoSrc = newUserForm.gender === 'FEMALE' ? '/videos/FemaleMannequin.mp4' : '/videos/MaleMannequin.mp4';

  // Sync profile video seek position to BMI (range 10.0 to 60.0)
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
  }, [bmi, form.gender, videoLoaded, isPlayingMorph, activeTab]);

  // Sync new user creation video seek position
  useEffect(() => {
    const video = newUserVideoRef.current;
    if (!video || !newUserVideoLoaded || !isCreatingUser) return;

    const clampedBmi = Math.max(10, Math.min(60, newUserBmi));
    const duration = video.duration || 6.042;
    const progress = (clampedBmi - 10) / 50;
    const targetTime = Math.max(0.01, Math.min(duration - 0.05, progress * duration));

    try {
      video.currentTime = targetTime;
    } catch (e) {
      console.warn('New user video seek error:', e);
    }
  }, [newUserBmi, newUserForm.gender, newUserVideoLoaded, isCreatingUser]);

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
        const calcBmi = (10 + currentProgress * 50).toFixed(1);
        setMorphBmiDisplay(calcBmi);

        if (video.ended || currentProgress >= 0.99) {
          setIsPlayingMorph(false);
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
  }, [isPlayingMorph]);

  const togglePlayMorph = () => {
    if (isPlayingMorph) {
      setIsPlayingMorph(false);
    } else {
      if (videoRef.current) {
        videoRef.current.currentTime = 0.01;
      }
      setIsPlayingMorph(true);
    }
  };

  const userRank = getUserRank(userProfile?.id);
  const achievements = getUserAchievements(userProfile?.id);
  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddWeightLog = () => {
    const val = Number(newLogWeight);
    if (!val || val < 20 || val > 300) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const existingIndex = (form.weightHistory || []).findIndex((item) => item.date === todayStr);

    let updatedHistory = [];
    if (existingIndex >= 0) {
      updatedHistory = [...form.weightHistory];
      updatedHistory[existingIndex] = { date: todayStr, weightKg: val };
    } else {
      updatedHistory = [{ date: todayStr, weightKg: val }, ...(form.weightHistory || [])];
    }

    const updatedForm = { ...form, weightKg: val, weightHistory: updatedHistory };
    setForm(updatedForm);
    onSaveProfile(updatedForm);
    setSuccessMsg('บันทึกการอัปเดตน้ำหนักวันนี้สำเร็จแล้ว! 🎉');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    onSaveProfile(form);
    setSuccessMsg('บันทึกข้อมูลส่วนบุคคลสำเร็จแล้ว!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleCreateNewUserSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newUserForm.name.trim()) return;
    onCreateUser(newUserForm);
    setIsCreatingUser(false);
    setSuccessMsg(`สร้างบัญชีผู้ใช้ "${newUserForm.name}" สำเร็จและสลับใช้งานแล้ว!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExportData = () => {
    exportUserData(userProfile?.id);
    setSuccessMsg('ส่งออกไฟล์สำรองข้อมูลผู้ใช้งาน (.json) สำเร็จแล้ว! 📥');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleImportFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result);
        const imported = importUserData(jsonData, userProfile?.id);
        onSaveProfile(imported);
        setForm(imported);
        setSuccessMsg(`นำเข้าข้อมูลของ "${imported.name}" เรียบร้อยแล้ว! 📤`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        alert(err.message || 'ไม่สามารถอ่านไฟล์สำรองข้อมูลได้');
      }
    };
    reader.readAsText(file);
  };

  const handleTestSupabase = async () => {
    setSupabaseStatus({ tested: true, loading: true, success: false, message: 'กำลังทดสอบการเชื่อมต่อ...' });
    const res = await testSupabaseConnection();
    setSupabaseStatus({ tested: true, loading: false, success: res.success, message: res.message });
  };

  const handleSyncToCloud = async () => {
    if (!userProfile?.id) return;
    setSyncingCloud(true);
    const logs = getWorkoutLogs(userProfile.id);
    const plans = getCustomPlans(userProfile.id);
    const customExs = getCustomExercises(userProfile.id);

    const res = await syncAllLocalDataToSupabase(form, logs, plans, customExs);
    setSyncingCloud(false);

    if (res.success) {
      setSuccessMsg(`ซิงค์ข้อมูล ${res.count} รายการขึ้น Supabase Cloud สำเร็จเรียบร้อย! ⚡`);
    } else {
      alert(`การซิงค์ข้อมูลขัดข้อง: ${res.message || 'กรุณาตรวจสอบ URL / Key'}`);
    }
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-2xl bg-[#131722] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 space-y-4 my-6 shadow-2xl max-h-[92vh] flex flex-col relative overflow-hidden">
        
        {/* Background Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-lime-400 p-[2px] shadow-lg shadow-cyan-500/20 shrink-0 flex items-center justify-center bg-[#0b0d12]">
              {form.customAvatarUrl ? (
                <img src={form.customAvatarUrl} alt={form.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="text-2xl">{form.avatar || '🏋️‍♂️'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white">{form.name}</h3>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${userRank.badgeBg} shadow-sm`}>
                  {userRank.icon} {userRank.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {form.motto ? `"${form.motto}"` : `เป้าหมาย: ${form.goal === 'MUSCLE_BUILDING' ? 'สร้างกล้ามเนื้อ' : 'ลดน้ำหนัก'} • น้ำหนัก ${form.weightKg} kg`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar (5 Tabs) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'PROFILE'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>โปรไฟล์</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ACHIEVEMENTS')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'ACHIEVEMENTS'
                ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>ผลงาน</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SECURITY')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'SECURITY'
                ? 'bg-purple-500 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>PIN / สำรอง</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SUPABASE')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'SUPABASE'
                ? 'bg-emerald-400 text-slate-950 font-black shadow-md'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>⚡ Supabase</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('USERS')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'USERS'
                ? 'bg-lime-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ผู้ใช้ ({usersList.length})</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold flex items-center space-x-2 animate-bounce-short">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: PROFILE & 3D PHYSIQUE */}
          {/* ========================================================================= */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-4">
              
              {/* 3D Visualizer Card */}
              <div className="glass-panel border-cyan-500/40 rounded-3xl p-4 sm:p-5 relative overflow-hidden bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 neon-border-cyan shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm">หุ่น 3D & วิเคราะห์ BMI (10 - 60)</h4>
                      <p className="text-[10px] text-slate-400">จำลองหุ่นตามค่าสรีระปัจจุบันของคุณ</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsCropSide(!isCropSide)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center space-x-1 ${
                        isCropSide
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-extrabold'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Crop className="w-3 h-3" />
                      <span>{isCropSide ? '✂️ โฟกัสหุ่น' : '↔️ เต็มเฟรม'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={togglePlayMorph}
                      className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all flex items-center space-x-1 shadow-md ${
                        isPlayingMorph
                          ? 'bg-amber-400 text-slate-950 animate-pulse'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      }`}
                    >
                      {isPlayingMorph ? (
                        <>
                          <Pause className="w-3 h-3 fill-slate-950" />
                          <span>หยุด</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-slate-950" />
                          <span>▶️ ชม Morph</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 3D Mannequin Video Canvas */}
                <div className="relative rounded-2xl overflow-hidden bg-black/95 border border-slate-800 flex items-center justify-center shadow-inner my-3 h-[240px] sm:h-[270px] w-full">
                  {/* Sci-Fi HUD Overlay */}
                  <div className="absolute top-2.5 left-2.5 z-20 flex items-center space-x-1.5 text-[9px] font-black tracking-widest text-cyan-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30 backdrop-blur-sm pointer-events-none">
                    <Sparkles className="w-3 h-3 animate-spin text-cyan-400" />
                    <span>3D ANATOMY MORPH // {isCropSide ? 'CROPPED FOCUS' : 'FULL FRAME'}</span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 z-20 flex items-center space-x-1.5 text-[10px] font-extrabold bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-700 backdrop-blur-sm pointer-events-none">
                    <span className="text-slate-400">BMI:</span>
                    <span className="text-cyan-400 font-black text-xs">
                      {isPlayingMorph ? (morphBmiDisplay || 10) : bmi}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-cyan-500/20 text-cyan-300">
                      {bmiCategory.category}
                    </span>
                  </div>

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
                </div>

                {/* BMI Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">BMI สรีระ</span>
                    <span className="text-lg font-black text-cyan-400">{bmi}</span>
                    <span className="text-[9px] font-bold block text-slate-300">{bmiCategory.category}</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">BMR อัตราเผาผลาญ</span>
                    <span className="text-lg font-black text-amber-400">{bmr}</span>
                    <span className="text-[9px] font-bold block text-slate-300">kcal / วัน</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">TDEE กิจกรรม</span>
                    <span className="text-lg font-black text-lime-400">{tdee}</span>
                    <span className="text-[9px] font-bold block text-slate-300">kcal / วัน</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">ส่วนสูง / น้ำหนัก</span>
                    <span className="text-lg font-black text-white">{form.heightCm} / {form.weightKg}</span>
                    <span className="text-[9px] font-bold block text-slate-300">cm / kg</span>
                  </div>
                </div>
              </div>

              {/* General Details & Avatar Customization */}
              <div className="glass-panel border-slate-800/90 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                  <User className="w-3.5 h-3.5" />
                  <span>ข้อมูลทั่วไป & ปรับแต่งโปรไฟล์</span>
                </div>

                {/* Avatar Picker & Custom Avatar URL */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">เลือกไอคอนประจำตัว (Avatar)</label>
                  <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 mb-2">
                    {AVATAR_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          handleFieldChange('avatar', emoji);
                          handleFieldChange('customAvatarUrl', '');
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                          form.avatar === emoji && !form.customAvatarUrl
                            ? 'bg-cyan-500/20 border-2 border-cyan-400 scale-110 shadow-md'
                            : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <input
                    type="url"
                    placeholder="หรือใส่ URL รูปถ่ายโปรไฟล์ประจำตัว (https://...)"
                    value={form.customAvatarUrl}
                    onChange={(e) => handleFieldChange('customAvatarUrl', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-xl px-3 py-2 outline-none text-xs focus:border-cyan-500"
                  />
                </div>

                {/* Name & Motto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">ชื่อ / นามแฝงประจำตัว</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="เช่น คุณยท, Fitness Explorer"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 outline-none focus:border-cyan-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">คำคม / เป้าหมายสร้างแรงบันดาลใจ</label>
                    <input
                      type="text"
                      value={form.motto}
                      onChange={(e) => handleFieldChange('motto', e.target.value)}
                      placeholder="เช่น ไม่หยุดจนกว่าจะบรรลุเป้าหมาย! 🚀"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 outline-none focus:border-cyan-500 font-medium"
                    />
                  </div>
                </div>

                {/* Gender & Favorite Muscle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">เพศสรีระ</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleFieldChange('gender', 'MALE')}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          form.gender === 'MALE'
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-black'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        👨 ชาย (Male)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldChange('gender', 'FEMALE')}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          form.gender === 'FEMALE'
                            ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-black'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        👩 หญิง (Female)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">กล้ามเนื้อเน้นพิเศษ (Favorite Focus)</label>
                    <input
                      type="text"
                      value={form.favoriteMuscle}
                      onChange={(e) => handleFieldChange('favoriteMuscle', e.target.value)}
                      placeholder="เช่น อกบน, ปีกหลัง, ไหล่ข้าง"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Age, Height, Weight, Target Weight */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] mb-1">อายุ (ปี)</span>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => handleFieldChange('age', Math.max(10, Number(e.target.value) || 10))}
                      className="w-full bg-transparent text-center font-black text-white text-sm outline-none"
                    />
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] mb-1">ส่วนสูง (cm)</span>
                    <input
                      type="number"
                      value={form.heightCm}
                      onChange={(e) => handleFieldChange('heightCm', Math.max(100, Number(e.target.value) || 100))}
                      className="w-full bg-transparent text-center font-black text-white text-sm outline-none"
                    />
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] mb-1">น้ำหนักปัจจุบัน (kg)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={form.weightKg}
                      onChange={(e) => handleFieldChange('weightKg', Number(e.target.value) || 30)}
                      className="w-full bg-transparent text-center font-black text-cyan-300 text-sm outline-none"
                    />
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] mb-1">เป้าหมาย (kg)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={form.targetWeightKg}
                      onChange={(e) => handleFieldChange('targetWeightKg', Number(e.target.value) || 30)}
                      className="w-full bg-transparent text-center font-black text-lime-400 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Weight History Tracker */}
              <div className="glass-panel border-slate-800/90 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>บันทึกการเปลี่ยนแปลงน้ำหนัก (Weight Log Tracker)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    เป้าหมาย: <span className="font-bold text-lime-400">{form.targetWeightKg} kg</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] whitespace-nowrap pl-1">น้ำหนักวันนี้:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={newLogWeight}
                    onChange={(e) => setNewLogWeight(e.target.value)}
                    className="w-20 bg-slate-950 border border-slate-700 text-center font-black text-cyan-300 rounded-lg py-1 text-xs outline-none"
                  />
                  <span className="text-slate-400 text-[11px]">kg</span>
                  <button
                    type="button"
                    onClick={handleAddWeightLog}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>บันทึกวันนี้</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ACHIEVEMENTS & RANK BADGES */}
          {/* ========================================================================= */}
          {activeTab === 'ACHIEVEMENTS' && (
            <div className="space-y-4 animate-fade-in">
              {/* User Rank Card */}
              <div className="glass-panel border-amber-400/30 rounded-3xl p-5 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 shadow-xl flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 p-[2px] shadow-lg shadow-amber-500/20 flex items-center justify-center text-3xl">
                    <span>{userRank.icon}</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                      ยศนักกีฬาประจำตัว (Athlete Rank Level {userRank.level})
                    </div>
                    <h3 className="text-xl font-black text-white">{userRank.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ปลดล็อกแล้ว <strong className="text-amber-300">{unlockedAchievementsCount}</strong> จาก {achievements.length} เหรียญเกียรติยศ
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <div className="text-xs font-black text-cyan-400">FitTrainer AI Pro</div>
                  <div className="text-[10px] text-slate-400">บันทึกสะสมอย่างต่อเนื่อง</div>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                      item.unlocked
                        ? 'bg-slate-900/90 border-amber-400/40 shadow-lg shadow-amber-500/5'
                        : 'bg-slate-950/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-white text-xs truncate">{item.title}</h4>
                          {item.unlocked ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              ✨ ปลดล็อกแล้ว
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              🔒 ยังไม่บรรลุ
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-500 ${
                            item.unlocked ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-cyan-500/40'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SECURITY PIN & DATA BACKUP/RESTORE */}
          {/* ========================================================================= */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-4 animate-fade-in">
              {/* Account PIN Lock Section */}
              <div className="glass-panel border-purple-500/30 rounded-3xl p-5 space-y-4 bg-gradient-to-br from-purple-500/10 via-slate-900 to-slate-950 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">รหัสผ่าน PIN ล็อกการสลับบัญชี (Account Security)</h3>
                    <p className="text-[11px] text-slate-400">
                      กำหนดรหัส PIN 4 หลักเพื่อป้องกันการเข้าถึงข้อมูลส่วนตัวเมื่อใช้งานหลายคนบนอุปกรณ์เดียวกัน
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1">
                        รหัส PIN ประจำตัว (4 หลัก)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="กรอกรหัส PIN 4 หลัก..."
                        value={form.pinCode}
                        onChange={(e) => handleFieldChange('pinCode', e.target.value.replace(/\D/g, ''))}
                        className="w-48 bg-slate-900 border border-slate-700 text-center font-mono font-black text-purple-300 tracking-widest text-lg rounded-xl py-2 outline-none focus:border-purple-400"
                      />
                    </div>

                    {form.pinCode && form.pinCode.trim().length === 4 ? (
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        <span>เปิดใช้งานรหัส PIN แล้ว</span>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs">
                        * ปล่อยว่างไว้ หากไม่ต้องการใช้รหัสผ่านในการสลับผู้ใช้
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Export & Import Section */}
              <div className="glass-panel border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">สำรอง & ฟื้นฟูข้อมูลผู้ใช้ (Backup & Restore)</h3>
                    <p className="text-[11px] text-slate-400">
                      ส่งออกประวัติการซ้อม ตารางฝึก และท่าฝึกที่สร้างเองเป็นไฟล์ JSON เพื่อย้ายเครื่องหรือสำรองข้อมูล
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="p-4 rounded-2xl bg-slate-900 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition-all text-left space-y-1.5 group"
                  >
                    <div className="flex items-center space-x-2 text-cyan-400 font-black">
                      <Download className="w-4 h-4 group-hover:bounce" />
                      <span>📥 ส่งออกข้อมูล (Export JSON)</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      ดาวน์โหลดไฟล์สำรองข้อมูลส่วนบุคคลของผู้ใช้นี้ลงในคอมพิวเตอร์ของคุณ
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-2xl bg-slate-900 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 text-slate-200 transition-all text-left space-y-1.5 group"
                  >
                    <div className="flex items-center space-x-2 text-amber-400 font-black">
                      <Upload className="w-4 h-4 group-hover:bounce" />
                      <span>📤 นำเข้าข้อมูล (Import JSON)</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      เลือกไฟล์ .json ที่เคยส่งออกไว้ เพื่อฟื้นฟูข้อมูลผู้ใช้กลับคืนมา
                    </p>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SUPABASE CLOUD DATABASE CONFIGURATION */}
          {/* ========================================================================= */}
          {activeTab === 'SUPABASE' && (
            <div className="space-y-4 animate-fade-in">
              {/* Supabase Connection Status Header */}
              <div className="glass-panel border-emerald-500/40 rounded-3xl p-5 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-xl">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-black text-white">Supabase Cloud Database</h3>
                        {isSupabaseConfigured() ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                            ⚡ พร้อมซิงค์คลาวด์
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            ⚠️ ทำงานในโหมด Local
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        เชื่อมต่อฐานข้อมูลคลาวด์ PostgreSQL สำหรับซิงค์สถิติและประวัติการซ้อมข้ามอุปกรณ์
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connection Tester */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-200">ทดสอบสถานะการเชื่อมต่อ Supabase</div>
                    <div className="text-[11px] text-slate-400">
                      {supabaseStatus.tested
                        ? supabaseStatus.message
                        : isSupabaseConfigured()
                        ? 'กดปุ่มเพื่อทดสอบส่งคำขอไปยัง Supabase Project ของคุณ'
                        : 'กรุณากรอก VITE_SUPABASE_URL และ ANON_KEY ด้านล่าง'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    disabled={supabaseStatus.loading}
                    className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-all shadow-md shrink-0 flex items-center justify-center space-x-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus.loading ? 'animate-spin' : ''}`} />
                    <span>{supabaseStatus.loading ? 'กำลังทดสอบ...' : '🧪 ทดสอบการเชื่อมต่อ'}</span>
                  </button>
                </div>
              </div>

              {/* Supabase Environment Credentials Status Panel */}
              <div className="glass-panel border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                    <Server className="w-3.5 h-3.5" />
                    <span>การตั้งค่า API Credentials (ดึงจากไฟล์ .env)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    🔒 อ่านจาก .env เท่านั้น (ห้ามกรอกผ่าน UI)
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Project URL (VITE_SUPABASE_URL)</span>
                    <p className="font-mono text-xs text-white truncate">
                      {supabaseConfig.url || <span className="text-amber-400 italic">ยังไม่ได้กำหนดใน .env</span>}
                    </p>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Anon Key (VITE_SUPABASE_ANON_KEY)</span>
                    <p className="font-mono text-xs text-white truncate">
                      {supabaseConfig.key ? (
                        <span className="text-emerald-400">•••••••••••••••••••••••••••••••• (โหลดแล้วจาก .env)</span>
                      ) : (
                        <span className="text-amber-400 italic">ยังไม่ได้กำหนดใน .env</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p className="font-bold text-slate-300">💡 คำแนะนำการตั้งค่า:</p>
                  <p>หากต้องการเปลี่ยน URL หรือ API Key กรุณาแก้ไขไฟล์ <code className="text-cyan-300 font-mono">.env</code> ใน Root Directory ของโปรเจกต์:</p>
                  <pre className="bg-slate-950 p-2 rounded-xl text-emerald-400 font-mono text-[10px] overflow-x-auto mt-1">
                    VITE_SUPABASE_URL=https://your-project.supabase.co{"\n"}
                    VITE_SUPABASE_ANON_KEY=your-anon-key
                  </pre>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSyncToCloud}
                    disabled={syncingCloud || !isSupabaseConfigured()}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-md disabled:opacity-40 flex items-center justify-center space-x-1.5"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>{syncingCloud ? 'กำลังซิงค์...' : '🚀 ซิงค์ข้อมูลในเครื่องขึ้น คลาวด์'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: MULTI-USER MANAGEMENT & CREATION */}
          {/* ========================================================================= */}
          {activeTab === 'USERS' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-lime-400" />
                    <span>โปรไฟล์ผู้ใช้ในระบบทั้งหมด ({usersList.length} คน)</span>
                  </span>

                  {!isCreatingUser && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingUser(true)}
                      className="px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs transition-all flex items-center space-x-1.5 shadow-md"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ เพิ่มผู้ใช้ใหม่</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {usersList.map((usr) => {
                    const isActive = usr.id === activeUserId;
                    return (
                      <div
                        key={usr.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500/15 via-slate-900 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                            {usr.avatar || '🏋️‍♂️'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-sm text-white truncate">
                                {usr.name}
                              </span>
                              {usr.hasPin && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>PIN</span>
                                </span>
                              )}
                              {isActive && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950">
                                  กำลังใช้งาน
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                              <span>{usr.gender === 'FEMALE' ? 'หญิง' : 'ชาย'}</span>
                              <span>•</span>
                              <span>{usr.weightKg} kg</span>
                              <span>•</span>
                              <span>ฝึก {usr.targetDaysPerWeek || 4} วัน/สัปดาห์</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {!isActive ? (
                            <button
                              type="button"
                              onClick={() => {
                                onSwitchUser(usr.id);
                                setSuccessMsg(`สลับไปใช้งานโปรไฟล์ "${usr.name}" เรียบร้อยแล้ว!`);
                                setTimeout(() => setSuccessMsg(''), 2500);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/30 transition-all text-xs"
                            >
                              สลับใช้โปรไฟล์นี้
                            </button>
                          ) : (
                            <span className="text-cyan-400 font-bold flex items-center space-x-1 px-2 py-1 bg-cyan-500/10 rounded-lg text-xs">
                              <Check className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </span>
                          )}

                          {usersList.length > 1 && !isActive && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`ต้องการลบโปรไฟล์ของ "${usr.name}" ใช่หรือไม่? ข้อมูลทั้งหมดของผู้ใช้นี้จะถูกลบอย่างถาวร`)) {
                                  onDeleteUser(usr.id);
                                }
                              }}
                              className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="ลบโปรไฟล์นี้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Create New User Form */}
              {isCreatingUser && (
                <div className="glass-panel border-amber-400/40 rounded-2xl p-4 space-y-3.5 bg-gradient-to-br from-amber-500/5 to-slate-900/90 shadow-xl animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-amber-300 flex items-center space-x-2">
                      <UserPlus className="w-4 h-4" />
                      <span>สร้างโปรไฟล์ผู้ใช้ใหม่</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingUser(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Avatar Picker */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">เลือกไอคอนประจำตัว (Avatar)</label>
                    <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                      {AVATAR_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewUserForm({ ...newUserForm, avatar: emoji })}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                            newUserForm.avatar === emoji
                              ? 'bg-amber-400/20 border-2 border-amber-400 scale-110 shadow-md'
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
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">ชื่อผู้ใช้งาน <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        placeholder="เช่น น้องฟ้า, Athlete 2"
                        value={newUserForm.name}
                        onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-400 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">เพศสรีระ</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewUserForm({ ...newUserForm, gender: 'MALE' })}
                          className={`py-1.5 rounded-xl font-bold border transition-all text-xs ${
                            newUserForm.gender === 'MALE'
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          👨 ชาย
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewUserForm({ ...newUserForm, gender: 'FEMALE' })}
                          className={`py-1.5 rounded-xl font-bold border transition-all text-xs ${
                            newUserForm.gender === 'FEMALE'
                              ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          👩 หญิง
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">อายุ (ปี)</span>
                      <input
                        type="number"
                        value={newUserForm.age}
                        onChange={(e) => setNewUserForm({ ...newUserForm, age: Number(e.target.value) || 20 })}
                        className="w-full bg-slate-900 border border-slate-700 text-center font-bold text-white rounded-lg py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ส่วนสูง (cm)</span>
                      <input
                        type="number"
                        value={newUserForm.heightCm}
                        onChange={(e) => setNewUserForm({ ...newUserForm, heightCm: Number(e.target.value) || 160 })}
                        className="w-full bg-slate-900 border border-slate-700 text-center font-bold text-white rounded-lg py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">น้ำหนัก (kg)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={newUserForm.weightKg}
                        onChange={(e) => setNewUserForm({ ...newUserForm, weightKg: Number(e.target.value) || 50, targetWeightKg: Number(e.target.value) || 50 })}
                        className="w-full bg-slate-900 border border-slate-700 text-center font-bold text-amber-300 rounded-lg py-1.5 text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* 3D Mannequin Video Visualizer Preview for New Member */}
                  <div className="relative rounded-2xl overflow-hidden bg-black/95 border border-amber-500/40 flex items-center justify-center shadow-inner my-2 h-[220px] sm:h-[250px] w-full">
                    {/* HUD Watermark */}
                    <div className="absolute top-2.5 left-2.5 z-20 flex items-center space-x-1.5 text-[9px] font-black tracking-widest text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-amber-500/30 backdrop-blur-sm pointer-events-none">
                      <Sparkles className="w-3 h-3 animate-spin text-amber-400" />
                      <span>3D ANATOMY PREVIEW // {newUserForm.gender === 'FEMALE' ? 'FEMALE' : 'MALE'}</span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center space-x-1.5 text-[10px] font-extrabold bg-slate-950/80 px-2.5 py-0.5 rounded-lg border border-slate-700 backdrop-blur-sm pointer-events-none">
                      <span className="text-slate-400">BMI จำลอง:</span>
                      <span className="text-amber-400 font-black text-xs">{newUserBmi}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-400/20 text-amber-300">
                        {newUserBmiCategory.category}
                      </span>
                    </div>

                    <video
                      ref={newUserVideoRef}
                      key={newUserVideoSrc}
                      src={newUserVideoSrc}
                      preload="auto"
                      playsInline
                      muted
                      onLoadedMetadata={() => {
                        setNewUserVideoLoaded(true);
                        if (newUserVideoRef.current) {
                          const duration = newUserVideoRef.current.duration || 6.042;
                          const clampedBmi = Math.max(10, Math.min(60, newUserBmi));
                          const progress = (clampedBmi - 10) / 50;
                          newUserVideoRef.current.currentTime = Math.max(0.01, progress * duration);
                        }
                      }}
                      className="w-full h-full object-cover object-center scale-[1.12]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingUser(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewUserSubmit}
                      disabled={!newUserForm.name.trim()}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black text-xs shadow-md hover:brightness-110 disabled:opacity-40"
                    >
                      + ยืนยันสร้างและสลับใช้งาน
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            ปิด
          </button>

          {(activeTab === 'PROFILE' || activeTab === 'SECURITY' || activeTab === 'SUPABASE') && (
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-lime-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>💾 บันทึกข้อมูล (Save Profile)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
