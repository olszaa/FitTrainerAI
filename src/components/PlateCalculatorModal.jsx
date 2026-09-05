import React, { useState } from 'react';
import { X, Calculator, ShieldAlert, Check } from 'lucide-react';
import { calculateBarbellPlates } from '../utils/fitnessCalculators';

export default function PlateCalculatorModal({ isOpen, onClose, initialWeight = 60 }) {
  const [targetWeight, setTargetWeight] = useState(initialWeight);
  const [barWeight, setBarWeight] = useState(20);

  if (!isOpen) return null;

  const result = calculateBarbellPlates(parseFloat(targetWeight) || 0, barWeight);

  const plateColors = {
    25: 'bg-red-600 border-red-400 text-white',
    20: 'bg-blue-600 border-blue-400 text-white',
    15: 'bg-yellow-500 border-yellow-300 text-slate-950',
    10: 'bg-emerald-600 border-emerald-400 text-white',
    5: 'bg-white border-slate-300 text-slate-900',
    2.5: 'bg-slate-700 border-slate-500 text-slate-200',
    1.25: 'bg-slate-800 border-slate-600 text-slate-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#131722] border border-slate-800 rounded-3xl shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">เครื่องคำนวณแผ่นบาร์เบล (Plate Calculator)</h3>
              <p className="text-xs text-slate-400">คำนวณแผ่นน้ำหนักที่ต้องใส่ฝั่งละกี่กิโลกรัม</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-1.5">น้ำหนักรวมเป้าหมาย (kg)</label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2.5 text-base font-bold text-center outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-1.5">น้ำหนักคานบาร์ (kg)</label>
            <select
              value={barWeight}
              onChange={(e) => setBarWeight(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none transition-colors"
            >
              <option value={20}>20 kg (คานโอลิมปิกมาตรฐาน)</option>
              <option value={15}>15 kg (คานโอลิมปิกหญิง)</option>
              <option value={10}>10 kg (คานซ้อมขนาดเล็ก)</option>
            </select>
          </div>
        </div>

        {/* Result Visualizer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 text-center">
          <div className="text-xs text-slate-400 mb-1">น้ำหนักแผ่นรวมแต่ละฝั่ง (Side Weight)</div>
          <div className="text-3xl font-extrabold text-cyan-400 mb-4">
            {result.sideWeight} <span className="text-sm text-slate-400 font-medium">kg / ข้าง</span>
          </div>

          {/* Barbell Visual Graphic */}
          <div className="flex items-center justify-center space-x-1 py-4 overflow-x-auto">
            {/* Left Sleeves */}
            <div className="flex items-center space-x-1 flex-row-reverse">
              {result.platesPerSide.map((weight, idx) => (
                <div
                  key={`left-${idx}`}
                  className={`flex items-center justify-center font-bold text-[10px] rounded-md border shadow-md px-1.5 transition-all ${
                    plateColors[weight] || 'bg-slate-600 text-white'
                  }`}
                  style={{ height: `${Math.min(80, 40 + weight * 1.5)}px`, width: '22px' }}
                >
                  <span className="transform -rotate-90">{weight}</span>
                </div>
              ))}
            </div>

            {/* Collar */}
            <div className="w-2 h-16 bg-slate-500 rounded" />
            {/* Center Bar */}
            <div className="h-6 px-6 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded flex items-center justify-center text-[10px] text-slate-900 font-extrabold shadow-inner">
              BAR {barWeight}kg
            </div>
            {/* Collar */}
            <div className="w-2 h-16 bg-slate-500 rounded" />

            {/* Right Sleeves */}
            <div className="flex items-center space-x-1">
              {result.platesPerSide.map((weight, idx) => (
                <div
                  key={`right-${idx}`}
                  className={`flex items-center justify-center font-bold text-[10px] rounded-md border shadow-md px-1.5 transition-all ${
                    plateColors[weight] || 'bg-slate-600 text-white'
                  }`}
                  style={{ height: `${Math.min(80, 40 + weight * 1.5)}px`, width: '22px' }}
                >
                  <span className="transform -rotate-90">{weight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plates Checklist */}
          {result.platesPerSide.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-slate-400">ใส่แผ่นข้างละ:</span>
              {result.platesPerSide.map((weight, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                  {weight} kg
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs text-amber-400 mt-2">ใช้น้ำหนักคานเปล่า {barWeight} kg โดยไม่ต้องใส่แผ่น</div>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2"
        >
          <Check className="w-4 h-4" />
          <span>เข้าใจแล้ว ลุยต่อ!</span>
        </button>
      </div>
    </div>
  );
}
