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
  ZoomOut,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Tag,
  HelpCircle,
  ImagePlus
} from 'lucide-react';
import { EXERCISE_DATABASE, EXERCISE_CATEGORIES, EQUIPMENT_TYPES } from '../data/exerciseDatabase';
import { getCustomExercises, saveCustomExercise, deleteCustomExercise } from '../utils/storage';

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

const PRESET_ICONS = ['🏋️‍♂️', '🏋️‍♀️', '💪', '🤸‍♂️', '🏃‍♂️', '🚴‍♂️', '🧘‍♂️', '⚡', '🔥', '🏆', '🎯', '🥊'];

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

const INITIAL_FORM_STATE = {
  nameTh: '',
  name: '',
  category: 'CHEST',
  muscle: '',
  secondaryMuscles: '',
  equipment: 'DUMBBELL',
  isGym: true,
  isHome: true,
  icon: '🏋️‍♂️',
  imageUrl: '',
  instructions: ['', '', ''],
  tips: ''
};

export default function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'CUSTOM' | EXERCISE_CATEGORIES key
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Custom Exercises State
  const [customExercises, setCustomExercises] = useState(() => getCustomExercises());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Video playback, image fit, zoom & lightbox states
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [imageFitMode, setImageFitMode] = useState('contain');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Combine standard database and custom exercises
  const combinedExercises = [...customExercises, ...EXERCISE_DATABASE];

  const filteredExercises = combinedExercises.filter((ex) => {
    const matchesSearch =
      (ex.nameTh || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.muscle || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'CUSTOM') return Boolean(ex.isCustom);
    return ex.category === selectedCategory;
  });

  const handleOpenExercise = (ex) => {
    setSelectedExercise(ex);
    setIsPlaying(true);
    setImageFitMode('contain');
    setZoomLevel(1);
    setIsLightboxOpen(false);
  };

  const handleOpenAddModal = () => {
    setFormData(INITIAL_FORM_STATE);
    setEditingExerciseId(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (ex) => {
    setFormData({
      nameTh: ex.nameTh || '',
      name: ex.name || '',
      category: ex.category || 'CHEST',
      muscle: ex.muscle || '',
      secondaryMuscles: Array.isArray(ex.secondaryMuscles) ? ex.secondaryMuscles.join(', ') : (ex.secondaryMuscles || ''),
      equipment: ex.equipment || 'DUMBBELL',
      isGym: ex.isGym !== undefined ? ex.isGym : true,
      isHome: ex.isHome !== undefined ? ex.isHome : true,
      icon: ex.icon || '🏋️‍♂️',
      imageUrl: ex.imageUrl || '',
      instructions: ex.instructions && ex.instructions.length > 0 ? [...ex.instructions] : ['', '', ''],
      tips: ex.tips || ''
    });
    setEditingExerciseId(ex.id);
    setIsAddModalOpen(true);
  };

  const handleSaveExercise = (e) => {
    e.preventDefault();

    if (!formData.nameTh.trim() && !formData.name.trim()) {
      alert('กรุณากรอกชื่อท่าฝึกอย่างน้อย 1 ภาษา (ไทย หรือ อังกฤษ)');
      return;
    }

    const secMusclesArray = formData.secondaryMuscles
      ? formData.secondaryMuscles.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const cleanedInstructions = formData.instructions
      .map((item) => item.trim())
      .filter(Boolean);

    const exerciseToSave = {
      id: editingExerciseId || `custom-ex-${Date.now()}`,
      nameTh: formData.nameTh.trim() || formData.name.trim(),
      name: formData.name.trim() || formData.nameTh.trim(),
      category: formData.category,
      muscle: formData.muscle.trim() || EXERCISE_CATEGORIES[formData.category] || 'General Muscle',
      secondaryMuscles: secMusclesArray,
      equipment: formData.equipment,
      isGym: formData.isGym,
      isHome: formData.isHome,
      icon: formData.icon || '🏋️‍♂️',
      imageUrl: formData.imageUrl.trim() || undefined,
      instructions: cleanedInstructions.length > 0 ? cleanedInstructions : ['ปฏิบัติตามฟอร์มพื้นฐานอย่างปลอดภัย'],
      tips: formData.tips.trim() || undefined,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const updated = saveCustomExercise(exerciseToSave);
    setCustomExercises(updated);
    setIsAddModalOpen(false);

    // If editing the currently open exercise detail, update it
    if (selectedExercise && selectedExercise.id === exerciseToSave.id) {
      setSelectedExercise(exerciseToSave);
    }
  };

  const handleDeleteCustomEx = (exId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('คุณต้องการลบท่าฝึกนี้ออกจากคลังใช่หรือไม่?')) {
      const updated = deleteCustomExercise(exId);
      setCustomExercises(updated);
      if (selectedExercise?.id === exId) {
        setSelectedExercise(null);
      }
    }
  };

  const handleInstructionChange = (index, value) => {
    const updated = [...formData.instructions];
    updated[index] = value;
    setFormData({ ...formData, instructions: updated });
  };

  const handleAddInstructionStep = () => {
    setFormData({ ...formData, instructions: [...formData.instructions, ''] });
  };

  const handleRemoveInstructionStep = (index) => {
    if (formData.instructions.length <= 1) return;
    const updated = formData.instructions.filter((_, idx) => idx !== index);
    setFormData({ ...formData, instructions: updated });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Search Bar & Add Button */}
      <div className="glass-panel border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>3D Anatomy & Custom Exercise Manager</span>
            </div>
            <h2 className="text-2xl font-black text-white">คลังท่าฝึก (Exercise Library)</h2>
            <p className="text-xs text-slate-400 mt-1">
              เรียนรู้ท่าฝึก 3D Anatomy หรือ <strong className="text-cyan-300">เพิ่มท่าฝึกที่ต้องการใช้งานเอง</strong> เข้าสู่ระบบ
            </p>
          </div>

          {/* Action Buttons: Add Custom Exercise & Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>เพิ่มท่าฝึกใหม่</span>
            </button>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="ค้นหาท่าฝึก เช่น Bench Press, Lat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 text-white rounded-2xl pl-10 pr-4 py-2.5 text-xs outline-none transition-colors"
              />
            </div>
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
            ทั้งหมด ({combinedExercises.length})
          </button>

          {customExercises.length > 0 && (
            <button
              onClick={() => setSelectedCategory('CUSTOM')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                selectedCategory === 'CUSTOM'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ ท่าที่สร้างเอง ({customExercises.length})</span>
            </button>
          )}

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

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExercises.map((ex) => {
          const imgSrc = ex.imageUrl || EXERCISE_IMAGE_MAP[ex.id] || '/exercises/bench_press.jpg';
          const theme = getGlowColorStyle(ex.category);
          const hasVideo = Boolean(ex.videoUrl);

          return (
            <div
              key={ex.id}
              onClick={() => handleOpenExercise(ex)}
              className="glass-panel border-slate-800 hover:border-cyan-500/50 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between shadow-xl relative"
            >
              {/* Card Poster / Image */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black flex items-center justify-center">
                {ex.imageUrl || EXERCISE_IMAGE_MAP[ex.id] ? (
                  <img
                    src={imgSrc}
                    alt={ex.nameTh || ex.name}
                    className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-[#131722] to-slate-950 p-6 text-center">
                    <span className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {ex.icon || '🏋️‍♂️'}
                    </span>
                    <span className="text-xs font-extrabold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                      Custom Exercise
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-black/30 pointer-events-none" />

                {/* Video / Eye Badge Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

                {/* Top Badges & Custom Tag */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <div className="flex items-center space-x-1.5">
                    {ex.isCustom ? (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-400/90 text-slate-950 shadow-md backdrop-blur-md flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 fill-slate-950" />
                        <span>ท่าสร้างเอง</span>
                      </span>
                    ) : (
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-md ${theme.badge}`}>
                        {ex.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-slate-200 border border-slate-700/80 backdrop-blur-md">
                      {EQUIPMENT_TYPES[ex.equipment] || ex.equipment}
                    </span>
                  </div>
                </div>

                {/* Quick Action buttons for custom exercises */}
                {ex.isCustom && (
                  <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(ex);
                      }}
                      className="p-2 rounded-xl bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-slate-700 transition-colors shadow-lg"
                      title="แก้ไขข้อมูลท่าฝึกนี้"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCustomEx(ex.id, e)}
                      className="p-2 rounded-xl bg-slate-900/90 hover:bg-red-500 hover:text-white text-slate-400 border border-slate-700 transition-colors shadow-lg"
                      title="ลบท่าฝึกนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
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
                        <span>กดดูวิดีโอ + คำแนะนำ</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>กดดูรายละเอียด + วิธีฝึก</span>
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
          <div className="col-span-full glass-panel border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-base font-bold text-white">ไม่พบข้อมูลท่าฝึกที่คุณค้นหา</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              คุณสามารถกดปุ่ม <strong className="text-cyan-300">"+ เพิ่มท่าฝึกใหม่"</strong> ด้านบน เพื่อสร้างท่าฝึกเฉพาะตัวได้ทันที
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>สร้างท่าฝึกใหม่ตอนนี้</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal 1: Add / Edit Custom Exercise Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] bg-[#131722] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingExerciseId ? 'แก้ไขข้อมูลท่าฝึก' : 'เพิ่มท่าฝึกใหม่ในคลัง'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingExerciseId ? 'ปรับปรุงคำแนะนำหรืออุปกรณ์สำหรับท่าฝึกนี้' : 'สร้างท่าฝึกแบบกำหนดเองสำหรับใช้ในระบบ บันทึกซ้อม และแผนฝึก'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveExercise} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Row 1: Thai Name & English Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    ชื่อท่าฝึก (ภาษาไทย) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นอนดันดัมเบลบนม้านั่งเอียงลง"
                    value={formData.nameTh}
                    onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    ชื่อท่าฝึก (English)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น Decline Dumbbell Bench Press"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Category & Equipment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">หมวดหมู่กล้ามเนื้อหลัก</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2.5 outline-none transition-colors cursor-pointer"
                  >
                    {Object.keys(EXERCISE_CATEGORIES).map((catKey) => (
                      <option key={catKey} value={catKey}>
                        {EXERCISE_CATEGORIES[catKey]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">อุปกรณ์ที่ใช้ฝึก</label>
                  <select
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2.5 outline-none transition-colors cursor-pointer"
                  >
                    {Object.keys(EQUIPMENT_TYPES).map((eqKey) => (
                      <option key={eqKey} value={eqKey}>
                        {EQUIPMENT_TYPES[eqKey]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Target Muscle & Secondary Muscles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">กล้ามเนื้อเป้าหมาย (Target Muscle)</label>
                  <input
                    type="text"
                    placeholder="เช่น Lower Chest, Latissimus Dorsi"
                    value={formData.muscle}
                    onChange={(e) => setFormData({ ...formData, muscle: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">กล้ามเนื้อรอง (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
                  <input
                    type="text"
                    placeholder="เช่น Triceps, Front Delts"
                    value={formData.secondaryMuscles}
                    onChange={(e) => setFormData({ ...formData, secondaryMuscles: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Row 4: Icon & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">เลือกไอคอนสัญลักษณ์</label>
                  <div className="flex items-center space-x-1.5 overflow-x-auto p-1 bg-slate-900 border border-slate-700/80 rounded-xl no-scrollbar">
                    {PRESET_ICONS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`p-2 rounded-lg text-lg transition-transform hover:scale-110 ${
                          formData.icon === emoji ? 'bg-cyan-500/20 border border-cyan-500/50' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">URL รูปภาพ (ถ้ามี)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Row 5: Training Location check */}
              <div className="flex items-center space-x-6 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-bold">สถานที่เหมาะสม:</span>
                <label className="flex items-center space-x-2 text-slate-200 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isGym}
                    onChange={(e) => setFormData({ ...formData, isGym: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-0"
                  />
                  <span>🏋️‍♂️ ยิม (Gym)</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-200 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHome}
                    onChange={(e) => setFormData({ ...formData, isHome: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-0"
                  />
                  <span>🏠 บ้าน (Home Workout)</span>
                </label>
              </div>

              {/* Step-by-Step Instructions Dynamic List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold">ขั้นตอนและเทคนิคการฝึก (Instructions)</label>
                  <button
                    type="button"
                    onClick={handleAddInstructionStep}
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มขั้นตอน</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.instructions.map((stepText, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="w-5 text-center font-bold text-slate-500">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder={`ขั้นตอนที่ ${idx + 1}...`}
                        value={stepText}
                        onChange={(e) => handleInstructionChange(idx, e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2 outline-none transition-colors"
                      />
                      {formData.instructions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInstructionStep(idx)}
                          className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                          title="ลบขั้นตอนนี้"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Tips & Advice */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">คำแนะนำโค้ช / ข้อควรระวัง (Tips)</label>
                <textarea
                  rows="2"
                  placeholder="เช่น ห้ามแอ่นหลังมากเกินไป และเกร็งหน้าท้องตลอดการยก..."
                  value={formData.tips}
                  onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 text-white rounded-xl p-3 outline-none transition-colors"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black transition-all shadow-lg shadow-cyan-500/20"
                >
                  {editingExerciseId ? 'บันทึกการแก้ไข' : 'สร้างและบันทึกท่าฝึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Interactive Media (Video or Image) & Complete Instructions */}
      {selectedExercise && (() => {
        const imgSrc = selectedExercise.imageUrl || EXERCISE_IMAGE_MAP[selectedExercise.id] || '/exercises/bench_press.jpg';
        const theme = getGlowColorStyle(selectedExercise.category);
        const hasVideo = Boolean(selectedExercise.videoUrl);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-2xl max-h-[94vh] sm:max-h-[92vh] overflow-y-auto bg-[#131722] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col">
              
              {/* Media Display Screen */}
              <div className="relative w-full h-[380px] sm:h-[520px] md:h-[560px] bg-slate-950 overflow-hidden flex items-center justify-center select-none">
                {hasVideo ? (
                  <video
                    src={selectedExercise.videoUrl}
                    autoPlay={isPlaying}
                    loop
                    playsInline
                    className="max-h-full max-w-full object-contain object-center"
                  />
                ) : selectedExercise.imageUrl || EXERCISE_IMAGE_MAP[selectedExercise.id] ? (
                  <div
                    onClick={() => setZoomLevel((prev) => (prev >= 2 ? 1 : Number((prev + 0.35).toFixed(2))))}
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
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-900 via-[#131722] to-slate-950 w-full h-full">
                    <span className="text-8xl mb-4 animate-bounce">{selectedExercise.icon || '🏋️‍♂️'}</span>
                    <span className="text-sm font-bold text-cyan-400 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">
                      {selectedExercise.nameTh || selectedExercise.name}
                    </span>
                  </div>
                )}

                {/* Cinematic Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                {hasVideo && isPlaying && (
                  <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanline opacity-75 pointer-events-none" />
                )}

                {/* Top Overlay Badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                  <div className="flex items-center space-x-2">
                    {selectedExercise.isCustom ? (
                      <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-lg">
                        <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                        <span>CUSTOM EXERCISE</span>
                      </span>
                    ) : hasVideo ? (
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
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedExercise.isCustom && (
                      <button
                        onClick={() => {
                          const exToEdit = selectedExercise;
                          setSelectedExercise(null);
                          handleOpenEditModal(exToEdit);
                        }}
                        className="p-1.5 rounded-full bg-black/70 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-white/20 transition-colors shadow-lg"
                        title="แก้ไขท่าฝึกนี้"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {(selectedExercise.imageUrl || EXERCISE_IMAGE_MAP[selectedExercise.id]) && !hasVideo && (
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
                      {/* Image Controls */}
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <button
                          onClick={() => setImageFitMode(imageFitMode === 'cover' ? 'contain' : 'cover')}
                          className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-extrabold transition-all"
                          title="สลับโหมดการแสดงผล"
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

                      {(selectedExercise.imageUrl || EXERCISE_IMAGE_MAP[selectedExercise.id]) && (
                        <button
                          onClick={() => setIsLightboxOpen(true)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-extrabold transition-all shadow-md shrink-0"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline sm:inline">ดูเต็มจอ</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Modal Body: Instructions & Guidance */}
              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-black text-white">
                      {selectedExercise.nameTh || selectedExercise.name}
                    </h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${theme.badge}`}>
                      {EQUIPMENT_TYPES[selectedExercise.equipment] || selectedExercise.equipment}
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
                        กล้ามเนื้อเป้าหมาย (Target Muscle)
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
                        {Array.isArray(selectedExercise.secondaryMuscles)
                          ? selectedExercise.secondaryMuscles.join(', ')
                          : selectedExercise.secondaryMuscles}
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

                {/* Coach Tips */}
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

            {/* Lightbox for Image */}
            {isLightboxOpen && (
              <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-6 animate-fade-in select-none">
                <div className="w-full max-w-4xl flex items-center justify-between text-white py-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      FULLSCREEN VIEW
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

                <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xl text-xs">
                  <div className="text-slate-300 text-xs truncate mr-2">
                    <span className="text-slate-500">โฟกัส: </span>
                    <strong className="text-cyan-300">{selectedExercise.muscle}</strong>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.8, Number((z - 0.25).toFixed(2))))}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center justify-center text-sm border border-slate-700"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-cyan-400 min-w-[40px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center justify-center text-sm border border-slate-700"
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
