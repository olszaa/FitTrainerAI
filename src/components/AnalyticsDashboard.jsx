import React, { useState } from 'react';
import { BarChart3, Calendar, Flame, Dumbbell, Award, Download, Upload, Trash2, Calculator, ShieldCheck, ChevronRight } from 'lucide-react';
import { calculate1RM } from '../utils/fitnessCalculators';

export default function AnalyticsDashboard({ workoutLogs = [], onClearHistory }) {
  // 1RM calculator widget states
  const [calcWeight, setCalcWeight] = useState(80);
  const [calcReps, setCalcReps] = useState(5);

  const estimated1RM = calculate1RM(parseFloat(calcWeight) || 0, parseInt(calcReps) || 0);

  // Overall metrics
  const totalSessions = workoutLogs.length;
  const totalTonnage = workoutLogs.reduce((sum, l) => sum + (l.totalTonnageKg || 0), 0);
  const totalCalories = workoutLogs.reduce((sum, l) => sum + (l.caloriesBurned || 0), 0);
  const totalMinutes = workoutLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

  const exportDataJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workoutLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fittrainer_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="glass-panel border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Workout Performance Analytics</span>
            </div>
            <h2 className="text-2xl font-black text-white">สถิติและประวัติการฝึก (Analytics & Logs)</h2>
            <p className="text-xs text-slate-400 mt-1">
              สรุปภาพรวมจำนวนเซสชัน น้ำหนักสะสม แคลอรี และเครื่องมือคำนวณ 1RM
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportDataJSON}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>สำรองข้อมูล JSON</span>
            </button>
          </div>
        </div>

        {/* 4 Cards Stat Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <Dumbbell className="w-4 h-4 text-cyan-400" />
              <span>เซสชันทั้งหมด</span>
            </div>
            <div className="text-2xl font-black text-white">{totalSessions} <span className="text-xs font-normal text-slate-400">ครั้ง</span></div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <Flame className="w-4 h-4 text-lime-400" />
              <span>น้ำหนักสะสมรวม</span>
            </div>
            <div className="text-2xl font-black text-lime-400">{totalTonnage.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span></div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>แคลอรีที่เผาผลาญ</span>
            </div>
            <div className="text-2xl font-black text-orange-400">{totalCalories.toLocaleString()} <span className="text-xs font-normal text-slate-400">kcal</span></div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <Award className="w-4 h-4 text-purple-400" />
              <span>เวลารวมในการฝึก</span>
            </div>
            <div className="text-2xl font-black text-purple-300">{totalMinutes} <span className="text-xs font-normal text-slate-400">นาที</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Session History Logs */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>ประวัติการออกกำลังกายย้อนหลัง</span>
          </h3>

          <div className="space-y-3">
            {workoutLogs.length === 0 ? (
              <div className="glass-panel border-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400">
                ยังไม่มีประวัติการบันทึก เริ่มต้นเล่น Gym Log หรือ Home Log เพื่อสะสมประวัติ
              </div>
            ) : (
              workoutLogs.map((log) => {
                const dateStr = new Date(log.date).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={log.id} className="glass-panel border-slate-800 rounded-2xl p-4 hover:border-cyan-500/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          log.mode === 'GYM' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-lime-400/20 text-lime-300 border border-lime-400/30'
                        }`}>
                          {log.mode}
                        </span>
                        <h4 className="font-bold text-white text-sm">{log.routineName}</h4>
                      </div>
                      <span className="text-[11px] text-slate-400">{dateStr}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-slate-300 mb-3">
                      <span>⏱️ {log.durationMinutes} นาที</span>
                      <span>🔥 {log.caloriesBurned} kcal</span>
                      {log.totalTonnageKg > 0 && <span>🏋️ {log.totalTonnageKg.toLocaleString()} kg Volume</span>}
                    </div>

                    {/* Exercise items preview */}
                    <div className="flex flex-wrap gap-1.5">
                      {log.exercises.map((ex, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          {ex.exerciseName || ex.name} ({ex.sets ? ex.sets.length : 1} เซ็ต)
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Standalone 1RM Calculator Widget */}
        <div className="glass-panel border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <Calculator className="w-5 h-5" />
            <span>คำนวณ 1RM (One-Rep Max)</span>
          </div>
          <p className="text-xs text-slate-400">
            ประมาณการณ์น้ำหนักยกสูงสุดได้ 1 ครั้งอย่างปลอดภัยโดยไม่ต้องยกจริงหนักเกินไป
          </p>

          <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">น้ำหนักที่ยกได้ (kg)</label>
              <input
                type="number"
                value={calcWeight}
                onChange={(e) => setCalcWeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white font-bold rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-500 text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">จำนวนครั้งที่ยกได้ (Reps)</label>
              <input
                type="number"
                value={calcReps}
                onChange={(e) => setCalcReps(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white font-bold rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-500 text-center"
              />
            </div>

            <div className="pt-2 text-center border-t border-slate-800">
              <span className="text-xs text-slate-400">ค่า 1RM ประมาณการณ์:</span>
              <div className="text-3xl font-black text-cyan-400 mt-1">
                {estimated1RM} <span className="text-xs font-medium text-slate-400">kg</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            💡 <strong>ตารางสัดส่วนเปอร์เซ็นต์ (% 1RM):</strong>
            <ul className="mt-1 space-y-0.5">
              <li>• 90% 1RM (~{Math.round(estimated1RM * 0.9)}kg) = 3-4 Reps (เน้นความแข็งแรง)</li>
              <li>• 80% 1RM (~{Math.round(estimated1RM * 0.8)}kg) = 7-8 Reps (เน้นสร้างกล้ามเนื้อ)</li>
              <li>• 70% 1RM (~{Math.round(estimated1RM * 0.7)}kg) = 11-12 Reps (เน้นความทนทาน)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
