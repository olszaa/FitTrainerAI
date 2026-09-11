import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GymLogger from './components/GymLogger';
import HomeLogger from './components/HomeLogger';
import PlanBuilder from './components/PlanBuilder';
import MuscleHeatmap from './components/MuscleHeatmap';
import ExerciseLibrary from './components/ExerciseLibrary';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AITrainerModal from './components/AITrainerModal';
import UserProfileModal from './components/UserProfileModal';
import AdminMemberModal from './components/AdminMemberModal';
import BodyAndMuscles from './components/BodyAndMuscles';
import LoginScreen from './components/LoginScreen';
import {
  getUsersList,
  getActiveUserId,
  setActiveUserId,
  createNewUser,
  deleteUser,
  getWorkoutLogs,
  saveWorkoutLog,
  getUserProfile,
  saveUserProfile,
  verifyUserPin,
  getAuthSession,
  setAuthSession,
  clearAuthSession,
  syncCloudProfilesToLocal,
  syncUserDataFromCloudToLocal,
  syncProfileToSupabase
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('body'); // Default tab set to 'body' (สรีระ & กล้ามเนื้อ)
  
  // Auth & Session State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const session = getAuthSession();
    return Boolean(session && session.userId);
  });

  // Multi-user state
  const [activeUserId, setActiveUserIdState] = useState(() => {
    const session = getAuthSession();
    return session?.userId || getActiveUserId();
  });

  const [usersList, setUsersList] = useState(() => getUsersList());
  const [userProfile, setUserProfile] = useState(() => getUserProfile(activeUserId));
  const [workoutLogs, setWorkoutLogs] = useState(() => getWorkoutLogs(activeUserId));

  // Sync cloud profiles on app mount so all registered accounts are available across devices
  useEffect(() => {
    const fetchCloudProfiles = async () => {
      // Auto-push any local profiles to Supabase Cloud
      const localUsers = getUsersList();
      localUsers.forEach((u) => {
        const prof = getUserProfile(u.id);
        if (prof) syncProfileToSupabase(prof);
      });

      const mergedUsers = await syncCloudProfilesToLocal();
      if (mergedUsers) {
        setUsersList(mergedUsers);
      }
    };
    fetchCloudProfiles();
  }, []);

  // Sync user profile & logs from cloud whenever active user is loaded
  useEffect(() => {
    if (isAuthenticated && activeUserId) {
      syncUserDataFromCloudToLocal(activeUserId).then(() => {
        setUserProfile(getUserProfile(activeUserId));
        setWorkoutLogs(getWorkoutLogs(activeUserId));
      });
    }
  }, [activeUserId, isAuthenticated]);

  const [activeWorkout, setActiveWorkout] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState('PROFILE');

  const [templateToOpen, setTemplateToOpen] = useState(null);
  const [bodySubTab, setBodySubTab] = useState('PROFILE');

  // PIN Verification Modal state for switching users
  const [pendingPinUserId, setPendingPinUserId] = useState(null);
  const [pinPromptOpen, setPinPromptOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Core user switch execution
  const doSwitchUser = async (newUserId) => {
    setActiveUserId(newUserId);
    setActiveUserIdState(newUserId);
    setUserProfile(getUserProfile(newUserId));
    setWorkoutLogs(getWorkoutLogs(newUserId));
    setActiveWorkout(null);
    setActiveTab('body');

    await syncUserDataFromCloudToLocal(newUserId);
    setUserProfile(getUserProfile(newUserId));
    setWorkoutLogs(getWorkoutLogs(newUserId));
  };

  const handleLoginSuccess = async (userId) => {
    setAuthSession(userId);
    await doSwitchUser(userId);
    setIsAuthenticated(true);
    setActiveTab('body');
  };

  const handleLogout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
  };

  // Intercept switch attempt for PIN verification
  const handleSwitchUser = (newUserId) => {
    if (newUserId === activeUserId) return;

    if (!verifyUserPin(newUserId, null)) {
      // User has PIN enabled -> ask for PIN
      setPendingPinUserId(newUserId);
      setPinInput('');
      setPinError('');
      setPinPromptOpen(true);
    } else {
      setAuthSession(newUserId);
      doSwitchUser(newUserId);
    }
  };

  const handleVerifyPinSubmit = (e) => {
    if (e) e.preventDefault();
    if (verifyUserPin(pendingPinUserId, pinInput)) {
      setAuthSession(pendingPinUserId);
      doSwitchUser(pendingPinUserId);
      setPinPromptOpen(false);
      setPendingPinUserId(null);
    } else {
      setPinError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleCreateUser = (userData) => {
    const { newUser, updatedUsers } = createNewUser(userData);
    setUsersList(updatedUsers);
    setAuthSession(newUser.id);
    doSwitchUser(newUser.id);
  };

  const handleDeleteUser = async (userIdToDelete) => {
    try {
      const { activeId, updatedUsers } = await deleteUser(userIdToDelete);
      setUsersList(updatedUsers);
      setAuthSession(activeId);
      await doSwitchUser(activeId);
    } catch (e) {
      alert(e.message || 'ไม่สามารถลบผู้ใช้งานได้');
    }
  };

  const handleFinishWorkoutSession = (newLog) => {
    const updated = saveWorkoutLog(newLog, activeUserId);
    setWorkoutLogs(updated);
    setActiveTab('analytics'); // Switch to analytics to show victory log!
  };

  const handleStartWorkoutPlan = (template) => {
    setTemplateToOpen(template);
    setActiveTab('gym');
  };

  const handleSaveProfile = (updatedProfile) => {
    const saved = saveUserProfile(updatedProfile, activeUserId);
    setUserProfile(saved);
    setUsersList(getUsersList());
  };

  const handleOpenProfileModal = (tab = 'PROFILE') => {
    setBodySubTab(tab);
    setActiveTab('body');
  };

  // If not authenticated, display full Login Screen
  if (!isAuthenticated) {
    return (
      <LoginScreen
        usersList={usersList}
        onLoginSuccess={handleLoginSuccess}
        onCreateUser={handleCreateUser}
        onRefreshUsers={() => setUsersList(getUsersList())}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeWorkout={activeWorkout}
        onOpenAIChat={() => setAiModalOpen(true)}
        onOpenProfile={handleOpenProfileModal}
        onOpenAdmin={() => setAdminModalOpen(true)}
        userProfile={userProfile}
        usersList={usersList}
        activeUserId={activeUserId}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        streakDays={userProfile.streakDays || 4}
      />

      {/* Main Content Body (Scoped by activeUserId via React key) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6 pb-28 md:pb-8">
        {(activeTab === 'gym' || activeTab === 'home') && (
          <GymLogger
            key={`gym-${activeUserId}`}
            onFinishSession={handleFinishWorkoutSession}
            activeWorkout={activeWorkout}
            setActiveWorkout={setActiveWorkout}
            previousLogs={workoutLogs}
            templateToOpen={templateToOpen}
            onClearTemplateToOpen={() => setTemplateToOpen(null)}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'plans' && (
          <PlanBuilder
            key={`plans-${activeUserId}`}
            onStartWorkoutPlan={handleStartWorkoutPlan}
          />
        )}

        {(activeTab === 'body' || activeTab === 'heatmap') && (
          <BodyAndMuscles
            key={`body-${activeUserId}`}
            workoutLogs={workoutLogs}
            userProfile={userProfile}
            onSaveProfile={handleSaveProfile}
            usersList={usersList}
            activeUserId={activeUserId}
            onSwitchUser={handleSwitchUser}
            onCreateUser={handleCreateUser}
            onDeleteUser={handleDeleteUser}
            initialSubTab={bodySubTab}
          />
        )}

        {activeTab === 'library' && (
          <ExerciseLibrary />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            key={`analytics-${activeUserId}`}
            workoutLogs={workoutLogs}
          />
        )}
      </main>

      {/* Multi-User & Personal Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        usersList={usersList}
        activeUserId={activeUserId}
        onSwitchUser={handleSwitchUser}
        onCreateUser={handleCreateUser}
        onDeleteUser={handleDeleteUser}
        initialTab={profileInitialTab}
      />

      {/* Admin Member Management Modal */}
      <AdminMemberModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        usersList={usersList}
        activeUserId={activeUserId}
        onSwitchUser={handleSwitchUser}
        onDeleteUser={handleDeleteUser}
        onCreateUser={handleCreateUser}
      />

      {/* AI Personal Trainer Coach Flex Modal */}
      <AITrainerModal
        key={`ai-${activeUserId}`}
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onStartGeneratedWorkout={(plan) => {
          handleStartWorkoutPlan(plan);
        }}
      />

      {/* PIN Security Verification Modal for Account Switching */}
      {pinPromptOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#131722] border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center mx-auto text-2xl shadow-lg">
              🔒
            </div>
            <div>
              <h3 className="text-base font-black text-white">ยืนยันรหัส PIN ผู้ใช้งาน</h3>
              <p className="text-xs text-slate-400 mt-1">
                บัญชีของ <strong className="text-cyan-300">{getUserProfile(pendingPinUserId)?.name}</strong> เปิดการปกป้องด้วยรหัสผ่าน PIN ไว้
              </p>
            </div>

            <form onSubmit={handleVerifyPinSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="ป้อน PIN 4 หลัก..."
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ''));
                  setPinError('');
                }}
                className="w-full bg-slate-900 border border-slate-700 text-center font-mono font-black text-purple-300 tracking-widest text-2xl rounded-2xl py-3 outline-none focus:border-purple-400"
              />

              {pinError && (
                <div className="text-xs text-red-400 font-bold bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                  {pinError}
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinPromptOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={pinInput.length !== 4}
                  className="flex-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs shadow-lg shadow-purple-500/20 disabled:opacity-40"
                >
                  ปลดล็อก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 bg-[#090b0e]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">FitTrainer AI</span>
            <span>—</span>
            <span>Multi-User Workout Planner & Personal Trainer</span>
          </div>
          <div className="text-slate-400">
            ผู้ใช้ปัจจุบัน: <span className="font-bold text-cyan-400">{userProfile?.name}</span> ({usersList.length} บัญชีในเครื่องนี้)
          </div>
        </div>
      </footer>
    </div>
  );
}
