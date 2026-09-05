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
import BodyAndMuscles from './components/BodyAndMuscles';
import {
  getUsersList,
  getActiveUserId,
  setActiveUserId,
  createNewUser,
  deleteUser,
  getWorkoutLogs,
  saveWorkoutLog,
  getUserProfile,
  saveUserProfile
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('gym'); // 'gym' | 'home' | 'plans' | 'heatmap' | 'library' | 'analytics'
  
  // Multi-user state
  const [activeUserId, setActiveUserIdState] = useState(() => getActiveUserId());
  const [usersList, setUsersList] = useState(() => getUsersList());
  const [userProfile, setUserProfile] = useState(() => getUserProfile(getActiveUserId()));
  const [workoutLogs, setWorkoutLogs] = useState(() => getWorkoutLogs(getActiveUserId()));

  const [activeWorkout, setActiveWorkout] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState('PROFILE');

  const [templateToOpen, setTemplateToOpen] = useState(null);
  const [bodySubTab, setBodySubTab] = useState('PROFILE');

  // Sync user data whenever activeUserId changes
  const handleSwitchUser = (newUserId) => {
    setActiveUserId(newUserId);
    setActiveUserIdState(newUserId);
    setUserProfile(getUserProfile(newUserId));
    setWorkoutLogs(getWorkoutLogs(newUserId));
    setActiveWorkout(null); // Clear active session of previous user
  };

  const handleCreateUser = (userData) => {
    const { newUser, updatedUsers } = createNewUser(userData);
    setUsersList(updatedUsers);
    handleSwitchUser(newUser.id);
  };

  const handleDeleteUser = (userIdToDelete) => {
    try {
      const { activeId, updatedUsers } = deleteUser(userIdToDelete);
      setUsersList(updatedUsers);
      handleSwitchUser(activeId);
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

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeWorkout={activeWorkout}
        onOpenAIChat={() => setAiModalOpen(true)}
        onOpenProfile={handleOpenProfileModal}
        userProfile={userProfile}
        usersList={usersList}
        activeUserId={activeUserId}
        onSwitchUser={handleSwitchUser}
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

      {/* AI Personal Trainer Coach Flex Modal */}
      <AITrainerModal
        key={`ai-${activeUserId}`}
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onStartGeneratedWorkout={(plan) => {
          handleStartWorkoutPlan(plan);
        }}
      />

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
