import React, { useState, useRef, useEffect } from 'react';
import {
  Dumbbell,
  Lock,
  User,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  Key,
  CheckCircle2,
  Award,
  Zap,
  Mail
} from 'lucide-react';
import {
  getUserProfile,
  verifyUserPin,
  createNewUser,
  checkDuplicateUser,
  syncCloudProfilesToLocal,
  syncUserDataFromCloudToLocal,
  searchProfileFromSupabase
} from '../utils/storage';
import {
  calculateBMI,
  getBMICategory
} from '../utils/fitnessCalculators';

const AVATAR_OPTIONS = ['🏋️‍♂️', '🏃‍♀️', '🥊', '⚡', '🧘', '🦾', '🥇', '🎯', '🔥', '🚴'];

export default function LoginScreen({
  usersList = [],
  onLoginSuccess,
  onCreateUser,
  onRefreshUsers
}) {
  const [view, setView] = useState('SELECT_ACCOUNT'); // 'SELECT_ACCOUNT' | 'ENTER_PIN' | 'REGISTER'
  const [directUsername, setDirectUsername] = useState('');
  const [directPassword, setDirectPassword] = useState('');
  const [directLoginError, setDirectLoginError] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Fetch Cloud Profiles on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCloud = async () => {
      setIsCloudSyncing(true);
      setSyncStatusMsg('☁️กำลังเชื่อมต่อบัญชี Cloud Sync...');
      await syncCloudProfilesToLocal();
      if (isMounted) {
        if (onRefreshUsers) onRefreshUsers();
        setIsCloudSyncing(false);
        setSyncStatusMsg('');
      }
    };
    fetchCloud();
    return () => { isMounted = false; };
  }, []);

  // Registration Form State
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    avatar: '🏋️‍♂️',
    gender: 'MALE',
    age: 26,
    weightKg: 70,
    targetWeightKg: 70,
    heightCm: 175,
    goal: 'MUSCLE_BUILDING',
    gymLevel: 'INTERMEDIATE',
    targetDaysPerWeek: 4,
    pinCode: ''
  });

  // 3D Mannequin Video State for Registration
  const registerBmi = calculateBMI(registerForm.weightKg, registerForm.heightCm);
  const registerBmiCategory = getBMICategory(registerBmi);
  const registerVideoSrc = registerForm.gender === 'FEMALE' ? '/videos/FemaleMannequin.mp4' : '/videos/MaleMannequin.mp4';
  const registerVideoRef = useRef(null);

  useEffect(() => {
    if (view !== 'REGISTER') return;
    const video = registerVideoRef.current;
    if (video) {
      const clampedBmi = Math.max(10, Math.min(60, registerBmi));
      const duration = video.duration || 6.042;
      const progress = (clampedBmi - 10) / 50;
      const targetTime = Math.max(0.01, Math.min(duration - 0.05, progress * duration));
      try {
        video.currentTime = targetTime;
      } catch (e) {
        console.warn('Register video seek error:', e);
      }
    }
  }, [registerBmi, registerForm.gender, view]);

  const processLogin = async (userId) => {
    setIsCloudSyncing(true);
    setSyncStatusMsg('☁️ กำลังซิงค์ข้อมูลจาก Cloud...');
    await syncUserDataFromCloudToLocal(userId);
    setIsCloudSyncing(false);
    setSyncStatusMsg('');
    onLoginSuccess(userId);
  };

  const handleDirectLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!directUsername.trim()) {
      setDirectLoginError('กรุณากรอกชื่อผู้ใช้งาน (Username)');
      return;
    }

    setDirectLoginError('');
    setIsCloudSyncing(true);
    setSyncStatusMsg('🔍 กำลังตรวจสอบบัญชีและรหัสผ่าน...');

    // Pull latest profiles from Supabase Cloud
    const cloudUsers = await syncCloudProfilesToLocal();
    if (onRefreshUsers) onRefreshUsers();

    const searchName = directUsername.trim().toLowerCase();
    const allUsers = cloudUsers || usersList;
    let match = allUsers.find(
      (u) =>
        (u.username && u.username.trim().toLowerCase() === searchName) ||
        (u.name && u.name.trim().toLowerCase() === searchName) ||
        (u.email && u.email.trim().toLowerCase() === searchName) ||
        (u.id && u.id.trim().toLowerCase() === searchName)
    );

    if (!match) {
      // Direct deep search query on Supabase Cloud
      const cloudMatches = await searchProfileFromSupabase(directUsername);
      if (cloudMatches && cloudMatches.length > 0) {
        match = cloudMatches[0];
        await syncCloudProfilesToLocal();
        if (onRefreshUsers) onRefreshUsers();
      }
    }

    if (!match) {
      setIsCloudSyncing(false);
      setSyncStatusMsg('');
      setDirectLoginError(`ไม่พบบัญชีผู้ใช้งานชื่อ "${directUsername.trim()}" ในระบบ คุณสามารถสมัครสมาชิกใหม่ได้ทันทีด้านล่าง`);
      return;
    }

    // Account found -> Check PIN requirement
    const profile = getUserProfile(match.id);
    const hasPin = profile.pinCode && profile.pinCode.trim().length > 0;

    if (hasPin) {
      if (!directPassword.trim()) {
        setIsCloudSyncing(false);
        setSyncStatusMsg('');
        setSelectedUser(match);
        setPinInput('');
        setPinError('บัญชีนี้ตั้งรหัสผ่านไว้ กรุณาป้อนรหัสผ่านเพื่อเข้าใช้งาน');
        setView('ENTER_PIN');
        return;
      }

      if (!verifyUserPin(match.id, directPassword.trim())) {
        setIsCloudSyncing(false);
        setSyncStatusMsg('');
        setDirectLoginError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        return;
      }
    }

    // Success -> Process login & cloud sync!
    await processLogin(match.id);
  };

  const handlePinSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedUser) return;

    if (verifyUserPin(selectedUser.id, pinInput)) {
      await processLogin(selectedUser.id);
    } else {
      setPinError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setPinInput('');
    }
  };

  const handleNumpadClick = async (num) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      setPinError('');
      if (nextPin.length === 4) {
        if (verifyUserPin(selectedUser.id, nextPin)) {
          await processLogin(selectedUser.id);
        } else {
          setPinError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
          setTimeout(() => setPinInput(''), 400);
        }
      }
    }
  };

  const handleNumpadDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setPinError('');
  };

  const [registerError, setRegisterError] = useState('');
  const [duplicateField, setDuplicateField] = useState(null);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setDuplicateField(null);

    const payload = {
      ...registerForm,
      username: registerForm.username.trim() || registerForm.name.trim(),
      name: registerForm.name.trim() || registerForm.username.trim(),
      password: registerForm.password.trim() || registerForm.pinCode.trim(),
      pinCode: registerForm.password.trim() || registerForm.pinCode.trim(),
      email: registerForm.email.trim()
    };

    if (!payload.username && !payload.name) {
      setRegisterError('กรุณากรอก Username หรือ ชื่อผู้ใช้งานให้เรียบร้อย');
      return;
    }

    setIsCloudSyncing(true);
    setSyncStatusMsg('🔍 กำลังตรวจสอบข้อมูลซ้ำในระบบ...');

    // Validate duplicate Username, Email, or Name
    const dupCheck = await checkDuplicateUser(payload);
    if (dupCheck.isDuplicate) {
      setIsCloudSyncing(false);
      setSyncStatusMsg('');
      setRegisterError(dupCheck.message);
      setDuplicateField(dupCheck.field);
      return;
    }

    setSyncStatusMsg('✨ กำลังสร้างบัญชีและซิงค์ข้อมูลไปยัง Cloud...');
    const { newUser } = await createNewUser(payload);
    if (onCreateUser) onCreateUser(payload);
    await syncUserDataFromCloudToLocal(newUser.id);
    setIsCloudSyncing(false);
    setSyncStatusMsg('');
    onLoginSuccess(newUser.id);
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      {/* Dynamic Ambient Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[550px] h-96 sm:h-[550px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/10 to-lime-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Branding */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between z-10 pt-2 sm:pt-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-lime-400 p-[2px] shadow-lg shadow-cyan-500/25 shrink-0">
            <div className="w-full h-full bg-[#0c0e13] rounded-[14px] flex items-center justify-center">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 transform -rotate-12" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-black text-lg sm:text-2xl tracking-tight text-white">
                FitTrainer <span className="text-cyan-400">AI</span>
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/30">
                PRO AUTH
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden xs:block">
              ระบบบันทึกการออกกำลังกาย & โค้ชส่วนตัว AI 3D Anatomy
            </p>
          </div>
        </div>

        {view !== 'SELECT_ACCOUNT' && (
          <button
            onClick={() => setView('SELECT_ACCOUNT')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>
        )}
      </header>

      {/* Main Content Stage */}
      <main className="max-w-xl w-full mx-auto my-auto py-8 z-10 animate-fade-in">
        
        {/* ========================================================================= */}
        {/* VIEW 1: SELECT ACCOUNT GRID */}
        {/* ========================================================================= */}
        {view === 'SELECT_ACCOUNT' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                🔑 เข้าสู่ระบบใช้งาน (Log In)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                ป้อนชื่อผู้ใช้งาน (Username) และรหัสผ่านเพื่อเข้าสู่ระบบจากเครื่องใดก็ได้
              </p>
            </div>

            {/* Cloud Sync Spinner Banner */}
            {isCloudSyncing && syncStatusMsg && (
              <div className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{syncStatusMsg}</span>
              </div>
            )}

            {/* FORM LOGIN (Direct Username & Password Input) */}
            <form onSubmit={handleDirectLoginSubmit} className="glass-panel border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl bg-gradient-to-b from-[#131722] via-[#131722] to-slate-950 text-left">
              <div className="space-y-1.5">
                <label className="block text-slate-200 font-extrabold text-xs">
                  ชื่อผู้ใช้งาน (Username) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="ป้อนชื่อบัญชี เช่น คุณยท, Ake..."
                    value={directUsername}
                    onChange={(e) => {
                      setDirectUsername(e.target.value);
                      setDirectLoginError('');
                    }}
                    className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-cyan-400 font-bold text-sm shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-200 font-extrabold text-xs">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    type="password"
                    placeholder="กรอกรหัสผ่านของคุณ (ถ้ามี)..."
                    value={directPassword}
                    onChange={(e) => {
                      setDirectPassword(e.target.value);
                      setDirectLoginError('');
                    }}
                    className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-purple-400 font-bold text-sm shadow-inner"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block pt-0.5">
                  💡 หากคุณตั้งรหัสผ่านไว้บนบัญชี ให้กรอกรหัสผ่านเพื่อเข้าสู่ระบบ
                </span>
              </div>

              {directLoginError && (
                <div className="text-xs font-bold text-rose-400 bg-rose-500/10 p-3 rounded-2xl border border-rose-500/30 animate-shake">
                  ⚠️ {directLoginError}
                </div>
              )}

              <button
                type="submit"
                disabled={!directUsername.trim() || isCloudSyncing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-lime-400 hover:brightness-110 text-slate-950 font-black text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <Key className="w-4 h-4 stroke-[3]" />
                <span>เข้าสู่ระบบทันที (Log In)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </form>


            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setView('REGISTER')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-extrabold text-xs transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-cyan-400 stroke-[2.5]" />
                <span>+ สมัครสมาชิก / เพิ่มผู้ใช้งานใหม่</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: ENTER PIN SCREEN */}
        {/* ========================================================================= */}
        {view === 'ENTER_PIN' && selectedUser && (
          <div className="glass-panel border-purple-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl bg-gradient-to-b from-[#131722] via-[#131722] to-slate-950 max-w-md mx-auto">
            {/* User Avatar Badge */}
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-3xl bg-slate-950 border-2 border-purple-500/50 flex items-center justify-center text-4xl mx-auto shadow-xl">
                <span>{selectedUser.avatar || '🏋️‍♂️'}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-purple-600 text-white border-2 border-[#131722] shadow-lg">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">{selectedUser.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                ป้อนรหัส PIN 4 หลักเพื่อเข้าสู่ระบบ
              </p>
            </div>

            {/* 4-Digit PIN Indicators */}
            <div className="flex items-center justify-center space-x-4 py-2">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      filled
                        ? 'bg-purple-400 shadow-lg shadow-purple-500/50 scale-125'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                );
              })}
            </div>

            {/* Error Message */}
            {pinError && (
              <div className="text-xs font-bold text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30 animate-shake">
                {pinError}
              </div>
            )}

            {/* On-screen Numpad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumpadClick(num.toString())}
                  className="h-12 rounded-2xl bg-slate-900/90 hover:bg-purple-600/20 active:bg-purple-600/40 text-white font-black text-lg border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setView('SELECT_ACCOUNT')}
                className="h-12 rounded-2xl bg-slate-900/50 text-slate-400 text-xs font-bold flex items-center justify-center"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleNumpadClick('0')}
                className="h-12 rounded-2xl bg-slate-900/90 hover:bg-purple-600/20 active:bg-purple-600/40 text-white font-black text-lg border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-center"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleNumpadDelete}
                className="h-12 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-bold text-sm border border-slate-800 flex items-center justify-center"
              >
                ⌫
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: REGISTER NEW USER */}
        {/* ========================================================================= */}
        {view === 'REGISTER' && (
          <div className="glass-panel border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl bg-gradient-to-b from-[#131722] via-[#131722] to-slate-950 max-w-xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">สมัครสมาชิก / เพิ่มผู้ใช้งานใหม่</h3>
                <p className="text-xs text-slate-400">กรอกข้อมูลเริ่มต้นเพื่อสร้างโปรไฟล์การซ้อมของคุณ</p>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              {registerError && (
                <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs p-3.5 rounded-xl flex items-center space-x-2.5 animate-shake shadow-lg shadow-rose-950/40">
                  <span className="text-lg shrink-0">⚠️</span>
                  <span className="font-bold">{registerError}</span>
                </div>
              )}

              {/* Avatar Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">เลือกไอคอนประจำตัว (Avatar)</label>
                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setRegisterForm({ ...registerForm, avatar: emoji })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        registerForm.avatar === emoji
                          ? 'bg-cyan-500/20 border-2 border-cyan-400 scale-110 shadow-md'
                          : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Main Credentials: Username, Password, Name, Email */}
              <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-4 space-y-3.5 shadow-inner">
                <div className="text-[11px] font-black text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-2">
                  <Key className="w-3.5 h-3.5" />
                  <span>ข้อมูลบัญชีหลัก (Account Credentials)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Username */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      1. Username (ชื่อผู้ใช้เข้าระบบ) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                      <input
                        type="text"
                        required
                        placeholder="เช่น ake_fit, john99"
                        value={registerForm.username}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRegisterForm({
                            ...registerForm,
                            username: val,
                            name: registerForm.name || val
                          });
                        }}
                        className={`w-full bg-slate-950 border ${
                          duplicateField === 'username'
                            ? 'border-rose-500 text-rose-200 focus:border-rose-400 ring-2 ring-rose-500/20'
                            : 'border-slate-700 text-white focus:border-cyan-400'
                        } rounded-xl pl-9 pr-3 py-2.5 outline-none font-bold transition-all`}
                      />
                    </div>
                  </div>

                  {/* 2. Password */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      2. Password (รหัสผ่าน / PIN) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                      <input
                        type="password"
                        required
                        placeholder="ตั้งรหัสผ่าน หรือ PIN 4 หลัก"
                        value={registerForm.password}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRegisterForm({
                            ...registerForm,
                            password: val,
                            pinCode: val
                          });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-purple-400 font-mono tracking-widest font-bold"
                      />
                    </div>
                  </div>

                  {/* 3. Display Name */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      3. ชื่อ-นามสกุล (Display Name) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-400" />
                      <input
                        type="text"
                        required
                        placeholder="เช่น คุณเอก (Ake)"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className={`w-full bg-slate-950 border ${
                          duplicateField === 'name'
                            ? 'border-rose-500 text-rose-200 focus:border-rose-400 ring-2 ring-rose-500/20'
                            : 'border-slate-700 text-white focus:border-lime-400'
                        } rounded-xl pl-9 pr-3 py-2.5 outline-none font-bold transition-all`}
                      />
                    </div>
                  </div>

                  {/* 4. Email */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      4. อีเมล (Email Address)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                      <input
                        type="email"
                        placeholder="เช่น user@example.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className={`w-full bg-slate-950 border ${
                          duplicateField === 'email'
                            ? 'border-rose-500 text-rose-200 focus:border-rose-400 ring-2 ring-rose-500/20'
                            : 'border-slate-700 text-white focus:border-amber-400'
                        } rounded-xl pl-9 pr-3 py-2.5 outline-none font-bold transition-all`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">เพศสรีระ</label>
                <div className="grid grid-cols-2 gap-2 max-w-md">
                  <button
                    type="button"
                    onClick={() => setRegisterForm({ ...registerForm, gender: 'MALE' })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      registerForm.gender === 'MALE'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    👨 ชาย
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterForm({ ...registerForm, gender: 'FEMALE' })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      registerForm.gender === 'FEMALE'
                        ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    👩 หญิง
                  </button>
                </div>
              </div>

              {/* Body Stats Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold mb-1">อายุ (ปี)</span>
                  <input
                    type="number"
                    value={registerForm.age}
                    onChange={(e) => setRegisterForm({ ...registerForm, age: Number(e.target.value) || 20 })}
                    className="w-full bg-slate-900 border border-slate-700 text-center font-black text-white rounded-xl py-2 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold mb-1">ส่วนสูง (cm)</span>
                  <input
                    type="number"
                    value={registerForm.heightCm}
                    onChange={(e) => setRegisterForm({ ...registerForm, heightCm: Number(e.target.value) || 160 })}
                    className="w-full bg-slate-900 border border-slate-700 text-center font-black text-white rounded-xl py-2 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold mb-1">น้ำหนัก (kg)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={registerForm.weightKg}
                    onChange={(e) => setRegisterForm({ ...registerForm, weightKg: Number(e.target.value) || 50, targetWeightKg: Number(e.target.value) || 50 })}
                    className="w-full bg-slate-900 border border-slate-700 text-center font-black text-cyan-300 rounded-xl py-2 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* 3D Mannequin Video Visualizer Preview for Registration */}
              <div className="relative rounded-2xl overflow-hidden bg-black/95 border border-cyan-500/40 flex items-center justify-center shadow-inner my-3 h-[220px] sm:h-[250px] w-full">
                {/* Background Fallback Image */}
                <img
                  src="/muscle_heatmap_3d.jpg"
                  alt="3D Mannequin Fallback"
                  className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
                />

                {/* HUD Watermark */}
                <div className="absolute top-2.5 left-2.5 z-20 flex items-center space-x-1.5 text-[9px] font-black tracking-widest text-cyan-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30 backdrop-blur-sm pointer-events-none">
                  <Sparkles className="w-3 h-3 animate-spin text-cyan-400" />
                  <span>3D ANATOMY PREVIEW // {registerForm.gender === 'FEMALE' ? 'FEMALE' : 'MALE'}</span>
                </div>

                <div className="absolute top-2.5 right-2.5 z-20 flex items-center space-x-1.5 text-[10px] font-extrabold bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-700 backdrop-blur-sm pointer-events-none">
                  <span className="text-slate-400">BMI จำลอง:</span>
                  <span className="text-cyan-400 font-black text-xs">{registerBmi}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-cyan-500/20 text-cyan-300">
                    {registerBmiCategory.category}
                  </span>
                </div>

                <video
                  ref={registerVideoRef}
                  key={`${registerVideoSrc}-${registerBmi}`}
                  src={registerVideoSrc}
                  preload="auto"
                  playsInline
                  muted
                  onLoadedMetadata={(e) => {
                    const duration = e.target.duration || 6.042;
                    const clampedBmi = Math.max(10, Math.min(60, registerBmi));
                    const progress = (clampedBmi - 10) / 50;
                    try {
                      e.target.currentTime = Math.max(0.01, progress * duration);
                    } catch (err) {}
                  }}
                  onLoadedData={(e) => {
                    const duration = e.target.duration || 6.042;
                    const clampedBmi = Math.max(10, Math.min(60, registerBmi));
                    const progress = (clampedBmi - 10) / 50;
                    try {
                      e.target.currentTime = Math.max(0.01, progress * duration);
                    } catch (err) {}
                  }}
                  className="w-full h-full object-cover object-center scale-[1.12] relative z-10"
                />
              </div>

              {/* Goal Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">เป้าหมายหลักในการออกกำลังกาย</label>
                <select
                  value={registerForm.goal}
                  onChange={(e) => setRegisterForm({ ...registerForm, goal: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold"
                >
                  <option value="MUSCLE_BUILDING">🏋️‍♂️ สร้างกล้ามเนื้อ (Build Muscle)</option>
                  <option value="WEIGHT_LOSS">🔥 ลดน้ำหนัก / กระชับสัดส่วน (Weight Loss)</option>
                  <option value="MAINTAIN">⚡ เพิ่มความแข็งแรงทนทาน (Strength & Maintenance)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setView('SELECT_ACCOUNT')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!registerForm.name.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-lime-400 hover:brightness-110 text-slate-950 font-black transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40"
                >
                  ✨ สร้างบัญชี & เข้าสู่ระบบทันที
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* Footer Branding */}
      <footer className="text-center text-xs text-slate-500 z-10 pb-2">
        <p>FitTrainer AI — Multi-User Fitness Authentication System</p>
      </footer>
    </div>
  );
}
