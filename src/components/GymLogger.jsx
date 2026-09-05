import React, { useState, useEffect, useRef } from 'react';
import {
  Dumbbell,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Clock,
  Calculator,
  ShieldAlert,
  ChevronRight,
  Award,
  Flame,
  Save,
  Play,
  Pause,
  SkipForward,
  Sparkles,
  ArrowLeft,
  Settings,
  Sliders,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Volume2,
  VolumeX,
  Check,
  Zap,
  Trophy,
  FastForward,
  Copy
} from 'lucide-react';
import { EXERCISE_DATABASE, EXERCISE_IMAGE_MAP } from '../data/exerciseDatabase';
import { WORKOUT_TEMPLATES } from '../data/workoutTemplates';
import { calculate1RM, estimateCaloriesBurned } from '../utils/fitnessCalculators';
import { soundManager } from '../utils/timerSound';
import { getCustomPlans, saveCustomPlan } from '../utils/storage';
import PlateCalculatorModal from './PlateCalculatorModal';
import RestTimerOverlay from './RestTimerOverlay';

// Helper to determine if an exercise is a Cardio Interval exercise
export const isCardioExercise = (ex) => {
  if (!ex) return false;
  const id = (ex.exerciseId || ex.id || '').toLowerCase();
  const cat = (ex.category || '').toUpperCase();
  return (
    cat === 'CARDIO' ||
    ex.isCardio === true ||
    id.includes('cardio') ||
    id.includes('battle-rope') ||
    id.includes('cable-rowing') ||
    id === 'battle-rope' ||
    id === 'cable-rowing-machine'
  );
};

export default function GymLogger({
  onFinishSession,
  activeWorkout,
  setActiveWorkout,
  previousLogs = [],
  templateToOpen = null,
  onClearTemplateToOpen,
  userProfile,
}) {
  const [customPlans, setCustomPlans] = useState(() => getCustomPlans());
  const [selectedTemplate, setSelectedTemplate] = useState(WORKOUT_TEMPLATES[0]);
  const [setupSession, setSetupSession] = useState(null);
  const [workoutSession, setWorkoutSession] = useState(() => activeWorkout || null);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (activeWorkout?.startTime) {
      const diff = Math.floor((Date.now() - new Date(activeWorkout.startTime).getTime()) / 1000);
      return Math.max(activeWorkout.elapsedSeconds || 0, isNaN(diff) ? 0 : diff);
    }
    return activeWorkout?.elapsedSeconds || 0;
  });
  const [timerRunning, setTimerRunning] = useState(() => !!activeWorkout);

  // Sync custom plans when component mounts or updates
  useEffect(() => {
    setCustomPlans(getCustomPlans());
  }, [templateToOpen, workoutSession, setupSession, activeWorkout]);

  // If a template was triggered from PlanBuilder or AI Coach, automatically open its setup
  useEffect(() => {
    if (templateToOpen) {
      handleOpenSetup(templateToOpen);
      if (onClearTemplateToOpen) {
        onClearTemplateToOpen();
      }
    }
  }, [templateToOpen]);

  // Live Player Guided Mode States
  const [playerMode, setPlayerMode] = useState(() => activeWorkout?.playerMode || 'PLAYER'); // 'PLAYER' | 'TABLE'
  const [currentExIndex, setCurrentExIndex] = useState(() => activeWorkout?.currentExIndex || 0);
  const [currentSetIndex, setCurrentSetIndex] = useState(() => activeWorkout?.currentSetIndex || 0);
  const [playerPhase, setPlayerPhase] = useState(() => activeWorkout?.playerPhase || 'WORK'); // 'WORK' | 'REST' | 'READY' | 'FINISHED'
  const [workSeconds, setWorkSeconds] = useState(() => activeWorkout?.workSeconds || 0); // Counts UP during work
  const [restSecondsLeft, setRestSecondsLeft] = useState(() => activeWorkout?.restSecondsLeft ?? 30); // Counts DOWN during rest (starts at 30s)
  const [cardioSecondsLeft, setCardioSecondsLeft] = useState(() => activeWorkout?.cardioSecondsLeft ?? 30); // Counts DOWN during cardio work & rest
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [gymNotification, setGymNotification] = useState('');

  const showGymNotification = (msg) => {
    setGymNotification(msg);
    setTimeout(() => setGymNotification(''), 3500);
  };

  // Ref tracking latest state for tab navigation without losing progress
  const latestStateRef = useRef({
    workoutSession,
    elapsedSeconds,
    currentExIndex,
    currentSetIndex,
    playerPhase,
    playerMode,
    workSeconds,
    restSecondsLeft,
    cardioSecondsLeft,
  });

  useEffect(() => {
    latestStateRef.current = {
      workoutSession,
      elapsedSeconds,
      currentExIndex,
      currentSetIndex,
      playerPhase,
      playerMode,
      workSeconds,
      restSecondsLeft,
      cardioSecondsLeft,
    };
  });

  // When activeWorkout changes externally or user returns from another tab, restore session
  useEffect(() => {
    if (activeWorkout) {
      if (!workoutSession || workoutSession.id !== activeWorkout.id) {
        setWorkoutSession(activeWorkout);
        setTimerRunning(true);
        if (activeWorkout.startTime) {
          const diff = Math.floor((Date.now() - new Date(activeWorkout.startTime).getTime()) / 1000);
          setElapsedSeconds(Math.max(activeWorkout.elapsedSeconds || 0, isNaN(diff) ? 0 : diff));
        } else if (activeWorkout.elapsedSeconds !== undefined) {
          setElapsedSeconds(activeWorkout.elapsedSeconds);
        }
        if (activeWorkout.currentExIndex !== undefined) setCurrentExIndex(activeWorkout.currentExIndex);
        if (activeWorkout.currentSetIndex !== undefined) setCurrentSetIndex(activeWorkout.currentSetIndex);
        if (activeWorkout.playerPhase) setPlayerPhase(activeWorkout.playerPhase);
        if (activeWorkout.playerMode) setPlayerMode(activeWorkout.playerMode);
        if (activeWorkout.workSeconds !== undefined) setWorkSeconds(activeWorkout.workSeconds);
        if (activeWorkout.restSecondsLeft !== undefined) setRestSecondsLeft(activeWorkout.restSecondsLeft);
        if (activeWorkout.cardioSecondsLeft !== undefined) setCardioSecondsLeft(activeWorkout.cardioSecondsLeft);
      }
    }
  }, [activeWorkout]);

  // Keep parent activeWorkout in sync with current indices and progress
  useEffect(() => {
    if (workoutSession && setActiveWorkout) {
      setActiveWorkout((prev) => ({
        ...(prev || {}),
        ...workoutSession,
        elapsedSeconds,
        currentExIndex,
        currentSetIndex,
        playerPhase,
        playerMode,
        workSeconds,
        restSecondsLeft,
        cardioSecondsLeft,
      }));
    }
  }, [workoutSession, currentExIndex, currentSetIndex, playerPhase, playerMode]);

  // Save session state to activeWorkout when component unmounts (switching tabs)
  useEffect(() => {
    return () => {
      const cur = latestStateRef.current;
      if (cur.workoutSession && setActiveWorkout) {
        setActiveWorkout({
          ...cur.workoutSession,
          elapsedSeconds: cur.elapsedSeconds,
          currentExIndex: cur.currentExIndex,
          currentSetIndex: cur.currentSetIndex,
          playerPhase: cur.playerPhase,
          playerMode: cur.playerMode,
          workSeconds: cur.workSeconds,
          restSecondsLeft: cur.restSecondsLeft,
          cardioSecondsLeft: cur.cardioSecondsLeft,
        });
      }
    };
  }, []);

  // Plate Calc Modal
  const [plateCalcOpen, setPlateCalcOpen] = useState(false);
  const [plateCalcWeight, setPlateCalcWeight] = useState(60);

  // Rest Timer State (for table view fallback)
  const [restTimerOpen, setRestTimerOpen] = useState(false);
  const [nextSetInfo, setNextSetInfo] = useState('');

  // Exercise Picker Modal
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState(false);

  // Active workout timer tick (counts overall time, gym work time UP, gym rest DOWN, and cardio intervals AUTO-CONTINUOUS)
  useEffect(() => {
    let interval;
    if (timerRunning && !isPaused && workoutSession && playerPhase !== 'FINISHED') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        const currentEx = workoutSession.exercises[currentExIndex];
        const isCurrentCardio = isCardioExercise(currentEx);

        if (isCurrentCardio) {
          // CARDIO AUTO-CONTINUOUS INTERVALS ("เล่นยาวจนครบตามที่ตั้ง")
          setCardioSecondsLeft((prev) => {
            if (prev <= 1) {
              if (soundEnabled) soundManager.playCompletionChime();

              if (playerPhase === 'WORK') {
                // Current round work finished
                const updated = { ...workoutSession };
                if (updated.exercises[currentExIndex]?.sets[currentSetIndex]) {
                  updated.exercises[currentExIndex].sets[currentSetIndex].completed = true;
                  setWorkoutSession(updated);
                  setActiveWorkout(updated);
                }

                const totalRounds = currentEx.cardioRounds || currentEx.sets?.length || 8;
                if (currentSetIndex + 1 < totalRounds) {
                  // Switch to REST of current round
                  if ((currentEx.cardioRestSec || 15) > 0) {
                    setPlayerPhase('REST');
                    return currentEx.cardioRestSec || 15;
                  } else {
                    // No rest: start next round work immediately
                    setCurrentSetIndex((s) => s + 1);
                    return currentEx.cardioWorkSec || 30;
                  }
                } else {
                  // ALL ROUNDS OF THIS CARDIO EXERCISE FINISHED!
                  const nextExIdx = currentExIndex + 1;
                  if (nextExIdx < workoutSession.exercises.length) {
                    setCurrentExIndex(nextExIdx);
                    setCurrentSetIndex(0);
                    const nextEx = workoutSession.exercises[nextExIdx];
                    if (isCardioExercise(nextEx)) {
                      setPlayerPhase('WORK');
                      return nextEx.cardioWorkSec || 30;
                    } else {
                      setPlayerPhase('WORK');
                      setWorkSeconds(0);
                      return 0;
                    }
                  } else {
                    setPlayerPhase('FINISHED');
                    return 0;
                  }
                }
              } else if (playerPhase === 'REST') {
                // Rest interval finished -> automatically advance to next round WORK!
                setCurrentSetIndex((s) => s + 1);
                setPlayerPhase('WORK');
                return currentEx.cardioWorkSec || 30;
              }
            }

            if (prev <= 4 && prev > 1 && soundEnabled) {
              soundManager.playBeep(880, 0.1);
            }
            return prev - 1;
          });
        } else {
          // STANDARD GYM EXERCISE
          if (playerPhase === 'WORK') {
            setWorkSeconds((prev) => prev + 1);
          }

          if (playerPhase === 'REST') {
            setRestSecondsLeft((prev) => {
              if (prev <= 1) {
                if (soundEnabled) soundManager.playCompletionChime();
                setPlayerPhase('READY'); // countdown จบ ให้กดเริ่มเซ็ตใหม่เอง
                return 0;
              }
              if (prev <= 4 && prev > 1 && soundEnabled) {
                soundManager.playBeep(880, 0.1);
              }
              return prev - 1;
            });
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, isPaused, workoutSession, playerPhase, soundEnabled, currentExIndex, currentSetIndex]);

  // Find previous performance for an exercise
  const getPreviousPerformance = (exId) => {
    for (const log of previousLogs) {
      const match = log.exercises.find((e) => e.exerciseId === exId);
      if (match && match.sets && match.sets.length > 0) {
        const completedSets = match.sets.filter((s) => s.completed);
        if (completedSets.length > 0) {
          const maxWeightSet = completedSets.reduce((max, s) => (s.weight > max.weight ? s : max), completedSets[0]);
          return `ครั้งก่อน: ${maxWeightSet.weight}kg × ${maxWeightSet.reps}`;
        }
      }
    }
    return null;
  };

  // Open setup screen for a routine
  const handleOpenSetup = (template) => {
    if (!template) return;
    const setup = {
      id: template.id,
      routineName: template.nameTh || template.name,
      description: template.description || '',
      category: template.category || 'GYM',
      estimatedMinutes: template.estimatedMinutes || 50,
      targetMuscles: template.targetMuscles || [],
      splitTag: template.splitTag || '',
      exercises: (template.exercises || []).map((templateEx, idx) => {
        const fullInfo = EXERCISE_DATABASE.find(
          (e) => e.id === templateEx.exerciseId || e.id === templateEx.exerciseId?.replace('-cardio', '')
        ) || {};
        const isCardio = isCardioExercise({ category: fullInfo.category, exerciseId: templateEx.exerciseId });
        const cardioWorkSec = Number(templateEx.cardioWorkSec) || 30;
        const cardioRestSec = Number(templateEx.cardioRestSec) || 15;
        const cardioRounds = Number(templateEx.cardioRounds) || (isCardio ? 8 : (Number(templateEx.targetSets) || 3));
        const parsedReps = typeof templateEx.targetReps === 'number'
          ? templateEx.targetReps
          : parseInt(templateEx.targetReps, 10) || 10;
        const totalSets = isCardio ? cardioRounds : (Number(templateEx.targetSets) || 3);
        const defaultWeight = Number(templateEx.defaultWeight) || 20;

        return {
          id: `setup-ex-${idx}-${Date.now()}`,
          exerciseId: templateEx.exerciseId,
          name: fullInfo.nameTh || fullInfo.name || templateEx.exerciseId,
          englishName: fullInfo.name || templateEx.exerciseId,
          category: fullInfo.category || (isCardio ? 'CARDIO' : 'CHEST'),
          equipment: fullInfo.equipment || (isCardio ? 'ROPE' : 'BARBELL'),
          muscle: fullInfo.muscle || '',
          isCardio: isCardio,
          cardioWorkSec: cardioWorkSec,
          cardioRestSec: cardioRestSec,
          cardioRounds: cardioRounds,
          targetRest: 30,
          sets: isCardio
            ? Array.from({ length: cardioRounds }).map((_, sIdx) => ({
                id: `setup-set-${idx}-${sIdx + 1}`,
                setNum: sIdx + 1,
                weight: 0,
                reps: cardioWorkSec,
                type: 'Normal',
              }))
            : Array.from({ length: totalSets }).map((_, sIdx) => ({
                id: `setup-set-${idx}-${sIdx + 1}`,
                setNum: sIdx + 1,
                weight: defaultWeight,
                reps: parsedReps,
                type: sIdx === 0 && totalSets > 3 ? 'Warmup' : 'Normal',
              })),
        };
      }),
    };
    setSetupSession(setup);
  };

  // 1-Click Copy any routine to custom plans
  const handleCopyRoutine = (template, e) => {
    if (e) e.stopPropagation();
    const cloned = JSON.parse(JSON.stringify(template));
    cloned.id = `custom-plan-${Date.now()}`;
    const baseName = template.nameTh || template.name;
    cloned.name = `${baseName} (คัดลอก)`;
    cloned.nameTh = `${baseName} (คัดลอก)`;
    cloned.isCustom = true;

    const updated = saveCustomPlan(cloned);
    setCustomPlans(updated);
    showGymNotification(`📋 คัดลอกตาราง "${cloned.nameTh}" สำเร็จแล้ว!`);
  };

  // Save current Setup Session configuration as a custom plan
  const handleSaveSetupAsCustomPlan = () => {
    if (!setupSession) return;
    const planId = setupSession.id?.startsWith('custom-') ? setupSession.id : `custom-plan-${Date.now()}`;
    const planToSave = {
      id: planId,
      name: setupSession.routineName,
      nameTh: setupSession.routineName,
      category: setupSession.category || 'GYM',
      description: setupSession.description || 'ตารางฝึกที่ปรับแต่งแล้ว',
      estimatedMinutes: setupSession.estimatedMinutes || 45,
      targetMuscles: setupSession.targetMuscles || [],
      splitTag: setupSession.splitTag || '',
      exercises: setupSession.exercises.map((ex) => ({
        exerciseId: ex.exerciseId || ex.id,
        targetSets: ex.sets?.length || 3,
        targetReps: typeof ex.sets?.[0]?.reps === 'number' ? `${ex.sets[0].reps}` : (ex.sets?.[0]?.reps || '10-12'),
        restSeconds: ex.targetRest || 30,
        defaultWeight: ex.sets?.[0]?.weight || 20,
        cardioWorkSec: ex.cardioWorkSec,
        cardioRestSec: ex.cardioRestSec,
        cardioRounds: ex.cardioRounds,
        sets: ex.sets?.map((s) => ({ weight: s.weight, reps: s.reps, type: s.type })),
      })),
      isCustom: true,
    };
    const updated = saveCustomPlan(planToSave);
    setCustomPlans(updated);
    showGymNotification(`💾 บันทึกตาราง "${planToSave.name}" ลงในตารางของคุณเรียบร้อยแล้ว!`);
  };

  // Update a single field in a specific set
  const handleSetupUpdateSetField = (exIdx, setIdx, field, value) => {
    if (!setupSession) return;
    const updated = { ...setupSession };
    updated.exercises[exIdx].sets[setIdx][field] = value;
    setSetupSession(updated);
  };

  // Adjust weight or reps for a specific set with +/- button
  const handleSetupAdjustSetValue = (exIdx, setIdx, field, delta) => {
    if (!setupSession) return;
    const updated = { ...setupSession };
    const current = Number(updated.exercises[exIdx].sets[setIdx][field]) || 0;
    const newVal = field === 'reps' ? Math.max(1, current + delta) : Math.max(0, current + delta);
    updated.exercises[exIdx].sets[setIdx][field] = newVal;
    setSetupSession(updated);
  };

  // Update Cardio settings in Setup (Work time, Rest time, Rounds)
  const handleSetupUpdateCardio = (exIdx, field, deltaOrValue, isAbsolute = false) => {
    if (!setupSession) return;
    const updated = { ...setupSession };
    const ex = updated.exercises[exIdx];
    let newVal = isAbsolute ? deltaOrValue : (ex[field] || 0) + deltaOrValue;
    if (field === 'cardioWorkSec') newVal = Math.max(5, Math.min(300, newVal));
    if (field === 'cardioRestSec') newVal = Math.max(0, Math.min(300, newVal));
    if (field === 'cardioRounds') newVal = Math.max(1, Math.min(50, newVal));

    ex[field] = newVal;
    if (field === 'cardioRounds') {
      ex.sets = Array.from({ length: newVal }).map((_, idx) => ({
        id: `setup-cardio-set-${idx + 1}`,
        setNum: idx + 1,
        weight: 0,
        reps: ex.cardioWorkSec || 30,
        type: 'Normal',
      }));
    }
    setSetupSession(updated);
  };

  // Add set to an exercise in setup
  const handleSetupAddSet = (exIdx) => {
    if (!setupSession) return;
    const updated = { ...setupSession };
    const sets = updated.exercises[exIdx].sets;
    const lastSet = sets[sets.length - 1] || { weight: 20, reps: 10, type: 'Normal' };
    sets.push({
      id: `setup-set-${Date.now()}-${sets.length + 1}`,
      setNum: sets.length + 1,
      weight: lastSet.weight,
      reps: lastSet.reps,
      type: 'Normal',
    });
    setSetupSession(updated);
  };

  // Remove a specific set in setup
  const handleSetupRemoveSet = (exIdx, setIdx) => {
    if (!setupSession) return;
    const updated = { ...setupSession };
    if (updated.exercises[exIdx].sets.length <= 1) {
      alert('แต่ละท่าต้องมีอย่างน้อย 1 เซ็ต');
      return;
    }
    updated.exercises[exIdx].sets.splice(setIdx, 1);
    updated.exercises[exIdx].sets.forEach((s, idx) => (s.setNum = idx + 1));
    setSetupSession(updated);
  };

  const handleSetupUpdateRest = (exIdx, seconds) => {
    if (!setupSession) return;
    const updated = { ...setupSession };
    updated.exercises[exIdx].targetRest = seconds;
    setSetupSession(updated);
  };

  const handleSetupRemoveExercise = (exIdx) => {
    if (!setupSession) return;
    const updated = { ...setupSession };
    updated.exercises.splice(exIdx, 1);
    setSetupSession(updated);
  };

  const handleSetupMoveExercise = (exIdx, direction) => {
    if (!setupSession) return;
    const targetIdx = exIdx + direction;
    if (targetIdx < 0 || targetIdx >= setupSession.exercises.length) return;
    const updated = { ...setupSession };
    const item = updated.exercises.splice(exIdx, 1)[0];
    updated.exercises.splice(targetIdx, 0, item);
    setSetupSession(updated);
  };

  const handleStartFromSetup = () => {
    if (!setupSession || setupSession.exercises.length === 0) {
      alert('กรุณามีท่าฝึกอย่างน้อย 1 ท่า');
      return;
    }
    const session = {
      id: `gym-session-${Date.now()}`,
      routineName: setupSession.routineName,
      mode: 'GYM',
      startTime: new Date().toISOString(),
      exercises: setupSession.exercises.map((ex) => {
        const isCardio = ex.isCardio || isCardioExercise(ex);
        const cardioWorkSec = Number(ex.cardioWorkSec) || 30;
        const cardioRestSec = Number(ex.cardioRestSec) || 15;
        const cardioRounds = Number(ex.cardioRounds) || (ex.sets?.length || 8);
        return {
          exerciseId: ex.exerciseId,
          name: ex.name,
          category: ex.category,
          equipment: ex.equipment,
          isCardio: isCardio,
          cardioWorkSec: cardioWorkSec,
          cardioRestSec: cardioRestSec,
          cardioRounds: cardioRounds,
          targetRest: ex.targetRest || 30,
          sets: isCardio
            ? Array.from({ length: cardioRounds }).map((_, idx) => ({
                id: `set-${idx + 1}`,
                setNum: idx + 1,
                weight: 0,
                reps: cardioWorkSec,
                rpe: 8,
                type: 'Normal',
                completed: false,
              }))
            : ex.sets.map((s, idx) => ({
                id: `set-${idx + 1}`,
                setNum: idx + 1,
                weight: parseFloat(s.weight) || 0,
                reps: parseInt(s.reps, 10) || 10,
                rpe: 8,
                type: s.type || 'Normal',
                completed: false,
              })),
        };
      }),
    };
    setWorkoutSession(session);
    setActiveWorkout(session);
    setElapsedSeconds(0);
    setTimerRunning(true);
    setSetupSession(null);

    // Initialize Guided Live Player
    setPlayerMode('PLAYER');
    setCurrentExIndex(0);
    setCurrentSetIndex(0);
    setPlayerPhase('WORK');

    const firstEx = session.exercises[0];
    if (isCardioExercise(firstEx)) {
      setCardioSecondsLeft(firstEx.cardioWorkSec || 30);
    } else {
      setWorkSeconds(0);
    }
    setRestSecondsLeft(session.exercises[0]?.targetRest || 30);
    setIsPaused(false);
  };

  // Helper to get next set indices
  const getNextSetIndices = () => {
    if (!workoutSession) return null;
    const currentEx = workoutSession.exercises[currentExIndex];
    if (!currentEx) return null;

    if (currentSetIndex + 1 < currentEx.sets.length) {
      return { exIdx: currentExIndex, setIdx: currentSetIndex + 1, isNewEx: false };
    }
    if (currentExIndex + 1 < workoutSession.exercises.length) {
      return { exIdx: currentExIndex + 1, setIdx: 0, isNewEx: true };
    }
    return null;
  };

  // 1. Finish Set -> Count DOWN during rest (Standard Gym)
  const handlePlayerFinishSet = () => {
    if (!workoutSession) return;
    const updated = { ...workoutSession };
    updated.exercises[currentExIndex].sets[currentSetIndex].completed = true;
    setWorkoutSession(updated);
    setActiveWorkout(updated);

    const next = getNextSetIndices();
    if (next) {
      const restSec = updated.exercises[currentExIndex].targetRest || 30;
      setRestSecondsLeft(restSec);
      setPlayerPhase('REST');
    } else {
      setPlayerPhase('FINISHED');
      if (soundEnabled) soundManager.playCompletionChime();
    }
  };

  // 2. Skip Set -> "ถ้ากดข้ามเซ็ต ไม่ต้อง countdown" -> immediate next set in WORK mode!
  const handlePlayerSkipSet = () => {
    if (!workoutSession) return;
    const next = getNextSetIndices();
    if (next) {
      setCurrentExIndex(next.exIdx);
      setCurrentSetIndex(next.setIdx);
      const nextEx = workoutSession.exercises[next.exIdx];
      if (isCardioExercise(nextEx)) {
        setCardioSecondsLeft(nextEx.cardioWorkSec || 30);
      } else {
        setWorkSeconds(0);
      }
      setPlayerPhase('WORK');
    } else {
      setPlayerPhase('FINISHED');
      if (soundEnabled) soundManager.playCompletionChime();
    }
  };

  // 3. Start Next Set -> "countdown จบให้กดเริ่มเซ็ตใหม่เอง" or when clicking ready
  const handlePlayerStartNextSet = () => {
    const next = getNextSetIndices();
    if (next) {
      setCurrentExIndex(next.exIdx);
      setCurrentSetIndex(next.setIdx);
      const nextEx = workoutSession.exercises[next.exIdx];
      if (isCardioExercise(nextEx)) {
        setCardioSecondsLeft(nextEx.cardioWorkSec || 30);
      } else {
        setWorkSeconds(0);
      }
      setPlayerPhase('WORK');
    } else {
      setPlayerPhase('FINISHED');
      if (soundEnabled) soundManager.playCompletionChime();
    }
  };

  // Cardio Live Player Handlers:
  // Skip current interval (work -> rest or rest -> next round work)
  const handleCardioSkipInterval = () => {
    if (!workoutSession) return;
    const currentEx = workoutSession.exercises[currentExIndex];
    if (playerPhase === 'WORK') {
      const updated = { ...workoutSession };
      if (updated.exercises[currentExIndex]?.sets[currentSetIndex]) {
        updated.exercises[currentExIndex].sets[currentSetIndex].completed = true;
        setWorkoutSession(updated);
        setActiveWorkout(updated);
      }
      const totalRounds = currentEx.cardioRounds || currentEx.sets?.length || 8;
      if (currentSetIndex + 1 < totalRounds) {
        if ((currentEx.cardioRestSec || 15) > 0) {
          setPlayerPhase('REST');
          setCardioSecondsLeft(currentEx.cardioRestSec || 15);
        } else {
          setCurrentSetIndex((s) => s + 1);
          setCardioSecondsLeft(currentEx.cardioWorkSec || 30);
        }
      } else {
        handleCardioSkipExercise();
      }
    } else {
      // In REST, advance immediately to next round WORK
      setCurrentSetIndex((s) => s + 1);
      setPlayerPhase('WORK');
      setCardioSecondsLeft(currentEx.cardioWorkSec || 30);
    }
  };

  // Skip the entire cardio exercise to next exercise
  const handleCardioSkipExercise = () => {
    if (!workoutSession) return;
    const nextExIdx = currentExIndex + 1;
    if (nextExIdx < workoutSession.exercises.length) {
      setCurrentExIndex(nextExIdx);
      setCurrentSetIndex(0);
      const nextEx = workoutSession.exercises[nextExIdx];
      if (isCardioExercise(nextEx)) {
        setPlayerPhase('WORK');
        setCardioSecondsLeft(nextEx.cardioWorkSec || 30);
      } else {
        setPlayerPhase('WORK');
        setWorkSeconds(0);
      }
    } else {
      setPlayerPhase('FINISHED');
      if (soundEnabled) soundManager.playCompletionChime();
    }
  };

  // Adjust current set's weight or reps from player view
  const handlePlayerUpdateCurrentSet = (field, delta) => {
    if (!workoutSession) return;
    const updated = { ...workoutSession };
    const current = Number(updated.exercises[currentExIndex].sets[currentSetIndex][field]) || 0;
    const newVal = field === 'reps' ? Math.max(1, current + delta) : Math.max(0, current + delta);
    updated.exercises[currentExIndex].sets[currentSetIndex][field] = newVal;
    setWorkoutSession(updated);
    setActiveWorkout(updated);
  };

  // Save Workout from Player Finished Screen
  const handlePlayerSaveWorkout = () => {
    handleFinishWorkout();
  };

  // Discard Workout from Player Finished Screen
  const handlePlayerDiscardWorkout = () => {
    if (window.confirm('ต้องการทิ้งข้อมูลเซสชันนี้ใช่หรือไม่? ข้อมูลการฝึกจะไม่ถูกบันทึก')) {
      setTimerRunning(false);
      setWorkoutSession(null);
      setActiveWorkout(null);
      setElapsedSeconds(0);
      setPlayerPhase('WORK');
    }
  };

  // Start new workout session (direct fallback)
  const handleStartWorkout = (template) => {
    handleOpenSetup(template);
  };

  // Toggle set completed & trigger rest timer
  const handleToggleSetComplete = (exIdx, setIdx) => {
    if (!workoutSession) return;
    const updated = { ...workoutSession };
    const set = updated.exercises[exIdx].sets[setIdx];
    const isNowCompleted = !set.completed;
    set.completed = isNowCompleted;

    setWorkoutSession(updated);

    if (isNowCompleted) {
      const restSecs = updated.exercises[exIdx].targetRest || 30;
      setRestSecondsLeft(restSecs);
      
      // Determine next set info
      const nextSet = updated.exercises[exIdx].sets[setIdx + 1];
      if (nextSet) {
        setNextSetInfo(`${updated.exercises[exIdx].name} - เซ็ต ${setIdx + 2} (${nextSet.weight}kg × ${nextSet.reps})`);
      } else if (updated.exercises[exIdx + 1]) {
        setNextSetInfo(`ท่าถัดไป: ${updated.exercises[exIdx + 1].name}`);
      } else {
        setNextSetInfo('เซ็ตสุดท้ายของโปรแกรม!');
      }

      setRestTimerOpen(true);
    }
  };

  // Modify Set values
  const handleUpdateSet = (exIdx, setIdx, field, value) => {
    const updated = { ...workoutSession };
    updated.exercises[exIdx].sets[setIdx][field] = value;
    setWorkoutSession(updated);
  };

  // Add extra Set to an exercise
  const handleAddSet = (exIdx) => {
    const updated = { ...workoutSession };
    const sets = updated.exercises[exIdx].sets;
    const lastSet = sets[sets.length - 1] || { weight: 20, reps: 10, type: 'Normal' };
    sets.push({
      id: `set-${sets.length + 1}`,
      setNum: sets.length + 1,
      weight: lastSet.weight,
      reps: lastSet.reps,
      rpe: 8,
      type: 'Normal',
      completed: false,
    });
    setWorkoutSession(updated);
  };

  // Remove Set from an exercise
  const handleRemoveSet = (exIdx, setIdx) => {
    const updated = { ...workoutSession };
    updated.exercises[exIdx].sets.splice(setIdx, 1);
    // Renumber
    updated.exercises[exIdx].sets.forEach((s, idx) => (s.setNum = idx + 1));
    setWorkoutSession(updated);
  };

  // Remove single exercise from active workout session
  const handleRemoveExercise = (exIdx) => {
    if (!workoutSession) return;
    const exName = workoutSession.exercises[exIdx]?.name || 'ท่านี้';
    if (window.confirm(`ต้องการลบท่า "${exName}" ออกจากเซสชันนี้ใช่หรือไม่?`)) {
      const updated = { ...workoutSession };
      updated.exercises.splice(exIdx, 1);
      setWorkoutSession(updated);
      setActiveWorkout(updated);
    }
  };

  // Clear all exercises from active workout session
  const handleClearAllExercises = () => {
    if (!workoutSession || workoutSession.exercises.length === 0) return;
    if (window.confirm('คุณต้องการลบท่าทั้งหมดออกจากเซสชันนี้ใช่หรือไม่?')) {
      const updated = { ...workoutSession, exercises: [] };
      setWorkoutSession(updated);
      setActiveWorkout(updated);
    }
  };

  // Cancel workout session entirely
  const handleCancelWorkout = () => {
    if (!workoutSession) return;
    if (window.confirm('ต้องการยกเลิกเซสชันการออกกำลังกายนี้ใช่หรือไม่? ข้อมูลในเซสชันนี้จะไม่ถูกบันทึก')) {
      setTimerRunning(false);
      setWorkoutSession(null);
      setActiveWorkout(null);
      setElapsedSeconds(0);
    }
  };

  // Add new exercise to active workout
  const handleAddExerciseToWorkout = (exerciseId) => {
    const fullInfo = EXERCISE_DATABASE.find((e) => e.id === exerciseId);
    if (!fullInfo) return;

    const updated = { ...workoutSession };
    updated.exercises.push({
      exerciseId: fullInfo.id,
      name: fullInfo.nameTh || fullInfo.name,
      category: fullInfo.category,
      equipment: fullInfo.equipment,
      targetRest: 30,
      sets: [
        { id: 'set-1', setNum: 1, weight: 20, reps: 10, rpe: 8, type: 'Normal', completed: false },
        { id: 'set-2', setNum: 2, weight: 20, reps: 10, rpe: 8, type: 'Normal', completed: false },
        { id: 'set-3', setNum: 3, weight: 20, reps: 10, rpe: 8, type: 'Normal', completed: false },
      ],
    });

    setWorkoutSession(updated);
    setAddExerciseModalOpen(false);
  };

  // Calculate total volume tonnage
  const calculateTotalTonnage = () => {
    if (!workoutSession) return 0;
    let total = 0;
    workoutSession.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          total += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
        }
      });
    });
    return total;
  };

  // Finish and save workout
  const handleFinishWorkout = () => {
    if (!workoutSession) return;
    setTimerRunning(false);

    const minutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const userWeight = Number(userProfile?.weightKg) || 72;
    const calories = estimateCaloriesBurned(minutes, true, userWeight);
    const tonnage = calculateTotalTonnage();

    const finishedLog = {
      ...workoutSession,
      endTime: new Date().toISOString(),
      durationMinutes: minutes,
      caloriesBurned: calories,
      totalTonnageKg: tonnage,
    };

    onFinishSession(finishedLog);
    setWorkoutSession(null);
    setActiveWorkout(null);
  };

  const formatElapsed = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const [filterTag, setFilterTag] = useState('ALL');

  // --- VIEW 1: SELECT ROUTINE TO START ---
  if (!workoutSession && !setupSession) {
    const allCustomPlans = customPlans || [];
    const customGymPlans = allCustomPlans.filter((t) => t.category === 'GYM' || !t.category);
    const customHomePlans = allCustomPlans.filter((t) => t.category === 'HOME');

    const builtInGymTemplates = WORKOUT_TEMPLATES.filter((t) => t.category === 'GYM');
    const builtInHomeTemplates = WORKOUT_TEMPLATES.filter((t) => t.category === 'HOME');

    // Unified List: Custom first, then Gym, then Home
    const allWorkoutTemplates = [...allCustomPlans, ...builtInGymTemplates, ...builtInHomeTemplates];
    const gymTemplates = [...customGymPlans, ...builtInGymTemplates];
    const homeTemplates = [...customHomePlans, ...builtInHomeTemplates];

    const filteredTemplates =
      filterTag === 'CUSTOM'
        ? allCustomPlans
        : filterTag === 'GYM'
        ? gymTemplates
        : filterTag === 'HOME'
        ? homeTemplates
        : filterTag === '6DAY'
        ? allWorkoutTemplates.filter((t) => t.splitTag === '6-Day Upper Split')
        : filterTag === 'PPL'
        ? allWorkoutTemplates.filter((t) => t.id?.startsWith('ppl-'))
        : allWorkoutTemplates;

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Toast Notification */}
        {gymNotification && (
          <div className="fixed top-20 right-4 z-50 bg-slate-900 border border-cyan-400 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce-short">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{gymNotification}</span>
          </div>
        )}

        {/* Active Workout Resume Card (if an active session is in progress) */}
        {activeWorkout && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-2 border-rose-500/60 shadow-2xl shadow-rose-950/60 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in neon-border-rose">
            <div className="flex items-center space-x-3.5">
              <div className="relative flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping absolute" />
                <span className="w-3 h-3 rounded-full bg-rose-500 relative" />
              </div>
              <div>
                <div className="text-[11px] font-black text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>🔴 กำลังบันทึกการออกกำลังกายค้างอยู่</span>
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  {activeWorkout.routineName}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setWorkoutSession(activeWorkout);
                  setTimerRunning(true);
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>▶️ กลับไปที่การออกกำลังกายที่กำลังบันทึก</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('ต้องการยกเลิกและทิ้งเซสชันที่กำลังบันทึกอยู่นี้ใช่หรือไม่? ข้อมูลจะไม่ถูกบันทึก')) {
                    setActiveWorkout(null);
                    setWorkoutSession(null);
                    setTimerRunning(false);
                    setElapsedSeconds(0);
                  }
                }}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all cursor-pointer"
                title="ยกเลิกเซสชันนี้"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Banner */}
        <div className="glass-panel border-cyan-500/30 rounded-3xl p-6 relative overflow-hidden neon-border-cyan">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Dumbbell className="w-4 h-4" />
                <span>Unified Workout Logger</span>
              </div>
              <h2 className="text-2xl font-black text-white">บันทึกการออกกำลังกาย (Workout Log)</h2>
              <p className="text-xs text-slate-400 mt-1">
                รวมโปรแกรมฝึกทั้งสายยิม (Gym) และบอดี้เวทที่บ้าน (Home) ปรับเซ็ต เวลาพัก และบันทึกผลได้ครบจบในที่เดียว
              </p>
            </div>

            <button
              onClick={() => handleOpenSetup(allWorkoutTemplates[0] || WORKOUT_TEMPLATES[0])}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-lime-400 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>⚙️ ตั้งค่า & เตรียมเริ่มฝึก</span>
            </button>
          </div>
        </div>

        {/* Highlight User's Custom Plans if any exist */}
        {allCustomPlans.length > 0 && filterTag === 'ALL' && (
          <div className="glass-panel border-amber-400/30 rounded-3xl p-5 bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-slate-900/60 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-amber-300 flex items-center space-x-2">
                <span>⭐ ตารางที่คุณสร้างเอง (My Custom Routines)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                  {allCustomPlans.length} ตาราง
                </span>
              </h3>
              <span className="text-[11px] text-slate-400 hidden sm:inline">กดเริ่มฝึกได้ทันที</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allCustomPlans.map((tmpl) => (
                <div
                  key={`custom-highlight-${tmpl.id}`}
                  onClick={() => handleOpenSetup(tmpl)}
                  className="bg-slate-950/90 border border-amber-400/40 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between transition-all hover:-translate-y-0.5 cursor-pointer group shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        ⭐ สร้างเอง ({tmpl.category === 'HOME' ? 'บ้าน' : 'ยิม'})
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{tmpl.exercises.length} ท่าฝึก</span>
                    </div>
                    <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors mb-1">
                      {tmpl.nameTh || tmpl.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                      {tmpl.description || 'ตารางฝึกส่วนบุคคลที่คุณสร้าง'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSetup(tmpl);
                      }}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:brightness-110 text-slate-950 font-black text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>เริ่มฝึก</span>
                    </button>
                    <button
                      onClick={(e) => handleCopyRoutine(tmpl, e)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all flex items-center space-x-1"
                      title="คัดลอกตารางนี้"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Header & Category Filter Tabs */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>เลือกโปรแกรมออกกำลังกาย (Workout Plans)</span>
            </h3>

            {/* Filter Chips: All, Gym, Home, Custom, 6-Day, PPL */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setFilterTag('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTag === 'ALL'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                ทั้งหมด ({allWorkoutTemplates.length})
              </button>
              <button
                onClick={() => setFilterTag('GYM')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  filterTag === 'GYM'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-cyan-400 hover:bg-slate-800 border border-cyan-500/30'
                }`}
              >
                <span>🏋️‍♂️ ยิม ({gymTemplates.length})</span>
              </button>
              <button
                onClick={() => setFilterTag('HOME')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  filterTag === 'HOME'
                    ? 'bg-lime-400 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-lime-400 hover:bg-slate-800 border border-lime-400/30'
                }`}
              >
                <span>🏠 ที่บ้าน ({homeTemplates.length})</span>
              </button>
              {allCustomPlans.length > 0 && (
                <button
                  onClick={() => setFilterTag('CUSTOM')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                    filterTag === 'CUSTOM'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900 text-amber-400 hover:bg-slate-800 border border-amber-400/40'
                  }`}
                >
                  <span>⭐ ตารางของฉัน ({allCustomPlans.length})</span>
                </button>
              )}
              <button
                onClick={() => setFilterTag('6DAY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  filterTag === '6DAY'
                    ? 'bg-lime-400 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>🔥 ตาราง 6 วัน</span>
              </button>
              <button
                onClick={() => setFilterTag('PPL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTag === 'PPL'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                ⚡ PPL
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredTemplates.map((tmpl) => {
              const isHome = tmpl.category === 'HOME';
              const isCustom = tmpl.id?.startsWith('custom-') || tmpl.isCustom;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleOpenSetup(tmpl)}
                  className={`glass-panel rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group cursor-pointer ${
                    isCustom
                      ? 'border-amber-400/40 hover:border-amber-400 shadow-amber-400/10 shadow-lg'
                      : isHome
                      ? 'border-emerald-500/30 hover:border-emerald-400/60 shadow-emerald-500/5'
                      : 'border-slate-800 hover:border-cyan-500/40 shadow-cyan-500/5'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-1.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        isCustom
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                          : isHome
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {tmpl.estimatedMinutes} นาที
                      </span>

                      <div className="flex items-center space-x-1">
                        {isCustom ? (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                            ⭐ ตารางสร้างเอง
                          </span>
                        ) : isHome ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            🏠 ที่บ้าน
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            🏋️‍♂️ ยิม
                          </span>
                        )}

                        {tmpl.splitTag && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/30">
                            {tmpl.splitTag}
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-slate-400 font-semibold">{tmpl.exercises.length} ท่าฝึก</span>
                    </div>

                    <h4 className={`text-base font-bold transition-colors mb-1 ${
                      isHome ? 'text-white group-hover:text-emerald-300' : 'text-white group-hover:text-cyan-300'
                    }`}>
                      {tmpl.nameTh || tmpl.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{tmpl.description || 'ตารางฝึกที่กำหนดเอง'}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(tmpl.targetMuscles || []).map((m, idx) => (
                        <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSetup(tmpl);
                      }}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md ${
                        isCustom
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black'
                          : isHome
                          ? 'bg-slate-800 group-hover:bg-emerald-400 group-hover:text-slate-950 text-emerald-300'
                          : 'bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-cyan-300'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>⚙️ ตั้งค่า & ดูท่าฝึก</span>
                    </button>
                    <button
                      onClick={(e) => handleCopyRoutine(tmpl, e)}
                      className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-xs font-bold transition-all flex items-center space-x-1 shrink-0"
                      title="คัดลอกตารางนี้"
                    >
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">คัดลอก</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: WORKOUT SETUP & PREPARATION SCREEN ---
  if (!workoutSession && setupSession) {
    const totalSets = setupSession.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-28 animate-fade-in">
        {/* Setup Navigation & Header */}
        <div className="glass-panel border-cyan-500/30 rounded-3xl p-5 sm:p-6 relative overflow-hidden neon-border-cyan">
          <div className="flex items-center justify-between gap-3 mb-4">
            <button
              onClick={() => setSetupSession(null)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700/80 flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← ย้อนกลับไปเลือกโปรแกรม</span>
            </button>

            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 tracking-wider uppercase">
              ⚙️ WORKOUT SETUP MODE
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Sliders className="w-4 h-4" />
                <span>กำหนดน้ำหนักและจำนวนครั้งแยกแต่ละเซ็ตได้อิสระ</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{setupSession.routineName}</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                {setupSession.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                  ⏱️ ประมาณ {setupSession.estimatedMinutes} นาที
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-300 border border-slate-800">
                  📋 {setupSession.exercises.length} ท่าฝึก ({totalSets} เซ็ตทั้งหมด)
                </span>
                {setupSession.targetMuscles.map((m, idx) => (
                  <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleSaveSetupAsCustomPlan}
                className="px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 font-bold text-xs border border-amber-400/40 shadow-lg flex items-center space-x-1.5 transition-all"
                title="บันทึกการตั้งค่าตารางนี้ไว้ใช้ซ้ำ"
              >
                <Save className="w-4 h-4" />
                <span>💾 บันทึกเป็นตารางฝึก</span>
              </button>

              <button
                onClick={handleStartFromSetup}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-lime-400 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2 shrink-0"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>🚀 เริ่มออกกำลังกาย!</span>
              </button>
            </div>
          </div>
        </div>

        {/* Exercises Setup List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Dumbbell className="w-4 h-4 text-cyan-400" />
              <span>รายการท่าฝึก & ตั้งค่าแยกเซ็ต ({setupSession.exercises.length} ท่า)</span>
            </h3>

            <button
              onClick={() => setAddExerciseModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ เพิ่มท่าฝึก</span>
            </button>
          </div>

          {setupSession.exercises.length === 0 ? (
            <div className="glass-panel border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-3">
              <p className="text-sm text-slate-400">ไม่มีท่าฝึกในเซสชันนี้ กดปุ่มเพื่อเพิ่มท่าฝึก</p>
              <button
                onClick={() => setAddExerciseModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                + เพิ่มท่าฝึก
              </button>
            </div>
          ) : (
            setupSession.exercises.map((ex, exIdx) => {
              const imgSrc = EXERCISE_IMAGE_MAP[ex.exerciseId] || '/exercises/bench_press.jpg';

              return (
                <div
                  key={ex.id || exIdx}
                  className="glass-panel border-slate-800 hover:border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all group"
                >
                  {/* Top Exercise Header & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    {/* Left: 3D Thumbnail & Info */}
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-14 h-18 sm:w-16 sm:h-20 rounded-2xl bg-black overflow-hidden flex items-center justify-center shrink-0 border border-slate-800/80 shadow-md">
                        <img
                          src={imgSrc}
                          alt={ex.name}
                          className="w-full h-full object-contain object-center"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            ท่าที่ {exIdx + 1}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                            {ex.equipment}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm sm:text-base leading-tight truncate">
                          {ex.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{ex.englishName}</p>
                        {ex.muscle && (
                          <p className="text-[11px] text-cyan-400/90 font-medium mt-0.5 truncate">
                            🎯 โฟกัส: {ex.muscle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Rest time & Reorder / Remove */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0">
                      {/* Rest Seconds Selector */}
                      <div className="flex items-center space-x-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400">พักเซ็ต:</span>
                        <div className="flex items-center space-x-1">
                          {[30, 45, 60, 90].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSetupUpdateRest(exIdx, s)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                                ex.targetRest === s
                                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              {s}s
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reorder & Remove Actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleSetupMoveExercise(exIdx, -1)}
                          disabled={exIdx === 0}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 transition-colors"
                          title="เลื่อนขึ้น"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSetupMoveExercise(exIdx, 1)}
                          disabled={exIdx === setupSession.exercises.length - 1}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800 transition-colors"
                          title="เลื่อนลง"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSetupRemoveExercise(exIdx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-slate-800/80 transition-colors ml-1"
                          title="ลบท่านี้ออกจากการซ้อม"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Conditional: Cardio Interval Setup OR Standard Individual Sets */}
                  {isCardioExercise(ex) ? (
                    <div className="mt-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-extrabold text-xs flex items-center space-x-1.5">
                          <Flame className="w-4 h-4 text-amber-400" />
                          <span>ตั้งค่าคาร์ดิโอ (Cardio Interval Setup)</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          🏃 เล่นยาวอัตโนมัติต่อเนื่องจนครบ
                        </span>
                      </div>

                      {/* 3 Main Settings: เวลาเล่น, เวลาพัก, จำนวนรอบ */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. เวลาเล่นต่อรอบ */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                          <div className="text-[11px] font-extrabold text-slate-300 flex items-center justify-between mb-2">
                            <span>🔥 เวลาเล่น (ต่อรอบ)</span>
                            <span className="text-lime-400 font-black text-sm">{ex.cardioWorkSec || 30} วิ</span>
                          </div>
                          <div className="flex items-center space-x-1.5 mb-2">
                            <button
                              onClick={() => handleSetupUpdateCardio(exIdx, 'cardioWorkSec', -5)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center active:scale-95 transition-colors"
                            >
                              -5
                            </button>
                            <input
                              type="number"
                              value={ex.cardioWorkSec || 30}
                              onChange={(e) => handleSetupUpdateCardio(exIdx, 'cardioWorkSec', Number(e.target.value) || 10, true)}
                              className="w-full bg-slate-950 text-center text-lime-300 font-black text-xs sm:text-sm py-1 rounded-lg border border-slate-700 outline-none"
                            />
                            <button
                              onClick={() => handleSetupUpdateCardio(exIdx, 'cardioWorkSec', 5)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center active:scale-95 transition-colors"
                            >
                              +5
                            </button>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[20, 30, 45, 60].map((sec) => (
                              <button
                                key={sec}
                                onClick={() => handleSetupUpdateCardio(exIdx, 'cardioWorkSec', sec, true)}
                                className={`flex-1 py-0.5 rounded text-[10px] font-bold transition-all ${
                                  ex.cardioWorkSec === sec
                                    ? 'bg-lime-400 text-slate-950'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {sec}s
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. เวลาพักต่อรอบ */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                          <div className="text-[11px] font-extrabold text-slate-300 flex items-center justify-between mb-2">
                            <span>💤 เวลาพัก (ต่อรอบ)</span>
                            <span className="text-cyan-400 font-black text-sm">{ex.cardioRestSec || 15} วิ</span>
                          </div>
                          <div className="flex items-center space-x-1.5 mb-2">
                            <button
                              onClick={() => handleSetupUpdateCardio(exIdx, 'cardioRestSec', -5)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center active:scale-95 transition-colors"
                            >
                              -5
                            </button>
                            <input
                              type="number"
                              value={ex.cardioRestSec || 15}
                              onChange={(e) => handleSetupUpdateCardio(exIdx, 'cardioRestSec', Number(e.target.value) || 0, true)}
                              className="w-full bg-slate-950 text-center text-cyan-300 font-black text-xs sm:text-sm py-1 rounded-lg border border-slate-700 outline-none"
                            />
                            <button
                              onClick={() => handleSetupUpdateCardio(exIdx, 'cardioRestSec', 5)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center active:scale-95 transition-colors"
                            >
                              +5
                            </button>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[0, 15, 30, 45].map((sec) => (
                              <button
                                key={sec}
                                onClick={() => handleSetupUpdateCardio(exIdx, 'cardioRestSec', sec, true)}
                                className={`flex-1 py-0.5 rounded text-[10px] font-bold transition-all ${
                                  ex.cardioRestSec === sec
                                    ? 'bg-cyan-500 text-slate-950'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {sec}s
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 3. จำนวนรอบ */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                          <div className="text-[11px] font-extrabold text-slate-300 flex items-center justify-between mb-2">
                            <span>🔄 จำนวนรอบ</span>
                            <span className="text-amber-300 font-black text-sm">{ex.cardioRounds || 8} รอบ</span>
                          </div>
                          <div className="flex items-center space-x-1.5 mb-2">
                            <button
                              onClick={() => handleSetupUpdateCardio(exIdx, 'cardioRounds', -1)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center active:scale-95 transition-colors"
                            >
                              -1
                            </button>
                            <input
                              type="number"
                              value={ex.cardioRounds || 8}
                              onChange={(e) => handleSetupUpdateCardio(exIdx, 'cardioRounds', Math.max(1, Number(e.target.value) || 1), true)}
                              className="w-full bg-slate-950 text-center text-amber-300 font-black text-xs sm:text-sm py-1 rounded-lg border border-slate-700 outline-none"
                            />
                            <button
                              onClick={() => handleSetupUpdateCardio(exIdx, 'cardioRounds', 1)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center active:scale-95 transition-colors"
                            >
                              +1
                            </button>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[4, 6, 8, 10].map((rounds) => (
                              <button
                                key={rounds}
                                onClick={() => handleSetupUpdateCardio(exIdx, 'cardioRounds', rounds, true)}
                                className={`flex-1 py-0.5 rounded text-[10px] font-bold transition-all ${
                                  ex.cardioRounds === rounds
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {rounds}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Summary footer */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800/80">
                        <span>⏱️ เวลารวมคาร์ดิโอโดยประมาณ:</span>
                        <span className="font-extrabold text-lime-400">
                          {Math.round(((Number(ex.cardioWorkSec || 30) + Number(ex.cardioRestSec || 15)) * Number(ex.cardioRounds || 8)) / 60 * 10) / 10} นาที
                          {' '}({((Number(ex.cardioWorkSec || 30) + Number(ex.cardioRestSec || 15)) * Number(ex.cardioRounds || 8))} วินาที)
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Individual Sets Section (ตั้งค่าแยกแต่ละเซ็ต) */
                    <div className="mt-3.5 space-y-2.5">
                      <div className="flex items-center justify-between px-1 text-[11px] font-extrabold text-slate-300">
                        <div className="flex items-center space-x-2">
                          <span className="text-cyan-400 font-bold">⚡ กำหนดน้ำหนัก & จำนวนครั้งแยกเซ็ต</span>
                          <span className="text-slate-400 text-[10px]">({ex.sets.length} เซ็ต)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {ex.sets.length > 1 && (
                            <button
                              onClick={() => {
                                const firstSetWeight = ex.sets[0]?.weight || 20;
                                const updated = { ...setupSession };
                                updated.exercises[exIdx].sets.forEach((s) => (s.weight = firstSetWeight));
                                setSetupSession(updated);
                              }}
                              className="text-[10px] text-slate-400 hover:text-cyan-300 transition-colors hidden sm:inline"
                              title="ใช้น้ำหนักของเซ็ตที่ 1 กับทุกเซ็ตในท่านี้"
                            >
                              ใช้น้ำหนักเซ็ต 1 ทุกเซ็ต
                            </button>
                          )}
                          <button
                            onClick={() => handleSetupAddSet(exIdx)}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ เพิ่มเซ็ต</span>
                          </button>
                        </div>
                      </div>

                      {/* Table / List of Sets */}
                      <div className="space-y-2">
                        {ex.sets.map((set, setIdx) => (
                          <div
                            key={set.id || setIdx}
                            className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2.5 sm:px-3 sm:py-2 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all"
                          >
                            {/* Set Number & Type */}
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                                {setIdx + 1}
                              </span>
                              <select
                                value={set.type || 'Normal'}
                                onChange={(e) => handleSetupUpdateSetField(exIdx, setIdx, 'type', e.target.value)}
                                className={`text-[11px] font-bold rounded-xl px-2 py-1 outline-none border cursor-pointer ${
                                  set.type === 'Warmup'
                                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                    : set.type === 'Drop'
                                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                                    : set.type === 'Failure'
                                    ? 'bg-red-500/15 text-red-300 border-red-500/40'
                                    : 'bg-slate-900 text-slate-200 border-slate-800'
                                }`}
                              >
                                <option value="Normal">ปกติ (Normal)</option>
                                <option value="Warmup">วอร์ม (Warmup)</option>
                                <option value="Drop">ดรอปเซ็ต (Drop)</option>
                                <option value="Failure">หมดแรง (Failure)</option>
                              </select>
                            </div>

                            {/* Controls Container for Weight, Reps & Delete */}
                            <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
                              {/* Weight with +/- */}
                              <div className="flex items-center space-x-1 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 font-medium mr-0.5">กก.</span>
                                <button
                                  onClick={() => handleSetupAdjustSetValue(exIdx, setIdx, 'weight', -2.5)}
                                  className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center transition-colors"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={set.weight}
                                  onChange={(e) => handleSetupUpdateSetField(exIdx, setIdx, 'weight', Number(e.target.value) || 0)}
                                  className="w-12 sm:w-14 bg-transparent text-center text-cyan-300 font-black text-xs sm:text-sm outline-none"
                                />
                                <button
                                  onClick={() => handleSetupAdjustSetValue(exIdx, setIdx, 'weight', 2.5)}
                                  className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center transition-colors"
                                >
                                  +
                                </button>
                              </div>

                              {/* Reps with +/- */}
                              <div className="flex items-center space-x-1 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 font-medium mr-0.5">ครั้ง</span>
                                <button
                                  onClick={() => handleSetupAdjustSetValue(exIdx, setIdx, 'reps', -1)}
                                  className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center transition-colors"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) => handleSetupUpdateSetField(exIdx, setIdx, 'reps', Math.max(1, parseInt(e.target.value, 10) || 1))}
                                  className="w-9 sm:w-11 bg-transparent text-center text-lime-400 font-black text-xs sm:text-sm outline-none"
                                />
                                <button
                                  onClick={() => handleSetupAdjustSetValue(exIdx, setIdx, 'reps', 1)}
                                  className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center transition-colors"
                                >
                                  +
                                </button>
                              </div>

                              {/* Delete Set */}
                              <button
                                onClick={() => handleSetupRemoveSet(exIdx, setIdx)}
                                disabled={ex.sets.length <= 1}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20 transition-colors"
                                title="ลบเซ็ตนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Setup Sticky Bottom Action Bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0b0d12]/95 backdrop-blur-md border-t border-slate-800 p-3 sm:p-4 shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400 font-medium">พร้อมแล้วสำหรับการฝึกยิม</div>
              <div className="text-sm font-extrabold text-white truncate">
                {setupSession.routineName} ({setupSession.exercises.length} ท่าฝึก • {totalSets} เซ็ต)
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setSetupSession(null)}
                className="px-3.5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveSetupAsCustomPlan}
                className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 font-bold text-xs border border-amber-400/40 transition-colors flex items-center space-x-1.5"
                title="บันทึกการตั้งค่าตารางนี้ไว้ใช้ซ้ำ"
              >
                <Save className="w-4 h-4" />
                <span>💾 บันทึกตาราง</span>
              </button>
              <button
                onClick={handleStartFromSetup}
                className="px-5 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-lime-400 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all flex items-center space-x-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>🚀 เริ่มออกกำลังกายทันที</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add Exercise Modal in Setup */}
        {addExerciseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#131722] border border-slate-800 rounded-3xl p-6">
              <h3 className="text-base font-extrabold text-white mb-4">เลือกท่าฝึกเพิ่มในโปรแกรม</h3>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 mb-4">
                {EXERCISE_DATABASE.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => {
                      const updated = { ...setupSession };
                      updated.exercises.push({
                        id: `setup-ex-${updated.exercises.length}-${Date.now()}`,
                        exerciseId: ex.id,
                        name: ex.nameTh || ex.name,
                        englishName: ex.name || ex.id,
                        category: ex.category || 'CHEST',
                        equipment: ex.equipment || 'BARBELL',
                        muscle: ex.muscle || '',
                        targetRest: 30,
                        sets: [
                          { id: `setup-set-${Date.now()}-1`, setNum: 1, weight: 20, reps: 10, type: 'Warmup' },
                          { id: `setup-set-${Date.now()}-2`, setNum: 2, weight: 25, reps: 10, type: 'Normal' },
                          { id: `setup-set-${Date.now()}-3`, setNum: 3, weight: 25, reps: 10, type: 'Normal' },
                        ],
                      });
                      setSetupSession(updated);
                      setAddExerciseModalOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{ex.nameTh || ex.name}</div>
                      <div className="text-[10px] text-slate-400">{ex.category} • {ex.equipment}</div>
                    </div>
                    <Plus className="w-4 h-4 text-cyan-400" />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setAddExerciseModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 3A: FINISHED WORKOUT CELEBRATION & SUMMARY ---
  if (playerPhase === 'FINISHED') {
    const totalWorkoutSets = workoutSession.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSetsCount = workoutSession.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    );

    return (
      <div className="max-w-xl mx-auto space-y-6 pb-20 px-2 sm:px-0">
        <div className="glass-panel border-lime-400/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl neon-border-lime relative overflow-hidden">
          {/* Header celebration */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-lime-400 to-cyan-400 p-0.5 shadow-xl shadow-lime-400/20 mb-4 flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-lime-400 animate-bounce" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">🎉 ออกกำลังกายจบครบทุกแผนแล้ว!</h2>
          <p className="text-sm font-semibold text-slate-300 mb-6">
            คุณได้พิชิตโปรแกรม <span className="text-lime-400 font-extrabold">{workoutSession.routineName}</span> เรียบร้อยแล้ว
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold mb-1">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>เวลารวม</span>
              </div>
              <div className="text-xl font-black text-white">{formatElapsed(elapsedSeconds)}</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold mb-1">
                <Flame className="w-4 h-4 text-lime-400" />
                <span>น้ำหนักรวมสะสม</span>
              </div>
              <div className="text-xl font-black text-lime-400">{calculateTotalTonnage()} kg</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold mb-1">
                <Dumbbell className="w-4 h-4 text-cyan-400" />
                <span>จำนวนท่าฝึก</span>
              </div>
              <div className="text-xl font-black text-white">{workoutSession.exercises.length} ท่า</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-lime-400" />
                <span>เซ็ตที่สำเร็จ</span>
              </div>
              <div className="text-xl font-black text-white">{completedSetsCount} / {totalWorkoutSets} เซ็ต</div>
            </div>
          </div>

          {/* Action Buttons: Save (Big) & Discard (Small) */}
          <div className="space-y-4 pt-2">
            {/* HUGE Primary Save Button ("ปุ่มบันทึกใหญ่กว่า") */}
            <button
              onClick={handlePlayerSaveWorkout}
              className="w-full py-5 px-6 rounded-3xl bg-gradient-to-r from-lime-400 via-cyan-400 to-lime-400 hover:brightness-110 text-slate-950 font-black text-base sm:text-lg shadow-2xl shadow-lime-400/30 active:scale-95 transition-all flex items-center justify-center space-x-3 group cursor-pointer"
            >
              <Save className="w-6 h-6 fill-slate-950 group-hover:scale-110 transition-transform" />
              <span>💾 บันทึกผลการออกกำลังกาย (Save Workout)</span>
            </button>

            {/* Small Secondary Discard Button */}
            <button
              onClick={handlePlayerDiscardWorkout}
              className="w-full sm:w-auto mx-auto px-4 py-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ทิ้ง / ยกเลิกเซสชันนี้</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 3B: GUIDED LIVE WORKOUT PLAYER ---
  if (playerMode === 'PLAYER') {
    const currentEx = workoutSession.exercises[currentExIndex] || workoutSession.exercises[0];
    const currentSet = currentEx?.sets[currentSetIndex] || currentEx?.sets[0];
    const totalWorkoutSets = workoutSession.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    let currentAbsoluteSetIndex = 0;
    for (let i = 0; i < currentExIndex; i++) {
      currentAbsoluteSetIndex += workoutSession.exercises[i].sets.length;
    }
    currentAbsoluteSetIndex += (currentSetIndex + 1);

    const nextData = getNextSetIndices();
    const nextEx = nextData ? workoutSession.exercises[nextData.exIdx] : null;
    const nextSet = nextData && nextEx ? nextEx.sets[nextData.setIdx] : null;

    const isCurrentCardio = isCardioExercise(currentEx);
    const displayImageEx = (!isCurrentCardio && (playerPhase === 'REST' || playerPhase === 'READY') && nextEx) ? nextEx : currentEx;
    const exImage = EXERCISE_IMAGE_MAP[displayImageEx?.exerciseId] || `/exercises/${displayImageEx?.exerciseId?.replace(/-/g, '_')}.jpg`;

    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-20 px-2 sm:px-0">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-2 px-1">
          <button
            onClick={() => setPlayerMode('TABLE')}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>โหมดตาราง (Table View)</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-colors"
              title={soundEnabled ? 'ปิดเสียงเตือน' : 'เปิดเสียงเตือน'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-lime-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={() => setWorkoutSession(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-colors flex items-center space-x-1"
              title="ย่อหน้านี้เพื่อดูโปรแกรมหรือเมนูอื่น โดยระบบยังคงบันทึกต่อในพื้นหลัง"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ย่อ</span>
            </button>
            <button
              onClick={handleCancelWorkout}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 text-xs font-bold transition-colors"
            >
              ออก
            </button>
          </div>
        </div>

        {/* Guided Player Frame Card */}
        <div className={`glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden ${
          isCurrentCardio ? 'border-orange-500/40 shadow-orange-500/10' : 'border-cyan-500/40 neon-border-cyan'
        }`}>
          {/* Header Progress Information */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-white font-extrabold">ท่าที่ {currentExIndex + 1} จาก {workoutSession.exercises.length}</span>
              <span className="text-slate-500">•</span>
              {isCurrentCardio ? (
                <span className="text-orange-400 font-extrabold">
                  🔥 คาร์ดิโอรอบที่ {currentSetIndex + 1} จาก {currentEx.cardioRounds || currentEx.sets.length}
                </span>
              ) : (
                <span className="text-cyan-400">
                  เซ็ตที่ {currentSetIndex + 1} จาก {currentEx.sets.length}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1.5 text-lime-400">
              <Clock className="w-4 h-4" />
              <span>รวม {formatElapsed(elapsedSeconds)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-5">
            <div
              className={`h-full transition-all duration-300 ${
                isCurrentCardio
                  ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-lime-400'
                  : 'bg-gradient-to-r from-cyan-400 to-lime-400'
              }`}
              style={{ width: `${Math.min(100, (currentAbsoluteSetIndex / totalWorkoutSets) * 100)}%` }}
            />
          </div>

          {/* Phase Badge */}
          <div className="text-center mb-4">
            {isCurrentCardio ? (
              playerPhase === 'WORK' ? (
                <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-400/50 shadow-lg shadow-orange-500/10 animate-pulse">
                  <span>🔥 กำลังเล่นคาร์ดิโอ (WORK) • รอบ {currentSetIndex + 1}/{currentEx.cardioRounds || currentEx.sets.length}</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 animate-pulse">
                  <span>💤 พักระหว่างรอบ (REST) • เตรียมต่อรอบที่ {Math.min((currentEx.cardioRounds || currentEx.sets.length), currentSetIndex + 2)}</span>
                </span>
              )
            ) : (
              <>
                {playerPhase === 'WORK' && (
                  <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase px-4 py-1.5 rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/40 shadow-lg shadow-lime-400/10">
                    <span>🔥 กำลังออกกำลังกาย (WORK)</span>
                  </span>
                )}
                {playerPhase === 'REST' && (
                  <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 animate-pulse">
                    <span>💤 กำลังพักระหว่างเซ็ต (REST)</span>
                  </span>
                )}
                {playerPhase === 'READY' && (
                  <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-lg shadow-amber-400/10 animate-bounce">
                    <span>⚡ พักครบแล้ว พร้อมเริ่มเซ็ตใหม่! (READY)</span>
                  </span>
                )}
              </>
            )}
          </div>

          {/* Big 3D Mannequin Visual Box */}
          <div className="flex flex-col items-center justify-center my-2">
            <div className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-2 shadow-2xl mb-4 bg-slate-950 ${
              isCurrentCardio ? 'border-orange-500/50' : 'border-slate-700/80'
            }`}>
              <img
                src={exImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/exercises/bench_press.jpg';
                }}
                alt={displayImageEx?.name || 'Exercise'}
                className={`w-full h-full object-cover object-center ${
                  !isPaused && playerPhase === 'WORK' ? 'animate-workout-loop' : ''
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md backdrop-blur-md text-[10px] font-black tracking-wider ${
                isCurrentCardio
                  ? 'bg-orange-950/80 text-orange-300 border border-orange-400/40'
                  : 'bg-black/75 text-lime-300 border border-lime-400/30'
              }`}>
                {isCurrentCardio ? '🔥 CARDIO INTERVAL' : '3D ANATOMY'}
              </div>

              {/* Cardio Rest Overlay */}
              {isCurrentCardio && playerPhase === 'REST' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-cyan-300 font-black text-xs sm:text-sm uppercase tracking-widest bg-cyan-950/90 px-3 py-1.5 rounded-xl border border-cyan-400 shadow-lg">
                    พักหายใจ {cardioSecondsLeft}s
                  </span>
                  <span className="text-[11px] text-slate-300 mt-2 font-medium">
                    ระบบจะเริ่มรอบที่ {currentSetIndex + 2} อัตโนมัติ
                  </span>
                </div>
              )}

              {/* Gym Rest Overlay */}
              {!isCurrentCardio && playerPhase === 'REST' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-cyan-300 font-black text-xs sm:text-sm uppercase tracking-widest bg-cyan-950/90 px-3 py-1.5 rounded-xl border border-cyan-400 shadow-lg">
                    พักฟื้นฟูกล้ามเนื้อ
                  </span>
                  {nextEx && (
                    <span className="text-[11px] text-slate-300 mt-2 font-medium">
                      เตรียมพร้อม: {nextEx.name}
                    </span>
                  )}
                </div>
              )}

              {/* Gym Ready Overlay */}
              {!isCurrentCardio && playerPhase === 'READY' && (
                <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-amber-300 font-black text-xs sm:text-sm uppercase tracking-widest bg-amber-950/90 px-3 py-1.5 rounded-xl border border-amber-400 shadow-lg animate-pulse">
                    พร้อมลุยเซ็ตถัดไป!
                  </span>
                </div>
              )}
            </div>

            {/* Exercise Title */}
            <h3 className="text-xl sm:text-2xl font-black text-white text-center mb-1">
              {isCurrentCardio ? currentEx.name : (playerPhase === 'WORK' ? currentEx.name : (nextEx ? nextEx.name : currentEx.name))}
            </h3>

            {/* Target Set Info / Interval Info */}
            {isCurrentCardio ? (
              <div className="flex items-center justify-center flex-wrap gap-2 my-2">
                <div className="bg-slate-900/90 border border-orange-500/30 rounded-xl px-2.5 py-1 text-xs font-black text-orange-400">
                  🔥 เล่น {currentEx.cardioWorkSec || 30}s
                </div>
                <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl px-2.5 py-1 text-xs font-black text-cyan-300">
                  💤 พัก {currentEx.cardioRestSec || 15}s
                </div>
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl px-2.5 py-1 text-xs font-black text-amber-300">
                  🔄 รอบ {currentSetIndex + 1}/{currentEx.cardioRounds || currentEx.sets.length}
                </div>
                <div className="bg-lime-500/10 border border-lime-400/30 rounded-xl px-2.5 py-1 text-[11px] font-extrabold text-lime-300">
                  ⚡ เล่นยาวอัตโนมัติ
                </div>
              </div>
            ) : (
              playerPhase === 'WORK' && currentSet && (
                <div className="flex items-center justify-center flex-wrap gap-2.5 my-2">
                  {/* Weight Chip */}
                  <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1">
                    <button
                      onClick={() => handlePlayerUpdateCurrentSet('weight', -2.5)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center active:scale-90"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-cyan-400 px-1">
                      {currentSet.weight} kg
                    </span>
                    <button
                      onClick={() => handlePlayerUpdateCurrentSet('weight', 2.5)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center active:scale-90"
                    >
                      +
                    </button>
                  </div>

                  {/* Reps Chip */}
                  <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1">
                    <button
                      onClick={() => handlePlayerUpdateCurrentSet('reps', -1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center active:scale-90"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-lime-400 px-1">
                      {currentSet.reps} ครั้ง
                    </span>
                    <button
                      onClick={() => handlePlayerUpdateCurrentSet('reps', 1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Big Timer Display */}
            {isCurrentCardio ? (
              <div className="text-center my-2">
                <div className={`text-5xl sm:text-6xl font-black tracking-tight ${
                  playerPhase === 'WORK'
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-amber-400'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-400'
                }`}>
                  {cardioSecondsLeft} <span className="text-lg sm:text-xl font-normal text-slate-300">วินาที</span>
                </div>
                <div className="text-xs text-slate-300 font-semibold mt-1">
                  {playerPhase === 'WORK' ? (
                    <span className="text-amber-300">🔥 ออกแรงเต็มที่! ระบบจะสลับไปพักอัตโนมัติเมื่อครบเวลา</span>
                  ) : (
                    <span className="text-cyan-300">💤 พักผ่อนคลาย ระบบจะเริ่มรอบต่อไปอัตโนมัติ</span>
                  )}
                </div>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <button
                    onClick={() => setCardioSecondsLeft((prev) => Math.max(1, prev - 5))}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors"
                  >
                    -5 วิ
                  </button>
                  <button
                    onClick={() => setCardioSecondsLeft((prev) => prev + 10)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-colors"
                  >
                    +10 วิ
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* WORK: "ตอนเล่นให้นับขึ้น" */}
                {playerPhase === 'WORK' && (
                  <div className="text-center my-2">
                    <div className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-lime-400">
                      {formatElapsed(workSeconds)}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold mt-1">
                      ⏱️ กำลังเล่น (Count Up)
                    </div>
                  </div>
                )}

                {/* REST: "เล่นเสร็จนับลง" */}
                {playerPhase === 'REST' && (
                  <div className="text-center my-2">
                    <div className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-400">
                      {restSecondsLeft} <span className="text-lg sm:text-xl text-cyan-300 font-normal">วินาที</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <button
                        onClick={() => setRestSecondsLeft((prev) => Math.max(0, prev - 15))}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors"
                      >
                        -15 วิ
                      </button>
                      <button
                        onClick={() => setRestSecondsLeft((prev) => prev + 30)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-colors"
                      >
                        +30 วิ
                      </button>
                    </div>
                  </div>
                )}

                {/* READY: "countdown จบให้กดเริ่มเซ็ตใหม่เอง" */}
                {playerPhase === 'READY' && (
                  <div className="text-center my-2">
                    <div className="text-4xl sm:text-5xl font-black text-amber-300 animate-pulse">
                      0 <span className="text-lg text-amber-200 font-normal">วินาที</span>
                    </div>
                    <div className="text-xs text-amber-300/80 font-bold mt-1">
                      🔔 หมดเวลาพักแล้ว พร้อมแล้วกดเริ่มเซ็ตใหม่ได้เลย
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Next Set Preview Box (Matching User's Screenshot) */}
          {nextEx && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 my-4 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ท่าถัดไป:</span>
              <div className="text-xs font-bold text-slate-200 mt-0.5">
                {nextEx.name} {nextSet && !isCardioExercise(nextEx) && <span className="text-cyan-400 font-normal">• เซ็ต {nextData.setIdx + 1} ({nextSet.weight}kg × {nextSet.reps})</span>}
                {nextEx && isCardioExercise(nextEx) && <span className="text-orange-400 font-normal">• คาร์ดิโอ ({nextEx.cardioWorkSec || 30}s / {nextEx.cardioRestSec || 15}s)</span>}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mt-4">
            {isCurrentCardio ? (
              <>
                <button
                  onClick={handleCardioSkipInterval}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  title="ข้ามช่วงนี้ (จากเล่นไปพัก หรือจากพักไปเล่นรอบถัดไปทันที)"
                >
                  <SkipForward className="w-5 h-5 fill-slate-950" />
                  <span>{playerPhase === 'WORK' ? '⏭️ ข้ามไปพักทันที' : '⏭️ ข้ามพักเริ่มรอบถัดไป'}</span>
                </button>

                <button
                  onClick={handleCardioSkipExercise}
                  className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  title="ข้ามท่าคาร์ดิโอนี้ไปยังท่าถัดไป"
                >
                  <FastForward className="w-4 h-4 text-amber-400" />
                  <span>ข้ามท่านี้</span>
                </button>

                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition-all"
                  title={isPaused ? 'เล่นต่อ' : 'หยุดชั่วคราว'}
                >
                  {isPaused ? <Play className="w-5 h-5 text-lime-400" /> : <Pause className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <>
                {/* WORK Phase: "มีปุ่ม เล่นเสร็จกับปุ่มข้าม ถ้ากดข้ามเซ็ต ไม่ต้อง countdown" */}
                {playerPhase === 'WORK' && (
                  <>
                    <button
                      onClick={handlePlayerFinishSet}
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-lime-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-lime-400/25 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5 fill-slate-950 text-lime-400" />
                      <span>เล่นเสร็จ</span>
                    </button>

                    <button
                      onClick={handlePlayerSkipSet}
                      className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      title="ข้ามเซ็ตนี้ทันทีโดยไม่ต้องพัก"
                    >
                      <SkipForward className="w-4 h-4" />
                      <span>ข้าม</span>
                    </button>

                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition-all"
                      title={isPaused ? 'เล่นต่อ' : 'หยุดชั่วคราว'}
                    >
                      {isPaused ? <Play className="w-5 h-5 text-lime-400" /> : <Pause className="w-5 h-5" />}
                    </button>
                  </>
                )}

                {/* REST Phase */}
                {playerPhase === 'REST' && (
                  <>
                    <button
                      onClick={handlePlayerStartNextSet}
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-lime-400 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Zap className="w-5 h-5 fill-slate-950" />
                      <span>⚡ ข้ามพัก / พร้อมลุยต่อ</span>
                    </button>

                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition-all"
                    >
                      {isPaused ? <Play className="w-5 h-5 text-lime-400" /> : <Pause className="w-5 h-5" />}
                    </button>
                  </>
                )}

                {/* READY Phase: "countdown จบให้กดเริ่มเซ็ตใหม่เอง" */}
                {playerPhase === 'READY' && (
                  <button
                    onClick={handlePlayerStartNextSet}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-lime-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-base shadow-2xl shadow-amber-400/30 active:scale-95 transition-all flex items-center justify-center space-x-2 animate-pulse cursor-pointer"
                  >
                    <Play className="w-6 h-6 fill-slate-950" />
                    <span>▶️ เริ่มเล่นเซ็ตถัดไป</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Current Exercise Tips */}
        {currentEx && (
          <div className="glass-panel border-slate-800 rounded-3xl p-4 sm:p-5">
            <h4 className="text-xs font-bold text-white mb-1.5 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-lime-400" />
              <span>เทคนิคและคำแนะนำการฝึก ({currentEx.name})</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {EXERCISE_DATABASE.find((e) => e.id === currentEx.exerciseId)?.tips || 'เกร็งกล้ามเนื้อเป้าหมายให้มั่นคง ควบคุมจังหวะขึ้นและลงอย่างสม่ำเสมอ'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 3C: ACTIVE WORKOUT SESSION LOGGER (TABLE MODE) ---
  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-24">
      {/* Sticky Active Session Header */}
      <div className="sticky top-14 sm:top-16 z-30 glass-panel border-cyan-500/40 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl neon-border-cyan flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-white text-sm sm:text-base leading-tight truncate">{workoutSession.routineName}</h2>
            <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center space-x-1 text-cyan-300 font-bold">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatElapsed(elapsedSeconds)}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-lime-400 font-bold">
                <Flame className="w-3.5 h-3.5 text-lime-400" />
                <span>{calculateTotalTonnage()} kg</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Switch to Guided Player */}
          <button
            onClick={() => setPlayerMode('PLAYER')}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-lime-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 hover:brightness-110 flex items-center justify-center space-x-1.5 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>โหมดผู้ช่วยสด (Player)</span>
          </button>
          {workoutSession.exercises.length > 0 && (
            <button
              onClick={handleClearAllExercises}
              className="flex-1 sm:flex-none px-2.5 sm:px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30 flex items-center justify-center space-x-1 transition-all"
              title="ลบท่าทั้งหมดออกจากเซสชันนี้"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>ลบท่าทั้งหมด</span>
            </button>
          )}

          <button
            onClick={() => setAddExerciseModalOpen(true)}
            className="flex-1 sm:flex-none px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center space-x-1"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>เพิ่มท่า</span>
          </button>

          <button
            onClick={() => setWorkoutSession(null)}
            className="px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all flex items-center space-x-1"
            title="ย่อหน้านี้เพื่อดูโปรแกรมหรือเมนูอื่น โดยระบบยังคงบันทึกต่อในพื้นหลัง"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ย่อ</span>
          </button>

          <button
            onClick={handleCancelWorkout}
            className="px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all"
            title="ยกเลิกเซสชัน"
          >
            ยกเลิก
          </button>
          
          <button
            onClick={handleFinishWorkout}
            disabled={workoutSession.exercises.length === 0}
            className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-xl font-black text-xs shadow-lg transition-all flex items-center justify-center space-x-1.5 ${
              workoutSession.exercises.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 to-lime-400 text-slate-950 shadow-cyan-500/20 hover:brightness-110'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>เสร็จสิ้น</span>
          </button>
        </div>
      </div>

      {/* Exercises Log Card List */}
      <div className="space-y-4 sm:space-y-6">
        {workoutSession.exercises.map((ex, exIdx) => {
          const prevPerf = getPreviousPerformance(ex.exerciseId);

          return (
            <div key={exIdx} className="glass-panel border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 transition-all">
              {/* Exercise Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3 sm:mb-4">
                <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 font-bold text-xs sm:text-sm shrink-0">
                    {exIdx + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-white text-sm sm:text-base truncate">{ex.name}</h3>
                    <div className="flex items-center flex-wrap gap-1 mt-0.5">
                      <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                        {ex.category}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-800 text-cyan-300">
                        {ex.equipment}
                      </span>
                      {prevPerf && (
                        <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.2 rounded bg-lime-400/10 text-lime-400 border border-lime-400/20">
                          {prevPerf}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions (Plate Calc & Delete Exercise) */}
                <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                  {ex.equipment === 'BARBELL' && (
                    <button
                      onClick={() => {
                        setPlateCalcWeight(ex.sets[0]?.weight || 60);
                        setPlateCalcOpen(true);
                      }}
                      className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-[11px] sm:text-xs font-bold transition-all flex items-center space-x-1"
                      title="คำนวณแผ่นบาร์เบล"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Plate Calc</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveExercise(exIdx)}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all"
                    title={`ลบท่า ${ex.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Set Rows Table */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 sm:px-2">
                  <div className="col-span-1 text-center">SET</div>
                  <div className="col-span-2 text-center">TYPE</div>
                  <div className="col-span-4 sm:col-span-3 text-center">WEIGHT (KG)</div>
                  <div className="col-span-4 sm:col-span-3 text-center">REPS</div>
                  <div className="hidden sm:block sm:col-span-2 text-center">1RM EST</div>
                  <div className="col-span-1 text-center">DONE</div>
                </div>

                {ex.sets.map((set, setIdx) => {
                  const est1RM = calculate1RM(parseFloat(set.weight) || 0, parseInt(set.reps) || 0);

                  return (
                    <div
                      key={set.id}
                      className={`grid grid-cols-12 gap-1.5 sm:gap-2 items-center p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all ${
                        set.completed
                          ? 'bg-cyan-950/20 border-cyan-500/30'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                      }`}
                    >
                      {/* Set Number */}
                      <div className="col-span-1 text-center font-extrabold text-xs text-slate-300">
                        {set.setNum}
                      </div>

                      {/* Set Type Dropdown */}
                      <div className="col-span-2">
                        <select
                          value={set.type}
                          onChange={(e) => handleUpdateSet(exIdx, setIdx, 'type', e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 text-[10px] sm:text-[11px] font-bold rounded-lg sm:rounded-xl px-0.5 py-1 border border-slate-800 text-center outline-none"
                        >
                          <option value="Normal">Norm</option>
                          <option value="Warmup">Warm</option>
                          <option value="Drop">Drop</option>
                          <option value="Failure">Fail</option>
                        </select>
                      </div>

                      {/* Weight Input */}
                      <div className="col-span-4 sm:col-span-3 flex items-center space-x-0.5 sm:space-x-1">
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'weight', Math.max(0, (set.weight || 0) - 2.5))}
                          className="w-5 h-7 sm:w-6 sm:h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 touch-manipulation"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          value={set.weight}
                          onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-full min-w-0 bg-slate-950 border border-slate-800 text-white font-extrabold text-xs text-center rounded-lg sm:rounded-xl py-1 px-0.5 outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'weight', (set.weight || 0) + 2.5)}
                          className="w-5 h-7 sm:w-6 sm:h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 touch-manipulation"
                        >
                          +
                        </button>
                      </div>

                      {/* Reps Input */}
                      <div className="col-span-4 sm:col-span-3 flex items-center space-x-0.5 sm:space-x-1">
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'reps', Math.max(1, (set.reps || 1) - 1))}
                          className="w-5 h-7 sm:w-6 sm:h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 touch-manipulation"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                          className="w-full min-w-0 bg-slate-950 border border-slate-800 text-white font-extrabold text-xs text-center rounded-lg sm:rounded-xl py-1 px-0.5 outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'reps', (set.reps || 0) + 1)}
                          className="w-5 h-7 sm:w-6 sm:h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 touch-manipulation"
                        >
                          +
                        </button>
                      </div>

                      {/* 1RM Est Badge (Desktop) */}
                      <div className="hidden sm:block sm:col-span-2 text-center text-[10px] font-bold text-lime-400">
                        {est1RM > 0 ? `${est1RM} kg` : '-'}
                      </div>

                      {/* Completion Checkmark */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all touch-manipulation ${
                            set.completed
                              ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/40'
                              : 'bg-slate-800 text-slate-500 hover:text-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Set Button */}
              <button
                onClick={() => handleAddSet(exIdx)}
                className="w-full py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all border border-slate-800 flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>+ เพิ่มเซ็ต (Add Set)</span>
              </button>
            </div>
          );
        })}

        {workoutSession.exercises.length === 0 && (
          <div className="glass-panel border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Dumbbell className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">ไม่มีท่าออกกำลังกายในเซสชันนี้</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                คุณได้ลบท่าทั้งหมดออกจากเซสชันนี้แล้ว สามารถกดปุ่มเพื่อเลือกเพิ่มท่าใหม่ หรือยกเลิกเซสชันได้
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setAddExerciseModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มท่าออกกำลังกาย</span>
              </button>
              <button
                onClick={handleCancelWorkout}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all"
              >
                ยกเลิกเซสชัน
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rest Timer Overlay */}
      <RestTimerOverlay
        isOpen={restTimerOpen}
        secondsLeft={restSecondsLeft}
        setSecondsLeft={setRestSecondsLeft}
        onSkip={() => setRestTimerOpen(false)}
        nextInfo={nextSetInfo}
      />

      {/* Plate Calculator Modal */}
      <PlateCalculatorModal
        isOpen={plateCalcOpen}
        onClose={() => setPlateCalcOpen(false)}
        initialWeight={plateCalcWeight}
      />

      {/* Add Exercise Modal */}
      {addExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#131722] border border-slate-800 rounded-3xl p-6">
            <h3 className="text-base font-extrabold text-white mb-4">เพิ่มท่าฝึกในเซสชันนี้</h3>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 mb-4">
              {EXERCISE_DATABASE.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToWorkout(ex.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{ex.nameTh || ex.name}</div>
                    <div className="text-[10px] text-slate-400">{ex.category} • {ex.equipment}</div>
                  </div>
                  <Plus className="w-4 h-4 text-cyan-400" />
                </div>
              ))}
            </div>
            <button
              onClick={() => setAddExerciseModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
