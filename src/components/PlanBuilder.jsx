import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Minus,
  Trash2,
  Dumbbell,
  Sparkles,
  Check,
  Play,
  Edit3,
  Copy,
  ChevronUp,
  ChevronDown,
  Save,
  Search,
  X,
  Clock,
  ArrowLeft,
  Flame,
  Layers,
  Filter
} from 'lucide-react';
import { WORKOUT_TEMPLATES } from '../data/workoutTemplates';
import { EXERCISE_DATABASE, EXERCISE_IMAGE_MAP } from '../data/exerciseDatabase';
import { saveCustomPlan, getCustomPlans, deleteCustomPlan } from '../utils/storage';
import { isCardioExercise } from './GymLogger';

export default function PlanBuilder({ onStartWorkoutPlan }) {
  const [customPlans, setCustomPlans] = useState(() => getCustomPlans());
  const [filterCategory, setFilterCategory] = useState('ALL'); // 'ALL' | 'CUSTOM' | 'GYM' | 'HOME'
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState('');

  // Editing state (null = not editing, object = currently editing/creating)
  const [editingPlan, setEditingPlan] = useState(null);
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exerciseCategoryFilter, setExerciseCategoryFilter] = useState('ALL');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 3500);
  };

  // 1. Copy / Duplicate any plan (Built-in or Custom)
  const handleCopyPlan = (tmpl, e) => {
    if (e) e.stopPropagation();
    const cloned = JSON.parse(JSON.stringify(tmpl));
    cloned.id = `custom-plan-${Date.now()}`;
    const baseName = tmpl.nameTh || tmpl.name;
    cloned.name = `${baseName} (คัดลอก)`;
    cloned.nameTh = `${baseName} (คัดลอก)`;
    cloned.isCustom = true;

    const updated = saveCustomPlan(cloned);
    setCustomPlans(updated);
    showNotification(`📋 คัดลอกตาราง "${cloned.nameTh}" สำเร็จแล้ว!`);
  };

  // 2. Open Edit Plan Modal
  const handleOpenEditPlan = (tmpl, e) => {
    if (e) e.stopPropagation();
    const cloned = JSON.parse(JSON.stringify(tmpl));

    // If it's a built-in template, convert to a custom plan draft
    const isBuiltIn = !tmpl.id?.startsWith('custom-');
    if (isBuiltIn) {
      cloned.id = `custom-plan-${Date.now()}`;
      cloned.name = `${tmpl.nameTh || tmpl.name} (ฉบับแก้ไข)`;
      cloned.nameTh = `${tmpl.nameTh || tmpl.name} (ฉบับแก้ไข)`;
      cloned.isCustom = true;
      cloned.wasBuiltIn = true;
    }

    // Ensure exercises have valid properties
    cloned.exercises = (cloned.exercises || []).map((ex) => {
      const full = EXERCISE_DATABASE.find(
        (e) => e.id === ex.exerciseId || e.id === ex.exerciseId?.replace('-cardio', '')
      );
      const isCardio = isCardioExercise({ category: full?.category, exerciseId: ex.exerciseId });
      return {
        ...ex,
        targetSets: Number(ex.targetSets) || (isCardio ? 8 : 3),
        targetReps: ex.targetReps || (isCardio ? '30s' : '10-12'),
        restSeconds: Number(ex.restSeconds) || (isCardio ? 15 : 30),
        defaultWeight: Number(ex.defaultWeight) || 0,
        cardioWorkSec: Number(ex.cardioWorkSec) || 30,
        cardioRestSec: Number(ex.cardioRestSec) || 15,
        cardioRounds: Number(ex.cardioRounds) || 8,
      };
    });

    setEditingPlan(cloned);
  };

  // 3. Create Brand New Plan from scratch
  const handleCreateNewPlan = () => {
    setEditingPlan({
      id: `custom-plan-${Date.now()}`,
      name: '',
      nameTh: '',
      category: 'GYM',
      description: '',
      estimatedMinutes: 45,
      targetMuscles: [],
      exercises: [],
      isCustom: true,
      isNew: true,
    });
  };

  // 4. Save Edited Plan
  const handleSaveEditedPlan = () => {
    if (!editingPlan.name?.trim()) {
      alert('กรุณาระบุชื่อตารางฝึก');
      return;
    }
    if (editingPlan.exercises.length === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 ท่าฝึกในตาราง');
      return;
    }

    const cleanedName = editingPlan.name.trim();
    const planToSave = {
      ...editingPlan,
      name: cleanedName,
      nameTh: cleanedName,
      estimatedMinutes: Math.max(15, editingPlan.exercises.length * 10),
      isCustom: true,
    };
    delete planToSave.isNew;
    delete planToSave.wasBuiltIn;

    const updated = saveCustomPlan(planToSave);
    setCustomPlans(updated);
    setEditingPlan(null);
    showNotification(`💾 บันทึกตาราง "${cleanedName}" เรียบร้อยแล้ว!`);
  };

  // 5. Delete Custom Plan
  const handleDeletePlan = (id, planName, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`ต้องการลบตารางฝึก "${planName}" ใช่หรือไม่?`)) {
      const updated = deleteCustomPlan(id);
      setCustomPlans(updated);
      showNotification('🗑️ ลบตารางฝึกเรียบร้อยแล้ว');
    }
  };

  // --- Reordering & Exercise Modifiers in Editor ---
  const handleMoveExercise = (idx, direction) => {
    if (!editingPlan) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= editingPlan.exercises.length) return;

    const updatedExercises = [...editingPlan.exercises];
    const temp = updatedExercises[idx];
    updatedExercises[idx] = updatedExercises[newIdx];
    updatedExercises[newIdx] = temp;

    setEditingPlan({ ...editingPlan, exercises: updatedExercises });
  };

  const handleRemoveExercise = (idx) => {
    if (!editingPlan) return;
    const updatedExercises = editingPlan.exercises.filter((_, i) => i !== idx);
    setEditingPlan({ ...editingPlan, exercises: updatedExercises });
  };

  const handleUpdateExerciseProp = (idx, field, value) => {
    if (!editingPlan) return;
    const updatedExercises = [...editingPlan.exercises];
    updatedExercises[idx] = {
      ...updatedExercises[idx],
      [field]: value,
    };
    setEditingPlan({ ...editingPlan, exercises: updatedExercises });
  };

  const handleAddExerciseToPlan = (ex) => {
    if (!editingPlan) return;
    const isCardio = isCardioExercise({ category: ex.category, exerciseId: ex.id });
    const newEx = {
      exerciseId: ex.id,
      targetSets: isCardio ? 8 : 3,
      targetReps: isCardio ? '30s' : '10-12',
      restSeconds: isCardio ? 15 : 30,
      defaultWeight: ex.equipment === 'BODYWEIGHT' || isCardio ? 0 : 20,
      cardioWorkSec: 30,
      cardioRestSec: 15,
      cardioRounds: 8,
    };

    setEditingPlan({
      ...editingPlan,
      exercises: [...editingPlan.exercises, newEx],
    });
    setAddExerciseModalOpen(false);
  };

  // Combined Templates: Custom First, then Built-in
  const allTemplates = [...customPlans, ...WORKOUT_TEMPLATES];

  const filteredTemplates = allTemplates.filter((tmpl) => {
    const isCustom = tmpl.id?.startsWith('custom-') || tmpl.isCustom;
    if (filterCategory === 'CUSTOM' && !isCustom) return false;
    if (filterCategory === 'GYM' && tmpl.category !== 'GYM') return false;
    if (filterCategory === 'HOME' && tmpl.category !== 'HOME') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (tmpl.nameTh || tmpl.name || '').toLowerCase().includes(q);
      const matchDesc = (tmpl.description || '').toLowerCase().includes(q);
      const matchMuscles = (tmpl.targetMuscles || []).some((m) => m.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchMuscles) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 border border-cyan-400 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce-short">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Banner */}
      <div className="glass-panel border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Custom Routine Builder & Manager</span>
          </div>
          <h2 className="text-2xl font-black text-white">จัดการตารางออกกำลังกาย (Workout Plans)</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            เลือกตารางสำเร็จรูป แก้ไขปรับแต่งตามใจชอบ บันทึกไว้ใช้ซ้ำ หรือกดคัดลอก (Copy) ตารางใดก็ได้ทันที
          </p>
        </div>

        <button
          onClick={handleCreateNewPlan}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ สร้างตารางฝึกใหม่ (Create Plan)</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
        {/* Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ทั้งหมด ({allTemplates.length})
          </button>
          <button
            onClick={() => setFilterCategory('CUSTOM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              filterCategory === 'CUSTOM'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-amber-400 hover:bg-slate-800 border border-amber-400/30'
            }`}
          >
            <span>⭐ ตารางของฉัน ({customPlans.length})</span>
          </button>
          <button
            onClick={() => setFilterCategory('GYM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              filterCategory === 'GYM'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-cyan-400 hover:bg-slate-800 border border-cyan-500/30'
            }`}
          >
            <span>🏋️‍♂️ ยิม (Gym)</span>
          </button>
          <button
            onClick={() => setFilterCategory('HOME')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              filterCategory === 'HOME'
                ? 'bg-lime-400 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-lime-400 hover:bg-slate-800 border border-lime-400/30'
            }`}
          >
            <span>🏠 ที่บ้าน (Home)</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อตาราง หรือกล้ามเนื้อ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 text-white rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none focus:border-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Routine Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredTemplates.map((tmpl) => {
          const isCustom = tmpl.id?.startsWith('custom-') || tmpl.isCustom;
          const isHome = tmpl.category === 'HOME';

          return (
            <div
              key={tmpl.id}
              className={`glass-panel rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-lg ${
                isCustom
                  ? 'border-amber-400/40 hover:border-amber-400 shadow-amber-400/5'
                  : isHome
                  ? 'border-slate-800 hover:border-lime-400/40'
                  : 'border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-1.5">
                  <div className="flex items-center space-x-1.5">
                    {isCustom ? (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        ⭐ ตารางสร้างเอง
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isHome
                            ? 'bg-lime-400/20 text-lime-300 border-lime-400/30'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        {isHome ? '🏠 บ้าน (Home)' : '🏋️‍♂️ ยิม (Gym)'}
                      </span>
                    )}

                    {tmpl.splitTag && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {tmpl.splitTag}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-semibold">{tmpl.exercises?.length || 0} ท่าฝึก</span>
                </div>

                {/* Title & Description */}
                <h4 className="text-base font-bold text-white mb-1.5 leading-snug">
                  {tmpl.nameTh || tmpl.name}
                </h4>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  {tmpl.description || 'ตารางออกกำลังกายที่กำหนดเอง'}
                </p>

                {/* Target Muscles */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {(tmpl.targetMuscles || []).map((m, idx) => (
                    <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Start, Copy, Edit, Delete */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onStartWorkoutPlan(tmpl)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>เริ่มเล่นตารางนี้</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  {/* Copy Button */}
                  <button
                    onClick={(e) => handleCopyPlan(tmpl, e)}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                    title="คัดลอกตารางนี้เพื่อสร้างตารางใหม่"
                  >
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>คัดลอก (Copy)</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={(e) => handleOpenEditPlan(tmpl, e)}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                    title="แก้ไขรายละเอียดและท่าฝึกในตารางนี้"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>แก้ไข (Edit)</span>
                  </button>

                  {/* Delete Button (Only for custom plans) */}
                  {isCustom && (
                    <button
                      onClick={(e) => handleDeletePlan(tmpl.id, tmpl.nameTh || tmpl.name, e)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                      title="ลบตารางนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* RICH PLAN EDITOR MODAL (แก้ไข/ปรับแต่งตารางฝึก + บันทึก + จัดการท่าฝึก) */}
      {/* ========================================================================= */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#131722] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 space-y-5 my-8 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {editingPlan.isNew ? '✨ สร้างตารางฝึกใหม่' : '✏️ แก้ไขตารางฝึก'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingPlan.wasBuiltIn
                      ? 'ระบบจะบันทึกเป็นตารางฝึกส่วนบุคคลให้โดยอัตโนมัติ (ไม่กระทบตารางเริ่มต้น)'
                      : 'ปรับเปลี่ยนชื่อ ท่าฝึก จำนวนเซ็ต ครั้ง น้ำหนัก และเวลาพักได้อย่างอิสระ'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingPlan(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Plan Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ชื่อโปรแกรมฝึก (Plan Name) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น อก & หลังแขน หรือ My Custom Routine"
                  value={editingPlan.name || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value, nameTh: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-cyan-500 font-bold"
                />
              </div>

              {/* Category & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">สถานที่ฝึก</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPlan({ ...editingPlan, category: 'GYM' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        editingPlan.category === 'GYM'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-black'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🏋️‍♂️ ยิม (Gym)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPlan({ ...editingPlan, category: 'HOME' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        editingPlan.category === 'HOME'
                          ? 'bg-lime-400/20 border-lime-400 text-lime-300 font-black'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🏠 บ้าน (Home)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">คำอธิบายตาราง / เป้าหมาย</label>
                  <input
                    type="text"
                    placeholder="เช่น เน้นอกบนและไหล่ข้าง / คาร์ดิโอเผาผลาญ"
                    value={editingPlan.description || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Exercises Management Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Dumbbell className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs sm:text-sm font-black text-white">
                      รายการท่าฝึกในตาราง ({editingPlan.exercises.length} ท่า)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAddExerciseModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center space-x-1.5 shadow-md active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>+ เพิ่มท่าฝึก</span>
                  </button>
                </div>

                {editingPlan.exercises.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center space-y-2 bg-slate-900/40">
                    <p className="text-xs text-slate-400">ยังไม่มีท่าฝึกในตารางนี้</p>
                    <button
                      type="button"
                      onClick={() => setAddExerciseModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30"
                    >
                      + กดเลือกท่าฝึกจากฐานข้อมูล
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {editingPlan.exercises.map((ex, idx) => {
                      const fullInfo = EXERCISE_DATABASE.find(
                        (e) => e.id === ex.exerciseId || e.id === ex.exerciseId?.replace('-cardio', '')
                      ) || {};
                      const isCardio = isCardioExercise({ category: fullInfo.category, exerciseId: ex.exerciseId });
                      const imgSrc = EXERCISE_IMAGE_MAP[ex.exerciseId] || EXERCISE_IMAGE_MAP[fullInfo.id];

                      return (
                        <div
                          key={`${ex.exerciseId}-${idx}`}
                          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 sm:p-3.5 transition-all"
                        >
                          {/* Row 1: Exercise Info + Reorder / Delete */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              {imgSrc ? (
                                <img
                                  src={imgSrc}
                                  alt={fullInfo.name || ex.exerciseId}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 font-black text-xs shrink-0">
                                  #{idx + 1}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-xs font-black text-white truncate">
                                  {idx + 1}. {fullInfo.nameTh || fullInfo.name || ex.exerciseId}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {fullInfo.name || ex.exerciseId} • {fullInfo.category || (isCardio ? 'CARDIO' : 'MUSCLE')}
                                </div>
                              </div>
                            </div>

                            {/* Reorder and Delete controls */}
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMoveExercise(idx, -1)}
                                disabled={idx === 0}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20"
                                title="เลื่อนขึ้น"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveExercise(idx, 1)}
                                disabled={idx === editingPlan.exercises.length - 1}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20"
                                title="เลื่อนลง"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveExercise(idx)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 ml-1"
                                title="ลบท่านี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Row 2: Config Parameters (Sets, Reps, Weight, Rest / Cardio) */}
                          {isCardio ? (
                            <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-[11px]">
                              <div>
                                <span className="text-slate-400 block text-[10px]">เวลาเล่น (วินาที)</span>
                                <input
                                  type="number"
                                  value={ex.cardioWorkSec || 30}
                                  onChange={(e) => handleUpdateExerciseProp(idx, 'cardioWorkSec', Number(e.target.value) || 30)}
                                  className="w-full bg-slate-900 border border-slate-700 text-lime-400 font-bold rounded-lg px-2 py-1 text-center text-xs mt-0.5"
                                />
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">เวลาพัก (วินาที)</span>
                                <input
                                  type="number"
                                  value={ex.cardioRestSec || 15}
                                  onChange={(e) => handleUpdateExerciseProp(idx, 'cardioRestSec', Number(e.target.value) || 15)}
                                  className="w-full bg-slate-900 border border-slate-700 text-cyan-300 font-bold rounded-lg px-2 py-1 text-center text-xs mt-0.5"
                                />
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">จำนวนรอบ</span>
                                <input
                                  type="number"
                                  value={ex.cardioRounds || 8}
                                  onChange={(e) => handleUpdateExerciseProp(idx, 'cardioRounds', Number(e.target.value) || 8)}
                                  className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded-lg px-2 py-1 text-center text-xs mt-0.5"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-[11px]">
                              {/* Sets */}
                              <div>
                                <span className="text-slate-400 block text-[10px]">จำนวนเซ็ต</span>
                                <div className="flex items-center space-x-1 mt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateExerciseProp(idx, 'targetSets', Math.max(1, (Number(ex.targetSets) || 3) - 1))}
                                    className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={ex.targetSets || 3}
                                    onChange={(e) => handleUpdateExerciseProp(idx, 'targetSets', Math.max(1, Number(e.target.value) || 1))}
                                    className="w-full bg-slate-900 border border-slate-700 text-white font-bold rounded px-1 py-0.5 text-center text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateExerciseProp(idx, 'targetSets', (Number(ex.targetSets) || 3) + 1)}
                                    className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Reps */}
                              <div>
                                <span className="text-slate-400 block text-[10px]">จำนวนครั้ง (Reps)</span>
                                <input
                                  type="text"
                                  placeholder="เช่น 10-12"
                                  value={ex.targetReps || '10-12'}
                                  onChange={(e) => handleUpdateExerciseProp(idx, 'targetReps', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 text-lime-400 font-bold rounded px-2 py-1 text-center text-xs mt-0.5"
                                />
                              </div>

                              {/* Default Weight */}
                              <div>
                                <span className="text-slate-400 block text-[10px]">น้ำหนักเริ่มต้น (kg)</span>
                                <div className="flex items-center space-x-1 mt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateExerciseProp(idx, 'defaultWeight', Math.max(0, (Number(ex.defaultWeight) || 0) - 2.5))}
                                    className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={ex.defaultWeight ?? 20}
                                    onChange={(e) => handleUpdateExerciseProp(idx, 'defaultWeight', Math.max(0, Number(e.target.value) || 0))}
                                    className="w-full bg-slate-900 border border-slate-700 text-cyan-300 font-bold rounded px-1 py-0.5 text-center text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateExerciseProp(idx, 'defaultWeight', (Number(ex.defaultWeight) || 0) + 2.5)}
                                    className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Rest Seconds */}
                              <div>
                                <span className="text-slate-400 block text-[10px]">เวลาพัก (วินาที)</span>
                                <select
                                  value={ex.restSeconds || 30}
                                  onChange={(e) => handleUpdateExerciseProp(idx, 'restSeconds', Number(e.target.value) || 30)}
                                  className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded px-2 py-1 text-center text-xs mt-0.5 outline-none"
                                >
                                  <option value={15}>15 วิ</option>
                                  <option value={30}>30 วิ (มาตรฐาน)</option>
                                  <option value={45}>45 วิ</option>
                                  <option value={60}>60 วิ (1 นาที)</option>
                                  <option value={90}>90 วิ (1.5 นาที)</option>
                                  <option value={120}>120 วิ (2 นาที)</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleSaveEditedPlan}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-lime-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>💾 บันทึกตารางฝึก (Save Plan)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXERCISE PICKER MODAL (ค้นหาและเลือกท่าฝึกเพิ่มเข้าตาราง) */}
      {/* ========================================================================= */}
      {addExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#131722] border border-cyan-500/40 rounded-3xl p-5 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <Dumbbell className="w-4 h-4 text-cyan-400" />
                <span>เลือกท่าฝึกเพิ่มในตาราง</span>
              </h3>
              <button
                onClick={() => setAddExerciseModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อท่าฝึกภาษาไทย หรือ อังกฤษ..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-8 pr-3 py-2 text-xs outline-none focus:border-cyan-500"
              />
            </div>

            {/* Category Filter for Exercises */}
            <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'ALL', label: 'ทั้งหมด' },
                { id: 'CHEST', label: 'อก' },
                { id: 'BACK', label: 'หลัง' },
                { id: 'SHOULDERS', label: 'ไหล่' },
                { id: 'ARMS', label: 'แขน' },
                { id: 'LEGS', label: 'ขา' },
                { id: 'ABS', label: 'หน้าท้อง' },
                { id: 'CARDIO', label: 'คาร์ดิโอ' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setExerciseCategoryFilter(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all ${
                    exerciseCategoryFilter === c.id
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-72">
              {EXERCISE_DATABASE.filter((ex) => {
                if (exerciseCategoryFilter !== 'ALL' && ex.category !== exerciseCategoryFilter) return false;
                if (exerciseSearch.trim()) {
                  const q = exerciseSearch.toLowerCase();
                  const matchName = (ex.name || '').toLowerCase().includes(q);
                  const matchNameTh = (ex.nameTh || '').toLowerCase().includes(q);
                  const matchMuscle = (ex.muscle || '').toLowerCase().includes(q);
                  if (!matchName && !matchNameTh && !matchMuscle) return false;
                }
                return true;
              }).map((ex) => {
                const imgSrc = EXERCISE_IMAGE_MAP[ex.id];
                return (
                  <div
                    key={ex.id}
                    onClick={() => handleAddExerciseToPlan(ex)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-slate-900/60 hover:bg-cyan-500/10 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={ex.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                          {ex.category?.[0] || 'EX'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {ex.nameTh || ex.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {ex.name} • {ex.category}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shrink-0">
                      + เลือก
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setAddExerciseModalOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
