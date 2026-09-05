import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Dumbbell,
  Filter,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Video,
  Layers,
  Flame,
  CheckCircle2,
  Activity,
  Award,
  Image as ImageIcon,
  Eye,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { EXERCISE_DATABASE, EXERCISE_CATEGORIES } from '../data/exerciseDatabase';

const EXERCISE_IMAGE_MAP = {
  // Push Group
  'db-bench-press': '/exercises/db_bench_press.jpg',
  'incline-barbell-press': '/exercises/incline_press.jpg',
  'tricep-pushdown': '/exercises/tricep_pushdown.jpg',
  'overhead-db-extension': '/exercises/overhead_db_extension.jpg',

  // Pull Group
  'lat-pulldown': '/exercises/lat_pulldown.jpg',
  'seated-cable-row': '/exercises/seated_cable_row.jpg',
  'chest-supported-db-row': '/exercises/chest_supported_db_row.jpg',
  'barbell-curl': '/exercises/barbell_curl.jpg',
  'db-hammer-curl': '/exercises/db_hammer_curl.jpg',

  // Shoulders & Core Group
  'seated-db-shoulder-press': '/exercises/seated_db_shoulder_press.jpg',
  'lateral-raise': '/exercises/lateral_raise.jpg',
  'front-raise': '/exercises/front_raise.jpg',
  'db-front-raise': '/exercises/front_raise.jpg',
  'rear-delt-fly': '/exercises/rear_delt_fly.jpg',
  'cable-crunch': '/exercises/cable_crunch.jpg',
  'plank': '/exercises/plank.jpg',

  // Cardio Group
  'battle-rope': '/exercises/battle_rope.jpg',
  'battle-rope-cardio': '/exercises/battle_rope.jpg',
  'cable-rowing-machine': '/exercises/cable_rowing.jpg',
  'cable-rowing-cardio': '/exercises/cable_rowing.jpg',

  // Legacy / Fallbacks
  'bench-press': '/exercises/bench_press.jpg',
  'push-ups': '/exercises/push_ups.jpg',
  'pull-ups': '/exercises/pull_ups.jpg',
  'crunches': '/exercises/cable_crunch.jpg',
};

// Muscle glow color theme helper
const getGlowColorStyle = (category) => {
  switch (category) {
    case 'CHEST':
    case 'SHOULDERS':
    case 'BICEPS':
      return {
        badge: 'bg-red-500/20 text-red-400 border-red-500/30',
        glowBg: 'from-red-600/30 via-red-500/10 to-transparent',
        dot: 'bg-red-500 shadow-red-500',
        textColor: 'text-red-400'
      };
    case 'BACK':
      return {
        badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        glowBg: 'from-orange-600/30 via-orange-500/10 to-transparent',
        dot: 'bg-orange-500 shadow-orange-500',
        textColor: 'text-orange-400'
      };
    case 'TRICEPS':
      return {
        badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        glowBg: 'from-cyan-600/30 via-cyan-500/10 to-transparent',
        dot: 'bg-cyan-500 shadow-cyan-500',
        textColor: 'text-cyan-400'
      };
    case 'ABS':
      return {
        badge: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
        glowBg: 'from-yellow-500/30 via-yellow-400/10 to-transparent',
        dot: 'bg-yellow-400 shadow-yellow-400',
        textColor: 'text-yellow-400'
      };
    default:
      return {
        badge: 'bg-lime-400/20 text-lime-300 border-lime-400/30',
        glowBg: 'from-lime-500/30 via-lime-400/10 to-transparent',
        dot: 'bg-lime-400 shadow-lime-400',
        textColor: 'text-lime-400'
      };
  }
};

export default function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Video playback, image fit, zoom & lightbox states
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [imageFitMode, setImageFitMode] = useState('contain'); // 'contain' (full-view) or 'cover' (zoomed)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const filteredExercises = EXERCISE_DATABASE.filter((ex) => {
    const matchesSearch =
      (ex.nameTh || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.muscle || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || ex.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleOpenExercise = (ex) => {
    setSelectedExercise(ex);
    setIsPlaying(true);
    setImageFitMode('contain');
    setZoomLevel(1);
    setIsLightboxOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Search Bar */}
      <div className="glass-panel border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>3D Faceless Mannequin Image & Video Library</span>
            </div>
            <h2 className="text-2xl font-black text-white">คลังท่าฝึก 3D Anatomy (รูปภาพ & วิดีโอสอน)</h2>
            <p className="text-xs text-slate-400 mt-1">
              คลิกที่รูปท่าฝึกเพื่อเปิดดู <strong className="text-cyan-300">รูปภาพโมเดล 3D กายวิภาคเรืองแสง หรือวิดีโอสอน</strong> พร้อมคำแนะนำขั้นตอนการฝึกอย่างละเอียด
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ค้นหาท่าฝึก เช่น Bench Press, Lat Pulldown..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 text-white rounded-2xl pl-10 pr-4 py-2.5 text-xs outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ทั้งหมด ({EXERCISE_DATABASE.length})
          </button>
          {Object.keys(EXERCISE_CATEGORIES).map((catKey) => {
            const label = EXERCISE_CATEGORIES[catKey];
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise Cards Grid with 3D Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExercises.map((ex) => {
          const imgSrc = EXERCISE_IMAGE_MAP[ex.id] || '/exercises/bench_press.jpg';
          const theme = getGlowColorStyle(ex.category);
          const hasVideo = Boolean(ex.videoUrl);

          return (
            <div
              key={ex.id}
              onClick={() => handleOpenExercise(ex)}
              className="glass-panel border-slate-800 hover:border-cyan-500/50 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between shadow-xl"
            >
              {/* Card 3D Visual Poster */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={imgSrc}
                  alt={ex.nameTh || ex.name}
                  className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-black/30 pointer-events-none" />

                {/* Video Play Badge or Image View Badge Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {hasVideo ? (
                    <div className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-400 transition-all shadow-xl">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-400 transition-all shadow-xl">
                      <Eye className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-md ${theme.badge}`}>
                    {ex.category}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-slate-200 border border-slate-700/80 backdrop-blur-md">
                      {ex.equipment}
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                      {hasVideo ? 'VIDEO' : 'IMAGE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-base group-hover:text-cyan-300 transition-colors mb-1 line-clamp-1">
                    {ex.nameTh || ex.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-2.5 line-clamp-1">{ex.name}</p>

                  <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-300">
                    <span className={`w-2 h-2 rounded-full ${theme.dot} animate-pulse`} />
                    <span className="truncate">{ex.muscle}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span className="flex items-center space-x-1.5">
                    {hasVideo ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-cyan-400" />
                        <span>กดดูวิดีโอ 3D + คำแนะนำ</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>กดดูรูปภาพ 3D + คำแนะนำ</span>
                      </>
                    )}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredExercises.length === 0 && (
          <div className="col-span-full glass-panel border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-base font-bold text-white">ไม่มีท่าฝึกในคลัง</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              ขณะนี้ไม่มีรายการท่าออกกำลังกายในคลังท่าฝึก
            </p>
          </div>
        )}
      </div>

      {/* Modal: Interactive Media (Video or Image) & Complete Instructions */}
      {selectedExercise && (() => {
        const imgSrc = EXERCISE_IMAGE_MAP[selectedExercise.id] || '/exercises/bench_press.jpg';
        const theme = getGlowColorStyle(selectedExercise.category);
        const hasVideo = Boolean(selectedExercise.videoUrl);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-2xl max-h-[94vh] sm:max-h-[92vh] overflow-y-auto bg-[#131722] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col">
              
              {/* Media Display Screen (Video if available, otherwise High-Res Image) */}
              <div className="relative w-full h-[380px] sm:h-[520px] md:h-[560px] bg-slate-950 overflow-hidden flex items-center justify-center select-none">
                {hasVideo ? (
                  <video
                    src={selectedExercise.videoUrl}
                    autoPlay={isPlaying}
                    loop
                    playsInline
                    className="max-h-full max-w-full object-contain object-center"
                  />
                ) : (
                  <div
                    onClick={() => {
                      // Cycle zoom level on click
                      setZoomLevel((prev) => (prev >= 2 ? 1 : Number((prev + 0.35).toFixed(2))));
                    }}
                    className="relative w-full h-full flex items-center justify-center cursor-zoom-in overflow-hidden"
                    title="คลิกที่รูปเพื่อซูมขยาย"
                  >
                    <img
                      src={imgSrc}
                      alt={selectedExercise.nameTh || selectedExercise.name}
                      style={{ transform: `scale(${zoomLevel})` }}
                      className={`transition-transform duration-300 ${
                        imageFitMode === 'cover'
                          ? 'w-full h-full object-cover object-center'
                          : 'max-h-full max-w-full object-contain object-center'
                      }`}
                    />
                  </div>
                )}

                {/* Subtle Cinematic HUD Scanner Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                {hasVideo && isPlaying && (
                  <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanline opacity-75 pointer-events-none" />
                )}

                {/* Top Overlay Badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                  <div className="flex items-center space-x-2">
                    {hasVideo ? (
                      <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600/85 backdrop-blur-md text-white text-[10px] font-black tracking-wider uppercase shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>3D VIDEO SIMULATION</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-600/85 backdrop-blur-md text-white text-[10px] font-black tracking-wider uppercase shadow-lg">
                        <ImageIcon className="w-3.5 h-3.5 text-white" />
                        <span>3D ANATOMY IMAGE</span>
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/60 text-slate-300 border border-slate-700/80 backdrop-blur-md">
                      {hasVideo ? '4K 60FPS' : '2K HIGH-RES'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!hasVideo && (
                      <button
                        onClick={() => setIsLightboxOpen(true)}
                        className="p-1.5 rounded-full bg-black/70 hover:bg-slate-800 text-cyan-300 border border-white/20 transition-colors shadow-lg"
                        title="ดูรูปภาพขนาดใหญ่เต็มจอ (Fullscreen)"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedExercise(null)}
                      className="w-8 h-8 rounded-full bg-black/70 hover:bg-slate-800 text-white flex items-center justify-center text-sm font-bold border border-white/20 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Floating Bottom Media Bar */}
                <div className="absolute bottom-3 inset-x-3 bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex items-center justify-between text-xs z-10 shadow-2xl">
                  {hasVideo ? (
                    <>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-8 h-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-all shadow-md"
                        >
                          {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
                        </button>
                        <button
                          onClick={() => {
                            setIsPlaying(false);
                            setTimeout(() => setIsPlaying(true), 100);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="เริ่มใหม่อีกรอบ"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <div className="text-[11px] text-slate-300 font-bold hidden sm:inline">
                          {isPlaying ? 'กำลังเล่นวิดีโอ 3D Anatomy' : 'หยุดชั่วคราว'}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-400 font-bold">ความเร็ว:</span>
                        {[0.5, 1, 1.5].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSpeed(s)}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-colors ${
                              speed === s ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Image Controls: Mode toggle (Cover/Fit), Zoom (+/-), Fullscreen */}
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <button
                          onClick={() => setImageFitMode(imageFitMode === 'cover' ? 'contain' : 'cover')}
                          className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-extrabold transition-all"
                          title="สลับโหมดการแสดงผล (ดูรูปเต็ม / ซูมเน้นหุ่น)"
                        >
                          {imageFitMode === 'contain' ? '🔍 ซูมเน้นหุ่น' : '📐 ดูรูปเต็มทั้งตัว'}
                        </button>

                        <div className="flex items-center space-x-1 bg-slate-900/90 rounded-xl px-2 py-0.5 border border-slate-700/80">
                          <button
                            onClick={() => setZoomLevel((z) => Math.max(0.8, Number((z - 0.25).toFixed(2))))}
                            className="text-slate-400 hover:text-white font-black px-1 text-xs"
                            title="ย่อขนาด"
                          >
                            -
                          </button>
                          <span className="text-[10px] font-mono text-cyan-400 min-w-[34px] text-center font-bold">
                            {Math.round(zoomLevel * 100)}%
                          </span>
                          <button
                            onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))}
                            className="text-slate-400 hover:text-white font-black px-1 text-xs"
                            title="ขยายขนาด"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsLightboxOpen(true)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-extrabold transition-all shadow-md shrink-0"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline sm:inline">ดูเต็มจอ</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Modal Body: Instructions & Coaching Guidance */}
              <div className="p-6 space-y-5">
                {/* Title & Metadata */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-black text-white">
                      {selectedExercise.nameTh || selectedExercise.name}
                    </h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${theme.badge}`}>
                      {selectedExercise.equipment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{selectedExercise.name}</p>
                </div>

                {/* Target Muscle Focus Box */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl">
                      🎯
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        กล้ามเนื้อเป้าหมาย (Glowing Anatomy Target)
                      </div>
                      <div className={`text-sm font-black ${theme.textColor}`}>
                        {selectedExercise.muscle}
                      </div>
                    </div>
                  </div>

                  {selectedExercise.secondaryMuscles && selectedExercise.secondaryMuscles.length > 0 && (
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">กล้ามเนื้อช่วย</div>
                      <div className="text-xs text-slate-300 font-semibold">
                        {selectedExercise.secondaryMuscles.join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Step-by-Step Instructions */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span>ขั้นตอนการปฏิบัติและจัดท่า (Step-by-Step Instructions)</span>
                  </h4>
                  <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                    {selectedExercise.instructions.map((step, idx) => (
                      <li key={idx} className="leading-relaxed pl-1">
                        <span className="text-slate-200 font-medium">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Coach Tips & Injury Prevention */}
                {selectedExercise.tips && (
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-lime-400" />
                      <span>คำแนะนำโค้ช & เทคนิคการโฟกัส (Trainer Focus Tips)</span>
                    </h4>
                    <p className="text-xs text-lime-300 font-semibold bg-lime-400/10 p-3.5 rounded-2xl border border-lime-400/20 leading-relaxed">
                      💡 {selectedExercise.tips}
                    </p>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20"
                >
                  เข้าใจขั้นตอนแล้ว ปิดหน้าต่าง
                </button>
              </div>

            </div>

            {/* Fullscreen Lightbox for 3D Image */}
            {isLightboxOpen && (
              <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-6 animate-fade-in select-none">
                {/* Lightbox Header */}
                <div className="w-full max-w-4xl flex items-center justify-between text-white py-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      3D ANATOMY 2K FULLSCREEN
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
                      {selectedExercise.nameTh || selectedExercise.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsLightboxOpen(false)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg transition-colors border border-white/20"
                  >
                    ✕
                  </button>
                </div>

                {/* Lightbox Image Stage */}
                <div
                  onClick={() => setZoomLevel((z) => (z >= 2.5 ? 1 : Number((z + 0.5).toFixed(2))))}
                  className="relative flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden cursor-zoom-in my-2"
                  title="คลิกเพื่อซูมเข้า/ออก"
                >
                  <img
                    src={imgSrc}
                    alt={selectedExercise.nameTh || selectedExercise.name}
                    style={{ transform: `scale(${zoomLevel})` }}
                    className="max-h-[78vh] sm:max-h-[82vh] w-auto max-w-full object-contain transition-transform duration-300 shadow-2xl"
                  />
                </div>

                {/* Lightbox Footer Controls */}
                <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xl text-xs">
                  <div className="text-slate-300 text-xs truncate mr-2">
                    <span className="text-slate-500">โฟกัส: </span>
                    <strong className="text-cyan-300">{selectedExercise.muscle}</strong>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.8, Number((z - 0.25).toFixed(2))))}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center justify-center text-sm border border-slate-700"
                      title="ย่อ"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-cyan-400 min-w-[40px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center justify-center text-sm border border-slate-700"
                      title="ขยาย"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 ml-1"
                    >
                      รีเซ็ต
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
