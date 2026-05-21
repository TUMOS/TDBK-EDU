/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  UserCheck, ClipboardList, PenTool, CheckCircle, 
  Clock, PlusCircle, Bookmark, Star, HelpCircle, 
  Calendar, Inbox, CheckCircle2, UserPlus, FileWarning, ArrowRight 
} from 'lucide-react';
import { Student, AttendanceRecord, PermissionRequest, CbcAssessment, assessmentScore, AttendanceStatus, PassType, ChatMessage } from '../types';

interface TeacherPortalProps {
  students: Student[];
  attendance: AttendanceRecord[];
  permissions: PermissionRequest[];
  cbcAssessments: CbcAssessment[];
  chatMessages: ChatMessage[];
  onMarkAttendance: (studentId: string, status: AttendanceStatus, markedBy: string) => void;
  onApprovePermission: (id: string, approvedBy: string) => void;
  onDeclinePermission: (id: string) => void;
  onAddAssessment: (assessment: Omit<CbcAssessment, 'id' | 'date'>) => void;
  onSendDirectMessage: (sender: 'Parent' | 'Teacher' | 'Principal' | 'System', senderName: string, recipientId: string, content: string) => void;
  onMarkMessagesAsRead: (studentId: string, role: 'Parent' | 'Teacher') => void;
  typingStatus: Record<string, string>;
}

export default function TeacherPortal({
  students,
  attendance,
  permissions,
  cbcAssessments,
  chatMessages,
  onMarkAttendance,
  onApprovePermission,
  onDeclinePermission,
  onAddAssessment,
  onSendDirectMessage,
  onMarkMessagesAsRead,
  typingStatus,
}: TeacherPortalProps) {
  // Navigation tabs for teacher workspace
  const [activeTab, setActiveTab] = useState<'attendance' | 'approval' | 'cbc' | 'messages'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('teacherTab');
      if (tabParam && ['attendance', 'approval', 'cbc', 'messages'].includes(tabParam)) {
        return tabParam as any;
      }
    }
    return 'attendance';
  });

  // Sync state changes with URL parameters to enable instant address-bar bookmarking
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('teacherTab') !== activeTab) {
        url.searchParams.set('teacherTab', activeTab);
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    }
  }, [activeTab]);

  // Direct chat states
  const [selectedParentId, setSelectedParentId] = useState<string>(students[0]?.id || '');
  const [msgInput, setMsgInput] = useState<string>('');

  // CBC Form states
  const [cbcStudentId, setCbcStudentId] = useState(students[0]?.id || '');
  const [learningArea, setLearningArea] = useState('Mathematics');
  const [strand, setStrand] = useState('Fractions & Ratios');
  const [task, setTask] = useState('Interpreting fractional parts of objects');
  const [score, setScore] = useState<assessmentScore>('ME');
  const [comments, setComments] = useState('');
  const [assessmentSuccess, setAssessmentSuccess] = useState(false);

  // Quick feedback messaging
  const [notifMessage, setNotifMessage] = useState('');

  // Unread badge getters
  const getParentUnreadCount = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return 0;
    return chatMessages.filter(msg => 
      msg.recipientId === 'teacher-mercy' && 
      msg.senderName === student.parentName && 
      !msg.isRead
    ).length;
  };

  const totalUnreadMercury = chatMessages.filter(msg => msg.recipientId === 'teacher-mercy' && !msg.isRead).length;

  // Sync messages read status
  React.useEffect(() => {
    if (activeTab === 'messages' && selectedParentId) {
      onMarkMessagesAsRead(selectedParentId, 'Teacher');
    }
  }, [activeTab, selectedParentId, chatMessages.length]);

  // Handle assessment submission
  const handleSubmitAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === cbcStudentId);
    if (!student) return;

    onAddAssessment({
      studentId: cbcStudentId,
      studentName: student.name,
      grade: student.grade,
      learningArea,
      strand,
      task,
      score,
      comments,
      assessedBy: "Madam Mercy (Class Teacher)",
    });

    setComments('');
    setAssessmentSuccess(true);
    setNotifMessage(`Published ${student.name}'s ${learningArea} rubric card.`);
    setTimeout(() => {
      setAssessmentSuccess(false);
      setNotifMessage('');
    }, 4500);
  };

  const handleQuickRollCall = (studentId: string, status: AttendanceStatus) => {
    onMarkAttendance(studentId, status, "Madam Mercy");
    setNotifMessage(`Marked attendance status to [${status}] successfully.`);
    setTimeout(() => setNotifMessage(''), 3000);
  };

  return (
    <div id="teacher-panel" className="bg-[#0a0a0c] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#e2e2e2]">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[#1f1f23]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-semibold tracking-wider uppercase font-mono">Academic Portal</span>
            <span className="text-gray-500 text-sm">Instructor: Madam Mercy (Grade 7 & 8)</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mt-1">Teacher Web Terminal</h1>
          <p className="text-sm text-gray-500 mt-0.5">Direct link to boarding roll call, gate clearances, and Competency-Based Curriculum (CBC) metrics.</p>
        </div>
 
        {/* Sync Status Badge */}
        <div className="mt-4 md:mt-0 flex gap-2">
          {notifMessage ? (
            <div className="bg-[#10b981]/10 text-emerald-400 border border-[#10b981]/20 text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-medium animate-pulse">
              <CheckCircle className="h-4 w-4" /> {notifMessage}
            </div>
          ) : (
            <div className="bg-[#1c1c21] text-gray-500 border border-[#2d2d35] text-xs px-3 py-2 rounded-xl flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping mr-1"></span>
              Class Sync Buffer Flush Active
            </div>
          )}
        </div>
      </div>
 
      {/* Main Grid Tabs */}
      <div className="flex gap-2 border-b border-[#1f1f23] pb-px mb-6 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition flex items-center gap-2 border-b-2 break-keep whitespace-nowrap ${
            activeTab === 'attendance' ? 'text-emerald-400 bg-[#15161a] border-emerald-500 font-bold' : 'text-gray-500 hover:text-white border-transparent'
          }`}
        >
          <ClipboardList className="h-4 w-4" /> 
          Mark Attendance Grid
        </button>
 
        <button
          onClick={() => setActiveTab('approval')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition flex items-center gap-2 border-b-2 break-keep whitespace-nowrap ${
            activeTab === 'approval' ? 'text-emerald-400 bg-[#15161a] border-emerald-500 font-bold' : 'text-gray-500 hover:text-white border-transparent'
          }`}
        >
          <UserCheck className="h-4 w-4" /> 
          Egress Permit Approval Queue ({permissions.filter(p => p.status === 'Pending').length})
        </button>
 
        <button
          onClick={() => setActiveTab('cbc')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition flex items-center gap-2 border-b-2 break-keep whitespace-nowrap ${
            activeTab === 'cbc' ? 'text-emerald-400 bg-[#15161a] border-emerald-500 font-bold' : 'text-gray-500 hover:text-white border-transparent'
          }`}
        >
          <PenTool className="h-4 w-4" /> 
          Publish CBC Rubrics
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition flex items-center gap-2 border-b-2 break-keep whitespace-nowrap ${
            activeTab === 'messages' ? 'text-emerald-400 bg-[#15161a] border-emerald-500 font-bold' : 'text-gray-500 hover:text-white border-transparent'
          }`}
        >
          <Inbox className="h-4 w-4 text-emerald-400" /> 
          Direct Parents' Hotline
          {totalUnreadMercury > 0 && (
            <span className="ml-1.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
              {totalUnreadMercury}
            </span>
          )}
        </button>
      </div>

      {/* Grid layouts body */}
      {activeTab === 'messages' ? (
        <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-lg min-h-[550px] grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel: Parents hotline directory list */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <div className="pb-2 border-b border-[#1f1f23] shrink-0">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">My Class Families</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Select a thread to review direct real-time chats.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[480px]">
              {students.map((st) => {
                const isSelected = selectedParentId === st.id;
                const unreads = getParentUnreadCount(st.id);
                const latestMsg = chatMessages
                  .filter(msg => 
                    (msg.recipientId === 'teacher-mercy' && msg.senderName === st.parentName) ||
                    (msg.sender === 'Teacher' && msg.recipientId === st.id)
                  )
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .pop();

                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setSelectedParentId(st.id);
                      onMarkMessagesAsRead(st.id, 'Teacher');
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-[#1c1c21] border-emerald-500 text-white shadow-md'
                        : 'bg-[#0d0d10] border-[#1f1f23] text-gray-400 hover:border-[#2d2d35]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="h-8 w-8 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        {st.avatar}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-white truncate">{st.parentName}</p>
                        <p className="text-[9.5px] text-gray-500 truncate">{st.name} ({st.grade})</p>
                        {latestMsg && (
                          <p className="text-[9px] text-gray-400 truncate italic mt-0.5">"{latestMsg.content}"</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {latestMsg && (
                        <span className="text-[8px] text-gray-500 font-mono">
                          {new Date(latestMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {unreads > 0 && (
                        <span className="h-4.5 min-w-4.5 px-1 bg-red-500 border border-red-600 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm animate-bounce leading-none">
                          {unreads}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Active chat conversation */}
          <div className="md:col-span-2">
            {(() => {
              const selectedStudent = students.find(s => s.id === selectedParentId);
              if (!selectedStudent) {
                return (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
                    <span className="text-4xl mb-2">💬</span>
                    <p className="text-sm font-bold text-white">No discussion thread active</p>
                    <p className="text-[11px] mt-0.5">Choose a parent helpline from the sidebar list to start direct conversations.</p>
                  </div>
                );
              }

              const threadChats = chatMessages.filter(c => 
                (c.sender === 'Parent' && c.senderName === selectedStudent.parentName && c.recipientId === 'teacher-mercy') ||
                (c.sender === 'Teacher' && c.recipientId === selectedStudent.id)
              );

              return (
                <div className="flex flex-col h-[480px] bg-[#0d0d10] border border-[#1f1f23] rounded-2xl overflow-hidden shadow-xs">
                  {/* Active Header */}
                  <div className="p-3 bg-[#111216] border-b border-[#1f1f23] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-9 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center text-base">
                        {selectedStudent.avatar}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-white">{selectedStudent.parentName}</h4>
                        <p className="text-[9.5px] text-gray-500">
                          Student Link: <span className="text-emerald-400 font-bold">{selectedStudent.name} ({selectedStudent.id})</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-500 font-mono">
                      Mobile: {selectedStudent.parentPhone}
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
                    {threadChats.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500">
                        <span className="text-3xl mb-1">💬</span>
                        <p className="text-xs font-bold text-gray-400">Fresh Dialogue Opened</p>
                        <p className="text-[10px] max-w-xs mt-1">Send secure checklists, academic comments, medical alerts, or gate-leave updates safely.</p>
                      </div>
                    ) : (
                      threadChats.map((msg) => {
                        const isSelf = msg.sender === 'Teacher';
                        return (
                          <div 
                            key={msg.id} 
                            className={`max-w-[80%] p-2.5 rounded-2xl relative shadow-md space-y-1 text-xs ${
                              isSelf 
                                ? 'bg-emerald-600 text-white rounded-tr-none ml-auto' 
                                : 'bg-[#15161a] border border-[#1f1f23] rounded-tl-none text-gray-200 mr-auto'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <span className={`text-[8px] uppercase font-mono font-bold ${
                                isSelf ? 'text-emerald-200' : 'text-emerald-400'
                              }`}>
                                {msg.senderName}
                              </span>
                              <span className="text-[7.5px] text-gray-500 font-mono">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] whitespace-pre-wrap">{msg.content}</p>

                            {/* Read Receipt checkmark */}
                            {isSelf && (
                              <div className="text-[8px] flex justify-end items-center gap-0.5 leading-none mt-0.5 select-none font-bold">
                                {msg.isRead ? (
                                  <span className="text-blue-300 font-black tracking-tight flex items-center leading-none">✓✓ Read</span>
                                ) : (
                                  <span className="text-emerald-200/60 font-semibold tracking-tight flex items-center leading-none">✓ Sent</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Typing Status */}
                    {typingStatus[selectedStudent.id] && (
                      <div className="flex items-center gap-2 bg-[#15161a]/30 border border-[#1f1f23]/30 p-2 rounded-xl rounded-tl-none w-[70%] mr-auto py-1.5 px-2.5">
                        <div className="flex gap-1 items-center">
                          <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-medium font-mono">Parent is typing...</span>
                      </div>
                    )}
                  </div>

                  {/* Message Input form controls */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!msgInput.trim()) return;
                      onSendDirectMessage('Teacher', 'Madam Mercy', selectedStudent.id, msgInput);
                      setMsgInput('');
                    }} 
                    className="p-2.5 bg-[#111216] border-t border-[#1f1f23] flex gap-2"
                  >
                    <input 
                      type="text"
                      required
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      placeholder={`Direct message ${selectedStudent.parentName}...`}
                      className="flex-1 text-[11px] px-3.5 py-2.5 bg-[#0d0d10] border border-[#1f1f23] rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder-gray-500 font-sans"
                    />
                    <button 
                      type="submit"
                      className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition text-[10px] font-extrabold tracking-tight"
                    >
                      SEND
                    </button>
                  </form>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left main work panels */}
        <div className="lg:col-span-2 space-y-6">

          {/* ACTIVE TAB: FIELD ATTENDANCE CALL */}
          {activeTab === 'attendance' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">Weekly Roll Session</h3>
                <p className="text-xs text-gray-500">Record check-in status card for pupils below. Marking status updates Parent trackers and Principal grids instantaneously.</p>
              </div>

              <div className="space-y-2.5">
                {students.map((st) => {
                  const currentAttObj = attendance.find(a => a.studentId === st.id);
                  const markedStatus = currentAttObj ? currentAttObj.status : null;

                  return (
                    <div 
                      key={st.id} 
                      className="p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-1 bg-white border rounded-lg shadow-2xs leading-none">{st.avatar}</span>
                        <div>
                          <p className="font-semibold text-slate-800">{st.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{st.id} • {st.grade} ({st.stream})</p>
                        </div>
                      </div>

                      {/* Flex controls for taking roll call */}
                      <div className="flex flex-wrap gap-1.5 self-end md:self-auto">
                        {(['Present', 'Absent', 'Sick', 'Permission'] as AttendanceStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleQuickRollCall(st.id, status)}
                            className={`px-3 py-1 text-xs font-semibold font-mono rounded-lg transition border ${
                              markedStatus === status
                                ? status === 'Present' ? 'bg-emerald-600 text-white border-emerald-600' :
                                  status === 'Absent' ? 'bg-red-600 text-white border-red-600' :
                                  status === 'Sick' ? 'bg-amber-500 text-white border-amber-500' :
                                  'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white border-gray-200 hover:border-slate-400 text-slate-600'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIVE TAB: PASS REVIEWS */}
          {activeTab === 'approval' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">Egress Clearances & Permission Board</h3>
                <p className="text-xs text-gray-500">Assess out-of-school leave pass requests submitted by boarding pupils via Student Kiosk.</p>
              </div>

              {permissions.filter(p => p.status === 'Pending').length === 0 ? (
                <div className="text-center py-12 text-gray-400 border border-dashed rounded-xl bg-gray-50">
                  <Inbox className="h-8 w-8 mx-auto text-gray-300 mb-2 stroke-1" />
                  <p className="text-sm font-semibold">Clear pending queue found</p>
                  <p className="text-xs text-gray-400">All leave requests processed successfully.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {permissions.filter(p => p.status === 'Pending').map((p) => (
                    <div 
                      key={p.id}
                      className="p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/10 space-y-2.5 flex flex-col justify-between hover:bg-emerald-50/20"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{p.studentName}</p>
                          <p className="text-xs font-mono text-slate-400">{p.studentId} • {p.grade}</p>
                        </div>
                        <span className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold font-mono">
                          {p.passType}
                        </span>
                      </div>

                      <div className="p-3 bg-white border text-sm italic rounded-lg text-slate-700">
                        "{p.reason}"
                      </div>

                      <p className="text-xs text-gray-400">Requested Validation Date: <strong className="text-slate-800 text-xs">{p.dateValid}</strong></p>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button 
                          onClick={() => onDeclinePermission(p.id)}
                          className="px-3.5 py-1.5 text-xs font-medium text-red-655 hover:bg-red-50 rounded-lg transition"
                        >
                          Decline Permit
                        </button>
                        <button 
                          onClick={() => onApprovePermission(p.id, "Class Tr. Mercy")}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition"
                        >
                          Approve Permit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACTIVE TAB: PUBLISH ASSESSMENTS */}
          {activeTab === 'cbc' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">Kenyan CBC Rubrics Editor</h3>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest text-[#059669]">Skill Competency Grades</p>
              </div>

              <form onSubmit={handleSubmitAssessment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Evaluate Student</label>
                    <select 
                      value={cbcStudentId}
                      onChange={(e) => setCbcStudentId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border bg-slate-50 focus:bg-white"
                    >
                      {students.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.id} • {st.grade})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Learning Area (Subject)</label>
                    <select 
                      value={learningArea}
                      onChange={(e) => setLearningArea(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border bg-slate-50 focus:bg-white"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science & Technology">Science & Technology</option>
                      <option value="Social Studies">Social Studies</option>
                      <option value="Creative Arts & Sports">Creative Arts & Sports</option>
                      <option value="Agriculture & Nutrition">Agriculture & Nutrition</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <input 
                      type="text"
                      placeholder="Strand Name (e.g. Fractions & Percents)"
                      required
                      value={strand}
                      onChange={(e) => setStrand(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <input 
                      type="text"
                      placeholder="Task Evaluated (e.g. Solving equivalent percentages)"
                      required
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Score selector */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block mb-1">Competency Level Score Scale</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { code: 'EE', label: 'EE (Exceeding Expected)' },
                      { code: 'ME', label: 'ME (Meeting Expected)' },
                      { code: 'AE', label: 'AE (Approaching Expected)' },
                      { code: 'BE', label: 'BE (Below Expected)' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => setScore(item.code as assessmentScore)}
                        className={`py-2 px-1.5 rounded-lg text-xs font-semibold text-center border transition ${
                          score === item.code 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-white border-gray-200 text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <textarea 
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    required
                    placeholder="Enter professional teacher feedback/comments detailing pupil's practical observation..."
                    className="w-full text-xs p-3 border rounded-lg h-24 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {assessmentSuccess && (
                  <div className="p-2 border border-emerald-100 bg-emerald-50 text-emerald-800 rounded-lg text-xs text-center font-bold">
                    CBC Assessment card rubrics successfully published. Check Parent App progress view!
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg transition"
                >
                  Publish CBC Rubric Slip
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Right column: Student Lists & Academic Assessment History */}
        <div className="space-y-6">

          {/* Quick Stats overview */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm flex items-center gap-1.5">
              <Bookmark className="text-emerald-500 h-4.5 w-4.5" /> Assessment Annals
            </h3>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {cbcAssessments.slice().reverse().map((cbc) => (
                <div key={cbc.id} className="p-3 bg-gray-50 border rounded-xl space-y-2 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{cbc.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{cbc.id} • {cbc.learningArea}</p>
                    </div>
                    <span className="p-1 px-2.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black font-mono">
                      {cbc.score}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600"><span className="font-semibold">{cbc.strand}:</span> {cbc.task}</p>
                  <p className="text-[11px] text-gray-500 leading-snug italic bg-white p-1.5 border rounded">"{cbc.comments}"</p>
                  <div className="text-[9px] text-gray-400 font-mono text-right">Published: {cbc.date}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
      )}

    </div>
  );
}
