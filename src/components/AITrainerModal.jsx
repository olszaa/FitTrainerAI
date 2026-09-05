import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, Send, Sparkles, Dumbbell, Zap, HelpCircle, CheckCircle2, User, RefreshCw } from 'lucide-react';
import { AI_QUICK_QUESTIONS, AI_KNOWLEDGE_BASE } from '../data/aiPrompts';
import { getAIChatHistory, saveAIChatHistory } from '../utils/storage';

export default function AITrainerModal({ isOpen, onClose, onStartGeneratedWorkout }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'generator'

  // Generator form states
  const [goal, setGoal] = useState('MUSCLE');
  const [environment, setEnvironment] = useState('GYM');
  const [days, setDays] = useState(4);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const history = getAIChatHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            id: 'init-msg',
            sender: 'ai',
            text: 'สวัสดีครับ! ผมคือ **Coach Flex** เทรนเนอร์ AI ส่วนตัวของคุณ 💪\n\nพร้อมช่วยเหลือเรื่องจัดตารางฝึก ปรับท่าเล่น ปรับโภชนาการ หรือจัดตารางฝึกพิเศษเฉพาะตัวให้คุณเลย ถามคำถามผมมาได้เลยครับ!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend = inputText) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response with intelligent fitness logic
    setTimeout(() => {
      let responseText = '';
      const lower = textToSend.toLowerCase();

      if (lower.includes('6 วัน') || lower.includes('งดเล่นขา') || lower.includes('6-day') || lower.includes('เคเบิล')) {
        responseText = `🎯 **วิเคราะห์ตารางฝึก 6 วัน / พัก 1 วัน (งดเล่นขา เน้นช่วงบน + แกนกลางลำตัว) จาก โค้ช Flex**\n\n` +
          `ตารางนี้ออกแบบมาได้อย่างยอดเยี่ยมโดยประยุกต์ใช้ **ดัมเบล + บาร์เบล + เคตเทิลเบล + เครื่องเคเบิลอเนกประสงค์** อย่างคุ้มค่า:\n\n` +
          `• **Day 1 (Push A):** อก + หลังแขน + Battle Rope 15m\n` +
          `• **Day 2 (Pull A):** หลัง + หน้าแขน + Cable Rowing 15m\n` +
          `• **Day 3 (Shoulders & Core A):** ไหล่ + ท้อง + Battle Rope 15m\n` +
          `• **Day 4 (Push B):** อก + หลังแขน + Cable Rowing 15m\n` +
          `• **Day 5 (Pull B):** หลัง + หน้าแขน + Battle Rope 15m\n` +
          `• **Day 6 (Shoulders & Core B):** ไหล่ + ท้อง + Cable Rowing 15m\n` +
          `• **Day 7:** 💤 พักผ่อนเต็มวัน (Full Recovery)\n\n` +
          `💡 *ข้อดี:* เครื่องเคเบิลช่วยให้แรงต้านสม่ำเสมอตลอดระยะการเคลื่อนไหว และช่วยเก็บรายละเอียดกล้ามเนื้อส่วนบนได้อย่างสมบูรณ์แบบ คุณสามารถเลือกสลับเล่นทั้ง 6 วันได้ในหน้า **'Gym Log'** หรือ **'ตารางฝึก (Plans)'** ครับ!`;
      } else if (lower.includes('ตาราง') || lower.includes('push pull') || lower.includes('4-5 วัน')) {
        responseText = `🎯 **ข้อแนะนำตารางฝึก 4-5 วัน/สัปดาห์จาก โค้ช Flex**\n\n` +
          `ผมขอแนะนำระบบ **Push / Pull / Legs (PPL)** ซึ่งเป็นระบบที่มีประสิทธิภาพสูงสุดสำหรับการสร้างกล้ามเนื้อ:\n\n` +
          `• **Day 1: Push** (อก, ไหล่หน้า-ข้าง, หลังแขน) - เน้น Bench Press & Incline Dumbbell Press\n` +
          `• **Day 2: Pull** (หลัง, ปีก, หน้าแขน) - เน้น Lat Pulldown & Barbell Row\n` +
          `• **Day 3: Legs** (ขาหน้า, ก้น, ท้อง) - เน้น Barbell Squat & RDL\n` +
          `• **Day 4: พัก (Rest & Recovery)**\n` +
          `• **Day 5: Upper Body** (ส่วนบนรวม) - เน้นเก็บรายละเอียดกล้ามเนื้อ\n\n` +
          `💡 *Tip: คุณสามารถเลือกเล่นโปรแกรม PPL ที่เตรียมไว้ในหน้า 'ตารางฝึก (Plans)' ได้ทันทีครับ!*`;
      } else if (lower.includes('progressive overload') || lower.includes('bench press') || lower.includes('น้ำหนัก')) {
        responseText = `🏋️‍♂️ **เทคนิค Progressive Overload ในการเพิ่มน้ำหนัก Bench Press**\n\n` +
          `1. **กฎการเพิ่มน้ำหนัก 2.5kg**: เมื่อคุณเล่นได้ 10 reps ครบทุกเซ็ตด้วยท่าทางที่ถูกต้องในครั้งล่าสุด ให้เพิ่มน้ำหนักขึ้น 2.5 kg ในครั้งถัดไป\n` +
          `2. **พักระหว่างเซ็ต 2-3 นาที**: เพื่อให้ระบบประสาทและ ATP ฟื้นตัวเต็มที่สำหรับเซ็ตหนัก\n` +
          `3. **ใช้แรงส่งจากขา (Leg Drive)**: กดส้นเท้ากับพื้นแน่นๆ ขณะดันบาร์ขึ้น\n` +
          `4. **เกร็งสะบักหลัง (Retract Scapula)**: หนีบสะบักหลังเข้าหากันเพื่อความมั่นคงและป้องกันอาการบาดเจ็บไหล่ครับ`;
      } else if (lower.includes('ลดไขมัน') || lower.includes('บ้าน') || lower.includes('ไม่มีอุปกรณ์')) {
        responseText = `🔥 **คู่มือการลดไขมันที่บ้านโดยไม่ต้องใช้อุปกรณ์**\n\n` +
          `1. **เล่นแบบ Bodyweight HIIT**: เช่น 7-Minute Full Body (มีให้ในเมนู Home Log) เล่น 3-4 รอบต่อวัน\n` +
          `2. **ควบคุม Caloric Deficit**: ทานพลังงานให้น้อยกว่าที่ร่างกายใช้ไปประมาณ 300 - 500 kcal/วัน\n` +
          `3. **เน้นโปรตีนสูง**: ทานโปรตีน 1.8 - 2.0 กรัม ต่อน้ำหนักตัว (kg) เพื่อรักษาปริมาณกล้ามเนื้อขณะลดไขมัน\n` +
          `4. **เพิ่ม NEAT (กิจกรรมระหว่างวัน)**: เดินให้ได้ 8,000 - 10,000 ก้าวต่อวันครับ`;
      } else if (lower.includes('โปรตีน') || lower.includes('อาหาร') || lower.includes('แคล')) {
        responseText = `🥗 **คำนวณสารอาหารและโปรตีนสำหรับคุณ**\n\n` +
          `• **ปริมาณโปรตีนแนะนำ**: 1.6 - 2.2 กรัม ต่อน้ำหนักตัว 1 กิโลกรัมต่อวัน\n` +
          `  *(เช่น หากน้ำหนัก 70 kg ควรทานโปรตีน ~115 - 150 กรัม/วัน)*\n` +
          `• **แหล่งโปรตีนคุณภาพสูง**: อกไก่, ไข่ต้ม, ปลาแซลมอน/ทูน่า, เวย์โปรตีน, เต้าหู้\n` +
          `• **น้ำดื่ม**: ดื่มน้ำอย่างน้อย 3-4 ลิตรต่อวันเพื่อช่วยระบบเผาผลาญและการฟื้นฟูกล้ามเนื้อครับ`;
      } else {
        responseText = `💪 **คำแนะนำจาก Coach Flex**\n\n` +
          `ขอบคุณสำหรับคำถามครับ! สำหรับการฝึกออกกำลังกาย หัวใจสำคัญคือ **ความสม่ำเสมอ (Consistency)** และ **การฟื้นฟูร่างกาย (Recovery)**\n\n` +
          `หากคุณมีเป้าหมายเฉพาะ เช่น สร้างอกส่วนบน, เพิ่มแรงสควอท หรือจัดโภชนาการ แจ้งผมเพิ่มเติมได้เลยครับ ยินดีดูแลเสมอ!`;
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      saveAIChatHistory(finalMessages);
      setIsTyping(false);
    }, 1200);
  };

  const handleGenerateWorkout = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      onClose();
      if (onStartGeneratedWorkout) {
        onStartGeneratedWorkout({
          id: `ai-gen-${Date.now()}`,
          name: `AI Custom ${environment === 'GYM' ? 'Gym' : 'Home'} (${days} Days Split)`,
          category: environment,
          exercises: environment === 'GYM' ? ['bench-press', 'lat-pulldown', 'overhead-press', 'barbell-squat'] : ['push-ups', 'crunches', 'plank', 'jumping-jacks']
        });
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl h-[92vh] sm:h-[640px] bg-[#11141d] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#161a26] border-b border-slate-800 p-3 sm:p-4 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-400 to-lime-400 p-[2px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-lime-400 rounded-full border-2 border-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-white text-sm sm:text-base truncate">Coach Flex</h3>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                  AI
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">ที่ปรึกษาการออกกำลังกายส่วนตัว</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Mode Switcher Tabs */}
            <div className="bg-slate-900 p-0.5 sm:p-1 rounded-xl border border-slate-800 flex space-x-0.5 sm:space-x-1 text-[11px] sm:text-xs">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'chat' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                }`}
              >
                แชท
              </button>
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
                  activeTab === 'generator' ? 'bg-lime-400/20 text-lime-300 border border-lime-400/30' : 'text-slate-400'
                }`}
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>สร้างตาราง</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Chat Consultation */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
              {AI_QUICK_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSendMessage(q.prompt)}
                  className="whitespace-nowrap text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-all font-medium flex items-center space-x-1"
                >
                  <span>{q.title}</span>
                </button>
              ))}
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 font-semibold rounded-br-none shadow-md'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-lg'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    <div
                      className={`text-[9px] mt-2 text-right ${
                        msg.sender === 'user' ? 'text-cyan-950 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs text-slate-400 font-medium">Coach Flex กำลังเรียบเรียงคำตอบ...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#161a26] border-t border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="พิมพ์คำถามออกกำลังกาย เช่น 'ขอวิธีเพิ่มความกว้างของปีกหลัง'..."
                className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-cyan-500 text-white rounded-xl px-4 py-2.5 text-xs outline-none transition-colors"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md"
              >
                <Send className="w-4 h-4 fill-slate-950" />
              </button>
            </div>
          </div>
        ) : (
          /* Tab 2: Smart AI Plan Generator Wizard */
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="bg-gradient-to-r from-lime-400/10 to-cyan-500/10 border border-lime-400/30 rounded-2xl p-4">
              <div className="flex items-center space-x-2 text-lime-400 font-bold text-sm mb-1">
                <Sparkles className="w-4 h-4" />
                <span>ระบบสร้างตารางฝึกอัตโนมัติด้วย AI</span>
              </div>
              <p className="text-xs text-slate-300">
                ระบุเป้าหมาย สถานที่ และจำนวนวันที่สะดวก แล้ว AI จะออกแบบโปรแกรมฝึกเฉพาะคุณทันที
              </p>
            </div>

            {/* Goal selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">1. เป้าหมายหลักของคุณ</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGoal('MUSCLE')}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    goal === 'MUSCLE'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Dumbbell className="w-4 h-4 mb-1 text-cyan-400" />
                  <span>สร้างกล้ามเนื้อ (Hypertrophy)</span>
                </button>
                <button
                  onClick={() => setGoal('FAT_LOSS')}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    goal === 'FAT_LOSS'
                      ? 'bg-lime-400/20 border-lime-400 text-lime-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Zap className="w-4 h-4 mb-1 text-lime-400" />
                  <span>ลดไขมัน/กระชับสัดส่วน (Fat Loss)</span>
                </button>
              </div>
            </div>

            {/* Environment selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">2. สถานที่และอุปกรณ์</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setEnvironment('GYM')}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    environment === 'GYM'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>เล่นที่ยิม (Gym - Full Equipment)</span>
                </button>
                <button
                  onClick={() => setEnvironment('HOME')}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    environment === 'HOME'
                      ? 'bg-lime-400/20 border-lime-400 text-lime-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>เล่นที่บ้าน (Home - Bodyweight/Dumbbells)</span>
                </button>
              </div>
            </div>

            {/* Days per week */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">3. จำนวนวันสะดวกออกกำลังกาย / สัปดาห์</label>
              <div className="flex items-center space-x-3">
                {[3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setDays(num)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      days === num
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {num} วัน
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateWorkout}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-lime-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 hover:brightness-110"
            >
              <Sparkles className="w-5 h-5 fill-slate-950" />
              <span>ออกแบบและเริ่มเล่นตารางนี้เลย!</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
