import React, { useState } from 'react';
import {
  Dumbbell,
  Home,
  Calendar,
  Flame,
  Bot,
  Activity,
  BookOpen,
  BarChart3,
  User,
  Users,
  ChevronDown,
  Check,
  Plus,
  Settings,
  Lock,
  LogOut
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  activeWorkout,
  onOpenAIChat,
  onOpenProfile,
  onOpenAdmin,
  userProfile,
  usersList = [],
  activeUserId,
  onSwitchUser,
  onLogout,
  streakDays = 4
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'gym', label: 'บันทึก (Log)', shortLabel: 'บันทึก', icon: Dumbbell },
    { id: 'plans', label: 'ตารางฝึก', shortLabel: 'ตารางฝึก', icon: Calendar },
    { id: 'body', label: 'สรีระ & กล้ามเนื้อ', shortLabel: 'สรีระ & กล้าม', icon: Activity },
    { id: 'library', label: 'คลังท่า', shortLabel: 'คลังท่า', icon: BookOpen },
    { id: 'analytics', label: 'สถิติ', shortLabel: 'สถิติ', icon: BarChart3 },
  ];

  return (
    <>
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-[#0c0e13]/90 backdrop-blur-md border-b border-slate-800/80 px-2 sm:px-4 py-2 sm:py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab('gym')}>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-lime-400 p-[2px] shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-[#0b0d12] rounded-[10px] flex items-center justify-center">
                <Dumbbell className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-cyan-400 transform -rotate-12" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <h1 className="font-extrabold text-xs xs:text-sm sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  FitTrainer <span className="text-cyan-400">AI</span>
                </h1>
                <span className="text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.2 rounded bg-lime-400/20 text-lime-400 border border-lime-400/30 shrink-0">
                  PRO
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">
                Leap Fitness Inspired
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Visible on tablets & desktop) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === 'body' && activeTab === 'heatmap') ||
                (item.id === 'heatmap' && activeTab === 'body');
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-lime-400/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      item.id === 'gym' ? 'bg-cyan-500/30 text-cyan-300' : 'bg-lime-400/30 text-lime-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Active Session, Multi-User Switcher, Streak & AI Coach */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* Active Session Indicator Button */}
            {activeWorkout && (
              <button
                type="button"
                onClick={() => setActiveTab('gym')}
                className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs font-bold animate-pulse hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-500/25 cursor-pointer shrink-0"
                title="แตะเพื่อกลับไปยังการออกกำลังกายที่กำลังบันทึก"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-black text-[10px] sm:text-xs tracking-tight">กำลังบันทึก</span>
                <span className="text-[10px] text-rose-400 hidden sm:inline">(แตะเพื่อกลับไป)</span>
              </button>
            )}

            {/* Multi-User Switcher & Profile Button */}
            <div className="relative shrink-0">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-1 px-1.5 sm:px-3 py-1 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold transition-all shadow-sm hover:border-cyan-500/50 active:scale-95 group"
                title="สลับผู้ใช้งาน & จัดการโปรไฟล์"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-950 border border-cyan-500/40 flex items-center justify-center text-xs shrink-0 shadow-inner">
                  <span>{userProfile?.avatar || '🏋️‍♂️'}</span>
                </div>
                <span className="font-extrabold truncate max-w-[45px] sm:max-w-[100px] text-white text-[11px] sm:text-xs">
                  {userProfile?.name?.split(' ')[0] || 'โปรไฟล์'}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover:text-cyan-300 transition-transform shrink-0" />
              </button>

              {/* User Switcher Dropdown */}
              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-[#131722] border border-cyan-500/30 rounded-2xl p-2.5 shadow-2xl z-50 animate-fade-in space-y-2.5">
                    {/* Logged in User Only Display */}
                    <div className="px-2 py-2 bg-slate-900/90 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 flex items-center justify-between mb-1">
                        <span>โปรไฟล์ผู้ใช้งานของคุณ</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-cyan-500/20 text-cyan-300">
                          Active User
                        </span>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-950 border border-cyan-500/40 flex items-center justify-center text-base shrink-0 shadow-inner">
                          <span>{userProfile?.avatar || '🏋️‍♂️'}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black text-white truncate">
                            {userProfile?.name || 'ผู้ใช้งาน'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {userProfile?.weightKg ? `น้ำหนัก ${userProfile.weightKg} kg` : ''} {userProfile?.heightCm ? `• ${userProfile.heightCm} cm` : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-1.5 text-xs font-bold pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenProfile('PROFILE');
                        }}
                        className="w-full py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Settings className="w-3.5 h-3.5 text-cyan-400" />
                          <span>⚙️ ข้อมูลสรีระ & สุขภาพ</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenAdmin) onOpenAdmin();
                        }}
                        className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-400/20 via-amber-300/10 to-amber-500/20 hover:from-amber-400/30 hover:to-amber-500/30 text-amber-300 border border-amber-400/40 transition-all flex items-center justify-between group shadow-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                          <span>👑 จัดการสมาชิก (Admin)</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-amber-400/20 text-amber-300">
                          Pass Protect
                        </span>
                      </button>

                      {onLogout && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full py-2 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center justify-center space-x-1.5"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>🚪 ออกจากระบบ (Logout)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Workout Streak Counter */}
            <div className="flex items-center space-x-0.5 sm:space-x-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] sm:text-xs font-bold shrink-0" title="ออกกำลังกายต่อเนื่อง">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-500/20 shrink-0" />
              <span>{streakDays}<span className="hidden sm:inline"> ว.</span></span>
            </div>

            {/* AI Personal Trainer Button */}
            <button
              onClick={onOpenAIChat}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3.5 py-1 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-lime-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all shrink-0"
            >
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce shrink-0" />
              <span className="hidden sm:inline">โค้ช AI</span>
              <span className="inline sm:hidden font-extrabold text-[10px]">AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly native app experience) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0c0e13]/95 backdrop-blur-2xl border-t border-slate-800/90 px-1 pt-1.5 pb-2 flex items-center justify-around shadow-2xl safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'body' && activeTab === 'heatmap') ||
            (item.id === 'heatmap' && activeTab === 'body');

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-90 ${
                isActive
                  ? 'text-cyan-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.id === 'gym' && activeWorkout && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium leading-none tracking-tight">
                {item.shortLabel || item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
