/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, Wallet, BookOpen, HeartPulse, Send, 
  MessageCircle, ShieldAlert, ArrowUpRight, HelpCircle, 
  Check, Play, Plus, Clock, Sparkles, AlertCircle, RefreshCw, QrCode, Printer
} from 'lucide-react';
import SimulatedQRCode from './SimulatedQRCode';
import { 
  Student, AttendanceRecord, PermissionRequest, 
  HealthRecord, PocketMoneyTransaction, CbcAssessment, ChatMessage, FeePayment
} from '../types';

interface ParentAppProps {
  students: Student[];
  attendance: AttendanceRecord[];
  permissions: PermissionRequest[];
  healthRecords: HealthRecord[];
  transactions: PocketMoneyTransaction[];
  cbcAssessments: CbcAssessment[];
  chatMessages: ChatMessage[];
  onAddTransaction: (tx: Omit<PocketMoneyTransaction, 'id' | 'timestamp'>) => void;
  onAddPermissionRequest: (studentId: string, reason: string, passType: any) => void;
  onSendChatMessage: (senderId: string, content: string) => void;
  onSendDirectMessage: (sender: 'Parent' | 'Teacher' | 'Principal' | 'System', senderName: string, recipientId: string, content: string) => void;
  onMarkMessagesAsRead: (studentId: string, role: 'Parent' | 'Teacher') => void;
  typingStatus: Record<string, string>;
  onAddFeePayment?: (payment: Omit<FeePayment, 'id' | 'timestamp'>) => void;
}

export default function ParentApp({
  students,
  attendance,
  permissions,
  healthRecords,
  transactions,
  cbcAssessments,
  chatMessages,
  onAddTransaction,
  onAddPermissionRequest,
  onSendChatMessage,
  onSendDirectMessage,
  onMarkMessagesAsRead,
  typingStatus,
  onAddFeePayment,
}: ParentAppProps) {
  // Grace Gitau is our primary parent context (parent of Ethan Gitau TDBK-101)
  // But parents can "simulate" checking different parent contexts to see how different students profiles behave
  const [selectedParentId, setSelectedParentId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const studentId = params.get('studentId');
      if (studentId && students.some(s => s.id === studentId)) {
        return studentId;
      }
    }
    return 'TDBK-101';
  }); // Links by StudentID
  const currentChild = students.find(s => s.id === selectedParentId) || students[0];

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const studentId = params.get('studentId');
      if (studentId && students.some(s => s.id === studentId)) {
        return true;
      }
    }
    return false;
  });

  const [loginId, setLoginId] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = loginId.trim().toUpperCase();
    const student = students.find(s => s.id.toUpperCase() === cleanId);
    if (!student) {
      setLoginError('Admission ID not found. e.g. TDBK-101');
      return;
    }
    if (student.pin !== loginPin) {
      setLoginError('Incorrect 4-digit security PIN.');
      return;
    }
    setLoginError('');
    setSelectedParentId(student.id);
    setIsAuthenticated(true);
  };

  // Mobile App Internal Tab
  const [activeMTab, setActiveMTab] = useState<'home' | 'academics' | 'wallet' | 'chat'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('parentTab');
      if (tabParam && ['home', 'academics', 'wallet', 'chat'].includes(tabParam)) {
        return tabParam as any;
      }
    }
    return 'home';
  });

  // Sync state changes with URL parameters to enable instant address-bar bookmarking
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      let changed = false;
      if (url.searchParams.get('studentId') !== selectedParentId) {
        url.searchParams.set('studentId', selectedParentId);
        changed = true;
      }
      if (url.searchParams.get('parentTab') !== activeMTab) {
        url.searchParams.set('parentTab', activeMTab);
        changed = true;
      }
      if (changed) {
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    }
  }, [selectedParentId, activeMTab]);

  // Currently active chat target thread: 'teacher' | 'principal'
  const [activeContact, setActiveContact] = useState<'teacher' | 'principal'>('teacher');

  // Funding state
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundingLoad, setFundingLoad] = useState(false);
  const [fundingSuccess, setFundingSuccess] = useState(false);

  // Egress state
  const [parentEgressReason, setParentEgressReason] = useState('');
  const [egressSuccess, setEgressSuccess] = useState(false);

  // Passport display state (QR vs barcode)
  const [passportDisplayMode, setPassportDisplayMode] = useState<'qr' | 'barcode'>('qr');

  // Message state
  const [chatBuffer, setChatBuffer] = useState('');

  // Filtering data for CURRENT active child
  const currentChildId = currentChild.id;
  const childAttendance = attendance.find(a => a.studentId === currentChild.id);
  const childPermissions = permissions.filter(p => p.studentId === currentChild.id);
  const childHealth = healthRecords.filter(h => h.studentId === currentChild.id);
  const childCbc = cbcAssessments.filter(c => c.studentId === currentChild.id);
  const childTransactions = transactions.filter(t => t.studentId === currentChild.id);

  // Filter threads by contacts
  const teacherChats = chatMessages.filter(c => 
    (c.sender === 'Parent' && c.senderName === currentChild.parentName && c.recipientId === 'teacher-mercy') ||
    (c.sender === 'Teacher' && c.recipientId === currentChild.id)
  );

  const principalChats = chatMessages.filter(c => 
    (c.sender === 'Parent' && c.senderName === currentChild.parentName && c.recipientId !== 'teacher-mercy') ||
    (c.sender === 'Principal' && (c.recipientId === currentChild.id || c.recipientId === 'General-School')) ||
    (c.sender === 'System')
  );

  const activeThreadChats = activeContact === 'teacher' ? teacherChats : principalChats;

  // Unread badge calculation for the parent bottom bar
  const unreadChatsCount = chatMessages.filter(msg => 
    (msg.recipientId === currentChild.id || msg.recipientId === 'General-School') && 
    msg.sender !== 'Parent' && 
    !msg.isRead
  ).length;

  // Trigger automated mark-as-read when opening thread
  React.useEffect(() => {
    if (activeMTab === 'chat') {
      onMarkMessagesAsRead(currentChild.id, 'Parent');
    }
  }, [activeMTab, activeContact, currentChild.id, chatMessages.length]);

  const formatMessageTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Trigger deposit with virtual M-Pesa
  const handleMPesaDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(fundingAmount);
    if (!amount || amount <= 0) return;

    setFundingLoad(true);
    setTimeout(() => {
      onAddTransaction({
        studentId: currentChild.id,
        studentName: currentChild.name,
        amount,
        type: 'Deposit',
        source: 'M-Pesa',
        reference: 'MPX' + Math.floor(100000 + Math.random() * 900000) + 'K',
      });
      setFundingLoad(false);
      setFundingSuccess(true);
      setFundingAmount('');
      setTimeout(() => setFundingSuccess(false), 3000);
    }, 1200);
  };

  // Submit leave permit
  const handleParentEgressRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentEgressReason.trim()) return;

    onAddPermissionRequest(currentChild.id, parentEgressReason, 'Weekend Out');
    setParentEgressReason('');
    setEgressSuccess(true);
    setTimeout(() => setEgressSuccess(false), 3000);
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatBuffer.trim()) return;

    if (activeContact === 'teacher') {
      onSendDirectMessage('Parent', currentChild.parentName, 'teacher-mercy', chatBuffer);
    } else {
      onSendDirectMessage('Parent', currentChild.parentName, 'General-School', chatBuffer);
    }
    setChatBuffer('');
  };

  return (
    <div id="parent-app" className="bg-[#0a0a0c] py-10 px-2 flex flex-col items-center min-h-screen font-sans relative text-[#e2e2e2]">
      
      {/* Device wrapper and selector */}
      <div className="mb-6 bg-[#15161a] border border-[#1f1f23] p-3 rounded-2xl shadow-md text-xs flex max-sm:flex-col items-center gap-3 w-full max-w-sm">
        <span className="font-semibold text-gray-500 font-mono">Switch Parent Context:</span>
        <div className="flex gap-1.5 overflow-x-auto w-full">
          {students.map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setSelectedParentId(st.id);
                setIsAuthenticated(true);
                setActiveMTab('home');
              }}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition border break-keep whitespace-nowrap ${
                st.id === selectedParentId 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-[#1c1c21] border-[#2d2d35] text-gray-400 hover:text-white hover:bg-[#0d0d10]'
              }`}
            >
              {st.parentName} ({st.avatar})
            </button>
          ))}
        </div>
      </div>

      {/* High-Fidelity Smartphone mock container */}
      <div className="w-full max-w-[370px] aspect-[9/19] rounded-[48px] border-[12px] border-[#0d0d10] shadow-2xl bg-black p-[10px] flex flex-col outline-none relative select-none">
        
        {/* Notch container */}
        <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-32 h-4.5 bg-[#0d0d10] rounded-b-xl flex items-center justify-center gap-1.5 z-40">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-800"></span>
          <span className="h-1 w-8 rounded-full bg-slate-850"></span>
        </div>

        {/* SCREEN INNER CONTENT */}
        <div className="flex-1 bg-[#0a0a0c] rounded-[38px] flex flex-col overflow-hidden relative border border-[#1f1f23] pt-4 text-[#e2e2e2] select-none">
          
          {/* Internal Mobile Top status line */}
          <div className="px-5 pt-1.5 pb-2 flex justify-between items-center text-[10px] font-bold font-mono text-gray-500 select-none">
            <span>12:54 PM</span>
            <div className="flex items-center gap-1.5">
              <span>Safaricom 5G</span>
              <span className="p-0.5 bg-gray-800 rounded h-2.5 w-4 flex items-center"><span className="bg-emerald-500 w-2.5 h-1 rounded"></span></span>
            </div>
          </div>

          {/* MOBILE CONTENT VIEWPORT */}
          {!isAuthenticated ? (
            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col justify-center scrollbar-none">
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-950/80 border border-purple-800 rounded-full flex items-center justify-center mx-auto text-purple-400">
                    <ShieldAlert className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">Parent Secure Portal</h2>
                    <p className="text-[10px] text-gray-400 leading-normal">Authenticate using your pupil's secure details to retrieve official records</p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div className="text-left space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Pupil Admission ID</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. TDBK-101"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-[#121318] border border-[#212330] rounded-xl focus:outline-none focus:border-purple-600 text-white placeholder-gray-650 font-mono tracking-wide uppercase"
                    />
                  </div>

                  <div className="text-left space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">4-Digit Parent PIN</label>
                    <input 
                      type="password"
                      maxLength={4}
                      required
                      placeholder="••••"
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value)}
                      className="w-full text-xs p-2.5 bg-[#121318] border border-[#212330] rounded-xl focus:outline-none focus:border-purple-600 text-white placeholder-gray-650 font-mono tracking-widest text-center"
                    />
                  </div>

                  {loginError && (
                    <p className="text-[10px] text-red-500 bg-red-950/50 border border-red-900/60 rounded-lg p-2 text-center font-medium">
                      {loginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl tracking-wide transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                  >
                    Authorize Mobile App Context
                  </button>
                </form>

                <div className="border-t border-[#1a1b26] pt-3.5 text-center">
                  <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold font-mono block mb-2">Simulated Credentials (Tap to Auto-fill)</span>
                  <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-0.5 scrollbar-thin">
                    {students.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setLoginId(st.id);
                          setLoginPin(st.pin);
                          setLoginError('');
                        }}
                        className="p-1.5 bg-[#111217] hover:bg-[#191b26] border border-[#1d1f2e] rounded-lg text-left text-[9px] transition flex justify-between items-center group"
                      >
                        <span className="text-gray-400 truncate max-w-[90px] group-hover:text-white font-medium">{st.parentName}</span>
                        <span className="font-mono text-[8px] text-purple-400 shrink-0 font-bold bg-[#1d1c2b]/65 px-1 py-0.5 rounded">{st.pin}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 pb-14">
              
              {activeMTab === 'home' && (
                <div className="space-y-4">
                  {/* Header Welcome parent */}
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <p className="text-[10px] font-black tracking-widest text-purple-600 uppercase">TDBK Parent Portal</p>
                      <h2 className="text-lg font-bold text-white leading-tight">Habari, {currentChild.parentName}</h2>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAuthenticated(false);
                          setLoginId('');
                          setLoginPin('');
                        }}
                        className="text-[9px] font-mono font-bold uppercase py-0.5 px-1.5 border border-red-900 bg-red-950/20 text-red-400 hover:bg-red-950/40 rounded-lg transition"
                        title="Lock Parent Session"
                      >
                        Lock
                      </button>
                      <Sparkles className="text-amber-500 h-5 w-5 fill-amber-400" />
                    </div>
                  </div>

                {/* Tracking Kid status card */}
                <div className="bg-gradient-to-tr from-purple-750 to-indigo-800 text-white rounded-2xl p-4 shadow-sm border border-indigo-700/40 relative overflow-hidden bg-indigo-900">
                  <div className="absolute right-[-15px] bottom-[-20px] text-7xl opacity-15">{currentChild.avatar}</div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-indigo-200 font-semibold tracking-wider font-mono uppercase bg-indigo-950/40 px-2 py-0.5 rounded-full inline-block">
                        Active Pupil Profile
                      </p>
                      <h3 className="text-base font-bold mt-1.5">{currentChild.name}</h3>
                      <p className="text-xs text-indigo-100">{currentChild.grade} • Stream {currentChild.stream}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <div>
                      <span className="text-[10px] text-indigo-200 block font-mono">CAMPUS STATUS</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 bg-white text-slate-900 rounded-full mt-0.5 inline-block ${
                        currentChild.status === 'Sick Bay' ? 'text-amber-500 animate-pulse' : 
                        currentChild.status === 'In School' ? 'text-emerald-600' : 'text-indigo-600'
                      }`}>
                        {currentChild.status}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-indigo-200 block font-mono">ROLL CALL TODAY</span>
                      <span className="text-xs font-bold text-indigo-50 leading-tight">
                        {childAttendance ? childAttendance.status : 'No Check-In'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pupil Admission Smartcard / QR Gate-Pass */}
                <div className="bg-[#12131b] border border-[#212330] rounded-2xl p-4 space-y-3 shadow-md relative overflow-hidden text-slate-200">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1f1f23]">
                    <div className="flex items-center gap-1.5">
                      <QrCode className="h-4.5 w-4.5 text-blue-500 animate-pulse" />
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block font-bold">Secure Passport</span>
                        <h4 className="text-[11px] font-bold text-white">Admission Smart ID Badge</h4>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-900 text-[8px] font-bold uppercase rounded font-mono">
                      ACTIVE GATE QR
                    </span>
                  </div>

                  <div className="flex flex-col items-center py-2 bg-black/40 rounded-xl p-3 border border-[#1f1f23]">
                    <div className="text-center mb-2.5">
                      <p className="text-[11px] font-bold text-white uppercase">{currentChild.name}</p>
                      <p className="text-[9px] font-mono text-gray-405 text-gray-400">Card ID: <strong className="text-blue-400">{currentChild.id}</strong></p>
                    </div>

                    {/* DYNAMIC TOGGLE MODE STATE FOR THE VISUAL IDENTIFICATION */}
                    <div className="flex bg-[#161720] border border-[#222435] p-0.5 rounded-lg text-[8.5px] font-bold mb-3 font-mono">
                      <button 
                        type="button"
                        onClick={() => setPassportDisplayMode('qr')}
                        className={`px-2 py-1 rounded transition-all duration-150 ${passportDisplayMode === 'qr' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                        [X] QR PASS (Admission)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPassportDisplayMode('barcode')}
                        className={`px-2 py-1 rounded transition-all duration-150 ${passportDisplayMode === 'barcode' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                        Barcode
                      </button>
                    </div>

                    {passportDisplayMode === 'qr' ? (
                      <div className="relative group flex flex-col items-center">
                        <SimulatedQRCode value={currentChild.id} size={100} className="bg-white p-1 rounded-lg shadow-inner" />
                        <div className="mt-1.5 text-center">
                          <span className="text-[8px] tracking-[4px] font-mono font-bold text-gray-400">{currentChild.id}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center bg-white p-2.5 rounded-lg w-full max-w-[150px]">
                        <div className="flex gap-[1.5px] h-8 overflow-hidden bg-white w-full max-w-[120px] items-center justify-center">
                          {[2, 1, 3, 1, 2, 4, 1, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 4, 1, 2, 1, 3, 1].map((w, idx) => (
                            <div key={idx} className="bg-slate-950" style={{ width: `${w}px`, height: '100%' }} />
                          ))}
                        </div>
                        <span className="text-[7px] tracking-[5.5px] font-mono font-bold text-slate-800 uppercase mt-1.5">{currentChild.id}</span>
                      </div>
                    )}

                    <p className="text-[8.5px] text-gray-500 leading-snug text-center mt-2.5 max-w-[210px]">
                      Students can scan this code to login at any school self-service kiosk or gate terminal instantly.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Printing card details...\n\nCARD REGISTERED:\nHolders: ${currentChild.name}\nAdmission Number: ${currentChild.id}\nStream: ${currentChild.stream}\nQR Hash: Linked\n\nSimulated print command executed successfully! Smart pass badge dispatched.`);
                    }}
                    className="w-full py-1.5 bg-[#171821] hover:bg-[#20212e] border border-[#232537] rounded-xl text-[9.5px] font-bold text-blue-400 hover:text-blue-300 font-mono transition flex items-center justify-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print Physical Smart Badge
                  </button>
                </div>

                {/* SICK BAY ALERT if admitted */}
                {currentChild.status === 'Sick Bay' && childHealth.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3.5 text-xs space-y-1.5 animate-pulse">
                    <p className="font-bold flex items-center gap-1"><ShieldAlert className="h-4 w-4 text-amber-500" /> Clinic Boarding Notification</p>
                    <p className="text-gray-700 leading-snug">
                      Ethan is admitted into the sick bay under observation. Nurse Beatrice log: <strong>"{childHealth[0].symptoms}"</strong>
                    </p>
                    <span className="text-[9px] font-mono text-gray-500 block">Treatments: {childHealth[0].actionTaken}</span>
                  </div>
                )}

                {/* Financial overview card */}
                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-600">Smart-Card Pocket Balance</span>
                    <Wallet className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-2xl font-black text-slate-900 font-mono">KES {currentChild.pocketMoneyBalance.toLocaleString()}</p>
                    <button 
                      onClick={() => setActiveMTab('wallet')}
                      className="text-[10px] text-purple-600 font-bold hover:underline"
                    >
                      Funds Smart-Card +
                    </button>
                  </div>
                  <div className="bg-gray-50/65 rounded-lg text-[10px] p-2.5 text-slate-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="space-y-0.5">
                      <span className="block text-[#111216] font-bold">Full Tuition Due: KES {(currentChild.totalFees - currentChild.paidFees).toLocaleString()}</span>
                      <span className="font-mono text-xs text-purple-600 font-extrabold block">
                        {Math.round((currentChild.paidFees / currentChild.totalFees) * 100)}% Paid ({currentChild.paidFees.toLocaleString()} / {currentChild.totalFees.toLocaleString()} KES)
                      </span>
                    </div>
                    {currentChild.totalFees > currentChild.paidFees && onAddFeePayment && (
                      <button
                        onClick={() => {
                          const amt = prompt(`[Safaricom M-Pesa School Pay]\nEnter KSh tuition amount to transmit for ${currentChild.name}:`, (currentChild.totalFees - currentChild.paidFees).toString());
                          if (amt && !isNaN(Number(amt)) && Number(amt) > 0) {
                            const val = Number(amt);
                            if (window.confirm(`Initiate M-Pesa push to allocate KSh ${val.toLocaleString()}? This is instant boarding reconciliation.`)) {
                              onAddFeePayment({
                                studentId: currentChild.id,
                                studentName: currentChild.name,
                                amount: val,
                                method: 'M-Pesa',
                                reference: 'MPS-' + Math.floor(Math.random() * 900000 + 100000)
                              });
                              alert(`Transaction executed. The Bursar Desk is notified and tuition ledger credited by ${val.toLocaleString()}/-!`);
                            }
                          }
                        }}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 font-bold border border-purple-500 text-white rounded-lg text-[9.5px] uppercase tracking-wider transition shrink-0"
                      >
                        ⚡ Pay Tuition
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Request Leave pass slip */}
                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-2xs space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Quick-Apply Gate Exit passes</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">Sends exit requests instantly to the Principal's tablet.</p>
                  </div>

                  <form onSubmit={handleParentEgressRequest} className="space-y-2">
                    <input 
                      type="text"
                      required
                      value={parentEgressReason}
                      onChange={(e) => setParentEgressReason(e.target.value)}
                      placeholder="e.g. Sister's wedding pick-up request..."
                      className="w-full text-[11px] p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-purple-500 text-slate-800"
                    />
                    
                    {egressSuccess && (
                      <div className="text-[10px] p-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded text-center font-bold">
                        Pass request sent! Syncing queue.
                      </div>
                    )}

                    <button 
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] py-1.5 rounded-lg transition flex items-center justify-center gap-1.5"
                    >
                      Apply Weekend Egress Slip
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* ACADEMICS INDIVIDUAL CBC SLIP TAB */}
            {activeMTab === 'academics' && (
              <div className="space-y-4">
                <div className="mt-2">
                  <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider font-mono">Academic Report Slip</p>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Competency Based Assessment</h3>
                  <p className="text-[10px] text-slate-400 leading-tight">Official digital evaluations signed by class teachers.</p>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-0.5">
                  {childCbc.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs border border-dashed rounded-xl bg-white mt-4">
                      No CBC rubrics logged yet by class teachers.
                    </div>
                  ) : (
                    childCbc.map((cbc) => (
                      <div key={cbc.id} className="p-3 bg-white border border-gray-150 rounded-xl space-y-2 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">{cbc.learningArea}</span>
                            <span className="text-[9px] text-slate-400 font-mono block">STRAND: {cbc.strand}</span>
                          </div>
                          <span className={`p-1 px-2 rounded-lg text-[9px] font-black font-mono tracking-tight ${
                            cbc.score === 'EE' ? 'bg-emerald-100 text-emerald-800' :
                            cbc.score === 'ME' ? 'bg-indigo-100 text-indigo-800' :
                            cbc.score === 'AE' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {cbc.score}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-tight">Task: {cbc.task}</p>
                        <p className="text-[11px] text-slate-700 italic bg-purple-50 p-1.5 border border-purple-100 rounded leading-snug font-medium">
                          "{cbc.comments}"
                        </p>
                        <div className="text-[9px] text-slate-400 text-right">Published: {cbc.date}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* FINANCIAL AND POCKET FUNDING SYSTEM */}
            {activeMTab === 'wallet' && (
              <div className="space-y-4">
                <div className="mt-2">
                  <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider font-mono">Smart Card Cash Wallet</p>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Card Funding & Canteen Logs</h3>
                  <p className="text-[10px] text-slate-400 leading-tight">Top-up card pockets instantly using virtual Safaricom Lipa Na M-Pesa API gateways.</p>
                </div>

                {/* Pocket money balance */}
                <div className="bg-purple-950 p-4 rounded-2xl text-white space-y-1 relative overflow-hidden">
                  <span className="text-[10px] text-purple-300 font-mono tracking-widest block uppercase">Current Balance</span>
                  <p className="text-3xl font-black font-mono text-purple-200">KES {currentChild.pocketMoneyBalance.toLocaleString()}</p>
                  <span className="text-[9px] text-purple-400 block font-mono">LIMIT CONTROLS: 100/- Daily Kiosk Cap</span>
                </div>

                {/* Funding form */}
                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Direct Smart Card Top-up</h4>
                  
                  <form onSubmit={handleMPesaDeposit} className="space-y-3">
                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-450">KES</span>
                        <input 
                          type="number"
                          required
                          value={fundingAmount}
                          onChange={(e) => setFundingAmount(e.target.value)}
                          placeholder="e.g. 500"
                          className="w-full text-xs p-2 pl-10 border rounded-lg focus:outline-none focus:border-purple-500 font-mono text-slate-800"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={fundingLoad}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-[10px] font-bold px-3 py-2 rounded-lg font-mono tracking-tight"
                      >
                        {fundingLoad ? 'PAYING...' : 'DEPOSIT'}
                      </button>
                    </div>

                    {fundingSuccess && (
                      <div className="text-[10px] p-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded font-medium text-center">
                        M-PESA transaction verified and top-up credited to smart card!
                      </div>
                    )}
                  </form>
                </div>

                {/* Transaction history */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">Smart-Card purchase logs</h4>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-0.5">
                    {childTransactions.length === 0 ? (
                      <p className="text-[10px] text-slate-400 py-3 text-center">No purchases recorded today.</p>
                    ) : (
                      childTransactions.slice().reverse().map((t) => (
                        <div key={t.id} className="flex justify-between items-center p-2 bg-white border border-gray-150 rounded-lg text-[11px]">
                          <div>
                            <p className="font-semibold text-slate-800">{t.type} via {t.source}</p>
                            <span className="text-[9px] text-gray-400 font-mono">{t.reference}</span>
                          </div>
                          <span className={`font-mono font-bold ${
                            t.type === 'Deposit' ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {t.type === 'Deposit' ? '+' : '-'} {t.amount}/-
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}            {/* CHAT TERMINAL TAB */}
            {activeMTab === 'chat' && (
              <div className="space-y-2.5 flex flex-col justify-between h-[390px] overflow-hidden">
                <div className="shrink-0 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider font-mono">Simulated Chat Desk</p>
                      <h3 className="text-sm font-bold text-white leading-tight">Boarding Communications</h3>
                    </div>
                  </div>

                  {/* Contact selector tabs */}
                  <div className="grid grid-cols-2 gap-1 bg-[#15161a] p-1 rounded-xl border border-[#1f1f23] text-[10px]">
                    <button
                      type="button"
                      onClick={() => setActiveContact('teacher')}
                      className={`py-1.5 rounded-lg text-center font-bold transition flex items-center justify-center gap-1.5 ${
                        activeContact === 'teacher' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>👩‍🏫</span> Madam Mercy
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveContact('principal')}
                      className={`py-1.5 rounded-lg text-center font-bold transition flex items-center justify-center gap-1.5 ${
                        activeContact === 'principal' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>👨‍💼</span> Principal
                    </button>
                  </div>
                </div>

                {/* Conversation Box */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 text-[11px] py-1 select-text scrollbar-thin scrollbar-thumb-gray-800">
                  {activeThreadChats.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-4 text-center text-gray-500">
                      <p className="text-xs">No messages recorded in this channel yet.</p>
                      <p className="text-[9px] mt-1 font-mono">Direct secure link active.</p>
                    </div>
                  ) : (
                    activeThreadChats.map((msg) => {
                      const isSelf = msg.senderName === currentChild.parentName || msg.sender === 'Parent';
                      return (
                        <div 
                          key={msg.id} 
                          className={`max-w-[85%] p-2 rounded-2xl space-y-0.5 leading-snug relative text-xs ${
                            isSelf 
                              ? 'bg-blue-650 text-white rounded-tr-none ml-auto bg-blue-600 shadow-sm' 
                              : 'bg-[#15161a] border border-[#1f1f23] rounded-tl-none text-gray-200 mr-auto shadow-xs'
                          }`}
                        >
                          <div className="flex justify-between items-center gap-4">
                            <span className={`text-[8px] uppercase tracking-wider block font-extrabold ${
                              isSelf ? 'text-blue-200' : 'text-blue-400'
                            }`}>
                              {msg.senderName}
                            </span>
                            <span className="text-[7.5px] text-gray-500 font-mono">
                              {formatMessageTime(msg.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-100 whitespace-pre-wrap">{msg.content}</p>
                          
                          {/* Read Receipts for Self messages */}
                          {isSelf && (
                            <div className="text-[9px] flex justify-end items-center gap-0.5 leading-none mt-0.5">
                              {msg.isRead ? (
                                <span className="text-blue-300 font-black tracking-tighter" title="Read by recipient">✓✓ Read</span>
                              ) : (
                                <span className="text-gray-400 font-bold tracking-tighter" title="Sent successfully">✓ Sent</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Typing Indicator */}
                  {activeContact === 'teacher' && typingStatus[currentChild.id] && (
                    <div className="flex items-center gap-2 bg-[#15161a]/30 border border-[#1f1f23]/30 p-2 rounded-xl rounded-tl-none w-[70%] mr-auto py-1.5 px-2.5">
                      <div className="flex gap-1 items-center">
                        <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-[9px] text-gray-400 font-medium font-mono">Mercy is typing...</span>
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="flex gap-1 shrink-0 pt-1.5 border-t border-[#1f1f23] mt-auto">
                  <input 
                    type="text"
                    required
                    value={chatBuffer}
                    onChange={(e) => setChatBuffer(e.target.value)}
                    placeholder={activeContact === 'teacher' ? "Ask teacher about child..." : "Send query to principal..."}
                    className="flex-1 text-[11px] px-2.5 py-1.5 border border-[#1f1f23] bg-[#15161a] rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
                  />
                  <button 
                    type="submit"
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            )}

          </div>
          )}

          {/* INTERNAL PHONE NAVIGATION DOCKBAR */}
          {isAuthenticated && (
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-[#0a0a0c] border-t border-[#1f1f23] px-5 flex justify-between items-center z-40 select-none">
              <button 
                onClick={() => setActiveMTab('home')}
                className={`flex flex-col items-center gap-0.5 ${activeMTab === 'home' ? 'text-blue-500 font-bold' : 'text-gray-500 hover:text-white'}`}
              >
                <Smartphone className="h-4 w-4" />
                <span className="text-[9px]">Home</span>
              </button>

              <button 
                onClick={() => setActiveMTab('academics')}
                className={`flex flex-col items-center gap-0.5 ${activeMTab === 'academics' ? 'text-blue-500 font-bold' : 'text-gray-500 hover:text-white'}`}
              >
                <BookOpen className="h-4 w-4 text-indigo-500" />
                <span className="text-[9px]">Academics</span>
              </button>

              <button 
                onClick={() => setActiveMTab('wallet')}
                className={`flex flex-col items-center gap-0.5 ${activeMTab === 'wallet' ? 'text-blue-500 font-bold' : 'text-gray-500 hover:text-white'}`}
              >
                <Wallet className="h-4 w-4 text-emerald-500" />
                <span className="text-[9px]">Finance</span>
              </button>

              <button 
                onClick={() => setActiveMTab('chat')}
                className={`flex flex-col items-center gap-0.5 relative ${activeMTab === 'chat' ? 'text-blue-500 font-bold' : 'text-gray-500 hover:text-white'}`}
              >
                {unreadChatsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white leading-none scale-90 animate-pulse">
                    {unreadChatsCount}
                  </span>
                )}
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <span className="text-[9px]">Messages</span>
              </button>
            </div>
          )}

          {/* Soft tactile line */}
          <div className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-400 rounded-full z-45 opacity-55"></div>

        </div>
      </div>

    </div>
  );
}
