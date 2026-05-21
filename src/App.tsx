/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Users, Briefcase, Key, Compass, 
  HelpCircle, Sparkles, BookOpen, Clock, Play, 
  CheckCircle, ArrowRight, Activity, Wallet, Smartphone, ShieldAlert,
  Landmark, Moon, Share2
} from 'lucide-react';

import { 
  Student, AttendanceRecord, PermissionRequest, 
  HealthRecord, PocketMoneyTransaction, CbcAssessment, 
  GateLog, ChatMessage, AttendanceStatus, HealthSeverity, PassType, FeePayment, HealthStatus,
  Staff, VisitorLog
} from './types';

import { 
  INITIAL_STUDENTS, INITIAL_ATTENDANCE, INITIAL_PERMISSIONS, 
  INITIAL_HEALTH, INITIAL_PM_TRANSACTIONS, INITIAL_FEE_PAYMENTS, 
  INITIAL_CBC_ASSESSMENTS, INITIAL_GATE_LOGS, INITIAL_CHAT,
  INITIAL_STAFF
} from './data/mockData';

// Component imports
import PrincipalDashboard from './components/PrincipalDashboard';
import StudentKiosk from './components/StudentKiosk';
import TeacherPortal from './components/TeacherPortal';
import ParentApp from './components/ParentApp';
import GateKiosk from './components/GateKiosk';
import BursarDashboard from './components/BursarDashboard';
import MatronDashboard from './components/MatronDashboard';

// Firebase Integrations
import { db, createDocument, updateDocument, seedCollectionIfEmpty } from './lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function App() {
  // Core unified state pools matching Firebase Real-Time Synchronization subscriptions
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [permissions, setPermissions] = useState<PermissionRequest[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [transactions, setTransactions] = useState<PocketMoneyTransaction[]>([]);
  const [cbcAssessments, setCbcAssessments] = useState<CbcAssessment[]>([]);
  const [gateLogs, setGateLogs] = useState<GateLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Typing status of users: { [threadOrUserId]: string }
  const [typingStatus, setTypingStatus] = useState<Record<string, string>>({});

  // Bootstrap data on empty collections with a guaranteed 2.5 second fail-safe timeout
  React.useEffect(() => {
    const backupTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    async function fetchBootstrap() {
      try {
        await Promise.all([
          seedCollectionIfEmpty('students', INITIAL_STUDENTS),
          seedCollectionIfEmpty('attendance', INITIAL_ATTENDANCE),
          seedCollectionIfEmpty('permissions', INITIAL_PERMISSIONS),
          seedCollectionIfEmpty('healthRecords', INITIAL_HEALTH),
          seedCollectionIfEmpty('transactions', INITIAL_PM_TRANSACTIONS),
          seedCollectionIfEmpty('feePayments', INITIAL_FEE_PAYMENTS),
          seedCollectionIfEmpty('cbcAssessments', INITIAL_CBC_ASSESSMENTS),
          seedCollectionIfEmpty('gateLogs', INITIAL_GATE_LOGS),
          seedCollectionIfEmpty('chatMessages', INITIAL_CHAT),
          seedCollectionIfEmpty('staff', INITIAL_STAFF)
        ]);
      } catch (e) {
        console.error("Database seed failed with error: ", e);
      } finally {
        clearTimeout(backupTimer);
        setLoading(false);
      }
    }
    fetchBootstrap();
    return () => clearTimeout(backupTimer);
  }, []);

  // Set up Firebase Real-Time subscriptions
  React.useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      const data: Student[] = [];
      snap.forEach(doc => data.push(doc.data() as Student));
      data.sort((a, b) => a.id.localeCompare(b.id));
      setStudents(data);
    }, (err) => console.error("Students sync error:", err));

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      const data: AttendanceRecord[] = [];
      snap.forEach(doc => data.push(doc.data() as AttendanceRecord));
      setAttendance(data);
    }, (err) => console.error("Attendance sync error:", err));

    const unsubPermissions = onSnapshot(collection(db, 'permissions'), (snap) => {
      const data: PermissionRequest[] = [];
      snap.forEach(doc => data.push(doc.data() as PermissionRequest));
      setPermissions(data);
    }, (err) => console.error("Permissions sync error:", err));

    const unsubHealth = onSnapshot(collection(db, 'healthRecords'), (snap) => {
      const data: HealthRecord[] = [];
      snap.forEach(doc => data.push(doc.data() as HealthRecord));
      setHealthRecords(data);
    }, (err) => console.error("Health records sync error:", err));

    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snap) => {
      const data: PocketMoneyTransaction[] = [];
      snap.forEach(doc => data.push(doc.data() as PocketMoneyTransaction));
      data.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setTransactions(data);
    }, (err) => console.error("Transactions sync error:", err));

    const unsubFeePayments = onSnapshot(collection(db, 'feePayments'), (snap) => {
      const data: FeePayment[] = [];
      snap.forEach(doc => data.push(doc.data() as FeePayment));
      data.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setFeePayments(data);
    }, (err) => console.error("Fee payments sync error:", err));

    const unsubCbc = onSnapshot(collection(db, 'cbcAssessments'), (snap) => {
      const data: CbcAssessment[] = [];
      snap.forEach(doc => data.push(doc.data() as CbcAssessment));
      setCbcAssessments(data);
    }, (err) => console.error("CBC sync error:", err));

    const unsubGate = onSnapshot(collection(db, 'gateLogs'), (snap) => {
      const data: GateLog[] = [];
      snap.forEach(doc => data.push(doc.data() as GateLog));
      data.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setGateLogs(data);
    }, (err) => console.error("Gate logs sync error:", err));

    const unsubChat = onSnapshot(collection(db, 'chatMessages'), (snap) => {
      const data: ChatMessage[] = [];
      snap.forEach(doc => data.push(doc.data() as ChatMessage));
      data.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      setChatMessages(data);
    }, (err) => console.error("Chat sync error:", err));

    const unsubStaff = onSnapshot(collection(db, 'staff'), (snap) => {
      const data: Staff[] = [];
      snap.forEach(doc => data.push(doc.data() as Staff));
      data.sort((a, b) => a.id.localeCompare(b.id));
      setStaff(data);
    }, (err) => console.error("Staff sync error:", err));

    const unsubVisitors = onSnapshot(collection(db, 'visitorLogs'), (snap) => {
      const data: VisitorLog[] = [];
      snap.forEach(doc => data.push(doc.data() as VisitorLog));
      data.sort((a, b) => b.timeIn.localeCompare(a.timeIn));
      setVisitorLogs(data);
    }, (err) => console.error("Visitor sync error:", err));

    return () => {
      unsubStudents();
      unsubAttendance();
      unsubPermissions();
      unsubHealth();
      unsubTransactions();
      unsubFeePayments();
      unsubCbc();
      unsubGate();
      unsubChat();
      unsubStaff();
      unsubVisitors();
    };
  }, []);

  // Active Role switcher with URL route loading
  const [activeRole, setActiveRole] = useState<'principal' | 'teacher' | 'kiosk' | 'parent' | 'gate' | 'bursar' | 'matron'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      if (roleParam && ['principal', 'teacher', 'kiosk', 'parent', 'gate', 'bursar', 'matron'].includes(roleParam)) {
        return roleParam as any;
      }
    }
    return 'principal';
  });

  const [showScenarioGuide, setShowScenarioGuide] = useState(() => {
    // Automatically hide general scenario guide if they are directly targeting a persona via URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('role')) {
        return false;
      }
    }
    return true;
  });

  // State to toggle the Direct Link Share Panel
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync state changes with the URL search query (supports instant copy-pasting of address bar)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('role') !== activeRole) {
        url.searchParams.set('role', activeRole);
        
        // Clean up role-specific sub-params of other roles to keep active link clean
        const roleSpecificParams = ['principalTab', 'teacherTab', 'bursarTab', 'matronTab', 'parentTab', 'studentId'];
        roleSpecificParams.forEach(p => {
          if (p === 'studentId' && activeRole === 'parent') return; // Preserve student context for parents
          url.searchParams.delete(p);
        });
        
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    }
  }, [activeRole]);

  const handleCopyLink = (roleKey: string, customParams = '') => {
    const origin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    const fullUrl = `${origin}?role=${roleKey}${customParams}`;
    const copyKey = roleKey + (customParams || '');
    try {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopiedKey(copyKey);
        setTimeout(() => setCopiedKey(null), 1800);
      }).catch(() => {
        // Fallback alert
        alert(`Direct Link for this hub:\n${fullUrl}\n\nPlease copy this URL manually.`);
      });
    } catch (e) {
      alert(`Direct Link:\n${fullUrl}`);
    }
  };

  // --- RECTIVE HANDLERS (THE UNIFIED ENGINE) ---

  // 1. Mark Roll Call
  const handleMarkAttendance = async (studentId: string, status: AttendanceStatus, markedBy: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Check if attendance already marked today
    const dateToday = "2026-05-21";
    const existingRec = attendance.find(a => a.studentId === studentId && a.date === dateToday);
    const recId = existingRec ? existingRec.id : 'att-' + (attendance.length + 1) + '-' + Math.floor(Math.random() * 100);

    const newRecord: AttendanceRecord = {
      id: recId,
      studentId,
      studentName: student.name,
      grade: student.grade,
      stream: student.stream,
      status,
      date: dateToday,
      markedBy,
      timestamp: new Date().toISOString()
    };

    let nextStudentStatus: Student['status'] = 'In School';
    if (status === 'Sick') nextStudentStatus = 'Sick Bay';
    if (status === 'Permission') nextStudentStatus = 'Out of School';

    await createDocument('attendance', newRecord);
    await updateDocument('students', studentId, { status: nextStudentStatus });
  };

  // 2. Approve gate pass
  const handleApprovePermission = async (id: string, approvedBy: string) => {
    const pass = permissions.find(p => p.id === id);
    if (!pass) return;

    await updateDocument('permissions', id, { 
      status: 'Approved', 
      approvedBy, 
      approvedDate: "2026-05-21" 
    });

    // Generate notification automatically
    const newMsg: ChatMessage = {
      id: 'msg-' + Math.floor(Math.random() * 1000000),
      sender: 'System',
      senderName: 'TDBK Registrar',
      recipientId: pass.studentId,
      content: `Your leave request pass for ${pass.studentName} has been APPROVED by ${approvedBy}. Sentry clearing active.`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    await createDocument('chatMessages', newMsg);
  };

  // 3. Decline gate pass
  const handleDeclinePermission = async (id: string) => {
    await updateDocument('permissions', id, { status: 'Declined' });
  };

  // 4. Request gate pass from Student Kiosk or Parent app
  const handleAddPermissionRequest = async (studentId: string, reason: string, passType: PassType) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newRequest: PermissionRequest = {
      id: "PASS-" + (700 + permissions.length + 1) + '-' + Math.floor(Math.random() * 100),
      studentId,
      studentName: student.name,
      grade: student.grade,
      stream: student.stream,
      reason,
      passType,
      dateRequested: "2026-05-21",
      dateValid: "2026-05-21",
      status: 'Pending'
    };

    await createDocument('permissions', newRequest);
  };

  // 5. Submit illness reported by student at Kiosk or Matron desk
  const handleAddHealthQuery = async (
    studentId: string, 
    symptoms: string, 
    severity: HealthSeverity,
    actionTaken?: string,
    status?: HealthStatus,
    loggedBy?: string
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const finalAction = actionTaken || (severity === 'Severe' ? "Admitted to Sick Bay, medical pass queued." : "Sores ointment, bed rest given.");
    const finalStatus = status || 'Observation';
    const finalLoggedBy = loggedBy || "Nurse Beatrice";

    const newRecord: HealthRecord = {
      id: "HLTH-" + (healthRecords.length + 101) + '-' + Math.floor(Math.random() * 100),
      studentId,
      studentName: student.name,
      grade: student.grade,
      stream: student.stream,
      symptoms,
      severity,
      actionTaken: finalAction,
      status: finalStatus,
      dateLogged: "2026-05-21",
      loggedBy: finalLoggedBy
    };

    const nextStatus = finalStatus === 'Observation' ? 'Sick Bay' : finalStatus === 'Sent Home' || finalStatus === 'Referred to Hospital' ? 'Out of School' : 'In School';

    await createDocument('healthRecords', newRecord);
    await updateDocument('students', studentId, { status: nextStatus });

    // Auto notify parents
    const newSms: ChatMessage = {
      id: 'msg-h-' + Math.floor(Math.random() * 1000000),
      sender: 'Teacher',
      senderName: finalLoggedBy === 'Nurse Beatrice' ? 'School Infirmary' : finalLoggedBy,
      recipientId: studentId,
      content: `Boarding Alert: ${student.name} health update logged by ${finalLoggedBy}. Status: ${finalStatus}. Note: ${finalAction}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    await createDocument('chatMessages', newSms);
  };

  const handleUpdateStudentHealthStatus = async (studentId: string, status: 'In School' | 'Sick Bay' | 'Out of School') => {
    await updateDocument('students', studentId, { status });
  };

  const handleAddFeePayment = async (payment: Omit<FeePayment, 'id' | 'timestamp'>) => {
    const newId = 'FEE-' + Math.floor(Math.random() * 90000 + 10000);
    const newPayment: FeePayment = {
      ...payment,
      id: newId,
      timestamp: new Date().toISOString()
    };
    
    const student = students.find(s => s.id === payment.studentId);
    if (student) {
      const nextPaidFees = Math.min(student.totalFees || 45000, student.paidFees + payment.amount);
      await updateDocument('students', payment.studentId, { paidFees: nextPaidFees });
    }

    await createDocument('feePayments', newPayment);

    // Post system confirmation chat to parent channel
    const checkSms: ChatMessage = {
      id: 'msg-fees-' + Math.floor(Math.random() * 10000000),
      sender: 'System',
      senderName: 'Accounts Office',
      recipientId: payment.studentId,
      content: `Bursar Cleared: Received KSh ${payment.amount.toLocaleString()}/- through ${payment.method} (Ref: ${payment.reference}). High-school ledger has been cleared successfully!`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    await createDocument('chatMessages', checkSms);
  };

  // 6. smart card transaction (withdrawals, topups)
  const handleAddTransaction = async (newTx: Omit<PocketMoneyTransaction, 'id' | 'timestamp'>) => {
    const amount = newTx.amount;
    const type = newTx.type;

    const student = students.find(s => s.id === newTx.studentId);
    if (student) {
      let nextBal = student.pocketMoneyBalance;
      if (type === 'Deposit') nextBal += amount;
      if (type === 'Withdraw' || type === 'Purchase') nextBal -= amount;
      await updateDocument('students', newTx.studentId, { pocketMoneyBalance: nextBal });
    }

    const txRecord: PocketMoneyTransaction = {
      ...newTx,
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString()
    };

    await createDocument('transactions', txRecord);
  };

  // 7. Publish CBC Academic Evaluations
  const handleAddAssessment = async (newAssessment: Omit<CbcAssessment, 'id' | 'date'>) => {
    const fullAssessment: CbcAssessment = {
      ...newAssessment,
      id: 'CBC-' + (cbcAssessments.length + 101) + '-' + Math.floor(Math.random() * 100),
      date: "2026-05-21"
    };
    await createDocument('cbcAssessments', fullAssessment);
  };

  // 8. Gate Clearance: Check-Out Sentry
  const handleCheckOutStudent = async (studentId: string, permissionId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Complete the permission pass
    await updateDocument('permissions', permissionId, { status: 'Completed' });

    const pass = permissions.find(p => p.id === permissionId);
    // Create a Gate Sentry Log
    const newLog: GateLog = {
      id: 'GL-' + (300 + gateLogs.length + 1) + '-' + Math.floor(Math.random() * 100),
      studentId,
      studentName: student.name,
      grade: student.grade,
      stream: student.stream,
      action: 'Check-Out',
      passType: pass?.passType || 'Day Out',
      timestamp: new Date().toISOString(),
      clearedBy: 'Officer Mwita (Gate Guard)',
      permissionId
    };

    await createDocument('gateLogs', newLog);

    // Reactive Status Change: Set student status to 'Out of School'
    await updateDocument('students', studentId, { status: 'Out of School' });
  };

  // 9. Gate Clearance: Check-In returning Sentry
  const handleCheckInStudent = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Create a Gate In Sentry Log
    const newLog: GateLog = {
      id: 'GL-' + (300 + gateLogs.length + 1) + '-' + Math.floor(Math.random() * 100),
      studentId,
      studentName: student.name,
      grade: student.grade,
      stream: student.stream,
      action: 'Check-In',
      timestamp: new Date().toISOString(),
      clearedBy: 'Officer Mwita (Gate Guard)'
    };

    await createDocument('gateLogs', newLog);

    // Reactive Status Change: Return student status to 'In School'
    await updateDocument('students', studentId, { status: 'In School' });
  };

  // 10. Parent / Principal notice broadcasts
  const handleSendChatMessage = async (senderName: string, content: string) => {
    const newMsg: ChatMessage = {
      id: 'msg-' + Math.floor(Math.random() * 1000000),
      sender: 'Parent',
      senderName,
      recipientId: 'General-School',
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    await createDocument('chatMessages', newMsg);
  };

  // 11. Core Direct Messenger with typing triggers and automatic responses
  const handleSendDirectMessage = async (
    sender: 'Parent' | 'Teacher' | 'Principal' | 'System',
    senderName: string,
    recipientId: string, // e.g. student id (TDBK-101) representing context, or "teacher-mercy"
    content: string
  ) => {
    const newMsg: ChatMessage = {
      id: 'msg-direct-' + Math.floor(Math.random() * 10000000),
      sender,
      senderName,
      recipientId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    await createDocument('chatMessages', newMsg);

    // OPTIONAL: Simulated Auto response for interactive testing
    if (sender === 'Parent' && recipientId === 'teacher-mercy') {
      const student = students.find(s => s.parentName === senderName);
      const studentId = student?.id || 'TDBK-101';
      
      // Simulate typing indicator
      setTypingStatus(prev => ({ ...prev, [studentId]: 'Madam Mercy (Teacher) is typing...' }));
      
      setTimeout(async () => {
        setTypingStatus(prev => {
          const u = { ...prev };
          delete u[studentId];
          return u;
        });

        const replies = [
          `Thank you for reaching out, ${senderName}. I have noted this and will check in during classroom hours!`,
          `Greetings ${senderName}, Ethan's CBC tasks are going tremendously well. He's showing outstanding attention!`,
          `Acknowledged perfectly. I'll make sure to update their log, and advise Officer Mwita at the security gate if needed.`,
          `Got your message. I am currently reviewing our weekly stream attendance, but I will talk to the student soon!`
        ];

        const replyMsg = {
          id: 'msg-reply-' + Math.floor(Math.random() * 10000007),
          sender: 'Teacher' as const,
          senderName: 'Madam Mercy',
          recipientId: studentId,
          content: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date().toISOString(),
          isRead: false
        };
        await createDocument('chatMessages', replyMsg);
      }, 2500);
    }

    if (sender === 'Teacher') {
      const studentId = recipientId;
      const student = students.find(s => s.id === studentId);
      if (student) {
        // Toggle parent typing
        setTypingStatus(prev => ({ ...prev, ['teacher-mercy']: `${student.parentName} is typing...` }));
        
        setTimeout(async () => {
          setTypingStatus(prev => {
            const u = { ...prev };
            delete u['teacher-mercy'];
            return u;
          });

          const replies = [
            `Thank you for the update Madam Mercy. I am checking on their pocket money transactions now!`,
            `Excellent, thank you for guiding Ethan with his fractions activity.`,
            `Ah, that is clear. We will make preparations on our end. Cheers!`,
            `Understood, thank you. I appreciate you taking care of them in the boarding house.`
          ];

          const replyMsg = {
            id: 'msg-reply-' + Math.floor(Math.random() * 10000009),
            sender: 'Parent' as const,
            senderName: student.parentName,
            recipientId: 'teacher-mercy',
            content: replies[Math.floor(Math.random() * replies.length)],
            timestamp: new Date().toISOString(),
            isRead: false
          };
          await createDocument('chatMessages', replyMsg);
        }, 2200);
      }
    }
  };

  // 12. Read Receipts updator
  const handleMarkMessagesAsRead = async (studentId: string, role: 'Parent' | 'Teacher') => {
    const toUpdate = chatMessages.filter(msg => {
      if (role === 'Parent' && (msg.recipientId === studentId || msg.recipientId === 'General-School') && msg.sender !== 'Parent' && !msg.isRead) {
        return true;
      }
      if (role === 'Teacher' && msg.recipientId === 'teacher-mercy' && !msg.isRead) {
        const student = students.find(s => s.id === studentId);
        if (student && msg.senderName === student.parentName) {
          return true;
        }
      }
      return false;
    });

    for (const msg of toUpdate) {
      await updateDocument('chatMessages', msg.id, { isRead: true });
    }
  };

  // Broadcast announcements to all parents from principal office
  const handleSendAnnouncement = async (content: string) => {
    for (const st of students) {
      const annoSms: ChatMessage = {
        id: 'msg-anno-' + Math.floor(Math.random() * 9005) + '-' + st.id,
        sender: 'Principal',
        senderName: 'Principal Wekesa',
        recipientId: st.id,
        content,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      await createDocument('chatMessages', annoSms);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0a0a0c] min-h-screen text-[#e2e2e2] flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-slate-400 tracking-widest uppercase animate-pulse">Initializing Zero-Trust Cloud Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0c] min-h-screen text-[#e2e2e2] flex flex-col justify-between selection:bg-blue-600/30 font-sans antialiased">
      
      {/* 1. MASTER WORKSPACE CONTROL BAR */}
      <header className="bg-[#0d0d10] border-b border-[#1f1f23] p-4 sticky top-0 z-50 shadow-md select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo brand and share actions */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md select-none font-sans tracking-tight">
                T
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-white font-bold tracking-tight text-base hover:text-blue-400 transition-colors select-none">TDBK <span className="text-blue-500">PRO</span></span>
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold tracking-wider">CBC Based</span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase font-mono mt-0.5">Multi-role Sandbox Simulator</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 hover:bg-slate-800/80 hover:text-white transition cursor-pointer select-none"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Portal Links</span>
              <span className="sm:hidden">Share</span>
            </button>
          </div>

          {/* Quick role tabs navigation switcher */}
          <div className="flex bg-[#0a0a0c] border border-[#1f1f23] rounded-xl p-1 overflow-x-auto scrollbar-none gap-0.5">
            {([
              { key: 'principal', icon: Users, label: 'Principal Hub', color: 'text-blue-400' },
              { key: 'teacher', icon: Briefcase, label: 'Teacher App', color: 'text-emerald-400' },
              { key: 'bursar', icon: Landmark, label: 'Bursar Hub', color: 'text-rose-450 text-rose-400' },
              { key: 'matron', icon: Moon, label: 'Matron Hub', color: 'text-indigo-450 text-indigo-400' },
              { key: 'kiosk', icon: Key, label: 'Student Kiosk', color: 'text-amber-400' },
              { key: 'parent', icon: Smartphone, label: 'Parent App', color: 'text-purple-400' },
              { key: 'gate', icon: ShieldCheck, label: 'Gate Security', color: 'text-slate-300' },
            ] as const).map((role) => {
              const Icon = role.icon;
              const isSelected = activeRole === role.key;
              return (
                <button
                  key={role.key}
                  onClick={() => setActiveRole(role.key)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap break-keep ${
                    isSelected 
                      ? 'bg-[#1c1c21] text-blue-400 font-bold border border-[#2d2d35] shadow-sm' 
                      : 'text-gray-500 hover:text-gray-300 hover:bg-[#0d0d10]/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${role.color}`} />
                  {role.label}
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* 2. LIVE SANDBOX INTERACTIVE TUTORIAL / SCENARIO GUIDE TRAY */}
      {showScenarioGuide && (
        <div className="bg-gradient-to-r from-slate-930 to-indigo-950 border-b border-indigo-900/40 p-4 text-xs font-normal">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex gap-3 items-start">
              <span className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-700 rounded-xl leading-none font-bold text-base mt-0.5">💡</span>
              <div className="space-y-1">
                <p className="font-bold text-indigo-250 flex items-center gap-1">
                  How to test unified live-state synchronizations:
                </p>
                <div className="text-slate-350 leading-relaxed space-y-1">
                  <p>• <strong>Scenario A (Smart Canteen Funding)</strong>: Go to <strong>Parent App</strong> ➔ Choose Grace Gitau ➔ Deposit 500/- with virtual M-Pesa. Switch to <strong>Student Kiosk</strong> ➔ Tap Ethan Gitau (PIN: 1234) ➔ Tap Wallet. The balance is updated! Tap Canteen Fresh Milk, cash decrements instantly.</p>
                  <p>• <strong>Scenario B (Leave Gate Pass Clearance)</strong>: Go to <strong>Student Kiosk</strong> (or Parent App) ➔ Submit leave gate-pass request. Switch to <strong>Teacher App</strong> or <strong>Principal Hub</strong> ➔ Approve it. Switch to <strong>Gate Security</strong> ➔ Find student's approved slip ➔ Click 'Scan Out'. The student bounds are marked off campus in real-time!</p>
                  <p>• <strong>Scenario C (Bursar & Matron care sync)</strong>: Go to <strong>Bursar Hub</strong> ➔ Post a Fee Payment of 10,000 KES. Switch to <strong>Parent App</strong> or <strong>Principal Hub</strong> ➔ The accounts ledger lists the cleared status! Go to <strong>Matron Hub</strong> ➔ Log a illness Observation entry. Switch to <strong>Kiosk</strong> or <strong>Parent App</strong> ➔ Safe clinical alert flags populate instantly on current student profiles.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowScenarioGuide(false)}
              className="text-indigo-400 hover:text-white hover:underline shrink-0 text-xs font-semibold font-mono self-end md:self-auto bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg whitespace-nowrap"
            >
              Hide Guide Card
            </button>
          </div>
        </div>
      )}

      {/* 3. SIMULATOR VIEWPORT BODY */}
      <main className="flex-1 bg-[#0a0a0c] relative selection:bg-blue-600/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="min-h-screen"
          >
            {activeRole === 'principal' && (
              <PrincipalDashboard 
                students={students}
                attendance={attendance}
                permissions={permissions}
                healthRecords={healthRecords}
                gateLogs={gateLogs}
                chatMessages={chatMessages}
                staff={staff}
                onApprovePermission={handleApprovePermission}
                onDeclinePermission={handleDeclinePermission}
                onSendAnnouncement={handleSendAnnouncement}
              />
            )}

            {activeRole === 'teacher' && (
              <TeacherPortal 
                students={students}
                attendance={attendance}
                permissions={permissions}
                cbcAssessments={cbcAssessments}
                chatMessages={chatMessages}
                onMarkAttendance={handleMarkAttendance}
                onApprovePermission={handleApprovePermission}
                onDeclinePermission={handleDeclinePermission}
                onAddAssessment={handleAddAssessment}
                onSendDirectMessage={handleSendDirectMessage}
                onMarkMessagesAsRead={handleMarkMessagesAsRead}
                typingStatus={typingStatus}
              />
            )}

            {activeRole === 'kiosk' && (
              <StudentKiosk 
                students={students}
                onAddTransaction={handleAddTransaction}
                onAddHealthQuery={handleAddHealthQuery}
                onAddPermissionRequest={handleAddPermissionRequest}
                chatMessages={chatMessages}
              />
            )}

            {activeRole === 'parent' && (
              <ParentApp 
                students={students}
                attendance={attendance}
                permissions={permissions}
                healthRecords={healthRecords}
                transactions={transactions}
                cbcAssessments={cbcAssessments}
                chatMessages={chatMessages}
                onAddTransaction={handleAddTransaction}
                onAddPermissionRequest={handleAddPermissionRequest}
                onSendChatMessage={handleSendChatMessage}
                onSendDirectMessage={handleSendDirectMessage}
                onMarkMessagesAsRead={handleMarkMessagesAsRead}
                typingStatus={typingStatus}
                onAddFeePayment={handleAddFeePayment}
              />
            )}

            {activeRole === 'gate' && (
              <GateKiosk 
                students={students}
                permissions={permissions}
                gateLogs={gateLogs}
                onCheckOutStudent={handleCheckOutStudent}
                onCheckInStudent={handleCheckInStudent}
              />
            )}

            {activeRole === 'bursar' && (
              <BursarDashboard 
                students={students}
                transactions={transactions}
                feePayments={feePayments}
                onAddFeePayment={handleAddFeePayment}
                onAddTransaction={handleAddTransaction}
              />
            )}

            {activeRole === 'matron' && (
              <MatronDashboard 
                students={students}
                healthRecords={healthRecords}
                onAddHealthQuery={handleAddHealthQuery}
                onUpdateStudentHealthStatus={handleUpdateStudentHealthStatus}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. MASTER FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-850 py-5 px-6 text-center text-slate-500 text-xs mt-auto font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] select-none">
          <p>© 2026 TDBK School boarding ecosystem systems. All local sync pools live.</p>
          <div className="flex justify-center gap-4 text-slate-450 font-bold font-mono">
            <span>DATABASE: LOCAL</span>
            <span>SYNC: REDIS_MOCK</span>
            <span>API: MULTI_VIRTUAL</span>
          </div>
        </div>
      </footer>

      {/* 5. DIRECT ACCESS LINK SHARING MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f1015] border border-[#2d2d34] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              
              {/* Modal Header */}
              <div className="p-5 border-b border-[#1f1f23] flex items-center justify-between bg-[#13141a]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔑</span>
                  <div>
                    <h3 className="font-sans font-bold text-base text-white tracking-tight">Direct Share Portal Access Links</h3>
                    <p className="text-[10px] text-slate-400 font-mono">DISTRIBUTE INDIVIDUAL ROLES SECURELY</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-white bg-[#1a1b22] hover:bg-[#252731] border border-[#2d2d34] text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
                >
                  ✕ Close
                </button>
              </div>

              {/* Informational Banner */}
              <div className="bg-indigo-950/20 border-b border-indigo-900/30 p-4 text-[11px] leading-relaxed text-slate-300 flex gap-2.5 items-start">
                <span className="text-sm">ℹ️</span>
                <p>
                  These direct links automatically switch the workspace for specific actors on load. 
                  Provide the designated URL to your **Parents, Teachers, Bursars, or Matrons** so they bypass general tabs and see only their pertaining environment.
                </p>
              </div>

              {/* Modal Scroll area */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-none">
                {([
                  { 
                    key: 'principal', 
                    icon: Users, 
                    label: 'Principal Hub', 
                    color: 'text-blue-400', 
                    desc: 'Secure comprehensive management, system override clearances, general announcements.',
                    subLinks: [
                      { label: 'Overview Metrics', params: '&principalTab=overview' },
                      { label: 'Gate Operations & Attendance', params: '&principalTab=gate' },
                      { label: 'Finance & Fee Ledgers', params: '&principalTab=finance' }
                    ]
                  },
                  { 
                    key: 'teacher', 
                    icon: Briefcase, 
                    label: 'Teacher Portal', 
                    color: 'text-emerald-400', 
                    desc: 'Daily attendance charts, student checkout controls, publishes professional CBC grade-cards.',
                    subLinks: [
                      { label: 'Attendance Board', params: '&teacherTab=attendance' },
                      { label: 'CBC Assessment Center', params: '&teacherTab=cbc' },
                      { label: 'Guardian Chat Messages', params: '&teacherTab=messages' }
                    ]
                  },
                  { 
                    key: 'bursar', 
                    icon: Landmark, 
                    label: 'Bursar Hub', 
                    color: 'text-rose-400', 
                    desc: 'Boarding student budget ledgers, manual high-school fees, and tuition reconciliation clearances.',
                    subLinks: [
                      { label: 'Accounts Overview', params: '&bursarTab=overview' },
                      { label: 'Tuition Payments Ledger', params: '&bursarTab=payments' },
                      { label: 'Pocket Money Balances', params: '&bursarTab=pocket-money' }
                    ]
                  },
                  { 
                    key: 'matron', 
                    icon: Moon, 
                    label: 'Matron Care Hub', 
                    color: 'text-indigo-400', 
                    desc: 'Log clinic visits, bed-rests, clinical sick bay admissions, and dorm tracking directories.',
                    subLinks: [
                      { label: 'Dormitories Assignments', params: '&matronTab=dormitories' },
                      { label: 'Clinical Sick Bay logs', params: '&matronTab=sickbay' },
                      { label: 'Laundry Tracking Board', params: '&matronTab=laundry' }
                    ]
                  },
                  { 
                    key: 'parent', 
                    icon: Smartphone, 
                    label: 'Parent Application', 
                    color: 'text-purple-400', 
                    desc: 'Real-time CBC progress reports, student tracking bounds, and live M-Pesa tuition clearing.',
                    subLinks: [
                      { label: "Ethan Gitau (TDBK-101)", params: '&studentId=TDBK-101&parentTab=home' },
                      { label: 'Academic CBC Grade Cards', params: '&studentId=TDBK-101&parentTab=academics' },
                      { label: 'Safaricom Tuition & Wallet Pay', params: '&studentId=TDBK-101&parentTab=wallet' }
                    ]
                  },
                  { 
                    key: 'kiosk', 
                    icon: Key, 
                    label: 'Student Kiosk Terminal', 
                    color: 'text-amber-400', 
                    desc: 'Self-service checkouts, smart card PIN balances, and interactive clinical self-reports.',
                    subLinks: []
                  },
                  { 
                    key: 'gate', 
                    icon: ShieldCheck, 
                    label: 'Gate Security Guard', 
                    color: 'text-slate-350', 
                    desc: 'Scans barcode exit slips on departure, security clock logs, and boarding boundaries tracking.',
                    subLinks: []
                  },
                ] as const).map((role) => {
                  const Icon = role.icon;
                  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''}?role=${role.key}`;
                  const isCopied = copiedKey === role.key;

                  return (
                    <div key={role.key} className="bg-[#121319] border border-[#1f2029] hover:border-[#2d2e3b] p-3.5 rounded-xl transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#181922] p-1.5 rounded-lg border border-[#232431]">
                            <Icon className={`h-4 w-4 ${role.color}`} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block leading-tight">{role.label}</span>
                            <span className="text-[9.5px] text-gray-500 font-mono tracking-wider">ROLE_ENDPOINT: ?role={role.key}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight pr-2">{role.desc}</p>
                        
                        {/* Interactive Deep-Link Hotspots Badges */}
                        {role.subLinks && role.subLinks.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                            <span className="text-[9px] text-[#555bf6] font-bold font-mono mr-1">DEEP FIELDS:</span>
                            {role.subLinks.map((sub, idx) => {
                              const isSubCopied = copiedKey === (role.key + sub.params);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleCopyLink(role.key, sub.params)}
                                  className={`px-2 py-0.5 text-[9px] font-semibold rounded font-mono border transition flex items-center gap-1 cursor-pointer ${
                                    isSubCopied 
                                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' 
                                      : 'bg-slate-900 border-[#1f2029] text-indigo-300 hover:bg-[#5f5bf6]/10 hover:text-white hover:border-[#5f5bf6]/40'
                                  }`}
                                >
                                  {sub.label}
                                  <span className="text-[8px] opacity-70">{isSubCopied ? '✓' : '📋'}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* URL displaying container */}
                        <div className="mt-2 flex items-center bg-[#0d0d12] border border-[#21222b] rounded-lg p-1">
                          <input 
                            type="text" 
                            readOnly 
                            value={shareUrl}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                            className="bg-transparent border-none text-[10px] font-mono text-indigo-400 flex-1 outline-none px-2 select-all py-0.5 cursor-text"
                          />
                        </div>
                      </div>

                      {/* Action buttons on the right */}
                      <div className="flex md:flex-col gap-2 shrink-0 justify-end">
                        <button
                          onClick={() => handleCopyLink(role.key)}
                          className={`px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-200 w-full md:w-32 text-center select-none ${
                            isCopied 
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                              : 'bg-[#5f5bf6]/15 border-[#5f5bf6]/30 text-indigo-300 hover:bg-[#5f5bf6]/35 hover:text-white'
                          }`}
                        >
                          {isCopied ? '✓ Copied!' : '📋 Copy Link'}
                        </button>
                        <button 
                          onClick={() => {
                            setActiveRole(role.key);
                            // Also load the sublinks parameters if any on active switch
                            if (role.subLinks && role.subLinks.length > 0) {
                              const searchParams = new URLSearchParams(role.subLinks[0].params);
                              searchParams.forEach((value, name) => {
                                if (typeof window !== 'undefined') {
                                  const u = new URL(window.location.href);
                                  u.searchParams.set(name, value);
                                  window.history.replaceState(null, '', u.pathname + u.search);
                                }
                              });
                            }
                            setShowShareModal(false);
                          }}
                          className="px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider bg-[#1c1c24] border border-[#2b2b36] text-slate-350 hover:bg-[#252531] hover:text-white rounded-lg transition text-center w-full md:w-32 select-none"
                        >
                          👁️ Enter Portal
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#111218] border-t border-[#1f1f23] flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>LOCAL SANDBOX ENDPOINTS IN SECURE CLEAR</span>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-1 px-3 rounded text-[10px] cursor-pointer"
                >
                  Finished
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
