import React, { useState, useEffect } from 'react';
import { Home, Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX, CheckCircle2, Flame, Award, Clock, Sparkles } from 'lucide-react';
import { WORKOUT_TEMPLATES } from '../data/workoutTemplates';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { soundManager } from '../utils/timerSound';
import { estimateCaloriesBurned } from '../utils/fitnessCalculators';
import { getCustomPlans } from '../utils/storage';

export default function HomeLogger({ onFinishSession, templateToOpen = null, onClearTemplateToOpen }) {
  const [customPlans, setCustomPlans] = useState(() => getCustomPlans());
  const [selectedRoutine, setSelectedRoutine] = useState(
    WORKOUT_TEMPLATES.find((t) => t.category === 'HOME') || WORKOUT_TEMPLATES[3]
  );
  const [activeSession, setActiveSession] = useState(null);

  // Sync custom plans
  useEffect(() => {
    setCustomPlans(getCustomPlans());
  }, [templateToOpen, activeSession]);

  // If a template was triggered to open
  useEffect(() => {
    if (templateToOpen) {
      handleStartHomeSession(templateToOpen);
      if (onClearTemplateToOpen) {
        onClearTemplateToOpen();
      }
    }
  }, [templateToOpen]);

  // Player state
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [isRestPhase, setIsRestPhase] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalElapsed, setTotalElapsed] = useState(0);

  // Timer interval for home player
  useEffect(() => {
    if (!activeSession || isPaused || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (soundEnabled) soundManager.playCompletionChime();

          // Phase transition
          if (!isRestPhase) {
            // Work -> Rest phase
            setIsRestPhase(true);
            return selectedRoutine.restTimeSec || 15;
          } else {
            // Rest -> Next exercise
            setIsRestPhase(false);
            if (currentExIndex < activeSession.exercises.length - 1) {
              setCurrentExIndex((idx) => idx + 1);
              return selectedRoutine.workTimeSec || 30;
            } else {
              // Finish routine
              handleCompleteHomeSession();
              return 0;
            }
          }
        }

        if (prev <= 4 && prev > 1 && soundEnabled) {
          soundManager.playBeep(880, 0.1);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession, isPaused, secondsLeft, isRestPhase, currentExIndex, soundEnabled, selectedRoutine]);

  // Overall session elapsed timer
  useEffect(() => {
    let interval;
    if (activeSession && !isPaused) {
      interval = setInterval(() => {
        setTotalElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession, isPaused]);

  const handleStartHomeSession = (routine) => {
    const fullExercises = routine.exercises.map((item) => {
      const dbEx = EXERCISE_DATABASE.find((e) => e.id === item.exerciseId) || {};
      return {
        ...item,
        exerciseId: item.exerciseId,
        name: dbEx.nameTh || dbEx.name || item.exerciseId,
        icon: dbEx.icon || '🤸‍♂️',
        instructions: dbEx.instructions || ['เล่นด้วยความเข้มข้นสม่ำเสมอ'],
        tips: dbEx.tips || 'เกร็งลำตัวให้แน่น หายใจเข้าออกสม่ำเสมอ',
      };
    });

    const session = {
      id: `home-session-${Date.now()}`,
      routineName: routine.nameTh || routine.name,
      mode: 'HOME',
      startTime: new Date().toISOString(),
      exercises: fullExercises,
    };

    setActiveSession(session);
    setCurrentExIndex(0);
    setIsRestPhase(false);
    setSecondsLeft(routine.workTimeSec || 30);
    setIsPaused(false);
    setTotalElapsed(0);
  };

  const handleSkipPhase = () => {
    if (!activeSession) return;
    if (!isRestPhase) {
      setIsRestPhase(true);
      setSecondsLeft(selectedRoutine.restTimeSec || 15);
    } else {
      setIsRestPhase(false);
      if (currentExIndex < activeSession.exercises.length - 1) {
        setCurrentExIndex((idx) => idx + 1);
        setSecondsLeft(selectedRoutine.workTimeSec || 30);
      } else {
        handleCompleteHomeSession();
      }
    }
  };

  const handleCompleteHomeSession = () => {
    if (!activeSession) return;
    const minutes = Math.max(1, Math.round(totalElapsed / 60));
    const calories = estimateCaloriesBurned(minutes, false, 72);

    const log = {
      ...activeSession,
      endTime: new Date().toISOString(),
      durationMinutes: minutes,
      caloriesBurned: calories,
      totalTonnageKg: 0,
    };

    onFinishSession(log);
    setActiveSession(null);
  };

  const formatSecs = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- VIEW 1: ROUTINE SELECTION LIST ---
  if (!activeSession) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner */}
        <div className="glass-panel border-lime-400/30 rounded-3xl p-6 relative overflow-hidden neon-border-lime">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-lime-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Home className="w-4 h-4" />
                <span>Leap Fitness Inspired Home Log</span>
              </div>
              <h2 className="text-2xl font-black text-white">บันทึกการออกกำลังกายที่บ้าน (Home Log)</h2>
              <p className="text-xs text-slate-400 mt-1">
                ออกกำลังกายตามจังหวะเวลา (Guided Workouts) ไม่ต้องใช้อุปกรณ์ พร้อมเสียงนับเตือนภาพเคลื่อนไหว
              </p>
            </div>

            <button
              onClick={() => handleStartHomeSession(selectedRoutine)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-lime-400 to-cyan-400 text-slate-950 font-black text-sm shadow-lg shadow-lime-400/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>เริ่มออกกำลังกายที่บ้าน!</span>
            </button>
          </div>
        </div>

        {/* Home Routines Grid */}
        <div>
          <h3 className="text-lg font-extrabold text-white mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-lime-400" />
            <span>โปรแกรมออกกำลังกายที่บ้าน (Home Presets)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...(customPlans || []).filter((t) => t.category === 'HOME'), ...WORKOUT_TEMPLATES.filter((t) => t.category === 'HOME')].map((tmpl) => (
              <div
                key={tmpl.id}
                className={`glass-panel rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group ${
                  tmpl.id?.startsWith('custom-') || tmpl.isCustom
                    ? 'border-amber-400/40 hover:border-amber-400 shadow-amber-400/10'
                    : 'border-slate-800 hover:border-lime-400/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      tmpl.id?.startsWith('custom-') || tmpl.isCustom
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                        : 'bg-lime-400/20 text-lime-300 border-lime-400/30'
                    }`}>
                      {tmpl.estimatedMinutes} นาที
                    </span>
                    {tmpl.id?.startsWith('custom-') || tmpl.isCustom && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        ⭐ ตารางสร้างเอง
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-semibold">{tmpl.exercises.length} ท่าฝึก</span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-lime-300 transition-colors mb-1">
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

                <button
                  onClick={() => handleStartHomeSession(tmpl)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                    tmpl.id?.startsWith('custom-') || tmpl.isCustom
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black'
                      : 'bg-slate-800 group-hover:bg-lime-400 group-hover:text-slate-950 text-lime-300'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>เริ่มเซสชันนี้</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: ACTIVE GUIDED HOME WORKOUT PLAYER ---
  const currentEx = activeSession.exercises[currentExIndex];
  const nextEx = activeSession.exercises[currentExIndex + 1];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Player Frame Card */}
      <div className="glass-panel border-lime-400/40 rounded-3xl p-6 shadow-2xl neon-border-lime relative overflow-hidden">
        {/* Header Progress Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
            <span>ท่าที่ {currentExIndex + 1} จาก {activeSession.exercises.length}</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-lime-400">
            <Clock className="w-4 h-4 text-lime-400" />
            <span>รวม {formatSecs(totalElapsed)}</span>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-lime-400 transition-all duration-300"
            style={{ width: `${((currentExIndex + 1) / activeSession.exercises.length) * 100}%` }}
          />
        </div>

        {/* Phase Indicator */}
        <div className="text-center mb-4">
          <span
            className={`inline-block text-xs font-extrabold uppercase px-4 py-1.5 rounded-full border shadow-md ${
              isRestPhase
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                : 'bg-lime-400/20 text-lime-300 border-lime-400/40'
            }`}
          >
            {isRestPhase ? '⏱️ ช่วงเวลาพัก (REST)' : '🔥 กำลังออกกำลังกาย (WORK)'}
          </span>
        </div>

        {/* Big 3D Mannequin Visual & Exercise Title */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-2 border-lime-400/40 shadow-2xl mb-4 bg-slate-950">
            <img
              src={`/exercises/${currentEx.exerciseId?.replace(/-/g, '_')}.jpg`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/exercises/bench_press.jpg';
              }}
              alt={currentEx.name}
              className={`w-full h-full object-cover object-center ${
                !isPaused && !isRestPhase ? 'animate-workout-loop' : ''
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-extrabold text-lime-300 border border-lime-400/30">
              3D ANATOMY
            </div>
            {isRestPhase && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-cyan-300 font-black text-sm uppercase tracking-widest bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-400">
                  พักฟื้นฟูกล้ามเนื้อ
                </span>
              </div>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white text-center mb-1">{currentEx.name}</h3>

          {/* Big Countdown Timer */}
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-lime-400 my-2">
            {secondsLeft} <span className="text-lg text-slate-400 font-normal">วินาที</span>
          </div>
        </div>

        {/* Next Exercise Preview */}
        {nextEx && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-6 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">ท่าถัดไป:</span>
            <div className="text-xs font-bold text-slate-200">{nextEx.icon} {nextEx.name}</div>
          </div>
        )}

        {/* Player Action Controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-lime-400 to-cyan-400 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-lime-400/20 hover:scale-105 active:scale-95 transition-all"
          >
            {isPaused ? <Play className="w-6 h-6 fill-slate-950" /> : <Pause className="w-6 h-6 fill-slate-950" />}
          </button>

          <button
            onClick={handleSkipPhase}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            title="ข้ามไปท่าถัดไป"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Exercise Instructions & Form Guide */}
      <div className="glass-panel border-slate-800 rounded-3xl p-5">
        <h4 className="text-sm font-bold text-white mb-2">💡 วิธีการปฏิบัติและเทคนิค (Form & Tips)</h4>
        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside mb-3">
          {currentEx.instructions.map((ins, idx) => (
            <li key={idx}>{ins}</li>
          ))}
        </ul>
        <div className="text-xs text-lime-400 font-semibold bg-lime-400/10 p-2.5 rounded-xl border border-lime-400/20">
          ✨ {currentEx.tips}
        </div>
      </div>
    </div>
  );
}
