import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Key,
  Users,
  UserPlus,
  Trash2,
  Check,
  Search,
  LogOut,
  Sparkles,
  User,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const AVATAR_OPTIONS = ['🏋️‍♂️', '🏃‍♀️', '🥊', '⚡', '🧘', '🦾', '🥇', '🎯', '🔥', '🚴'];
const ADMIN_PASSWORD_REQUIRED = 'Code010906';

export default function AdminMemberModal({
  isOpen,
  onClose,
  usersList = [],
  activeUserId,
  onSwitchUser,
  onDeleteUser,
  onCreateUser
}) {
  if (!isOpen) return null;

  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [passError, setPassError] = useState('');

  // Search & Form State
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    email: '',
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

  const handleVerifyPassword = (e) => {
    if (e) e.preventDefault();
    if (adminPasswordInput.trim() === ADMIN_PASSWORD_REQUIRED) {
      setIsAdminAuthenticated(true);
      setPassError('');
      setAdminPasswordInput('');
    } else {
      setPassError('รหัสผ่าน Admin ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleCreateSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newUserForm.name.trim()) return;

    onCreateUser(newUserForm);
    setIsCreatingUser(false);
    setNewUserForm({
      name: '',
      username: '',
      email: '',
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
    setSuccessMsg(`สร้างสมาชิกใหม่ "${newUserForm.name}" สำเร็จแล้ว! 🎉`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteMember = (userId, userName) => {
    try {
      onDeleteUser(userId);
      setDeleteConfirmId(null);
      setSuccessMsg(`ลบสมาชิก "${userName}" ออกจากระบบเรียบร้อยแล้ว`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      alert(err.message || 'ไม่สามารถลบผู้ใช้งานได้');
    }
  };

  // Filter members by search query
  const filteredUsers = usersList.filter((usr) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      usr.name?.toLowerCase().includes(q) ||
      usr.username?.toLowerCase().includes(q) ||
      usr.email?.toLowerCase().includes(q) ||
      usr.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-2xl bg-[#131722] border border-cyan-500/40 rounded-3xl p-5 sm:p-6 space-y-4 my-6 shadow-2xl relative overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Glow Ambient Effect */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-cyan-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-cyan-500 to-lime-400 p-[2px] shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-[#0b0d12] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white">จัดการสมาชิก (Admin Panel)</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ADMIN MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                ระบบจัดการสมาชิก ผู้ดูแลระบบ และลบโปรไฟล์ซ้ำ
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

        {/* ========================================================================= */}
        {/* STEP 1: PASSWORD AUTHENTICATION SCREEN */}
        {/* ========================================================================= */}
        {!isAdminAuthenticated ? (
          <div className="py-8 px-4 sm:px-8 space-y-6 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h4 className="text-lg font-black text-white">กรอกรหัสผ่านผู้ดูแลระบบ (Admin Password)</h4>
              <p className="text-xs text-slate-400 mt-1">
                กรุณาป้อนรหัสผ่าน Admin เพื่อเข้าสู่เมนูจัดการสมาชิก
              </p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="รหัสผ่าน Admin"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setPassError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-amber-400 font-bold transition-all text-center tracking-widest"
                  autoFocus
                />
              </div>

              {passError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center space-x-1.5 animate-bounce-short">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ยืนยันปลดล็อก Admin</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ========================================================================= */
          /* STEP 2: ADMIN MEMBER MANAGEMENT DASHBOARD */
          /* ========================================================================= */
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            
            {/* Success Alert Banner */}
            {successMsg && (
              <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold flex items-center space-x-2 animate-bounce-short">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Admin Header Stats Bar & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 font-black text-xs flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>สมาชิกทั้งหมด: {usersList.length} คน</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingUser(!isCreatingUser)}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-lime-400 hover:brightness-110 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ เพิ่มสมาชิกใหม่</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAdminAuthenticated(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 font-bold text-xs border border-slate-700 transition-colors flex items-center space-x-1"
                  title="ออกจากโหมด Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ล็อก Admin</span>
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="ค้นหาชื่อสมาชิก, Username หรือ Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-cyan-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Create New Member Form (If Toggled) */}
            {isCreatingUser && (
              <div className="glass-panel border-amber-400/40 rounded-2xl p-4 space-y-3.5 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 shadow-xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black text-amber-300 flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>เพิ่มสมาชิกใหม่โดย Admin</span>
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
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all ${
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

                {/* Inputs: Name, Username, Email */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">ชื่อสมาชิก <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      placeholder="เช่น คุณเอก"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-amber-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">Username (ถ้ามี)</label>
                    <input
                      type="text"
                      placeholder="ake_user"
                      value={newUserForm.username}
                      onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">Email (ถ้ามี)</label>
                    <input
                      type="email"
                      placeholder="ake@example.com"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Gender, Weight, Height, Age */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] mb-0.5">เพศ</span>
                    <select
                      value={newUserForm.gender}
                      onChange={(e) => setNewUserForm({ ...newUserForm, gender: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs outline-none"
                    >
                      <option value="MALE">👨 ชาย</option>
                      <option value="FEMALE">👩 หญิง</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] mb-0.5">อายุ (ปี)</span>
                    <input
                      type="number"
                      value={newUserForm.age}
                      onChange={(e) => setNewUserForm({ ...newUserForm, age: Number(e.target.value) || 20 })}
                      className="w-full bg-slate-950 border border-slate-700 text-center font-bold text-white rounded-lg py-1 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] mb-0.5">ส่วนสูง (cm)</span>
                    <input
                      type="number"
                      value={newUserForm.heightCm}
                      onChange={(e) => setNewUserForm({ ...newUserForm, heightCm: Number(e.target.value) || 160 })}
                      className="w-full bg-slate-950 border border-slate-700 text-center font-bold text-white rounded-lg py-1 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] mb-0.5">น้ำหนัก (kg)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={newUserForm.weightKg}
                      onChange={(e) => setNewUserForm({ ...newUserForm, weightKg: Number(e.target.value) || 50, targetWeightKg: Number(e.target.value) || 50 })}
                      className="w-full bg-slate-950 border border-slate-700 text-center font-bold text-amber-300 rounded-lg py-1 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingUser(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSubmit}
                    disabled={!newUserForm.name.trim()}
                    className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black text-xs shadow-md hover:brightness-110 disabled:opacity-40"
                  >
                    + ยืนยันบันทึกสมาชิกใหม่
                  </button>
                </div>
              </div>
            )}

            {/* Members List Table / Cards */}
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-500" />
                  <p className="font-bold">ไม่พบรายชื่อสมาชิกที่ตรงกับคำค้นหา</p>
                </div>
              ) : (
                filteredUsers.map((usr) => {
                  const isActive = usr.id === activeUserId;
                  const isConfirmingDelete = deleteConfirmId === usr.id;

                  return (
                    <div
                      key={usr.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-md'
                          : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        
                        {/* Member Identity & Details */}
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0 shadow-inner">
                            <span>{usr.avatar || '🏋️‍♂️'}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-extrabold text-white text-xs sm:text-sm truncate">{usr.name}</h4>
                              {isActive && (
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-black shrink-0 flex items-center space-x-1">
                                  <Check className="w-3 h-3" />
                                  <span>Active</span>
                                </span>
                              )}
                              {usr.hasPin && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold shrink-0">
                                  🔒 PIN
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 mt-0.5">
                              {usr.username && <span>ID: <strong className="text-slate-300">@{usr.username}</strong></span>}
                              {usr.email && <span>📧 {usr.email}</span>}
                              <span>⚖️ {usr.weightKg || '--'} kg</span>
                              <span>📏 {usr.heightCm || '--'} cm</span>
                              <span className="text-slate-500">(Ref: {usr.id})</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions: Switch Profile & Delete */}
                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                          
                          {/* Confirm Delete State */}
                          {isConfirmingDelete ? (
                            <div className="flex items-center space-x-1 bg-rose-500/20 p-1 rounded-xl border border-rose-500/50 animate-fade-in">
                              <span className="text-[10px] font-bold text-rose-300 px-1">ยืนยันลบ?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteMember(usr.id, usr.name)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black text-[10px]"
                              >
                                ลบถาวร
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px]"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <>
                              {!isActive && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSwitchUser(usr.id);
                                    setSuccessMsg(`สลับไปใช้งานโปรไฟล์ "${usr.name}" เรียบร้อยแล้ว`);
                                    setTimeout(() => setSuccessMsg(''), 2500);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/40 transition-all text-xs flex items-center space-x-1"
                                >
                                  <span>สลับใช้</span>
                                </button>
                              )}

                              {usersList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(usr.id)}
                                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all"
                                  title="ลบสมาชิกนี้ออกจากระบบ (ลบแอคเคานต์ซ้ำ)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-500 font-mono">
            Admin Auth: Code010906
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
