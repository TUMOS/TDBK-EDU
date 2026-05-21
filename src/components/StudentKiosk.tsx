/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, LogOut, Pocket, Activity, ShieldAlert, 
  HelpCircle, ChevronLeft, CreditCard, ShoppingBag, 
  Send, ListPlus, Flame, Mail, Compass, MessageSquare, Monitor, CheckCircle, Printer, QrCode, Camera
} from 'lucide-react';
import SimulatedQRCode from './SimulatedQRCode';
import { Student, PocketMoneyTransaction, HealthSeverity, PassType } from '../types';

interface StudentKioskProps {
  students: Student[];
  onAddTransaction: (tx: Omit<PocketMoneyTransaction, 'id' | 'timestamp'>) => void;
  onAddHealthQuery: (studentId: string, symptoms: string, severity: HealthSeverity) => void;
  onAddPermissionRequest: (studentId: string, reason: string, passType: PassType) => void;
  chatMessages: any[];
}

export default function StudentKiosk({
  students,
  onAddTransaction,
  onAddHealthQuery,
  onAddPermissionRequest,
  chatMessages,
}: StudentKioskProps) {
  // Authentication states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pinBuffer, setPinBuffer] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [isAuthed, setIsAuthed] = useState<boolean>(false);

  // Kiosk view options for physical screen emulation 
  const [fullscreenKiosk, setFullscreenKiosk] = useState<boolean>(false);
  const [isSwipingCard, setIsSwipingCard] = useState<boolean>(false);
  const [kioskSensorMode, setKioskSensorMode] = useState<'rfid' | 'qr'>('rfid');
  const [isScanningQR, setIsScanningQR] = useState<boolean>(false);
  const [printedReceipt, setPrintedReceipt] = useState<{
    title: string;
    studentName: string;
    studentId: string;
    amount: number;
    type: 'Cash Withdrawal' | 'Canteen Purchase';
    ref: string;
    remaining: number;
    date: string;
    itemDesc?: string;
  } | null>(null);

  // Kiosk internal navigation
  const [activeScreen, setActiveScreen] = useState<'home' | 'wallet' | 'health' | 'permission' | 'messages'>('home');

  // Multi-form field states
  const [healSymptom, setHealSymptom] = useState('');
  const [healSeverity, setHealSeverity] = useState<HealthSeverity>('Mild');
  const [healSuccess, setHealSuccess] = useState(false);

  const [permReason, setPermReason] = useState('');
  const [permType, setPermType] = useState<PassType>('Day Out');
  const [permSuccess, setPermSuccess] = useState(false);

  const [kioskTxSuccess, setKioskTxSuccess] = useState('');

  // Auto student lock selector helper
  const handleSelectSimStudent = (st: Student) => {
    setSelectedStudent(st);
    setPinBuffer('');
    setPinError(false);
  };

  // RFID / NFC smartcard sensory reader simulation
  const handleQuickTapCard = (st: Student) => {
    if (isSwipingCard) return;
    setIsSwipingCard(true);
    setSelectedStudent(st);
    setPinBuffer('');
    setPinError(false);
    
    // Auto beep and bypass passcode entry on NFC/RFID trigger
    setTimeout(() => {
      setIsSwipingCard(false);
      setIsAuthed(true);
      setActiveScreen('home');
      // Subtle audio beep simulation if possible (benign fallback)
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } catch (err) {}
    }, 1100);
  };

  // Quick QR code scanning simulator (Admission based passport decoding)
  const handleQuickScanQR = (st: Student) => {
    if (isScanningQR) return;
    setIsScanningQR(true);
    setSelectedStudent(st);
    setPinBuffer('');
    setPinError(false);

    // Auto visual sweep and sound computerized positive beep
    setTimeout(() => {
      setIsScanningQR(false);
      setIsAuthed(true);
      setActiveScreen('home');
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (err) {}
    }, 1300);
  };

  const handleKeyPress = (num: string) => {
    if (pinBuffer.length < 4) {
      const nextBuffer = pinBuffer + num;
      setPinBuffer(nextBuffer);
      if (nextBuffer.length === 4) {
        // Evaluate PIN code
        if (selectedStudent && nextBuffer === selectedStudent.pin) {
          setIsAuthed(true);
          setActiveScreen('home');
          setPinError(false);
        } else {
          setPinError(true);
          setTimeout(() => {
            setPinBuffer('');
            setPinError(false);
          }, 1500);
        }
      }
    }
  };

  const handleDeletePress = () => {
    setPinBuffer(pinBuffer.slice(0, -1));
    setPinError(false);
  };

  const handleClearAll = () => {
    setPinBuffer('');
    setPinError(false);
  };

  const handleLockout = () => {
    setIsAuthed(false);
    setSelectedStudent(null);
    setPinBuffer('');
    setActiveScreen('home');
  };

  const handleWithdrawalMoney = (amount: number) => {
    if (!selectedStudent) return;
    if (selectedStudent.pocketMoneyBalance < amount) {
      setKioskTxSuccess('Insufficient balance on smart card.');
      setTimeout(() => setKioskTxSuccess(''), 3000);
      return;
    }

    const ref = 'KSK-WIT' + Math.floor(1000 + Math.random() * 9000);
    const remaining = selectedStudent.pocketMoneyBalance - amount;

    onAddTransaction({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      amount,
      type: 'Withdraw',
      source: 'Kiosk',
      reference: ref,
    });

    setKioskTxSuccess(`Dispensed KES ${amount} successfully.`);
    setPrintedReceipt({
      title: 'CASH DISPENSER',
      studentName: selectedStudent.name,
      studentId: selectedStudent.id,
      amount,
      type: 'Cash Withdrawal',
      ref,
      remaining,
      date: new Date().toLocaleString(),
    });
    setTimeout(() => setKioskTxSuccess(''), 4000);
  };

  const handlePurchaseSnack = (itemName: string, cost: number) => {
    if (!selectedStudent) return;
    if (selectedStudent.pocketMoneyBalance < cost) {
      setKioskTxSuccess('Canteen Purchase: Insufficient card balance.');
      setTimeout(() => setKioskTxSuccess(''), 3000);
      return;
    }

    const ref = 'KSK-PRC' + Math.floor(1000 + Math.random() * 9000);
    const remaining = selectedStudent.pocketMoneyBalance - cost;

    onAddTransaction({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      amount: cost,
      type: 'Purchase',
      source: 'Kiosk',
      reference: ref,
    });

    setKioskTxSuccess(`Canteen order successful: ${itemName} for KES ${cost}.`);
    setPrintedReceipt({
      title: 'CANTEEN ORDER TICKET',
      studentName: selectedStudent.name,
      studentId: selectedStudent.id,
      amount: cost,
      type: 'Canteen Purchase',
      ref,
      remaining,
      date: new Date().toLocaleString(),
      itemDesc: itemName,
    });
    setTimeout(() => setKioskTxSuccess(''), 4000);
  };

  const submitHealthQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !healSymptom.trim()) return;

    onAddHealthQuery(selectedStudent.id, healSymptom, healSeverity);
    setHealSymptom('');
    setHealSeverity('Mild');
    setHealSuccess(true);
    setTimeout(() => setHealSuccess(false), 3000);
  };

  const submitPermissionPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !permReason.trim()) return;

    onAddPermissionRequest(selectedStudent.id, permReason, permType);
    setPermReason('');
    setPermSuccess(true);
    setTimeout(() => setPermSuccess(false), 3000);
  };

  // Chat filter list for active student
  const myMessages = selectedStudent
    ? chatMessages.filter(m => m.recipientId === selectedStudent.id || m.recipientId === 'General-School')
    : [];

  return (
    <div id="student-kiosk" className="bg-slate-950 flex flex-col justify-center items-center p-2 sm:p-5 min-h-screen font-sans relative overflow-hidden select-none">
      
      {/* Decorative school environment background dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px]"></div>
      <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-505/5 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="text-center mb-4 max-w-xl">
        <span className="bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] uppercase tracking-widest font-mono px-3 py-1 rounded-full font-bold">
          🏫 SCHOOL STATIONARY CONSOLE
        </span>
        <h1 className="text-xl font-bold text-white tracking-tight mt-1.5 font-sans">Physical Self-Service Kiosk</h1>
        <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed mt-0.5">
          Designed specifically for phone-free students. Students interact with these stationary physical consoles placed across hallways, hostels, and canteens using NFC smart cards.
        </p>
      </div>

      {/* Main Kiosk Physical Frame */}
      <div className={`w-full bg-slate-900 border-4 border-slate-750/90 rounded-[28px] shadow-2xl relative z-10 flex flex-col min-h-[640px] overflow-hidden transition-all duration-300 ${
        fullscreenKiosk 
          ? 'max-w-5xl xl:max-w-6xl shadow-amber-500/5 border-amber-500' 
          : 'max-w-xl shadow-black/80 border-slate-800'
      }`}>
        
        {/* Kiosk Physical Frame Glossy Glass Highlight overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.015] to-white/[0.04] pointer-events-none"></div>

        {/* Kiosk Bezel Header Banner */}
        <div className="bg-[#14151e] text-slate-100 px-5 py-3 flex justify-between items-center select-none border-b border-[#212330]">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-xs font-mono">
              ST
            </div>
            <div>
              <span className="text-xs font-black tracking-widest font-mono text-white block">TDBK TERMINAL STATION</span>
              <span className="text-[9px] text-[#555bf6] font-mono tracking-wider font-bold block uppercase">Hardware Asset: HARD-KSK-15A</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="System Hardware Online"></span>
            
            {/* Screen Scale Mode Switcher */}
            <button
              onClick={() => setFullscreenKiosk(!fullscreenKiosk)}
              className="px-2.5 py-1 text-[9px] uppercase font-bold flex items-center gap-1.5 bg-slate-900 text-amber-400 border border-amber-500/30 rounded hover:bg-slate-950 transition font-mono cursor-pointer"
              title="Change simulation frame viewport size"
            >
              <Monitor className="h-3 w-3 text-amber-500" />
              {fullscreenKiosk ? 'Widescreen [X]' : 'Compact Frame'}
            </button>
          </div>
        </div>

        {/* AUTHENTICATION SCREEN */}
        {!isAuthed ? (
          <div className="flex-1 flex flex-col lg:flex-row p-5 gap-6 items-stretch bg-slate-900">
            
            {/* Simulation Accounts Panel */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 text-[9px] rounded font-mono font-bold">
                    {kioskSensorMode === 'rfid' ? 'RFID DECODER' : 'QR DEPOSIT SCANNER'}
                  </span>
                  <p className="text-[10px] text-amber-400 font-mono tracking-widest uppercase">Student Database</p>
                </div>
                <h2 className="text-base font-bold text-slate-100 leading-tight">
                  {kioskSensorMode === 'rfid' ? 'Touch Account to Tap Smart-Card' : 'Scan Smart-Pass (Admission QR)'}
                </h2>
                <p className="text-xs text-slate-400 leading-snug">
                  {kioskSensorMode === 'rfid' 
                    ? 'Since students do not possess phone handsets, they authenticate instantly by swiping their RFID proximity cards on the physical scanner sensor.'
                    : 'Students can present their admission-based QR code passes (printed or on a parent\'s phone) to the console scanner camera to log in instantly.'
                  }
                </p>
              </div>

              {/* Grid or List of Accounts */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {students.map((st) => {
                  const isChosen = selectedStudent?.id === st.id;
                  return (
                    <div 
                      key={st.id}
                      className={`p-2.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isChosen 
                          ? 'bg-amber-500/10 border-amber-400 text-amber-300 shadow-sm' 
                          : 'bg-slate-850/65 border-slate-800/65 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <button
                        onClick={() => handleSelectSimStudent(st)}
                        className="flex items-center gap-3 text-left flex-1"
                      >
                        <span className="text-2xl bg-slate-900/60 p-1.5 rounded-lg border border-slate-750/40">{st.avatar}</span>
                        <div>
                          <p className="font-bold text-slate-150 text-xs leading-none mb-1">{st.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">ID: {st.id} • {st.grade}</p>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <span className="text-[10px] font-mono bg-[#14151e] border border-[#212330] text-amber-500 px-1.5 py-0.5 rounded mr-1">
                          PIN: {st.pin}
                        </span>

                        {/* HIGH FIDELITY DIRECT NFC OR QR TRIGGER BUTTONS BASED ON THE CHOSEN SENSORY MODE */}
                        {kioskSensorMode === 'rfid' ? (
                          <button
                            onClick={() => handleQuickTapCard(st)}
                            disabled={isSwipingCard}
                            className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all duration-150 shadow disabled:opacity-40 cursor-pointer select-none"
                          >
                            💳 Tap Proximity Card
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickScanQR(st)}
                            disabled={isScanningQR}
                            className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all duration-150 shadow disabled:opacity-40 cursor-pointer select-none"
                          >
                            📷 Scan Admission QR
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-950/20 rounded-xl p-3 border border-slate-800/40 text-[10px] text-slate-400 flex gap-2 items-start mt-auto">
                <span className="text-xs">👋</span>
                <p>
                  <strong>RFID Proximity Pass:</strong> Click <strong className="text-amber-400">💳 Tap Proximity Card</strong> to simulate swiping physical smart badges onto the computer reader to instantly login and bypass password prompts!
                </p>
              </div>
            </div>

            {/* Virtual physical sensory layout side panel */}
            <div className="w-full lg:w-[240px] shrink-0 flex flex-col justify-between gap-4 bg-slate-850 border border-slate-800 rounded-2xl p-4">
              
              {/* SENSORY NFC / CAMERA VIEWPORT AREA */}
              <div className="bg-[#12131b] border border-slate-800 rounded-xl p-3 text-center flex flex-col gap-3">
                {/* Visual hardware mode switcher tabs */}
                <div className="grid grid-cols-2 gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-[9px] font-bold font-mono">
                  <button
                    type="button"
                    onClick={() => setKioskSensorMode('rfid')}
                    className={`py-1 rounded-sm flex items-center justify-center gap-1 transition-all duration-150 ${
                      kioskSensorMode === 'rfid' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5" /> RFID
                  </button>
                  <button
                    type="button"
                    onClick={() => setKioskSensorMode('qr')}
                    className={`py-1 rounded-sm flex items-center justify-center gap-1 transition-all duration-150 ${
                      kioskSensorMode === 'qr' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="h-3.5 w-3.5" /> QR Scan
                  </button>
                </div>

                {kioskSensorMode === 'rfid' ? (
                  <div className="space-y-2">
                    <span className="text-[8.5px] text-[#555bf6] font-bold tracking-widest font-mono block">RFID TOUCH-SENSING AREA</span>
                    
                    <button
                      type="button"
                      onClick={() => selectedStudent && handleQuickTapCard(selectedStudent)}
                      disabled={!selectedStudent || isSwipingCard}
                      className={`w-full h-20 bg-slate-900 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 relative overflow-hidden transition-all duration-200 text-center ${
                        isSwipingCard 
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-emerald-500/5' 
                          : selectedStudent 
                            ? 'border-amber-400 bg-amber-500/[0.02] hover:border-amber-300 cursor-pointer' 
                            : 'border-slate-800 bg-slate-900/50 cursor-not-allowed'
                      }`}
                    >
                      {isSwipingCard ? (
                        <>
                          <div className="absolute inset-0 bg-emerald-400/10 animate-pulse"></div>
                          <span className="text-xl animate-bounce">⚡</span>
                          <span className="text-[9px] text-emerald-400 font-mono tracking-wider font-bold">RFID ACTIVE</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className={`h-5 w-5 transition-colors ${selectedStudent ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
                          <span className={`text-[8px] font-mono tracking-wide ${selectedStudent ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                            {selectedStudent ? 'TAP TO LOG IN' : 'PROXIMITY READY'}
                          </span>
                        </>
                      )}
                    </button>
                    
                    <p className="text-[9px] text-slate-500 leading-normal">
                      {selectedStudent ? `Proximity RFID channel listening for ${selectedStudent.name}.` : 'Please select a student profile left first.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-[8.5px] text-emerald-400 font-bold tracking-widest font-mono block">CAMERA VIEWPORT SCANNER</span>
                    
                    <button
                      type="button"
                      onClick={() => selectedStudent && handleQuickScanQR(selectedStudent)}
                      disabled={!selectedStudent || isScanningQR}
                      className={`w-full h-20 bg-slate-950 border-2 rounded-xl flex flex-col items-center justify-center gap-1.5 relative overflow-hidden transition-all duration-200 text-center ${
                        isScanningQR 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : selectedStudent 
                            ? 'border-emerald-405 border-emerald-400 bg-emerald-500/[0.02] hover:border-emerald-300 cursor-pointer' 
                            : 'border-slate-800 bg-slate-950/50 cursor-not-allowed'
                      }`}
                    >
                      {/* Scanning visual laser sweep lines */}
                      <div className="absolute top-0 bottom-0 left-0 right-0 p-1 pointer-events-none">
                        <div className="w-full h-[1.5px] bg-emerald-400 opacity-60 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-bounce" />
                      </div>

                      {/* Viewfinder borders */}
                      <div className="absolute top-1 left-2 w-1.5 h-1.5 border-t border-l border-emerald-500/50"></div>
                      <div className="absolute top-1 right-2 w-1.5 h-1.5 border-t border-r border-emerald-500/50"></div>
                      <div className="absolute bottom-1 left-2 w-1.5 h-1.5 border-b border-l border-emerald-500/50"></div>
                      <div className="absolute bottom-1 right-2 w-1.5 h-1.5 border-b border-r border-emerald-500/50"></div>

                      {isScanningQR ? (
                        <>
                          <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
                          <span className="text-lg animate-spin">🔄</span>
                          <span className="text-[8px] text-emerald-400 font-mono tracking-wider font-extrabold">DECODING SCAN...</span>
                        </>
                      ) : (
                        <>
                          <Camera className={`h-5 w-5 transition-colors ${selectedStudent ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
                          <span className={`text-[8px] font-mono tracking-wide ${selectedStudent ? 'text-emerald-300 font-bold' : 'text-slate-500'}`}>
                            {selectedStudent ? 'SCAN QR CODE' : 'LENS LOCKED'}
                          </span>
                        </>
                      )}
                    </button>
                    
                    <p className="text-[9px] text-slate-505 text-slate-500 leading-normal">
                      {selectedStudent ? `Awaiting simulated Admission Smart Pass index for ${selectedStudent.id}.` : 'Select student left to present QR.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Display buffer pin dots */}
              <div className="text-center border-t border-slate-850 pt-2.5">
                <p className="text-[9px] font-mono text-slate-400 mb-1">OR ENTER KEYPAD PASSWORD</p>
                <div className={`p-2.5 rounded-xl font-mono text-xs tracking-widest flex justify-center gap-2.5 ${
                  pinError ? 'bg-red-950/40 text-red-400 border border-red-900' : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}>
                  {pinError ? (
                    <span className="font-bold text-[10px] uppercase flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" /> ACCESS DENIED!
                    </span>
                  ) : (
                    [0, 1, 2, 3].map((idx) => (
                      <span key={idx} className="inline-block w-3 h-3 rounded-full border border-slate-700 flex items-center justify-center">
                        {pinBuffer[idx] ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        ) : null}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Grid 3x4 numpad */}
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num)}
                    disabled={!selectedStudent || pinBuffer.length >= 4 || isSwipingCard}
                    className="aspect-square flex items-center justify-center text-slate-100 font-bold bg-slate-800 rounded-xl hover:bg-amber-500/20 active:bg-amber-500 text-base hover:text-amber-300 active:text-slate-950 border border-slate-750 transition disabled:opacity-20 disabled:pointer-events-none"
                  >
                    {num}
                  </button>
                ))}
                
                {/* Clear (Bottom row) */}
                <button
                  onClick={handleClearAll}
                  disabled={!selectedStudent || !pinBuffer || isSwipingCard}
                  className="text-red-400 bg-slate-800/80 rounded-xl flex items-center justify-center font-bold text-[9px] active:bg-red-500 active:text-white border border-slate-750 transition disabled:opacity-20"
                >
                  CLR
                </button>
                
                <button
                  onClick={() => handleKeyPress('0')}
                  disabled={!selectedStudent || pinBuffer.length >= 4 || isSwipingCard}
                  className="aspect-square flex items-center justify-center text-slate-100 font-bold bg-slate-800 rounded-xl hover:bg-amber-500/20 active:bg-amber-400 text-base hover:text-amber-300 border border-slate-750 transition disabled:opacity-20"
                >
                  0
                </button>

                {/* Backspace */}
                <button
                  onClick={handleDeletePress}
                  disabled={!selectedStudent || !pinBuffer || isSwipingCard}
                  className="text-slate-300 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-[9px] active:bg-slate-350 active:text-slate-900 border border-slate-750 transition disabled:opacity-20"
                >
                  DEL
                </button>
              </div>

            </div>

          </div>
        ) : (
          
          /* LOGGED IN WORKSPACE */
          <div className="flex-1 flex flex-col bg-slate-900 text-white">
            
            {/* Terminal Header Profile Card */}
            <div className="bg-slate-850 px-5 py-3 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-3xl bg-slate-800 p-1 rounded-xl border border-slate-700">{selectedStudent?.avatar}</span>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white">{selectedStudent?.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] flex-wrap">
                    <span className="font-mono bg-slate-900 px-1 py-0.5 rounded border border-slate-800">{selectedStudent?.id}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold font-mono">
                      {selectedStudent?.id === 'TDBK-101' ? 'Kilimanjaro Dorm RM-04' : 
                       selectedStudent?.id === 'TDBK-102' ? 'Ruwenzori Dorm RM-10' : 
                       selectedStudent?.id === 'TDBK-103' ? 'Kilimanjaro Dorm RM-03' : 
                       selectedStudent?.id === 'TDBK-104' ? 'Mount Kenya Dorm RM-01' : 
                       selectedStudent?.id === 'TDBK-105' ? 'Elgon Dorm RM-08' : 'General dorm'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & logout */}
              <div className="flex items-center gap-2">
                <span className="bg-emerald-900/40 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  {selectedStudent?.status}
                </span>
                <button 
                  onClick={handleLockout}
                  className="p-1.5 bg-red-950/50 hover:bg-red-900 text-red-400 border border-red-900 rounded-lg transition"
                  title="Logout / Lock Kiosk"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* SCREEN VIEWPORT SWITCHER */}
            <div className="flex-1 p-4 flex flex-col">

              {activeScreen !== 'home' && (
                <button 
                  onClick={() => setActiveScreen('home')}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs font-semibold mb-3 self-start font-mono bg-slate-850 border border-slate-800 px-2.5 py-1 rounded-lg"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back to Main Menu
                </button>
              )}

              <AnimatePresence mode="wait">
                {activeScreen === 'home' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-2 gap-3 flex-1 flex flex-col justify-center"
                  >
                    {/* Wallet Item */}
                    <button 
                      onClick={() => setActiveScreen('wallet')}
                      className="aspect-video bg-slate-850 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500 rounded-2xl p-4 flex flex-col justify-between text-left transition group"
                    >
                      <div className="bg-amber-500/20 group-hover:bg-amber-500/30 text-amber-400 p-2.5 rounded-xl self-start transition-colors">
                        <Pocket className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-amber-400">Card Wallet</h4>
                        <p className="text-[10px] text-slate-400 leading-tight">Cash withdrawal limits and canteen order terminals.</p>
                      </div>
                    </button>

                    {/* Messages Box */}
                    <button 
                      onClick={() => setActiveScreen('messages')}
                      className="aspect-video bg-slate-850 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500 rounded-2xl p-4 flex flex-col justify-between text-left transition group"
                    >
                      <div className="bg-blue-500/20 group-hover:bg-blue-500/30 text-blue-400 p-2.5 rounded-xl self-start transition-colors">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-blue-400 flex items-center justify-between w-full">
                          Mailbox
                          {myMessages.length > 0 && (
                            <span className="bg-blue-500 text-slate-950 font-bold font-mono text-[9px] px-1.5 py-0.2 rounded-full">
                              {myMessages.length}
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-tight">Receive instant boarding alerts and reminders from guardians.</p>
                      </div>
                    </button>

                    {/* Sick logs Report */}
                    <button 
                      onClick={() => setActiveScreen('health')}
                      className="aspect-video bg-slate-850 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500 rounded-2xl p-4 flex flex-col justify-between text-left transition group"
                    >
                      <div className="bg-emerald-500/20 group-hover:bg-emerald-500/30 text-emerald-400 p-2.5 rounded-xl self-start transition-colors">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-emerald-400">Nurse Clinic Consult</h4>
                        <p className="text-[10px] text-slate-400 leading-tight">Lodge symptoms dynamically to Nurse Beatrice queue.</p>
                      </div>
                    </button>

                    {/* Permission Request Out */}
                    <button 
                      onClick={() => setActiveScreen('permission')}
                      className="aspect-video bg-slate-850 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500 rounded-2xl p-4 flex flex-col justify-between text-left transition group"
                    >
                      <div className="bg-purple-500/20 group-hover:bg-purple-500/30 text-purple-400 p-2.5 rounded-xl self-start transition-colors">
                        <Compass className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-purple-400">Request Gate Pass</h4>
                        <p className="text-[10px] text-slate-400 leading-tight">Apply for weekend and medical egress permission slips.</p>
                      </div>
                    </button>
                  </motion.div>
                )}

                {/* WALLET & CANTEEN MODULE */}
                {activeScreen === 'wallet' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col justify-between bg-slate-850 p-4 border border-slate-800 rounded-2xl"
                  >
                    <div className="space-y-4">
                      {/* Pocket money banner */}
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-slate-400">Smart Card Available Balance (Local MPESA Sync)</p>
                          <p className="text-3xl font-black font-mono text-amber-400">KES {selectedStudent?.pocketMoneyBalance?.toLocaleString()}</p>
                        </div>
                        <CreditCard className="text-slate-600 h-10 w-10 stroke-1" />
                      </div>

                      {kioskTxSuccess && (
                        <div className="p-2 border border-slate-700 bg-slate-900 rounded-lg text-xs font-semibold text-center text-amber-300">
                          {kioskTxSuccess}
                        </div>
                      )}

                      {/* Cash withdrawals */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Simulate Kiosk Card Cash-Out</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => handleWithdrawalMoney(50)}
                            className="bg-slate-805 border border-slate-700 hover:border-amber-400 hover:text-amber-400 p-2.5 rounded-xl font-bold font-mono transition text-sm"
                          >
                            Withdraw KES 50/-
                          </button>
                          <button 
                            onClick={() => handleWithdrawalMoney(100)}
                            className="bg-slate-850 border border-slate-700 hover:border-amber-400 hover:text-amber-400 p-2.5 rounded-xl font-bold font-mono transition text-sm"
                          >
                            Withdraw KES 100/-
                          </button>
                        </div>
                      </div>

                      {/* Store item canteen purchase */}
                      <div className="space-y-2 pt-1 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Simulate Smart Canteen Purchases</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => handlePurchaseSnack("Fresh Milk / Ndizi", 40)}
                            className="bg-slate-850 border border-slate-700 hover:bg-emerald-500/10 hover:border-emerald-500 p-2.5 rounded-xl text-left transition flex justify-between items-center"
                          >
                            <div>
                              <p className="text-xs font-bold text-gray-200">Fresh Canteen Milk</p>
                              <p className="text-[10px] text-gray-400">Local dairy packet</p>
                            </div>
                            <span className="text-xs font-bold font-mono text-emerald-400">40/-</span>
                          </button>
                          <button 
                            onClick={() => handlePurchaseSnack("Exercise Book / Biro", 60)}
                            className="bg-slate-850 border border-slate-700 hover:bg-emerald-500/10 hover:border-emerald-500 p-2.5 rounded-xl text-left transition flex justify-between items-center"
                          >
                            <div>
                              <p className="text-xs font-bold text-gray-200">A5 Exercise Book</p>
                              <p className="text-[10px] text-gray-400">Ruled school writing</p>
                            </div>
                            <span className="text-xs font-bold font-mono text-emerald-400">60/-</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* SICK BAY NURSE QUERY FORM */}
                {activeScreen === 'health' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col justify-between bg-slate-850 p-4 border border-slate-800 rounded-2xl"
                  >
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-sm flex items-center gap-1">
                          <Activity className="text-emerald-500 h-4.5 w-4.5" /> 
                          Register Sick Bay Treatment Request
                        </h3>
                        <p className="text-[10px] text-slate-400">Report headache, tooth pain, fever or injury directly to Nurse Beatrice desk registers.</p>
                      </div>

                      <form onSubmit={submitHealthQuery} className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-mono">Detail Symptoms / Location of Pain</label>
                          <input 
                            type="text"
                            required
                            value={healSymptom}
                            onChange={(e) => setHealSymptom(e.target.value)}
                            placeholder="Describe how you are feeling (e.g. sharp headache since class time)..."
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-900 focus:outline-none focus:border-emerald-500 text-slate-100"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Pain / Fever Severity Scale</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['Mild', 'Moderate', 'Severe'] as HealthSeverity[]).map((sev) => (
                              <button
                                key={sev}
                                type="button"
                                onClick={() => setHealSeverity(sev)}
                                className={`text-xs py-2 font-medium rounded-lg border transition ${
                                  healSeverity === sev 
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold' 
                                    : 'bg-slate-905 border-slate-700 text-slate-400'
                                }`}
                              >
                                {sev} Pain [Level]
                              </button>
                            ))}
                          </div>
                        </div>

                        {healSuccess && (
                          <div className="p-2 bg-emerald-900/30 border border-emerald-800 text-emerald-400 text-xs rounded-lg text-center font-bold">
                            Successfully logged in Sick Bay admissions register!
                          </div>
                        )}

                        <button 
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-xl text-white font-bold text-xs transition"
                        >
                          Report Illness / Request Nurse Check
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* PERMISSION PASS SLIP FORM */}
                {activeScreen === 'permission' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col justify-between bg-slate-850 p-4 border border-slate-800 rounded-2xl"
                  >
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-sm flex items-center gap-1.5">
                          <ListPlus className="text-purple-500 h-4.5 w-4.5" /> 
                          Egress Gate-Pass Permission Slip Request
                        </h3>
                        <p className="text-[10px] text-slate-400">Sends digital permit request to Mr. Kipkorir & Madam Mercy tablets for review.</p>
                      </div>

                      <form onSubmit={submitPermissionPass} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-mono">Reason for Gate Egress</label>
                          <input 
                            type="text"
                            required
                            value={permReason}
                            onChange={(e) => setPermReason(e.target.value)}
                            placeholder="e.g. Tooth ache hospital visit, Family wedding pick-up..."
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-900 focus:outline-none focus:border-purple-500 text-slate-100"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Egress Slip Classification</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['Day Out', 'Medical Out', 'School Leave', 'Weekend Out'] as PassType[]).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setPermType(t)}
                                className={`text-xs py-2 font-medium rounded-lg border transition ${
                                  permType === t 
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500 font-bold' 
                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {t} Egress
                              </button>
                            ))}
                          </div>
                        </div>

                        {permSuccess && (
                          <div className="p-2 bg-purple-900/35 border border-purple-800 text-purple-400 text-[11px] rounded-lg text-center font-bold">
                            Egress Permit Slips queued and pending teacher/parent confirmation!
                          </div>
                        )}

                        <button 
                          type="submit"
                          className="w-full bg-purple-600 hover:bg-purple-700 py-2.5 rounded-xl font-bold text-xs text-white transition"
                        >
                          Submit Permit Application
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* DIGITAL MAILBOX MODULE */}
                {activeScreen === 'messages' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col justify-between bg-slate-850 p-4 border border-slate-800 rounded-2xl"
                  >
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-sm flex items-center gap-1.5 text-blue-400">
                          <Mail className="h-4 w-4" /> 
                          Student Digital Bulletin Box
                        </h3>
                        <p className="text-[10px] text-slate-400">Boarding message board with guidance reminders broadcasted by parents and school principal.</p>
                      </div>

                      <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
                        {myMessages.length === 0 ? (
                          <div className="text-center py-10 text-slate-500 text-xs">
                            No active messages found for your ID card.
                          </div>
                        ) : (
                          myMessages.map((msg: any) => (
                            <div key={msg.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 relative">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] bg-slate-850 text-slate-350 border px-2 py-0.5 rounded font-mono font-bold">
                                  FROM: {msg.senderName || msg.sender}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">
                                  {new Date(msg.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-slate-200 mt-1 italic">"{msg.content}"</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
              
              {/* VIRTUAL PHYSICAL THERMAL RECEIPT DISPENSER */}
              <AnimatePresence>
                {printedReceipt && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/90 z-40 flex items-center justify-center p-3"
                  >
                    <motion.div 
                      initial={{ y: 80, scale: 0.9, rotate: -2 }}
                      animate={{ y: 0, scale: 1, rotate: 0 }}
                      exit={{ y: 80, scale: 0.9, rotate: 2 }}
                      className="w-full max-w-[320px] bg-[#fdfdfc] text-slate-900 px-5 py-6 rounded shadow-2xl relative font-mono text-xs border-b-[8px] border-dashed border-slate-350"
                      style={{
                        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), inset 0 3px 0 #f59e0b',
                        backgroundImage: 'linear-gradient(to bottom, #ffffff 97%, #e5e7eb 100%)',
                      }}
                    >
                      {/* Ticket side gear grip details */}
                      <div className="absolute top-0 bottom-0 -left-1.5 w-1 flex flex-col justify-between py-2 pointer-events-none opacity-30 select-none">
                        {Array.from({ length: 12 }).map((_, idx) => (
                          <div key={idx} className="w-1 h-2 bg-slate-600 rounded-full"></div>
                        ))}
                      </div>
                      <div className="absolute top-0 bottom-0 -right-1.5 w-1 flex flex-col justify-between py-2 pointer-events-none opacity-30 select-none">
                        {Array.from({ length: 12 }).map((_, idx) => (
                          <div key={idx} className="w-1 h-2 bg-slate-600 rounded-full"></div>
                        ))}
                      </div>

                      {/* Header details */}
                      <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
                        <div className="flex justify-center mb-1 text-slate-800">
                          <Printer className="h-5 w-5 text-amber-600" />
                        </div>
                        <h4 className="font-extrabold text-[11px] tracking-widest text-slate-950">TDBK HIGH-SCHOOL STATION</h4>
                        <p className="text-[8.5px] text-slate-500 font-mono">AUTOMATED CANTEEN DISPENSER</p>
                        <p className="text-[8px] text-slate-400 font-mono mt-0.5">DEVICE SERIAL: ST-RFID-0922X</p>
                      </div>

                      {/* Receipt Info lines */}
                      <div className="space-y-1.5 text-[10.5px] text-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-500">OP STATUS:</span>
                          <span className="font-bold text-emerald-700">APPROVED</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">REF NO:</span>
                          <span className="font-bold text-slate-950">{printedReceipt.ref}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">DATE/TIME:</span>
                          <span className="text-slate-700">{printedReceipt.date}</span>
                        </div>
                        
                        <div className="border-t border-dashed border-slate-200 my-2 pt-2"></div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">CARD HOLDER:</span>
                          <span className="font-bold text-slate-900 uppercase">{printedReceipt.studentName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">UID DECODED:</span>
                          <span className="font-semibold font-mono text-slate-950">{printedReceipt.studentId}</span>
                        </div>

                        {printedReceipt.itemDesc && (
                          <div className="bg-amber-500/5 border border-amber-500/10 p-2 rounded text-[9.5px] text-slate-800 my-2">
                            <span className="font-bold text-[8.5px] tracking-wider text-amber-800 uppercase block mb-0.5">Dispensed / Registered:</span>
                            {printedReceipt.itemDesc}
                          </div>
                        )}
                      </div>

                      {/* Cash volume panel */}
                      <div className="border-t border-b border-dashed border-slate-350 py-2.5 text-center my-3 bg-slate-50">
                        <p className="text-[9px] tracking-wider text-slate-500 font-bold uppercase">CARD VALUE CHARGED</p>
                        <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">KES {printedReceipt.amount.toLocaleString()}/-</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">No offline signature required</p>
                      </div>

                      {/* Remaining Smart Balance */}
                      <div className="space-y-1 text-slate-800 text-[10px] border-b border-dashed border-slate-200 pb-2.5 mb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500">PREV CREDIT:</span>
                          <span>KES {(printedReceipt.remaining + printedReceipt.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-950 font-bold">
                          <span>REMAINING CARD BALANCE:</span>
                          <span className="text-indigo-700">KES {printedReceipt.remaining.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Hard simulated barcode stripes */}
                      <div className="flex flex-col items-center py-1">
                        <div className="flex gap-[1px] h-8 bg-white overflow-hidden w-44">
                          {[2, 1, 3, 1, 2, 4, 1, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 4, 1, 2, 1, 3, 1].map((w, idx) => (
                            <div key={idx} className="bg-slate-900" style={{ width: `${w}px` }} />
                          ))}
                        </div>
                        <span className="text-[7.5px] tracking-[3.5px] mt-1 text-slate-500 font-mono uppercase">{printedReceipt.ref}</span>
                      </div>

                      <div className="text-center text-[8px] text-slate-400 uppercase leading-snug mt-3">
                        * THANK YOU FOR COOPERATION *<br />
                        TDBK SYSTEM GUARDIAN LINK
                      </div>

                      {/* Clear / Tear Ticket Command Bar */}
                      <button
                        onClick={() => setPrintedReceipt(null)}
                        className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-wider py-2 rounded-lg border border-slate-900 shadow transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>✄</span> Tear Receipt Slip
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
