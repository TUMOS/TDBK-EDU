/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Tenant {
  school_name: string;
  custom_onboarding_fee: number;
  active_student_count: number;
}

export interface Student {
  id: string; // e.g. "TDBK-001"
  name: string;
  grade: string;
  stream: string;
  pin: string; // 4-digit PIN for kiosk login
  pocketMoneyBalance: number;
  totalFees: number;
  paidFees: number;
  parentName: string;
  parentPhone: string;
  avatar: string;
  status: 'In School' | 'Out of School' | 'Sick Bay' | 'Suspended';
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Permission' | 'Sick';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  stream: string;
  status: AttendanceStatus;
  date: string; // YYYY-MM-DD
  markedBy: string;
  timestamp: string;
}

export type PermissionStatus = 'Pending' | 'Approved' | 'Declined' | 'Completed';
export type PassType = 'Day Out' | 'Medical Out' | 'School Leave' | 'Weekend Out';

export interface PermissionRequest {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  stream: string;
  reason: string;
  passType: PassType;
  dateRequested: string;
  dateValid: string;
  status: PermissionStatus;
  approvedBy?: string;
  approvedDate?: string;
}

export type HealthSeverity = 'Mild' | 'Moderate' | 'Severe';
export type HealthStatus = 'Observation' | 'Discharged To Class' | 'Sent Home' | 'Referred to Hospital';

export interface HealthRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  stream: string;
  symptoms: string;
  severity: HealthSeverity;
  actionTaken: string;
  status: HealthStatus;
  dateLogged: string;
  loggedBy: string;
}

export interface PocketMoneyTransaction {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  type: 'Deposit' | 'Withdraw' | 'Purchase';
  source: 'M-Pesa' | 'Kiosk' | 'Bursar Office';
  reference: string;
  timestamp: string;
}

export interface FeePayment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: 'M-Pesa' | 'Bank Transfer' | 'Cheque';
  reference: string;
  timestamp: string;
}

export type assessmentScore = 'EE' | 'ME' | 'AE' | 'BE'; 
// EE: Exceeding Expectation, ME: Meeting Expectation, AE: Approaching Expectation, BE: Below Expectation

export interface CbcAssessment {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  learningArea: string; // e.g. "Mathematics", "Science & Tech"
  strand: string; // e.g. "Fractions", "Weather States"
  task: string; // e.g. "Identifying equivalent fractions"
  score: assessmentScore;
  comments: string;
  assessedBy: string;
  date: string;
}

export interface GateLog {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  stream: string;
  action: 'Check-In' | 'Check-Out';
  passType?: PassType;
  timestamp: string;
  clearedBy: string;
  permissionId?: string; // Links to permission approved
}

export interface ChatMessage {
  id: string;
  sender: 'Parent' | 'Teacher' | 'Principal' | 'System';
  senderName: string;
  recipientId: string; // "Student-ID", "General-School", etc.
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Staff {
  id: string; // e.g., "STF-101"
  authUid?: string; // Firebase Auth UID for role mapping
  name: string;
  role: string;
  phone: string;
  nationalId: string;
  specialization?: string; // Subject for Teachers, Shift/Station for Guard
  status: 'Active' | 'Terminated';
  dateJoined: string;
}

export interface VisitorLog {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  purpose: string;
  studentId?: string;
  studentName?: string;
  timeIn: string;
  timeOut?: string;
  status: 'Inside' | 'Checked-Out';
  clearedBy: string;
}

export interface CanteenItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'Snack' | 'Drink' | 'Meal';
}

export interface CanteenOrder {
  id: string;
  studentId: string;
  studentName: string;
  items: { itemId: string; name: string; price: number; quantity: number }[];
  total: number;
  timestamp: string;
}

