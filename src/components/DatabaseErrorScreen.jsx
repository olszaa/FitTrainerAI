import React from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, PhoneCall, Database } from 'lucide-react';

export default function DatabaseErrorScreen({ onRetry, errorMessage }) {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-rose-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full glass-panel border border-rose-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl bg-gradient-to-b from-[#161318] via-[#12131a] to-[#0a0c10] text-center z-10">
        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>ไม่สามารถเชื่อมต่อฐานข้อมูลได้</span>
          </h1>
          <p className="text-rose-400 font-bold text-sm sm:text-base">
            ⚠️ โปรดติดต่อ Admin เพื่อตรวจสอบระบบ
          </p>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
            ระบบทำงานผ่าน Supabase Cloud Database 100% ไม่สามารถเข้าถึงข้อมูลได้ในขณะนี้ กรุณาแจ้งผู้ดูแลระบบเพื่อตรวจสอบสถานะ Database หรือการตั้งค่า Environment Variables
          </p>
        </div>

        {/* Error Details Box (if available) */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-rose-400" />
              <span>รายละเอียดข้อผิดพลาด (Debug Info):</span>
            </div>
            <p className="text-xs text-rose-300/90 font-mono break-all line-clamp-3">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Admin Contact Box */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300 flex items-center justify-center gap-2">
          <PhoneCall className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Contact System Administrator</span>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-lime-400 hover:from-cyan-300 hover:to-lime-300 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ลองเชื่อมต่อใหม่อีกครั้ง (Retry)</span>
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 rounded-2xl font-bold text-xs text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-all"
          >
            รีเฟรชหน้าเว็บ (Reload Page)
          </button>
        </div>
      </div>
    </div>
  );
}
