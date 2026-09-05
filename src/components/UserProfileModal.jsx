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
  Crop
} from 'lucide-react';
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE
} from '../utils/fitnessCalculators';

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

  const [activeTab, setActiveTab] = useState(initialTab); // 'PROFILE' | 'USERS'
  const [successMsg, setSuccessMsg] = useState('');

  // 3D Mannequin Video State
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlayingMorph, setIsPlayingMorph] = useState(false);
  const [morphBmiDisplay, setMorphBmiDisplay] = useState(null);
  const [isCropSide, setIsCropSide] = useState(true);

  // Current user form state
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
  });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Sync form when userProfile prop changes
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
  }, [userProfile]);

  // Real-time calculations for active profile
  const bmi = calculateBMI(form.weightKg, form.heightCm);
  const bmiInfo = getBMICategory(bmi);
  const bmr = calculateBMR(form.weightKg, form.heightCm, form.age, form.gender);
  const tdee = calculateTDEE(bmr, form.targetDaysPerWeek);

  const maintainCalories = tdee;
  const cutCalories = Math.round(tdee * 0.85);
  const bulkCalories = Math.round(tdee * 1.10);

  // Video source based on gender
  const videoSrc = form.gender === 'FEMALE' ? '/videos/FemaleMannequin.mp4' : '/videos/MaleMannequin.mp4';

  // Seek video precisely to the given BMI (calculated between 10 and 60)
  const seekVideoToBmi = (currentBmi) => {
    if (!videoRef.current || !videoLoaded) return;
    const dur = videoRef.current.duration || 6.042;
    const clamped = Math.max(10, Math.min(60, Number(currentBmi) || 22));
    const progress = (clamped - 10) / 50; // BMI 10 -> 0s, BMI 60 -> end
    videoRef.current.currentTime = Math.min(dur - 0.05, Math.max(0.01, progress * dur));
  };

  // Sync video position whenever BMI or gender changes
  useEffect(() => {
    if (videoLoaded && !isPlayingMorph) {
      seekVideoToBmi(bmi);
    }
  }, [bmi, form.gender, videoLoaded, isPlayingMorph]);

  const handleVideoLoadedMetadata = () => {
    setVideoLoaded(true);
    seekVideoToBmi(bmi);
  };

  const togglePlayMorph = () => {
    if (!videoRef.current) return;
    if (isPlayingMorph) {
      videoRef.current.pause();
      setIsPlayingMorph(false);
      setMorphBmiDisplay(null);
      seekVideoToBmi(bmi);
    } else {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setIsPlayingMorph(true);
      }).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (isPlayingMorph && videoRef.current) {
      const dur = videoRef.current.duration || 6.042;
      const progress = videoRef.current.currentTime / dur;
      const currentMorphBmi = Math.round((10 + progress * 50) * 10) / 10;
      setMorphBmiDisplay(currentMorphBmi);
    }
  };

  const handleVideoEnded = () => {
    setIsPlayingMorph(false);
    setMorphBmiDisplay(null);
    seekVideoToBmi(bmi);
  };

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddWeightLog = () => {
    const today = new Date().toISOString().slice(0, 10);
    const weightNum = Number(newLogWeight) || form.weightKg;
    const existingLogs = form.weightHistory || [];
    const filtered = existingLogs.filter(log => log.date !== today);
    const updatedHistory = [{ date: today, weightKg: weightNum }, ...filtered];

    setForm(prev => ({
      ...prev,
      weightKg: weightNum,
      weightHistory: updatedHistory
    }));

    setSuccessMsg('บันทึกน้ำหนักวันนี้เรียบร้อย!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSave = () => {
    const updated = {
      ...form,
      weightKg: Number(form.weightKg),
      targetWeightKg: Number(form.targetWeightKg),
      heightCm: Number(form.heightCm),
      age: Number(form.age),
      targetDaysPerWeek: Number(form.targetDaysPerWeek),
      streakDays: Number(form.streakDays)
    };
    onSaveProfile(updated);
    setSuccessMsg('💾 บันทึกข้อมูลส่วนบุคคลเรียบร้อยแล้ว!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 700);
  };

  const handleCreateNewUserSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newUserForm.name.trim()) {
      alert('กรุณากรอกชื่อผู้ใช้งาน');
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
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-2xl bg-[#131722] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 space-y-4 my-6 shadow-2xl max-h-[92vh] flex flex-col relative overflow-hidden">
        
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header & Navigation Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-lime-400 p-[2px] shadow-lg shadow-cyan-500/20 shrink-0 flex items-center justify-center text-xl bg-[#0b0d12]">
              <span>{form.avatar || '🏋️‍♂️'}</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                <span>{form.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {usersList.length > 1 ? `Multi-User (${usersList.length} คน)` : 'Profile'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                จัดการสรีระ คำนวณ BMI 10-60 จำลองหุ่น 3D และสลับผู้ใช้งานในอุปกรณ์นี้
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

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'PROFILE'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>ข้อมูลสรีระ & หุ่น 3D (BMI 10-60)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('USERS')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'USERS'
                ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>สลับ & จัดการผู้ใช้ ({usersList.length})</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          
          {/* Quick Notification */}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold flex items-center space-x-2 animate-bounce-short">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: PROFILE & HEALTH DIAGNOSTICS */}
          {/* ========================================================================= */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-4">
              
              {/* --- 3D MANNEQUIN VIDEO VISUALIZER (BMI 10 - 60) --- */}
              <div className="glass-panel border-cyan-500/40 rounded-3xl p-4 sm:p-5 relative overflow-hidden bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 neon-border-cyan shadow-xl">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsCropSide(!isCropSide)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center space-x-1 ${
                        isCropSide
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-extrabold shadow-sm'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title="ตัดขอบข้าง / แสดงเต็มกรอบ"
                    >
                      <Crop className="w-3 h-3" />
                      <span>{isCropSide ? '✂️ ตัดขอบข้าง' : '↔️ เต็มกรอบ'}</span>
                    </button>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {form.gender === 'FEMALE' ? '👩 หญิง' : '👨 ชาย'}
                    </span>
                    <button
                      type="button"
                      onClick={togglePlayMorph}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md ${
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
                          <span>▶️ ชม Morph</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* SIDE-BY-SIDE 2-COLUMN GRID (VIDEO ON LEFT, SLIDERS ON RIGHT) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
                  {/* Left Column: Video Player with Side Crop */}
                  <div className="md:col-span-5 flex flex-col">
                    <div className="relative rounded-2xl overflow-hidden bg-black/95 border border-slate-800 flex items-center justify-center shadow-inner h-[280px] md:h-full min-h-[260px]">
                      <video
                        ref={videoRef}
                        src={videoSrc}
                        playsInline
                        muted
                        preload="auto"
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleVideoEnded}
                        className={`w-full h-full cursor-pointer transition-all duration-300 ${
                          isCropSide
                            ? 'object-cover object-center scale-[1.14]'
                            : 'object-contain object-center scale-100'
                        }`}
                        onClick={togglePlayMorph}
                      />

                      {/* Floating Badges */}
                      <div className="absolute top-2 left-2 pointer-events-none">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-slate-950/85 text-cyan-300 border border-cyan-500/40 backdrop-blur-md flex items-center space-x-1 shadow-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                          <span>{form.gender === 'FEMALE' ? 'FEMALE' : 'MALE'}</span>
                        </span>
                      </div>

                      <div className="absolute top-2 right-2 pointer-events-none text-right">
                        <div className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-950/85 text-white border border-slate-700 backdrop-blur-md shadow-lg inline-block">
                          BMI: <span className="text-cyan-400 font-black text-xs">{morphBmiDisplay || bmi}</span>
                        </div>
                      </div>

                      {/* Morph Animation Progress Bar */}
                      {isPlayingMorph && (
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-cyan-500/30">
                          <div
                            className="h-full bg-cyan-400 transition-all duration-75"
                            style={{
                              width: `${Math.min(100, Math.max(0, (((morphBmiDisplay || 10) - 10) / 50) * 100))}%`
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Interactive Sliders (Placed on the side) */}
                  <div className="md:col-span-7 space-y-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
                    
                    {/* 1. Interactive BMI Slider (10 - 60) */}
                    <div className="space-y-1 pb-2 border-b border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-1.5 font-black text-cyan-300">
                          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                          <span>1. สไลเดอร์ปรับค่า BMI (10 - 60)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
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
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        
                        <div className="flex justify-between text-[8px] text-slate-400 pt-0.5 font-semibold">
                          <span className="text-sky-400">10 (ผอม)</span>
                          <span className="text-emerald-400 font-bold">22.9 (สมส่วน)</span>
                          <span className="text-orange-400">29.9 (ท้วม)</span>
                          <span className="text-red-400">60 (อ้วนมาก)</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Interactive Weight Slider (30 - 160 kg) */}
                    <div className="space-y-1 pb-2 border-b border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-1.5 font-black text-amber-300">
                          <Scale className="w-3.5 h-3.5 text-amber-400" />
                          <span>2. สไลเดอร์ปรับน้ำหนัก (Weight)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleFieldChange('weightKg', Math.max(30, (Number(form.weightKg) - 0.5).toFixed(1)))}
                            className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="text-amber-300 font-black text-xs px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30">
                            {form.weightKg} kg
                          </span>
                          <button
                            type="button"
                            onClick={() => handleFieldChange('weightKg', (Number(form.weightKg) + 0.5).toFixed(1))}
                            className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
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
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[8px] text-slate-400 pt-0.5 font-semibold">
                          <span>30 kg</span>
                          <span>70 kg</span>
                          <span>110 kg</span>
                          <span>160 kg</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Interactive Height Slider (120 - 220 cm) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-1.5 font-black text-emerald-300">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span>3. สไลเดอร์ปรับส่วนสูง (Height)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleFieldChange('heightCm', Math.max(120, Number(form.heightCm) - 1))}
                            className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="text-emerald-300 font-black text-xs px-2 py-0.5 rounded-md bg-emerald-400/10 border border-emerald-400/30">
                            {form.heightCm} cm
                          </span>
                          <button
                            type="button"
                            onClick={() => handleFieldChange('heightCm', Math.min(220, Number(form.heightCm) + 1))}
                            className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
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
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                        <div className="flex justify-between text-[8px] text-slate-400 pt-0.5 font-semibold">
                          <span>120 cm</span>
                          <span>160 cm</span>
                          <span>175 cm</span>
                          <span>220 cm</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Section 1: Basic Information */}
              <div className="glass-panel border-slate-800/90 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                  <User className="w-3.5 h-3.5" />
                  <span>ข้อมูลทั่วไป & Avatar (General Details)</span>
                </div>

                {/* Avatar Picker */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">เลือกไอคอนประจำตัว (Avatar)</label>
                  <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                    {AVATAR_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleFieldChange('avatar', emoji)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">ชื่อ / นามแฝง</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="เช่น คุณยท, Nickname"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 outline-none focus:border-cyan-500 font-bold"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">เพศสรีระ (สลับโมเดล 3D และคำนวณ BMR)</label>
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
                </div>

                {/* Age, Height, Weight, Target Weight */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
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
                        className="w-full bg-transparent text-center font-black text-white text-sm outline-none"
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

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
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
                        className="w-full bg-transparent text-center font-black text-white text-sm outline-none"
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

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
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
                        onChange={(e) => handleFieldChange('weightKg', Number(e.target.value) || 30)}
                        className="w-full bg-transparent text-center font-black text-cyan-300 text-sm outline-none"
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

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
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
                        onChange={(e) => handleFieldChange('targetWeightKg', Number(e.target.value) || 30)}
                        className="w-full bg-transparent text-center font-black text-lime-400 text-sm outline-none"
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

              {/* Section 2: Real-time Health Metrics (BMI & BMR / TDEE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* BMI Card */}
                <div className="glass-panel border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ดัชนีมวลกาย (BMI)</span>
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${bmiInfo.bg} ${bmiInfo.color}`}>
                        {bmiInfo.label}
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-2 my-1">
                      <span className="text-3xl font-black text-white">{bmi}</span>
                      <span className="text-xs text-slate-400">kg/m²</span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1 mb-2">
                      {bmiInfo.desc}
                    </p>
                  </div>

                  <div className="space-y-1 mt-2">
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div className="w-[18.5%] bg-sky-400" title="ผอม" />
                      <div className="w-[23%] bg-emerald-400" title="สมส่วน" />
                      <div className="w-[15%] bg-amber-400" title="ท้วม" />
                      <div className="w-[25%] bg-orange-400" title="อ้วน 1" />
                      <div className="w-[18.5%] bg-red-400" title="อ้วน 2" />
                    </div>
                  </div>
                </div>

                {/* BMR & TDEE Card */}
                <div className="glass-panel border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span>การเผาผลาญ (Metabolism)</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">ฝึก {form.targetDaysPerWeek} วัน/สัปดาห์</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-1">
                      <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">BMR (ขณะพักผ่อน)</span>
                        <span className="text-base font-black text-amber-300">{bmr.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 ml-1">kcal</span>
                      </div>
                      <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">TDEE (รวมกิจกรรม)</span>
                        <span className="text-base font-black text-lime-400">{tdee.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 ml-1">kcal</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 bg-slate-900/70 p-2 rounded-xl border border-slate-800/80 text-[10px] space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>📉 ลดไขมัน (Cut):</span>
                      <span className="font-bold text-sky-300">~{cutCalories.toLocaleString()} kcal</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>📈 เพิ่มกล้าม (Bulk):</span>
                      <span className="font-bold text-lime-400">~{bulkCalories.toLocaleString()} kcal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Goals & Experience */}
              <div className="glass-panel border-slate-800/90 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                  <Target className="w-3.5 h-3.5" />
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
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
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
                    <label className="block font-bold text-slate-300 mb-1">ระดับประสบการณ์</label>
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
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">วันฝึกต่อสัปดาห์</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[3, 4, 5, 6].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => handleFieldChange('targetDaysPerWeek', days)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            form.targetDaysPerWeek === days
                              ? 'bg-cyan-500 text-slate-950 font-black'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {days} วัน
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Weight History Log Tracker */}
              <div className="glass-panel border-slate-800/90 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>บันทึกการเปลี่ยนแปลงน้ำหนัก (Weight Tracker)</span>
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

                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                  {(form.weightHistory || []).map((log, idx) => {
                    const prevWeight = form.weightHistory[idx + 1]?.weightKg;
                    const diff = prevWeight ? (log.weightKg - prevWeight).toFixed(1) : null;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px]"
                      >
                        <div className="flex items-center space-x-2 text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{log.date}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-white">{log.weightKg} kg</span>
                          {diff !== null && (
                            <span className={`text-[10px] font-bold ${Number(diff) > 0 ? 'text-amber-400' : Number(diff) < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {Number(diff) > 0 ? `+${diff}` : diff} kg
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MULTI-USER MANAGEMENT & CREATION */}
          {/* ========================================================================= */}
          {activeTab === 'USERS' && (
            <div className="space-y-4 animate-fade-in">
              {/* Active Users List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>โปรไฟล์ผู้ใช้ในระบบทั้งหมด ({usersList.length} คน)</span>
                  </span>

                  {!isCreatingUser && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingUser(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all flex items-center space-x-1.5 shadow-md"
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

              {/* Create New User Modal / Sub-Form */}
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
                        placeholder="เช่น น้องฟ้า, เพื่อนสนิท, หรือ Athlete 2"
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

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            ปิด
          </button>

          {activeTab === 'PROFILE' && (
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-lime-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>💾 บันทึกข้อมูลส่วนบุคคล (Save Profile)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
