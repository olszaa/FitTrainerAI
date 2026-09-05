import React, { useEffect, useState } from 'react';
import { Play, Pause, Plus, Minus, SkipForward, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/timerSound';

export default function RestTimerOverlay({ isOpen, secondsLeft, setSecondsLeft, onSkip, nextInfo }) {
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (!isOpen || isPaused || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (soundEnabled) soundManager.playCompletionChime();
          onSkip(); // finish timer
          return 0;
        }
        if (prev <= 4 && prev > 1 && soundEnabled) {
          soundManager.playBeep(880, 0.1);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, secondsLeft, soundEnabled, onSkip, setSecondsLeft]);

  if (!isOpen || secondsLeft <= 0) return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const addTime = (secs) => {
    setSecondsLeft((prev) => Math.max(0, prev + secs));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm w-full px-4">
      <div className="glass-panel border-cyan-500/40 rounded-3xl p-5 shadow-2xl neon-border-cyan timer-active relative overflow-hidden">
        {/* Progress Background bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">พักระหว่างเซ็ต (Resting)</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? 'เปิดเสียงเตือน' : 'ปิดเสียงเตือน'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

        {/* Big Countdown Timer Display */}
        <div className="flex items-center justify-center my-2">
          <span className="text-5xl font-black text-white tracking-tight drop-shadow-md">
            {formatTime(secondsLeft)}
          </span>
        </div>

        {/* Next Set Preview */}
        {nextInfo && (
          <div className="bg-slate-900/80 rounded-xl p-2.5 mb-4 text-center border border-slate-800">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">เซ็ตถัดไป:</div>
            <div className="text-xs font-bold text-slate-200 truncate">{nextInfo}</div>
          </div>
        )}

        {/* Quick Add/Sub Timer Controls */}
        <div className="flex items-center justify-between space-x-2 mb-3">
          <button
            onClick={() => addTime(-10)}
            className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 flex items-center justify-center space-x-1"
          >
            <Minus className="w-3 h-3" />
            <span>10s</span>
          </button>
          
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition-all border border-cyan-500/30 flex items-center justify-center space-x-1"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-cyan-400" /> : <Pause className="w-3.5 h-3.5 fill-cyan-400" />}
            <span>{isPaused ? 'เริ่มต่อ' : 'หยุดไว้'}</span>
          </button>

          <button
            onClick={() => addTime(30)}
            className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 flex items-center justify-center space-x-1"
          >
            <Plus className="w-3 h-3" />
            <span>30s</span>
          </button>
        </div>

        {/* Skip Rest Button */}
        <button
          onClick={onSkip}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-lime-400 text-slate-950 font-extrabold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 hover:brightness-110"
        >
          <SkipForward className="w-4 h-4 fill-slate-950" />
          <span>ข้ามการพัก พร้อมเล่นต่อเลย!</span>
        </button>
      </div>
    </div>
  );
}
