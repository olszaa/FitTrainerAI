import React, { useState } from 'react';
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
  Users,
  Award,
  Zap
} from 'lucide-react';
import {
  getUserProfile,
  verifyUserPin,
  getUserRank,
  createNewUser
} from '../utils/storage';

const AVATAR_OPTIONS = ['🏋️‍♂️', '🏃‍♀️', '🥊', '⚡', '🧘', '🦾', '🥇', '🎯', '🔥', '🚴'];

export default function LoginScreen({
  usersList = [],
  onLoginSuccess,
  onCreateUser
}) {
  const [view, setView] = useState('SELECT_ACCOUNT'); // 'SELECT_ACCOUNT' | 'ENTER_PIN' | 'REGISTER'
  const [selectedUser, setSelectedUser] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Registration Form State
  const [registerForm, setRegisterForm] = useState({
    name: '',
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

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    const profile = getUserProfile(user.id);
    if (profile.pinCode && profile.pinCode.trim().length === 4) {
      // User has PIN code -> Go to PIN entry screen
      setPinInput('');
      setPinError('');
      setView('ENTER_PIN');
    } else {
      // No PIN code -> Direct login!
      onLoginSuccess(user.id);
    }
  };

  const handlePinSubmit = (e) => {
    if (e) e.preventDefault();
    if (!selectedUser) return;

    if (verifyUserPin(selectedUser.id, pinInput)) {
      onLoginSuccess(selectedUser.id);
    } else {
      setPinError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setPinInput('');
    }
  };

  const handleNumpadClick = (num) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      setPinError('');
      if (nextPin.length === 4) {
        if (verifyUserPin(selectedUser.id, nextPin)) {
          onLoginSuccess(selectedUser.id);
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

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!registerForm.name.trim()) return;

    const { newUser } = createNewUser(registerForm);
    if (onCreateUser) onCreateUser(registerForm);
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
                ยินดีต้อนรับกลับมา 👋
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                เลือกโปรไฟล์ผู้ใช้งานของคุณเพื่อเข้าสู่ระบบ บันทึกซ้อม และจัดการตารางฝึก
              </p>
            </div>

            {/* Users Account List Grid */}
            <div className="space-y-3">
              {usersList.map((user) => {
                const rank = getUserRank(user.id);
                const isPinProtected = user.hasPin;

                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="glass-panel border-slate-800 hover:border-cyan-500/60 rounded-3xl p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 group shadow-xl bg-gradient-to-r from-[#131722] via-[#131722] to-slate-950"
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      {/* Avatar */}
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                        <span>{user.avatar || '🏋️‍♂️'}</span>
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors truncate">
                            {user.name}
                          </h3>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r ${rank.badgeBg} shrink-0`}>
                            {rank.icon} {rank.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                          <span>{user.gender === 'FEMALE' ? '👩 หญิง' : '👨 ชาย'}</span>
                          <span>•</span>
                          <span>{user.weightKg} kg</span>
                          <span>•</span>
                          <span>ฝึก {user.targetDaysPerWeek || 4} วัน/สัปดาห์</span>
                        </p>
                      </div>
                    </div>

                    {/* Right Lock / Login Icon */}
                    <div className="flex items-center space-x-2 shrink-0 pl-2">
                      {isPinProtected ? (
                        <span className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold">
                          <Lock className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">PIN</span>
                        </span>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 flex items-center justify-center transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setView('REGISTER')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-lime-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 active:scale-95"
              >
                <UserPlus className="w-4 h-4 stroke-[3]" />
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

              {/* Name & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    ชื่อผู้ใช้งาน <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น คุณยท, Nickname"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">เพศสรีระ</label>
                  <div className="grid grid-cols-2 gap-2">
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

              {/* Goal & Optional PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">เป้าหมายหลัก</label>
                  <select
                    value={registerForm.goal}
                    onChange={(e) => setRegisterForm({ ...registerForm, goal: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none cursor-pointer"
                  >
                    <option value="MUSCLE_BUILDING">🏋️‍♂️ สร้างกล้ามเนื้อ (Build Muscle)</option>
                    <option value="WEIGHT_LOSS">🔥 ลดน้ำหนัก / กระชับสัดส่วน</option>
                    <option value="MAINTAIN">⚡ เพิ่มความแข็งแรงทนทาน</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">ตั้งรหัสผ่าน PIN 4 หลัก (ถ้ามี)</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="รหัส PIN 4 หลัก (ไม่บังคับ)"
                    value={registerForm.pinCode}
                    onChange={(e) => setRegisterForm({ ...registerForm, pinCode: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none font-mono tracking-widest"
                  />
                </div>
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
