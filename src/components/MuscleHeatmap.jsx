import React, { useState } from 'react';
import {
  Activity,
  Flame,
  Shield,
  Info,
  Dumbbell,
  Cpu,
  Zap,
  Sparkles,
  Eye,
  Layers,
  HeartPulse,
  BarChart3,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';

export default function MuscleHeatmap({ workoutLogs = [] }) {
  const [selectedMuscle, setSelectedMuscle] = useState('CHEST');
  const [viewMode, setViewMode] = useState('3D'); // '3D' | 'BLUEPRINT'

  // Calculate volume per muscle group over the last 7 days
  const calculateMuscleVolume = () => {
    const volumeMap = {
      CHEST: 0,
      BACK: 0,
      SHOULDERS: 0,
      BICEPS: 0,
      TRICEPS: 0,
      LEGS: 0,
      ABS: 0,
      FULLBODY: 0,
    };

    const oneWeekAgo = Date.now() - 7 * 86400000;

    workoutLogs.forEach((log) => {
      const logDate = new Date(log.date).getTime();
      if (logDate >= oneWeekAgo) {
        log.exercises.forEach((ex) => {
          const cat = ex.category || 'CHEST';
          const completedSets = ex.sets ? ex.sets.filter((s) => s.completed).length : 0;
          if (volumeMap[cat] !== undefined) {
            volumeMap[cat] += completedSets;
          }
        });
      }
    });

    return volumeMap;
  };

  const muscleVolumes = calculateMuscleVolume();
  const totalWeeklySets = Object.values(muscleVolumes).reduce((sum, v) => sum + v, 0);

  // Helper to determine muscle glow color based on weekly sets volume
  const getMuscleColor = (categoryKey) => {
    const sets = muscleVolumes[categoryKey] || 0;
    if (sets === 0) return '#1e293b'; // slate-800
    if (sets < 5) return '#00f0ff'; // Cyan (Light focus)
    if (sets < 12) return '#ccff00'; // Lime Green (Optimal)
    return '#ff5555'; // Intense Red/Coral (High volume)
  };

  const getFatigueStatus = (sets) => {
    if (sets === 0) return { label: 'พักพร้อมลุย (Fresh)', color: 'text-slate-400', bg: 'bg-slate-800/80 border-slate-700', level: '0%' };
    if (sets < 5) return { label: 'กระตุ้นเบา (Light Stimulus)', color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30', level: '35%' };
    if (sets < 12) return { label: 'ระดับเติบโตสูงสุด (Optimal Growth)', color: 'text-lime-400', bg: 'bg-lime-500/15 border-lime-400/30', level: '75%' };
    return { label: 'กล้ามเนื้อล้าสูง (High Fatigue / Supercompensation)', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', level: '95%' };
  };

  const muscleDetails = {
    CHEST: {
      name: 'หน้าอก (Chest)',
      latin: 'Pectoralis Major & Minor',
      desc: 'กล้ามเนื้อผลักหลักของลำตัวส่วนบน ตอบสนองดีเยี่ยมกับมุมเอียงและเครื่องเคเบิล',
      sets: muscleVolumes.CHEST,
      optimalMin: 10,
      optimalMax: 16,
      hotspot: { top: '34%', left: '50%' },
      recoveryHours: 48,
    },
    SHOULDERS: {
      name: 'หัวไหล่ (Deltoids)',
      latin: 'Anterior, Lateral & Posterior Deltoids',
      desc: 'หัวไหล่ 3 มิติ (หน้า กลาง หลัง) ควบคุมความกว้างของสรีระ V-Taper',
      sets: muscleVolumes.SHOULDERS,
      optimalMin: 12,
      optimalMax: 18,
      hotspot: { top: '30%', left: '42%' },
      recoveryHours: 48,
    },
    BACK: {
      name: 'หลังและปีก (Back & Lats)',
      latin: 'Latissimus Dorsi, Rhomboids & Trapezius',
      desc: 'โครงสร้างดึงหลัก สร้างปีกกว้างและความหนาแน่นของหลังส่วนบน',
      sets: muscleVolumes.BACK,
      optimalMin: 12,
      optimalMax: 20,
      hotspot: { top: '32%', left: '58%' },
      recoveryHours: 72,
    },
    ABS: {
      name: 'แกนกลาง & หน้าท้อง (Core & Abs)',
      latin: 'Rectus Abdominis, Obliques & TVA',
      desc: 'เกราะป้องกันกระดูกสันหลัง เพิ่มพลังส่งถ่ายแรงในทุกท่า Compound',
      sets: muscleVolumes.ABS,
      optimalMin: 8,
      optimalMax: 15,
      hotspot: { top: '44%', left: '50%' },
      recoveryHours: 24,
    },
    BICEPS: {
      name: 'หน้าแขน (Biceps)',
      latin: 'Biceps Brachii & Brachialis',
      desc: 'กล้ามเนื้องอข้อศอกและหมุนข้อมือ ช่วยในการดึงทุกท่วงท่า',
      sets: muscleVolumes.BICEPS,
      optimalMin: 8,
      optimalMax: 14,
      hotspot: { top: '38%', left: '40%' },
      recoveryHours: 36,
    },
    TRICEPS: {
      name: 'หลังแขน (Triceps)',
      latin: 'Triceps Brachii (Long, Lateral, Medial)',
      desc: 'ครองสัดส่วน 60% ของท่อนแขน ช่วยล็อกข้อศอกในท่าดันทุกประเภท',
      sets: muscleVolumes.TRICEPS,
      optimalMin: 8,
      optimalMax: 14,
      hotspot: { top: '38%', left: '60%' },
      recoveryHours: 36,
    },
    LEGS: {
      name: 'ต้นขา & สะโพก (Legs & Glutes)',
      latin: 'Quadriceps, Hamstrings & Gluteus',
      desc: 'ฐานรากพลังกล้ามเนื้อมัดใหญ่ที่สุด เผาผลาญพลังงานและกระตุ้นฮอร์โมนเติบโต',
      sets: muscleVolumes.LEGS,
      optimalMin: 12,
      optimalMax: 20,
      hotspot: { top: '65%', left: '50%' },
      recoveryHours: 72,
    },
  };

  const currentInfo = muscleDetails[selectedMuscle] || muscleDetails.CHEST;
  const currentFatigue = getFatigueStatus(currentInfo.sets);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Sci-Fi HUD Top Header */}
      <div className="relative glass-panel border-cyan-500/40 rounded-3xl p-6 overflow-hidden neon-border-cyan">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 mb-1.5 font-black text-[11px] uppercase tracking-widest">
              <Cpu className="w-4 h-4 animate-pulse text-cyan-400" />
              <span>NEURAL SPORTS MEDICINE UI • 2K RESOLUTION INTERFACE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <span>แผนภูมิความเข้มข้นกล้ามเนื้อ 3D</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold uppercase">
                Sci-Fi Hologram
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              สแกนจำลองความล้าสะสม (Fatigue Levels) และปริมาณชุดเซ็ต (Weekly Sets Volume) 7 วันย้อนหลัง พร้อมระบบวิเคราะห์การฟื้นฟูของกล้ามเนื้อ
            </p>
          </div>

          {/* Sci-Fi Status Chips & View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('3D')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                  viewMode === '3D'
                    ? 'bg-gradient-to-r from-cyan-500 to-lime-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D HOLOGRAM</span>
              </button>
              <button
                onClick={() => setViewMode('BLUEPRINT')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                  viewMode === 'BLUEPRINT'
                    ? 'bg-gradient-to-r from-cyan-500 to-lime-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>BLUEPRINT (2D)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Diagnostic Bar & Color Legend */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <HeartPulse className="w-4 h-4 text-lime-400" />
              <span>ปริมาณรวมสัปดาห์นี้: <strong className="text-white font-extrabold">{totalWeeklySets} เซ็ต</strong></span>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 text-slate-400">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>สถานะสแกน: <strong className="text-cyan-400">Active Real-Time</strong></span>
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center space-x-3 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
              <span className="text-slate-400">Fresh (0)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80" />
              <span className="text-cyan-300">Light (1-4)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-sm shadow-lime-400/80" />
              <span className="text-lime-300">Optimal (5-11)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/80" />
              <span className="text-red-400">High (12+)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Center Main Interactive Display */}
        <div className="lg:col-span-8 space-y-4">
          {viewMode === '3D' ? (
            /* 3D SCI-FI ANATOMICAL MANNEQUIN HOLOGRAM VIEW */
            <div className="relative glass-panel border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl bg-black/90 group">
              {/* Sci-Fi HUD Corner Brackets */}
              <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-slate-950/80 px-3 py-1 rounded-lg border border-cyan-500/30 backdrop-blur-md">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>NEURAL ATHLETE SCANNER // 3D MANNEQUIN</span>
              </div>

              <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center space-x-2 text-[10px] font-bold text-lime-400 bg-slate-950/80 px-3 py-1 rounded-lg border border-lime-500/30 backdrop-blur-md">
                <span>RECOVERY RATE: 98.4%</span>
              </div>

              {/* The Cinematic 3D Mannequin Visual */}
              <div className="relative w-full aspect-[16/9] overflow-hidden flex items-center justify-center">
                <img
                  src="/muscle_heatmap_3d.jpg"
                  alt="3D Sci-Fi Anatomical Mannequin with Neon Muscle Heatmaps"
                  className="w-full h-full object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40 pointer-events-none" />

                {/* Holographic Hotspot Buttons Overlaid on Mannequin */}
                {Object.keys(muscleDetails).map((key) => {
                  const m = muscleDetails[key];
                  const isSelected = selectedMuscle === key;
                  const sets = m.sets;
                  const colorClass =
                    sets === 0
                      ? 'border-slate-500 text-slate-300 shadow-slate-900/50'
                      : sets < 5
                      ? 'border-cyan-400 text-cyan-300 shadow-cyan-400/50 animate-pulse'
                      : sets < 12
                      ? 'border-lime-400 text-lime-300 shadow-lime-400/50 animate-pulse'
                      : 'border-red-500 text-red-300 shadow-red-500/50 animate-bounce';

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedMuscle(key)}
                      style={{ top: m.hotspot.top, left: m.hotspot.left }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group/btn transition-all cursor-pointer ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                      }`}
                      title={m.name}
                    >
                      <div className={`relative flex items-center justify-center w-7 h-7 rounded-full bg-slate-950/90 border-2 shadow-xl backdrop-blur-md ${colorClass}`}>
                        <div className={`w-2 h-2 rounded-full ${sets === 0 ? 'bg-slate-400' : sets < 5 ? 'bg-cyan-400' : sets < 12 ? 'bg-lime-400' : 'bg-red-500'}`} />
                        {isSelected && (
                          <div className="absolute -inset-1.5 rounded-full border border-cyan-400 animate-ping pointer-events-none" />
                        )}
                      </div>
                      <span className={`absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-extrabold px-2 py-0.5 rounded-md backdrop-blur-md border transition-all ${
                        isSelected
                          ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-lg scale-105'
                          : 'bg-slate-950/80 text-slate-300 border-slate-800 group-hover/btn:border-cyan-500/50'
                      }`}>
                        {m.name.split(' ')[0]} ({m.sets})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Floating Control Bar */}
              <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-xs text-slate-300 font-semibold">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>แตะที่จุดนีออนบนหุ่น หรือเลือกจากเมนูเพื่อดูข้อมูลเชิงลึกเฉพาะส่วน</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  ACTIVE_NODE: <span className="text-cyan-400 font-bold">{selectedMuscle}</span>
                </div>
              </div>
            </div>
          ) : (
            /* 2D ANATOMICAL BLUEPRINT SVG VIEW */
            <div className="glass-panel border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center relative min-h-[440px]">
              <div className="text-xs text-slate-400 mb-6 font-semibold flex items-center space-x-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>คลิกที่ส่วนกล้ามเนื้อบนหุ่นพิมพ์เขียว (Blueprint) เพื่อเลือกดูรายละเอียด</span>
              </div>

              <div className="flex items-center justify-center space-x-12 w-full">
                {/* FRONT BODY */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-400 mb-2">ด้านหน้า (FRONT)</span>
                  <svg width="180" height="320" viewBox="0 0 200 360" className="drop-shadow-lg">
                    <circle cx="100" cy="35" r="22" fill="#334155" />
                    <path
                      d="M 60 70 Q 75 60 100 65 Q 125 60 140 70 C 155 80 155 100 150 110 L 140 105 L 140 75 L 60 75 L 60 105 L 50 110 C 45 100 45 80 60 70 Z"
                      fill={getMuscleColor('SHOULDERS')}
                      onClick={() => setSelectedMuscle('SHOULDERS')}
                      className="cursor-pointer hover:opacity-80 transition-all stroke-slate-900 stroke-2"
                    />
                    <path
                      d="M 65 75 Q 100 70 135 75 L 135 115 Q 100 125 65 115 Z"
                      fill={getMuscleColor('CHEST')}
                      onClick={() => setSelectedMuscle('CHEST')}
                      className="cursor-pointer hover:opacity-80 transition-all stroke-slate-900 stroke-2"
                    />
                    <rect
                      x="42" y="112" width="18" height="42" rx="8"
                      fill={getMuscleColor('BICEPS')}
                      onClick={() => setSelectedMuscle('BICEPS')}
                      className="cursor-pointer hover:opacity-80 transition-all stroke-slate-900 stroke-2"
                    />
                    <rect
                      x="140" y="112" width="18" height="42" rx="8"
                      fill={getMuscleColor('BICEPS')}
                      onClick={() => setSelectedMuscle('BICEPS')}
                      className="cursor-pointer hover:opacity-80 transition-all stroke-slate-900 stroke-2"
                    />
                    <path
                      d="M 68 118 Q 100 126 132 118 L 128 185 Q 100 190 72 185 Z"
                      fill={getMuscleColor('ABS')}
                      onClick={() => setSelectedMuscle('ABS')}
                      className="cursor-pointer hover:opacity-80 transition-all stroke-slate-900 stroke-2"
                    />
                    <path
                      d="M 68 190 Q 100 195 132 190 L 138 280 Q 100 285 62 280 Z"
                      fill={getMuscleColor('LEGS')}
                      onClick={() => setSelectedMuscle('LEGS')}
                      className="cursor-pointer hover:opacity-80 transition-all stroke-slate-900 stroke-2"
                    />
                    <rect x="70" y="285" width="22" height="60" rx="10" fill="#334155" />
                    <rect x="108" y="285" width="22" height="60" rx="10" fill="#334155" />
                  </svg>
                </div>

                {/* BACK BODY */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-400 mb-2">ด้านหลัง (BACK)</span>
                  <svg width="180" height="320" viewBox="0 0 200 360" className="drop-shadow-lg">
                    <circle cx="100" cy="35" r="22" fill="#334155" />
                    <path
                      d="M 62 70 Q 100 60 138 70 L 132 170 Q 100 178 68 170 Z"
                      fill={getMuscleColor('BACK')}
                      onClick={() => setSelectedMuscle('BACK')}
                      className="cursor-pointer hover:opacity-80 transition-all stroke-slate-900 stroke-2"
                    />
                    <rect
                      x="40" y="110" width="18" height="45" rx="8"
                      fill={getMuscleColor('TRICEPS')}
                      onClick={() => setSelectedMuscle('TRICEPS')}
                      className="cursor-pointer hover:opacity-80 transition-all stroke-slate-900 stroke-2"
                    />
                    <rect
                      x="142" y="110" width="18" height="45" rx="8"
                      fill={getMuscleColor('TRICEPS')}
                      onClick={() => setSelectedMuscle('TRICEPS')}
                      className="cursor-pointer hover:opacity-80 transition-all stroke-slate-900 stroke-2"
                    />
                    <path
                      d="M 68 175 Q 100 180 132 175 L 138 275 Q 100 282 62 275 Z"
                      fill={getMuscleColor('LEGS')}
                      onClick={() => setSelectedMuscle('LEGS')}
                      className="cursor-pointer hover:opacity-80 transition-all stroke-slate-900 stroke-2"
                    />
                    <rect x="70" y="280" width="22" height="65" rx="10" fill="#334155" />
                    <rect x="108" y="280" width="22" height="65" rx="10" fill="#334155" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Quick Muscle Selector Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {Object.keys(muscleDetails).map((key) => {
              const m = muscleDetails[key];
              const isSelected = selectedMuscle === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedMuscle(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {m.name.split(' ')[0]} ({m.sets})
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Selected Muscle Deep-Dive & Diagnostics */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Muscle Diagnostic Card */}
          <div className="glass-panel border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">ผลการสแกนกล้ามเนื้อ</h3>
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${currentFatigue.bg} ${currentFatigue.color}`}>
                {currentFatigue.level}
              </span>
            </div>

            {/* Muscle Title & Latin */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 mb-4">
              <div className="text-lg font-black text-white mb-0.5">{currentInfo.name}</div>
              <div className="text-xs font-mono text-cyan-400 mb-2">{currentInfo.latin}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentInfo.desc}</p>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-3 mb-4">
              {/* Sets Volume Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-400">ปริมาณเซ็ตสัปดาห์นี้:</span>
                  <span className="text-cyan-300 font-extrabold">{currentInfo.sets} เซ็ต (เป้าหมาย {currentInfo.optimalMin}-{currentInfo.optimalMax})</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-lime-400 to-red-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (currentInfo.sets / currentInfo.optimalMax) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Status & Recovery Protocol */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-400 font-bold flex items-center space-x-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ระยะเวลาฟื้นตัว</span>
                  </div>
                  <div className="font-black text-white">{currentInfo.recoveryHours} ชั่วโมง</div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-400 font-bold flex items-center space-x-1 mb-1">
                    <Activity className="w-3.5 h-3.5 text-lime-400" />
                    <span>ระดับความล้า</span>
                  </div>
                  <div className={`font-black text-xs truncate ${currentFatigue.color}`}>
                    {currentFatigue.label.split(' ')[0]}
                  </div>
                </div>
              </div>
            </div>

            {/* Trainer Recommendation */}
            <div className="bg-lime-500/10 border border-lime-400/30 rounded-2xl p-3.5 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-center space-x-1.5 text-lime-400 font-extrabold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>คำแนะนำสำหรับการฝึก (Trainer Note)</span>
              </div>
              {currentInfo.sets === 0 && 'ยังไม่มีการฝึกใน 7 วันนี้ แนะนำบรรจุในโปรแกรมฝึกรอบถัดไปเพื่อรักษาสมดุลร่างกาย'}
              {currentInfo.sets > 0 && currentInfo.sets < currentInfo.optimalMin && 'ปริมาณยังอยู่ในช่วงวอร์ม/กระตุ้น สามารถเพิ่มอีก 2-4 เซ็ตเพื่อเข้าสู่ช่วง Hypertrophy'}
              {currentInfo.sets >= currentInfo.optimalMin && currentInfo.sets <= currentInfo.optimalMax && 'ปริมาณเซ็ตอยู่ในจุดสร้างกล้ามเนื้อสูงสุด (Optimal Volume) รักษาฟอร์มและ RPE 8-9 ต่อไป!'}
              {currentInfo.sets > currentInfo.optimalMax && 'ปริมาณเซ็ตสูงมาก ควรเว้นระยะพักให้กล้ามเนื้อซ่อมแซมเต็มที่อย่างน้อย 48-72 ชม.'}
            </div>
          </div>

          {/* All Muscles Quick Volume List */}
          <div className="glass-panel border-slate-800 rounded-3xl p-5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>สถิติรวมทุกส่วน (Weekly Breakdown)</span>
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {Object.keys(muscleDetails).map((key) => {
                const item = muscleDetails[key];
                const sets = item.sets;
                const isSelected = selectedMuscle === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedMuscle(key)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-xs font-bold">{item.name.split(' ')[0]}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-lime-400"
                          style={{ width: `${Math.min(100, (sets / 16) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-cyan-400 w-8 text-right">{sets} s</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
