/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, AttendanceRecord, PermissionRequest, HealthRecord, PocketMoneyTransaction, FeePayment, CbcAssessment, GateLog, ChatMessage } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "TDBK-101",
    name: "Ethan Gitau",
    grade: "Grade 7",
    stream: "West",
    pin: "1234",
    pocketMoneyBalance: 1250,
    totalFees: 45000,
    paidFees: 40000,
    parentName: "Grace Gitau",
    parentPhone: "+254 712 345 678",
    avatar: "👨‍💻",
    status: "In School"
  },
  {
    id: "TDBK-102",
    name: "Stacy Mwangi",
    grade: "Grade 8",
    stream: "North",
    pin: "9876",
    pocketMoneyBalance: 350,
    totalFees: 45000,
    paidFees: 45000,
    parentName: "Peter Mwangi",
    parentPhone: "+254 722 987 654",
    avatar: "👩‍🎨",
    status: "In School"
  },
  {
    id: "TDBK-103",
    name: "Brian Kiprop",
    grade: "Grade 7",
    stream: "East",
    pin: "1111",
    pocketMoneyBalance: 2400,
    totalFees: 45000,
    paidFees: 20000,
    parentName: "David Kiprop",
    parentPhone: "+254 733 111 222",
    avatar: "🏃‍♂️",
    status: "In School"
  },
  {
    id: "TDBK-104",
    name: "Chloe Atieno",
    grade: "Grade 6",
    stream: "South",
    pin: "5555",
    pocketMoneyBalance: 150,
    totalFees: 42000,
    paidFees: 42000,
    parentName: "Amina Atieno",
    parentPhone: "+254 701 555 666",
    avatar: "🎨",
    status: "Sick Bay"
  },
  {
    id: "TDBK-105",
    name: "Kelvin Kamau",
    grade: "Grade 8",
    stream: "West",
    pin: "8888",
    pocketMoneyBalance: 800,
    totalFees: 45000,
    paidFees: 35000,
    parentName: "Lucy Kamau",
    parentPhone: "+254 711 888 999",
    avatar: "⚽",
    status: "Out of School"
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: "att-1", studentId: "TDBK-101", studentName: "Ethan Gitau", grade: "Grade 7", stream: "West", status: "Present", date: "2026-05-21", markedBy: "Madam Mercy", timestamp: "12:54:17Z" },
  { id: "att-2", studentId: "TDBK-102", studentName: "Stacy Mwangi", grade: "Grade 8", stream: "North", status: "Present", date: "2026-05-21", markedBy: "Mr. Kipkorir", timestamp: "12:54:17Z" },
  { id: "att-3", studentId: "TDBK-103", studentName: "Brian Kiprop", grade: "Grade 7", stream: "East", status: "Present", date: "2026-05-21", markedBy: "Madam Mercy", timestamp: "12:54:17Z" },
  { id: "att-4", studentId: "TDBK-104", studentName: "Chloe Atieno", grade: "Grade 6", stream: "South", status: "Sick", date: "2026-05-21", markedBy: "Madam Mercy", timestamp: "12:54:17Z" },
  { id: "att-5", studentId: "TDBK-105", studentName: "Kelvin Kamau", grade: "Grade 8", stream: "West", status: "Permission", date: "2026-05-21", markedBy: "Mr. Kipkorir", timestamp: "12:54:17Z" }
];

export const INITIAL_PERMISSIONS: PermissionRequest[] = [
  {
    id: "PASS-701",
    studentId: "TDBK-105",
    studentName: "Kelvin Kamau",
    grade: "Grade 8",
    stream: "West",
    reason: "Severe dental pain - urgent hospital visit scheduled",
    passType: "Medical Out",
    dateRequested: "2026-05-20",
    dateValid: "2026-05-21",
    status: "Completed",
    approvedBy: "Principal Wekesa",
    approvedDate: "2026-05-20"
  },
  {
    id: "PASS-702",
    studentId: "TDBK-101",
    studentName: "Ethan Gitau",
    grade: "Grade 7",
    stream: "West",
    reason: "Sister's wedding - family pickup at gate",
    passType: "Weekend Out",
    dateRequested: "2026-05-21",
    dateValid: "2026-05-22",
    status: "Approved",
    approvedBy: "Mr. Kipkorir",
    approvedDate: "2026-05-21"
  },
  {
    id: "PASS-703",
    studentId: "TDBK-102",
    studentName: "Stacy Mwangi",
    grade: "Grade 8",
    stream: "North",
    reason: "Collect certificate from district center",
    passType: "Day Out",
    dateRequested: "2026-05-21",
    dateValid: "2026-05-21",
    status: "Pending"
  }
];

export const INITIAL_HEALTH: HealthRecord[] = [
  {
    id: "HLTH-001",
    studentId: "TDBK-104",
    studentName: "Chloe Atieno",
    grade: "Grade 6",
    stream: "South",
    symptoms: "Mild throat inflammation, fever (38.2°C)",
    severity: "Moderate",
    actionTaken: "Administered ibuprofen, given bed rest in Ward 1",
    status: "Observation",
    dateLogged: "2026-05-21",
    loggedBy: "Nurse Beatrice"
  },
  {
    id: "HLTH-002",
    studentId: "TDBK-105",
    studentName: "Kelvin Kamau",
    grade: "Grade 8",
    stream: "West",
    symptoms: "Tooth decay bleeding",
    severity: "Severe",
    actionTaken: "Referred to local dental clinic. Permission slip generated.",
    status: "Referred to Hospital",
    dateLogged: "2026-05-21",
    loggedBy: "Nurse Beatrice"
  }
];

export const INITIAL_PM_TRANSACTIONS: PocketMoneyTransaction[] = [
  {
    id: "TX-901",
    studentId: "TDBK-101",
    studentName: "Ethan Gitau",
    amount: 500,
    type: "Deposit",
    source: "M-Pesa",
    reference: "REK49DH8SK",
    timestamp: "2026-05-20T10:15:00Z"
  },
  {
    id: "TX-902",
    studentId: "TDBK-101",
    studentName: "Ethan Gitau",
    amount: 50,
    type: "Purchase",
    source: "Kiosk",
    reference: "KSK-01927",
    timestamp: "2026-05-21T08:30:00Z"
  },
  {
    id: "TX-903",
    studentId: "TDBK-102",
    studentName: "Stacy Mwangi",
    amount: 200,
    type: "Withdraw",
    source: "Bursar Office",
    reference: "BUR-1920",
    timestamp: "2026-05-19T14:20:00Z"
  }
];

export const INITIAL_FEE_PAYMENTS: FeePayment[] = [
  {
    id: "FEE-401",
    studentId: "TDBK-101",
    studentName: "Ethan Gitau",
    amount: 15000,
    method: "Bank Transfer",
    reference: "EQT-99812",
    timestamp: "2026-05-10T09:00:00Z"
  },
  {
    id: "FEE-402",
    studentId: "TDBK-103",
    studentName: "Brian Kiprop",
    amount: 10000,
    method: "M-Pesa",
    reference: "REI56MH9X7",
    timestamp: "2026-05-12T16:45:00Z"
  }
];

export const INITIAL_CBC_ASSESSMENTS: CbcAssessment[] = [
  {
    id: "CBC-101",
    studentId: "TDBK-101",
    studentName: "Ethan Gitau",
    grade: "Grade 7",
    learningArea: "Mathematics",
    strand: "Fractions & Decimals",
    task: "Solve basic percentage translation problems",
    score: "EE",
    comments: "Demonstrated exceptional problem-solving speed and accuracy.",
    assessedBy: "Madam Mercy",
    date: "2026-05-18"
  },
  {
    id: "CBC-102",
    studentId: "TDBK-102",
    studentName: "Stacy Mwangi",
    grade: "Grade 8",
    learningArea: "Science & Technology",
    strand: "Conservation of Energy",
    task: "Design simple solar heating box prototype",
    score: "ME",
    comments: "Created a solid mock box correctly utilizing absorption materials.",
    assessedBy: "Mr. Kipkorir",
    date: "2026-05-19"
  },
  {
    id: "CBC-103",
    studentId: "TDBK-104",
    studentName: "Chloe Atieno",
    grade: "Grade 6",
    learningArea: "Creative Arts",
    strand: "Clay Modeling",
    task: "Sculpt miniature storage pot using pinch clay style",
    score: "EE",
    comments: "Outstanding patience and precise execution of local patterns.",
    assessedBy: "Madam Mercy",
    date: "2026-05-15"
  }
];

export const INITIAL_GATE_LOGS: GateLog[] = [
  {
    id: "GL-301",
    studentId: "TDBK-105",
    studentName: "Kelvin Kamau",
    grade: "Grade 8",
    stream: "West",
    action: "Check-Out",
    passType: "Medical Out",
    timestamp: "2026-05-21T09:12:00Z",
    clearedBy: "Officer Mwita",
    permissionId: "PASS-701"
  }
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: "MSG-001",
    sender: "Principal",
    senderName: "Principal Wekesa",
    recipientId: "TDBK-101", 
    content: "Greetings Grace Gitau. This is a reminder that Ethan should pack sport shoes for next week's track tournament.",
    timestamp: "2026-05-20T16:00:00Z",
    isRead: false
  },
  {
    id: "MSG-002",
    sender: "Teacher",
    senderName: "Madam Mercy",
    recipientId: "TDBK-102",
    content: "Stacy scored ME (Meeting Expectation) in her reading homework today. Excellent improvement!",
    timestamp: "2026-05-21T07:15:00Z",
    isRead: false
  },
  {
    id: "MSG-003",
    sender: "Parent",
    senderName: "Grace Gitau",
    recipientId: "General-School",
    content: "Hello, I have deposited pocket money for Ethan to buy book wrappers. Please guide him to purchase at the Kiosk.",
    timestamp: "2026-05-21T11:45:00Z",
    isRead: true
  },
  {
    id: "MSG-004",
    sender: "Parent",
    senderName: "Grace Gitau",
    recipientId: "teacher-mercy",
    content: "Good afternoon Madam Mercy. How is Ethan fairing with his homework chores in the stream?",
    timestamp: "2026-05-21T09:30:00Z",
    isRead: true
  },
  {
    id: "MSG-005",
    sender: "Teacher",
    senderName: "Madam Mercy",
    recipientId: "TDBK-101",
    content: "Good afternoon Grace! Ethan is outstanding in homework. Let's make sure he tracks his weekly syllabus rubrics closely inside his pocket ledger.",
    timestamp: "2026-05-21T10:15:00Z",
    isRead: false
  }
];

export const INITIAL_STAFF: any[] = [
  {
    id: "STF-101",
    name: "Madam Mercy",
    role: "Teacher",
    phone: "+254 711 223 344",
    nationalId: "29871654",
    specialization: "Mathematics & English",
    status: "Active",
    dateJoined: "2025-01-15"
  },
  {
    id: "STF-102",
    name: "Mr. Kipkorir",
    role: "Teacher",
    phone: "+254 722 334 455",
    nationalId: "30514298",
    specialization: "Science & Technology",
    status: "Active",
    dateJoined: "2024-05-20"
  },
  {
    id: "STF-103",
    name: "Officer Mwita",
    role: "Gate Guardian",
    phone: "+254 733 445 566",
    nationalId: "18942051",
    specialization: "Main Sentry Post (Day/Night)",
    status: "Active",
    dateJoined: "2023-11-01"
  },
  {
    id: "STF-104",
    name: "Nurse Beatrice",
    role: "Nurse",
    phone: "+254 701 556 677",
    nationalId: "24501928",
    specialization: "Infirmary Ward Lead",
    status: "Active",
    dateJoined: "2025-02-10"
  }
];

