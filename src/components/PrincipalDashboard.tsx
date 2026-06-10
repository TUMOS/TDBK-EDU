/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import StaffList from './StaffList';
import { motion } from 'motion/react';
import { 
  Users, CheckCircle2, AlertTriangle, Activity, 
  CreditCard, ShieldCheck, Mail, Send, Calendar, Clock, ArrowRight, UserCheck,
  UserPlus, UserMinus, ShieldAlert, BadgeInfo, PhoneCall, Check, Sparkles, Trash2, Search, SlidersHorizontal
} from 'lucide-react';
import AttendanceTrendChart from './AttendanceTrendChart';
import ECitizenPaymentTracker from './ECitizenPaymentTracker';
import SecretaryDashboard from './SecretaryDashboard';
import { 
  Student, AttendanceRecord, PermissionRequest, 
  HealthRecord, GateLog, ChatMessage, Staff, VisitorLog
} from '../types';
import { createDocument, updateDocument, deleteDocument } from '../lib/firebase';

interface PrincipalDashboardProps {
  students: Student[];
  attendance: AttendanceRecord[];
  permissions: PermissionRequest[];
  healthRecords: HealthRecord[];
  gateLogs: GateLog[];
  visitorLogs: VisitorLog[];
  chatMessages: ChatMessage[];
  staff?: Staff[];
  onApprovePermission: (id: string, approverName: string) => void;
  onDeclinePermission: (id: string) => void;
  onSendAnnouncement: (content: string) => void;
}

export default function PrincipalDashboard({
  students,
  attendance,
  permissions,
  healthRecords,
  gateLogs,
  visitorLogs,
  chatMessages,
  staff = [],
  onApprovePermission,
  onDeclinePermission,
  onSendAnnouncement,
}: PrincipalDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'health' | 'finance' | 'gate' | 'staff' | 'secretary' | 'students'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('principalTab');
      if (tabParam && ['overview', 'attendance', 'health', 'finance', 'gate', 'staff', 'secretary', 'students'].includes(tabParam)) {
        return tabParam as any;
      }
    }
    return 'overview';
  });

  // Sync state changes with URL parameters to enable instant address-bar bookmarking
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('principalTab') !== activeTab) {
        url.searchParams.set('principalTab', activeTab);
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    }
  }, [activeTab]);
  const [announcement, setAnnouncement] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // Staff Management States
  const [enrollName, setEnrollName] = useState('');
  const [enrollRole, setEnrollRole] = useState<string>('Teacher');
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollNationalId, setEnrollNationalId] = useState('');
  const [enrollSpecialization, setEnrollSpecialization] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Active' | 'Terminated'>('all');
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('all');
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');

  // Student Pool Management States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentGradeFilter, setStudentGradeFilter] = useState<string>('all');
  const [studentStreamFilter, setStudentStreamFilter] = useState<string>('all');

  const handleEnrollStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollError('');
    setEnrollSuccess('');

    if (!enrollName.trim() || !enrollPhone.trim() || !enrollNationalId.trim()) {
      setEnrollError('Name, Phone, and National ID are required fields.');
      return;
    }

    const staffId = 'STF-' + (100 + staff.length + 1) + '-' + Math.floor(Math.random() * 100);
    const newStaff: Staff = {
      id: staffId,
      name: enrollName.trim(),
      role: enrollRole,
      phone: enrollPhone.trim(),
      nationalId: enrollNationalId.trim(),
      specialization: enrollSpecialization.trim() || (enrollRole === 'Teacher' ? 'General CBC Facilitator' : 'Active Duty Shift'),
      status: 'Active',
      dateJoined: new Date().toISOString().split('T')[0]
    };

    try {
      await createDocument('staff', newStaff);
      setEnrollSuccess(`Staff "${enrollName}" enrolled successfully as ${enrollRole}! ID: ${staffId}`);
      // Clear fields
      setEnrollName('');
      setEnrollPhone('');
      setEnrollNationalId('');
      setEnrollSpecialization('');
    } catch (err) {
      setEnrollError('Failed to save staff member to the cloud database.');
    }
  };

  const handleToggleStaffStatus = async (staffId: string, currentStatus: 'Active' | 'Terminated') => {
    const nextStatus = currentStatus === 'Active' ? 'Terminated' : 'Active';
    try {
      await updateDocument('staff', staffId, { status: nextStatus });
    } catch (err) {
      console.error('Error toggling staff status: ', err);
    }
  };

  const handleDeleteStaffLog = async (staffId: string) => {
    if (window.confirm("Are you sure you want to completely delete this staff member from school records?")) {
      try {
        await deleteDocument('staff', staffId);
      } catch (err) {
        console.error('Error deleting staff: ', err);
      }
    }
  };

  // Helper metrics
  const totalStudents = students.length;
  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const sickCount = healthRecords.filter(h => h.status === 'Observation').length;
  const outCount = students.filter(s => s.status === 'Out of School').length;
  const pendingPerms = permissions.filter(p => p.status === 'Pending').length;

  const totalFeesExpected = students.reduce((sum, s) => sum + s.totalFees, 0);
  const totalFeesPaid = students.reduce((sum, s) => sum + s.paidFees, 0);
  const totalFeesBalance = totalFeesExpected - totalFeesPaid;
  const totalPocketMoney = students.reduce((sum, s) => sum + s.pocketMoneyBalance, 0);

  // Handle broadcast
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.trim()) return;
    onSendAnnouncement(announcement);
    setAnnouncement('');
    setAnnouncementSuccess(true);
    setTimeout(() => setAnnouncementSuccess(false), 3000);
  };

  return (
    <div id="principal-panel" className="bg-[#0a0a0c] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#e2e2e2]">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[#1f1f23]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-md text-xs font-semibold tracking-wider uppercase font-mono">Principal Admin</span>
            <span className="text-gray-500 text-sm font-medium">May 21, 2026</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mt-1">TDBK Principal Command</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time control node for boarding security, academic CBC assessments, and financial flows.</p>
        </div>
        
        {/* Rapid summary badge */}
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] rounded-lg p-2.5 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Campus Secure: {presentCount + sickCount}/{totalStudents} Accounted
          </div>
        </div>
      </div>

      {/* Main Grid: Metrics summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div id="metric-students" className="bg-white p-4.5 rounded-xl border border-gray-150 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Students Enrolled</p>
            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
          </div>
        </div>

        <div id="metric-attendance" className="bg-white p-4.5 rounded-xl border border-gray-150 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Roll Call Present</p>
            <p className="text-2xl font-bold text-gray-900">{presentCount}</p>
          </div>
        </div>

        <div id="metric-sick-bay" className="bg-white p-4.5 rounded-xl border border-gray-150 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Active In Sick-Bay</p>
            <p className="text-2xl font-bold text-gray-900">{sickCount}</p>
          </div>
        </div>

        <div id="metric-out" className="bg-white p-4.5 rounded-xl border border-gray-150 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Out of Bounds Log</p>
            <p className="text-2xl font-bold text-gray-900">{outCount}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Student Academics & Life Menu */}
        <div className="bg-[#121318] border border-[#1f1f23] rounded-xl overflow-hidden p-2">
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-2 mb-1">Student Academics & Life</h4>
          <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 px-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'overview' ? 'text-white bg-[#1a1b23]' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b23]/50'
              }`}
            >
              Overview Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'students' ? 'text-white bg-[#1a1b23]' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b23]/50'
              }`}
            >
              Students Pool
            </button>
            <button 
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'attendance' ? 'text-white bg-[#1a1b23]' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b23]/50'
              }`}
            >
              Daily Roll Call
            </button>
          </div>
        </div>

        {/* School Operations Menu */}
        <div className="bg-[#121318] border border-[#1f1f23] rounded-xl overflow-hidden p-2">
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-2 mb-1">School Operations (Staff & Admin)</h4>
          <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 px-1">
            <button 
              onClick={() => setActiveTab('staff')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'staff' ? 'text-white bg-[#1a1b23]' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b23]/50'
              }`}
            >
              Staff & HR
            </button>
            <button 
              onClick={() => setActiveTab('finance')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'finance' ? 'text-white bg-[#1a1b23]' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b23]/50'
              }`}
            >
              Finance Center
            </button>
            <button 
              onClick={() => setActiveTab('gate')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'gate' ? 'text-white bg-[#1a1b23]' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b23]/50'
              }`}
            >
              Security Checkpoints
            </button>
            <button 
              onClick={() => setActiveTab('health')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'health' ? 'text-white bg-[#1a1b23]' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b23]/50'
              }`}
            >
              Sick Bay ({sickCount})
            </button>
            <button 
              onClick={() => setActiveTab('secretary')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'secretary' ? 'text-white bg-[#1a1b23]' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b23]/50'
              }`}
            >
              Secretary Hub
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1 & 2 (Main panel for state logs and reports) */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'overview' && (
            <>
              {/* Approvals Box */}
              <div id="approvals-queue" className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="text-amber-500 h-5 w-5" /> 
                      Gate-Pass Authorization Queue
                    </h3>
                    <p className="text-xs text-gray-500">Sign off out-of-school leave permits requested by parents or teaching staff.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingPerms > 0 && (
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to approve all pending passes?")) {
                            permissions.filter(p => p.status === 'Pending').forEach(p => onApprovePermission(p.id, "Principal Wekesa"));
                          }
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Bulk Approve
                      </button>
                    )}
                    <span className="bg-amber-100 text-amber-800 font-mono text-xs font-semibold px-2 py-0.5 rounded-full">
                      {pendingPerms} pending
                    </span>
                  </div>
                </div>

                {permissions.filter(p => p.status === 'Pending').length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <UserCheck className="mx-auto h-8 w-8 text-gray-300 stroke-1 mb-2" />
                    <p className="text-sm font-medium">All leave passes processed and cleared</p>
                    <p className="text-xs">Incoming requests appear instantly</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {permissions.filter(p => p.status === 'Pending').map((pass) => (
                      <motion.div 
                        key={pass.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-150 rounded-xl hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{pass.studentName}</span>
                            <span className="text-xs text-gray-400 font-mono bg-white border px-1.5 py-0.5 rounded">{pass.studentId}</span>
                            <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded">
                              {pass.passType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 italic">"{pass.reason}"</p>
                          <div className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" /> Requested: {pass.dateRequested} | Valid for: <span className="font-medium text-slate-800">{pass.dateValid}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0 self-end">
                          <button 
                            onClick={() => onDeclinePermission(pass.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-150"
                          >
                            Decline
                          </button>
                          <button 
                            onClick={() => onApprovePermission(pass.id, "Principal Wekesa")}
                            className="bg-emerald-600 text-white font-medium text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition"
                          >
                            Approve Pass
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attendance Trend Chart */}
              <AttendanceTrendChart attendance={attendance} />
            </>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">Today's Class Roll Call</h3>
                <p className="text-xs text-gray-500">Official log generated from teacher tablet roll registers synced at prep-time.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-xs font-medium bg-gray-50">
                      <th className="py-2 px-3">Student ID</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Grade/Stream</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Marked By</th>
                      <th className="py-2 px-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendance.map((rec) => {
                      const student = students.find(s => s.id === rec.studentId);
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono text-xs">{rec.studentId}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{rec.studentName}</td>
                          <td className="py-2.5 px-3 text-slate-500">{rec.grade} • {rec.stream}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              rec.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                              rec.status === 'Sick' ? 'bg-amber-100 text-amber-800' :
                              rec.status === 'Permission' ? 'bg-indigo-100 text-indigo-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-xs">{rec.markedBy}</td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-xs">{rec.timestamp}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">Infirmary & Sick-Bay Register</h3>
                <p className="text-xs text-gray-500">Real-time health admissions logged by Nurse Beatrice.</p>
              </div>

              {healthRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                  <p>No active patients registered in the sick bay.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {healthRecords.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-800">{item.studentName}</p>
                          <p className="text-xs font-mono text-slate-400">{item.studentId} • {item.grade}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          item.severity === 'Severe' ? 'bg-red-100 text-red-800' :
                          item.severity === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.severity} Severity
                        </span>
                      </div>
                      <p className="text-sm text-slate-700"><strong>Symptoms:</strong> {item.symptoms}</p>
                      <p className="text-xs text-slate-600"><strong>Action Taken:</strong> {item.actionTaken}</p>
                      <div className="pt-2 border-t border-amber-100/65 flex justify-between items-center text-xs">
                        <span className="bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded">Status: {item.status}</span>
                        <span className="text-slate-400 font-mono">Logged: {item.dateLogged}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900">Bursar Ledger Analysis</h3>
                  <p className="text-xs text-gray-500">Consolidated overview of direct tuition fees and smart-card pocket money pools.</p>
                </div>

                {/* Financial balances grids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 text-slate-800">
                    <span className="text-xs text-gray-500 font-medium tracking-tight">Tuition Collected</span>
                    <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">KES {totalFeesPaid.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Direct bank transfer and M-Pesa</p>
                  </div>
                  <div className="p-4 rounded-xl border border-red-100 bg-red-50/20 text-slate-800">
                    <span className="text-xs text-gray-500 font-medium tracking-tight">Out-standing Fees Balance</span>
                    <p className="text-2xl font-bold font-mono text-red-700 mt-1">KES {totalFeesBalance.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Sms warning notifications ready</p>
                  </div>
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 text-slate-800">
                    <span className="text-xs text-gray-500 font-medium tracking-tight">Kiosk Card Depository</span>
                    <p className="text-2xl font-bold font-mono text-indigo-700 mt-1">KES {totalPocketMoney.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Parent-funded pocket cash holdings</p>
                  </div>
                </div>

                {/* Student Accounts Sub-table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono">Individual Student Ledger Cards</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-150 text-xs font-mono text-gray-400 font-light">
                          <th className="py-2">Student</th>
                          <th className="py-2">Tuition Coverage</th>
                          <th className="py-2">Pending Balance</th>
                          <th className="py-2">Kiosk Cash Wallet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {students.map((st) => {
                          const paidPercent = Math.round((st.paidFees / st.totalFees) * 100);
                          return (
                            <tr key={st.id} className="hover:bg-slate-50/30 text-xs py-2">
                              <td className="py-3 font-semibold text-slate-700">
                                {st.name} <span className="font-normal font-mono text-gray-400">({st.id})</span>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-slate-100 rounded-full h-1.5">
                                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${paidPercent}%` }}></div>
                                  </div>
                                  <span className="font-mono text-slate-700 font-semibold">{paidPercent}%</span>
                                </div>
                              </td>
                              <td className="py-3 font-mono text-red-600 font-semibold">
                                KES {(st.totalFees - st.paidFees).toLocaleString()}
                              </td>
                              <td className="py-3 font-mono font-bold text-indigo-600">
                                KES {st.pocketMoneyBalance.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <ECitizenPaymentTracker />
            </div>
          )}

          {activeTab === 'gate' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="text-emerald-500 h-5 w-5" /> Active Guard Desk Status</h3>
                  <p className="text-xs text-gray-400">Security checkpoint synced at Gate 1 with terminal device scanners.</p>
                </div>
                <span className="bg-emerald-600/35 border border-emerald-500 text-emerald-400 text-xs px-2.5 py-1 rounded font-mono animate-pulse">
                  Terminal Online
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase font-mono tracking-wider">Historical Guard Crossing Journal</h4>
                {gateLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                    No crossing logs captured yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {gateLogs.map((log) => (
                      <div key={log.id} className="flex justify-between items-center p-3 bg-slate-50 border rounded-lg text-xs md:text-sm">
                        <div className="flex items-center gap-3">
                          <span className={`p-1.5 rounded font-bold font-mono ${
                            log.action === 'Check-Out' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {log.action === 'Check-Out' ? 'OUT' : 'IN'}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800">{log.studentName} <span className="font-normal font-mono text-gray-400">({log.studentId})</span></p>
                            <p className="text-xs text-gray-500">Cleared via {log.passType || 'Standard Roll Call'} by {log.clearedBy}</p>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <p className="font-mono text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{log.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="text-blue-500 h-5 w-5" /> 
                    Students Pool
                  </h3>
                  <p className="text-xs text-gray-500">Manage all student pools filtered by grade or stream classifications.</p>
                </div>
                {/* Search & filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search student Name or ID..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="text-xs pl-8 pr-3 py-1.5 w-48 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-gray-400"
                    />
                  </div>
                  <select
                    value={studentGradeFilter}
                    onChange={(e: any) => setStudentGradeFilter(e.target.value)}
                    className="text-xs bg-gray-50 border rounded-lg p-1.5 text-gray-600 focus:outline-none"
                  >
                    <option value="all">All Grades</option>
                    {Array.from(new Set(students.map(s => s.grade))).sort().map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <select
                    value={studentStreamFilter}
                    onChange={(e: any) => setStudentStreamFilter(e.target.value)}
                    className="text-xs bg-gray-50 border rounded-lg p-1.5 text-gray-600 focus:outline-none"
                  >
                    <option value="all">All Streams</option>
                    {Array.from(new Set(students.map(s => s.stream))).sort().map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              
              <div className="overflow-x-auto mt-4 border border-gray-150 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-medium text-xs border-b border-gray-150 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">ID Number</th>
                      <th className="py-2.5 px-3">Grade</th>
                      <th className="py-2.5 px-3">Stream</th>
                      <th className="py-2.5 px-3 border-l border-gray-150 text-right">Academics Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {students
                      .filter(s => studentSearch === '' || s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.id.toLowerCase().includes(studentSearch.toLowerCase()))
                      .filter(s => studentGradeFilter === 'all' || s.grade === studentGradeFilter)
                      .filter(s => studentStreamFilter === 'all' || s.stream === studentStreamFilter)
                      .map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/50 text-sm">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{st.name}</td>
                          <td className="py-2.5 px-3 font-mono text-gray-500">{st.id}</td>
                          <td className="py-2.5 px-3 text-emerald-700 font-medium">{st.grade}</td>
                          <td className="py-2.5 px-3 text-slate-600">{st.stream}</td>
                          <td className="py-2.5 px-3 border-l border-gray-150 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                              st.status === 'In School' ? 'bg-emerald-100 text-emerald-800' : 
                              st.status === 'Sick Bay' ? 'bg-amber-100 text-amber-800' :
                              st.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {st.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    {students.filter(s => studentSearch === '' || s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.id.toLowerCase().includes(studentSearch.toLowerCase()))
                      .filter(s => studentGradeFilter === 'all' || s.grade === studentGradeFilter)
                      .filter(s => studentStreamFilter === 'all' || s.stream === studentStreamFilter).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400 text-xs italic">
                          No students matched your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="text-blue-500 h-5 w-5" /> 
                    Staff Directory & Roster
                  </h3>
                  <p className="text-xs text-gray-500">Live roster of authorized school staff. Manage enrollment privileges or block entries.</p>
                </div>
                {/* Search & filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search staff Name..."
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      className="text-xs pl-8 pr-3 py-1.5 w-40 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-gray-400"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e: any) => setRoleFilter(e.target.value)}
                    className="text-xs bg-gray-50 border rounded-lg p-1.5 text-gray-600 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active Only</option>
                    <option value="Terminated">Terminated Only</option>
                  </select>
                </div>
              
              <StaffList 
                staff={staff} 
                staffSearch={staffSearch} 
                roleFilter={roleFilter} 
                handleDeleteStaffLog={handleDeleteStaffLog} 
                handleToggleStaffStatus={handleToggleStaffStatus} 
              />
            </div>
          )}

          {activeTab === 'secretary' && (
            <SecretaryDashboard 
              chatMessages={chatMessages}
              visitorLogs={visitorLogs}
            />
          )}

        </div>

        {/* Column 3 (Broadcasts, announcements & Live feed notifications) */}
        <div className="space-y-6">
          
          {activeTab === 'staff' ? (
            /* Secure Staff Enrollment Register form */
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="text-blue-500 h-5 w-5" />
                <h3 className="font-semibold text-slate-900 leading-tight">Enlist New Staff Record</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">Digitally enroll a new teacher, matron, or guard with immediate system-access permissions.</p>

              <form onSubmit={handleEnrollStaffSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Full Name (e.g. Madam Mercy)</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full title/name"
                    value={enrollName}
                    onChange={(e) => setEnrollName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-150 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Role Assignment / Office Title</label>
                    <input
                      type="text"
                      list="dynamicRoles"
                      value={enrollRole}
                      onChange={(e) => setEnrollRole(e.target.value)}
                      placeholder="Select or type a custom role"
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-150 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                    <datalist id="dynamicRoles">
                      <option value="Teacher" />
                      <option value="Gate Guardian" />
                      <option value="Bursar" />
                      <option value="Matron" />
                      <option value="Nurse" />
                      <option value="School Deputy" />
                      <option value="Director" />
                      <option value="Accounts" />
                      <option value="Secretary" />
                      <option value="Administrator" />
                    </datalist>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">National ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 29871654"
                      value={enrollNationalId}
                      onChange={(e) => setEnrollNationalId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-150 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +254 711 223 344"
                    value={enrollPhone}
                    onChange={(e) => setEnrollPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-150 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Specialization / Post Assigned</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics, Night shift, Matron lead"
                    value={enrollSpecialization}
                    onChange={(e) => setEnrollSpecialization(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-150 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-gray-400"
                  />
                </div>

                {enrollError && (
                  <p className="text-[10px] text-red-500 bg-red-50 p-2.5 border border-red-250 rounded-lg text-center font-medium">
                    {enrollError}
                  </p>
                )}

                {enrollSuccess && (
                  <p className="text-[10px] text-emerald-800 bg-emerald-50 p-2.5 border border-emerald-250 rounded-lg text-center font-medium">
                    {enrollSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" /> Enlist Staff & Sync Cloud
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <h1 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-1">
                <Mail className="text-indigo-600 h-5 w-5" /> 
                Emergency Broadcast
              </h1>
              <p className="text-xs text-gray-500 mb-4">Direct parents notifications stream. Sends instant alerts via SMS protocols.</p>

              <form onSubmit={handleBroadcast} className="space-y-3">
                <textarea 
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Type school announcement text here (e.g. Weather advice or closing dates)..."
                  maxLength={160}
                  className="w-full text-xs p-3 border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 h-24 resize-none text-slate-800"
                />
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span>{160 - announcement.length} characters left</span>
                  <span>Standard SMS format (M-GURUSH ready)</span>
                </div>

                {announcementSuccess && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-2 text-center text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg font-medium"
                  >
                    Broadcast sent to {totalStudents} parents successfully!
                  </motion.div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" /> Broadcast Announcement
                </button>
              </form>
            </div>
          )}

          {/* Quick Logs Feed */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <Clock className="text-gray-400 h-4 w-4" /> 
                System Flow Log
              </h3>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {/* Generate timeline items dynamically */}
              {gateLogs.slice().reverse().map((log) => (
                <div key={log.id} className="border-l-2 border-red-300 pl-3.5 py-0.5 relative text-xs">
                  <div className="h-2 w-2 rounded-full bg-red-400 absolute -left-[5px] top-1.5"></div>
                  <p className="font-medium text-slate-800">Student Exited Gate</p>
                  <p className="text-gray-500">{log.studentName} logged Check-Out via {log.passType || 'Pass'}</p>
                  <span className="text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}

              {healthRecords.filter(h => h.status === 'Observation').map((h) => (
                <div key={h.id} className="border-l-2 border-amber-300 pl-3.5 py-0.5 relative text-xs">
                  <div className="h-2 w-2 rounded-full bg-amber-400 absolute -left-[5px] top-1.5"></div>
                  <p className="font-medium text-slate-800">Infirmary Admission</p>
                  <p className="text-gray-500">{h.studentName} hospitalized: {h.symptoms}</p>
                  <span className="text-[10px] text-gray-400 font-mono">Today</span>
                </div>
              ))}

              {chatMessages.filter(m => m.sender === 'Parent').map((m) => (
                <div key={m.id} className="border-l-2 border-indigo-300 pl-3.5 py-0.5 relative text-xs">
                  <div className="h-2 w-2 rounded-full bg-indigo-400 absolute -left-[5px] top-1.5"></div>
                  <p className="font-medium text-slate-800">Parent Query Received</p>
                  <p className="text-gray-500">{m.senderName}: "{m.content.slice(0, 30)}..."</p>
                  <span className="text-[10px] text-gray-400 font-mono">Today</span>
                </div>
              ))}

              <div className="border-l-2 border-slate-300 pl-3.5 py-0.5 relative text-xs">
                <div className="h-2 w-2 rounded-full bg-slate-400 absolute -left-[5px] top-1.5"></div>
                <p className="font-medium text-slate-800">Database Seed Ready</p>
                <p className="text-gray-500">All local sync pools flushed and active.</p>
                <span className="text-[10px] text-gray-400 font-mono">System Start</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
