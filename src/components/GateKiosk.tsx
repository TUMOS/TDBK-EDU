/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, Scan, UserCheck, Shield, Clock, 
  HelpCircle, ChevronRight, CheckCircle2, UserX, AlertTriangle, Play, QrCode,
  UserPlus, BookOpen, Search, LogIn, LogOut, Check, Building, Trash2
} from 'lucide-react';
import SimulatedQRCode from './SimulatedQRCode';
import { Student, PermissionRequest, GateLog, VisitorLog } from '../types';
import { createDocument, updateDocument } from '../lib/firebase';

interface GateKioskProps {
  students: Student[];
  permissions: PermissionRequest[];
  gateLogs: GateLog[];
  visitorLogs?: VisitorLog[];
  onCheckOutStudent: (studentId: string, permissionId: string) => void;
  onCheckInStudent: (studentId: string) => void;
}

export default function GateKiosk({
  students,
  permissions,
  gateLogs,
  visitorLogs = [],
  onCheckOutStudent,
  onCheckInStudent,
}: GateKioskProps) {
  // Navigation
  const [activeKioskTab, setActiveKioskTab] = useState<'pupils' | 'visitors'>('pupils');

  // Gate management state
  const [typedStudentId, setTypedStudentId] = useState('');
  const [scanFeedback, setScanFeedback] = useState<{ status: 'success' | 'error'; msg: string } | null>(null);
  const [activeQRModalPass, setActiveQRModalPass] = useState<PermissionRequest | null>(null);

  // Visitor Registration States
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorNationalId, setVisitorNationalId] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('Parent-Teacher Consultation');
  const [customVisitorPurpose, setCustomVisitorPurpose] = useState('');
  const [visitorStudentId, setVisitorStudentId] = useState('');
  const [visitorError, setVisitorError] = useState('');
  const [visitorSuccess, setVisitorSuccess] = useState('');
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorFilter, setVisitorFilter] = useState<'All' | 'Inside' | 'Checked-Out'>('Inside');

  // Filter Active approved leave passes that are NOT completed yet
  const clearablePasses = permissions.filter(p => p.status === 'Approved');

  // Register modern visitor in digital gate book
  const handleRegisterVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVisitorError('');
    setVisitorSuccess('');

    if (!visitorName.trim() || !visitorPhone.trim() || !visitorNationalId.trim()) {
      setVisitorError('Please fill out Name, Phone Number, and National ID.');
      return;
    }

    const matchedChild = students.find(s => s.id === visitorStudentId.trim().toUpperCase());

    const visitorId = 'VIS-' + Math.floor(Math.random() * 9000 + 1000);
    const newVisitor: VisitorLog = {
      id: visitorId,
      name: visitorName.trim(),
      phone: visitorPhone.trim(),
      nationalId: visitorNationalId.trim(),
      purpose: visitorPurpose === 'Other' ? (customVisitorPurpose.trim() || 'General Inquiry') : visitorPurpose,
      studentId: visitorStudentId ? visitorStudentId.trim().toUpperCase() : undefined,
      studentName: matchedChild ? matchedChild.name : undefined,
      timeIn: new Date().toISOString(),
      status: 'Inside',
      clearedBy: 'Officer Mwita (Gate Guard)'
    };

    try {
      await createDocument('visitorLogs', newVisitor);
      setVisitorSuccess(`Inbound Access Granted! Visitor "${newVisitor.name}" has been logged INSIDE campus. Check-in Serial: ${visitorId}`);
      
      // Clear inputs
      setVisitorName('');
      setVisitorPhone('');
      setVisitorNationalId('');
      setVisitorStudentId('');
      setCustomVisitorPurpose('');

      // Auto clear feedback
      setTimeout(() => setVisitorSuccess(''), 5000);
    } catch (err) {
      console.error(err);
      setVisitorError('Failed to sync visitor log to Secure Guard Cloud.');
    }
  };

  const handleSignOutVisitor = async (id: string, name: string) => {
    setVisitorError('');
    setVisitorSuccess('');
    try {
      await updateDocument('visitorLogs', id, { 
        status: 'Checked-Out', 
        timeOut: new Date().toISOString()
      });
      setVisitorSuccess(`OUTBOUND CLEARANCE OK! Sighed out visitor "${name}" from campus bounds.`);
      setTimeout(() => setVisitorSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setVisitorError('Failed to record visitor outbound departure.');
    }
  };

  // Handle barcode/ID search
  const handleKeyboardScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stId = typedStudentId.trim().toUpperCase();
    if (!stId) return;

    const student = students.find(s => s.id === stId);
    if (!student) {
      setScanFeedback({ status: 'error', msg: `No student records found matching code [${stId}].` });
      setTimeout(() => setScanFeedback(null), 3500);
      return;
    }

    // Evaluate check-out/check-in possibilities
    if (student.status === 'Out of School') {
      // Simulate checking them back in
      onCheckInStudent(student.id);
      setScanFeedback({ status: 'success', msg: `M-GURUSH OK! Evaluated Check-In. ${student.name} welcomed back on campus.` });
    } else {
      // Need an active approved pass to leave
      const activeAppPass = permissions.find(p => p.studentId === student.id && p.status === 'Approved');
      if (activeAppPass) {
        onCheckOutStudent(student.id, activeAppPass.id);
        setScanFeedback({ status: 'success', msg: `GATE CLEARED! Checked-Out ${student.name} under APPROVED slip ${activeAppPass.id}.` });
      } else {
        setScanFeedback({ status: 'error', msg: `ACCESS DENIED! ${student.name} has no APPROVED Gate-Pass in active queue.` });
      }
    }

    setTypedStudentId('');
    setTimeout(() => setScanFeedback(null), 4000);
  };

  // Shortcut scan triggers
  const handleTriggerPassCheckout = (studentId: string, passId: string, name: string) => {
    onCheckOutStudent(studentId, passId);
    setScanFeedback({ status: 'success', msg: `CHECK-OUT SUCCESS: cleared student ${name} via pass ${passId}.` });
    setTimeout(() => setScanFeedback(null), 3000);
  };

  const handleTriggerQuickCheckin = (studentId: string, name: string) => {
    onCheckInStudent(studentId);
    setScanFeedback({ status: 'success', msg: `CHECK-IN SUCCESS: ${name} returned and logged back inside campus bounds.` });
    setTimeout(() => setScanFeedback(null), 3000);
  };

  return (
    <div id="gate-security-panel" className="bg-[#0a0a0c] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-slate-100 flex flex-col justify-between">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-[#1f1f23]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded text-xs font-semibold tracking-wider uppercase font-mono">
              Gate checkpoint 1
            </span>
            <span className="text-emerald-400 text-xs flex items-center gap-1 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Secure Socket Guard Terminal
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-white">TDBK Gatekeeper Console</h1>
          <p className="text-xs text-slate-400">Officer Mwita guard command interface. Verify student QR pass slips and manage camp crossings.</p>
        </div>

        {/* Console stats */}
        <div className="flex gap-4 mt-4 md:mt-0 max-sm:grid max-sm:grid-cols-2 text-xs">
          <div className="p-2 border border-slate-800 bg-slate-950/60 rounded-xl">
            <span className="text-slate-500 font-mono block">CAMP UNDERWATCH</span>
            <span className="text-sm font-bold text-slate-200">
              {students.filter(s => s.status === 'In School' || s.status === 'Sick Bay').length} pupils inside
            </span>
          </div>
          <div className="p-2 border border-slate-800 bg-slate-950/60 rounded-xl">
            <span className="text-slate-500 font-mono block">OUT OF SCHOOL</span>
            <span className="text-sm font-bold text-amber-500">
              {students.filter(s => s.status === 'Out of School').length} logged out
            </span>
          </div>
        </div>
      </div>

      {/* Main Terminal Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
        
        {/* Left 5 cols: Barcode scan input and quick-scanner representation */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-sm tracking-wide text-slate-300 flex items-center gap-2 uppercase font-mono">
                <Scan className="text-indigo-400 h-4.5 w-4.5" /> 
                Pass Laser Emulator
              </h3>
              <p className="text-xs text-slate-500 mt-1">Egress and ingress can be triggered either by typing a Pupil's ID (e.g. TDBK-101) or scanning passes using the shortcuts on the right.</p>
            </div>

            {/* Virtual laser scan feed representation */}
            <div className="relative border-2 border-slate-800 rounded-xl overflow-hidden bg-slate-900 group aspect-video flex flex-col items-center justify-center">
              
              {/* Pulsing visual laser line */}
              <div className="absolute top-0 bottom-0 left-0 right-0 py-10 px-4 flex flex-col items-center justify-center">
                <span className="text-4xl">📸</span>
                <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest text-[#6366f1]">Laser Scanners Ready</p>
              </div>

              {/* Laser animation */}
              <motion.div 
                className="absolute left-0 right-0 h-0.5 bg-indigo-500 opacity-60 shadow-[0_0_10px_rgba(99,102,241,0.6)]"
                animate={{ y: [0, 160, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              />

              {/* Active Scanner results overlap */}
              {scanFeedback && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-20 ${
                    scanFeedback.status === 'success' ? 'bg-indigo-950/95 border-l-4 border-indigo-500' : 'bg-red-950/95 border-l-4 border-red-500'
                  }`}
                >
                  <p className="text-xs uppercase font-mono font-bold tracking-widest text-slate-400 mb-1">Scanner Feed</p>
                  <p className={`text-sm font-bold ${scanFeedback.status === 'success' ? 'text-indigo-300' : 'text-red-300'}`}>
                    {scanFeedback.msg}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Barcode typed input form */}
            <form onSubmit={handleKeyboardScanSubmit} className="space-y-3 pt-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Keyboard Code Override Entry</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={typedStudentId}
                  onChange={(e) => setTypedStudentId(e.target.value)}
                  placeholder="e.g. TDBK-102"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono p-2.5 focus:outline-none focus:border-indigo-500 text-slate-100 uppercase"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs px-4 rounded-xl text-white transition flex items-center gap-1"
                >
                  Clear Over <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-850/80 text-[10px] text-slate-550 flex items-center gap-2">
            <HelpCircle className="h-4 w-4" /> Type a Pupil ID on the keyboard or tap the Approved slips shortcuts right.
          </div>
        </div>

        {/* Right 7 columns: Active leaves permits shortcut queue */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Approved Leaves Shortcuts */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <CheckCircle2 className="text-emerald-500 h-4.5 w-4.5" /> Approved Exit Passes (Pending Check-Out)
              </h3>
              <p className="text-xs text-slate-500">Below are pupils who have authorized passes. Tapping clears them out of school instantly!</p>
            </div>

            {clearablePasses.length === 0 ? (
              <div className="text-center py-10 bg-slate-900 border border-dashed text-slate-500 text-xs rounded-xl">
                No approved leave passes awaiting clearance today.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {clearablePasses.map((pass) => (
                  <div 
                    key={pass.id}
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-slate-100 text-sm">{pass.studentName}</p>
                      <p className="text-xs font-mono text-slate-400 mb-1">{pass.studentId} • Slip Code: {pass.id}</p>
                      <span className="bg-amber-950 text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono border border-amber-900 font-bold uppercase">
                        Reason: {pass.reason} ({pass.passType})
                      </span>
                    </div>

                    <div className="flex gap-1.5 shrink-0 self-end sm:self-auto">
                      <button 
                        onClick={() => setActiveQRModalPass(pass)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-700 transition flex items-center gap-1"
                        title="Display Admission-based 2D QR Code Passport"
                      >
                        <QrCode className="h-3.5 w-3.5 text-blue-400" /> Passport QR
                      </button>

                      <button 
                        onClick={() => handleTriggerPassCheckout(pass.studentId, pass.id, pass.studentName)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
                      >
                        <Scan className="h-3.5 w-3.5" /> Scan Out
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active pupils who are checked OUT (Shortcuts matching Check-In return) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Shield className="text-indigo-400 h-4.5 w-4.5" /> Active Out of Bounds List (Exited Gate)
              </h3>
              <p className="text-xs text-slate-500">Pupils currently off campus. Tapping check-in welcomes them back inside school structures.</p>
            </div>

            {students.filter(s => s.status === 'Out of School').length === 0 ? (
              <div className="text-center py-10 bg-slate-900 border border-dashed text-slate-500 text-xs rounded-xl">
                All boarding pupils accounts accounted for. No off-campus profiles found.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {students.filter(s => s.status === 'Out of School').map((st) => (
                  <div 
                    key={st.id}
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-slate-100 text-sm">{st.name}</p>
                      <p className="text-xs font-mono text-slate-400">{st.id} • Stream {st.stream}</p>
                      <span className="text-[10px] text-red-400 bg-red-950/40 border border-red-900 px-2 py-0.5 rounded inline-block font-mono font-bold mt-1 uppercase">
                        Current Bounds OOB: OUT OF CAMPUS
                      </span>
                    </div>

                    <button 
                      onClick={() => handleTriggerQuickCheckin(st.id, st.name)}
                      className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 self-end sm:self-auto"
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Scan Return / In
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* HIGH FIDELITY SECURE 2D GATEWAY PASSPORT OVERLAY */}
      {activeQRModalPass && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-[3px] select-none">
          <div className="bg-[#12131c] border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative text-slate-200">
            
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="text-blue-400 h-5 w-5 animate-pulse" />
                <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">ADMISSION SMART DECODER</h4>
                  <p className="text-xs font-bold text-white">Student QR Passport ID</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveQRModalPass(null)}
                className="text-gray-500 hover:text-white font-black text-xs font-mono p-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center text-center">
              <span className="text-2xl mb-2">🎓</span>
              <p className="text-xs font-extrabold text-white uppercase tracking-wide">{activeQRModalPass.studentName}</p>
              <p className="text-[10px] font-mono text-gray-450 text-gray-400 mb-3">
                Admission ID: <strong className="text-blue-400">{activeQRModalPass.studentId}</strong>
              </p>

              {/* RENDER THE DETERMINISTIC ADMISSION-BASED QR CODE COMPONENT */}
              <div className="p-2.5 bg-white rounded-xl shadow-inner border border-slate-200">
                <SimulatedQRCode value={activeQRModalPass.studentId} size={130} />
              </div>

              <span className="text-[9px] font-mono font-bold tracking-[5px] text-gray-400 mt-2.5 uppercase select-all">
                {activeQRModalPass.studentId}
              </span>
              
              <div className="mt-3.5 p-2.5 bg-[#171923] border border-slate-800/60 rounded-xl text-[9px] leading-relaxed text-gray-400">
                Authorized Reason: <strong className="text-amber-400">{activeQRModalPass.reason}</strong>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => setActiveQRModalPass(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Dismiss Code
              </button>
              <button
                onClick={() => {
                  handleTriggerPassCheckout(activeQRModalPass.studentId, activeQRModalPass.id, activeQRModalPass.studentName);
                  setActiveQRModalPass(null);
                }}
                className="flex-1 py-1.5 bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1"
              >
                <Scan className="h-4 w-4" /> Scan Clear
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
