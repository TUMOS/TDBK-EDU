import React, { useState } from 'react';
import { 
  Home, Bed, Sparkles, HeartPulse, ShieldAlert, CheckCircle2, ClipboardList, 
  Trash2, RefreshCw, Layers, Clock, AlertTriangle, Moon, Gift, UserPlus, HelpCircle
} from 'lucide-react';
import { Student, HealthRecord, HealthSeverity, HealthStatus } from '../types';

interface MatronDashboardProps {
  students: Student[];
  healthRecords: HealthRecord[];
  onAddHealthQuery: (studentId: string, symptoms: string, severity: HealthSeverity, actionTaken: string, status: HealthStatus, loggedBy: string) => void;
  onUpdateStudentHealthStatus: (studentId: string, status: 'In School' | 'Sick Bay' | 'Out of School') => void;
}

// Initial mock hostel assignments
interface DormAssignment {
  studentId: string;
  studentName: string;
  dorm: 'Kilimanjaro' | 'Ruwenzori' | 'Mount Kenya' | 'Elgon';
  roomNo: string;
  bedNo: string;
  toiletriesKit: {
    soap: boolean;
    tissue: boolean;
    toothpaste: boolean;
    shoePolish: boolean;
  };
}

const INITIAL_DORMS: DormAssignment[] = [
  { studentId: "TDBK-101", studentName: "Ethan Gitau", dorm: "Kilimanjaro", roomNo: "RM-04", bedNo: "Bed 2A (Top)", toiletriesKit: { soap: true, tissue: true, toothpaste: true, shoePolish: false } },
  { studentId: "TDBK-102", studentName: "Stacy Mwangi", dorm: "Ruwenzori", roomNo: "RM-10", bedNo: "Bed 1B (Bottom)", toiletriesKit: { soap: true, tissue: false, toothpaste: true, shoePolish: true } },
  { studentId: "TDBK-103", studentName: "Brian Kiprop", dorm: "Kilimanjaro", roomNo: "RM-03", bedNo: "Bed 4A (Top)", toiletriesKit: { soap: false, tissue: true, toothpaste: false, shoePolish: true } },
  { studentId: "TDBK-104", studentName: "Chloe Atieno", dorm: "Mount Kenya", roomNo: "RM-01", bedNo: "Bed 1A (Bottom)", toiletriesKit: { soap: true, tissue: true, toothpaste: true, shoePolish: true } },
  { studentId: "TDBK-105", studentName: "Kelvin Kamau", dorm: "Elgon", roomNo: "RM-08", bedNo: "Bed 3B (Bottom)", toiletriesKit: { soap: true, tissue: true, toothpaste: false, shoePolish: false } },
];

interface LaundryItem {
  id: string;
  studentId: string;
  studentName: string;
  dorm: string;
  items: string; // e.g. "School Blazer, 2 Shirts"
  status: 'Pending' | 'Washing' | 'Ironing' | 'Ready for Pickup';
  dateAdded: string;
}

export default function MatronDashboard({
  students,
  healthRecords,
  onAddHealthQuery,
  onUpdateStudentHealthStatus,
}: MatronDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dormitories' | 'rollcall' | 'laundry' | 'sickbay'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('matronTab');
      if (tabParam && ['dormitories', 'rollcall', 'laundry', 'sickbay'].includes(tabParam)) {
        return tabParam as any;
      }
    }
    return 'dormitories';
  });

  // Sync state changes with URL parameters to enable instant address-bar bookmarking
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('matronTab') !== activeTab) {
        url.searchParams.set('matronTab', activeTab);
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    }
  }, [activeTab]);
  
  // States of simulated data
  const [dormRecords, setDormRecords] = useState<DormAssignment[]>(INITIAL_DORMS);
  
  // Laundry states
  const [laundries, setLaundries] = useState<LaundryItem[]>([
    { id: "LND-01", studentId: "TDBK-101", studentName: "Ethan Gitau", dorm: "Kilimanjaro", items: "School Uniform, 3 Socks", status: "Washing", dateAdded: "2026-05-21" },
    { id: "LND-02", studentId: "TDBK-103", studentName: "Brian Kiprop", dorm: "Kilimanjaro", items: "Bed Sheets, Blanket", status: "Ironing", dateAdded: "2026-05-20" },
    { id: "LND-03", studentId: "TDBK-102", studentName: "Stacy Mwangi", dorm: "Ruwenzori", items: "Games Kit, Towel", status: "Ready for Pickup", dateAdded: "2026-05-21" }
  ]);
  const [newLndStudentId, setNewLndStudentId] = useState(students[0]?.id || '');
  const [newLndItems, setNewLndItems] = useState('');

  // Roll call statuses (in state for interactive checkboxes)
  const [rollCallDate, setRollCallDate] = useState("2026-05-21");
  const [presentStatuses, setPresentStatuses] = useState<Record<string, 'Present' | 'Absent' | 'Excused'>>({});
  const [rollCallFinished, setRollCallFinished] = useState(false);

  // Sickbay intake form states
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState<HealthSeverity>('Mild');
  const [actionTaken, setActionTaken] = useState('');
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('Observation');

  const handleToggleToiletry = (studentId: string, item: 'soap' | 'tissue' | 'toothpaste' | 'shoePolish') => {
    setDormRecords(prev => prev.map(rec => {
      if (rec.studentId === studentId) {
        return {
          ...rec,
          toiletriesKit: {
            ...rec.toiletriesKit,
            [item]: !rec.toiletriesKit[item]
          }
        };
      }
      return rec;
    }));
  };

  const handleAddLaundryObj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLndItems.trim()) return;
    
    const student = students.find(s => s.id === newLndStudentId);
    const dormAssigned = dormRecords.find(d => d.studentId === newLndStudentId)?.dorm || 'General';

    const item: LaundryItem = {
      id: 'LND-' + Math.floor(Math.random() * 900 + 100),
      studentId: newLndStudentId,
      studentName: student?.name || 'Unknown student',
      dorm: dormAssigned,
      items: newLndItems,
      status: 'Pending',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setLaundries(prev => [...prev, item]);
    setNewLndItems('');
    alert('Laundry parcel recorded successfully for cleaning queue!');
  };

  const handleUpdateLaundryStatus = (id: string, newStat: any) => {
    setLaundries(prev => prev.map(l => l.id === id ? { ...l, status: newStat } : l));
  };

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || !actionTaken.trim()) return;

    onAddHealthQuery(
      selectedStudentId,
      symptoms.trim(),
      severity,
      actionTaken.trim(),
      healthStatus,
      'Matron Grace'
    );

    // Update the students status state in UI
    const targetStatus = healthStatus === 'Observation' ? 'Sick Bay' : healthStatus === 'Sent Home' || healthStatus === 'Referred to Hospital' ? 'Out of School' : 'In School';
    onUpdateStudentHealthStatus(selectedStudentId, targetStatus);

    setSymptoms('');
    setActionTaken('');
    alert(`Sick bay record logged. Student status was updated to: ${targetStatus}.`);
  };

  const handleRollCallSubmit = () => {
    // Audit check
    const unaccounted = students.filter(st => {
      const parentS = st.status;
      const val = presentStatuses[st.id];
      return !val && parentS === 'In School';
    });

    if (unaccounted.length > 0) {
      alert(`There are still ${unaccounted.length} boarders unaccounted for. Please review and mark all students before publishing.`);
      return;
    }

    setRollCallFinished(true);
  };

  // Counting hostel distribution
  const dormSummary = dormRecords.reduce((acc, curr) => {
    acc[curr.dorm] = (acc[curr.dorm] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div id="matron-panel" className="bg-[#0a0a0c] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#e2e2e2]">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-[#1f1f23] border-b">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-650/15 text-emerald-450 border border-emerald-500/20 rounded-md text-xs font-semibold tracking-wider uppercase font-mono bg-emerald-600/10">Matron Hub</span>
            <span className="text-gray-500 text-sm font-medium">Student Care & Upkeep Control</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mt-1">Hostels & Boarder Life Desk</h1>
          <p className="text-sm text-gray-400 mt-0.5">Care center for tracking student bedrooms, laundry logs, hygiene distributions, sick-bay ward rounds and bedtime roll-call.</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-2">
          <div className="bg-[#15161a] border border-[#1f1f23] rounded-xl px-4 py-2.5 text-xs text-slate-400 flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-400" />
            Active Boarders: {students.filter(s => s.status !== 'Suspended').length} Students
          </div>
          <div className="bg-[#15161a] border border-[#1f1f23] rounded-xl px-4 py-2.5 text-xs text-slate-400 flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-rose-500 animate-pulse" />
            Sick Bay Ward Occupancy: {students.filter(s => s.status === 'Sick Bay').length} Bedded
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-[#1f1f23] pb-px mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('dormitories')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 gap-2 flex items-center break-keep whitespace-nowrap ${
            activeTab === 'dormitories' ? 'text-emerald-400 border-emerald-500 bg-[#15161a] font-bold' : 'text-gray-500 hover:text-white border-transparent'
          }`}
        >
          <Home className="h-4 w-4 text-emerald-450" />
          Dormitories / Hostels
        </button>

        <button
          onClick={() => setActiveTab('rollcall')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 gap-2 flex items-center break-keep whitespace-nowrap ${
            activeTab === 'rollcall' ? 'text-emerald-400 border-emerald-500 bg-[#15161a] font-bold' : 'text-gray-500 hover:text-white border-transparent'
          }`}
        >
          <Moon className="h-4 w-4 text-emerald-450" />
          Bedtime Roll Call
        </button>

        <button
          onClick={() => setActiveTab('laundry')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 gap-2 flex items-center break-keep whitespace-nowrap ${
            activeTab === 'laundry' ? 'text-emerald-400 border-emerald-500 bg-[#15161a] font-bold' : 'text-gray-500 hover:text-white border-transparent'
          }`}
        >
          <Layers className="h-4 w-4 text-emerald-450" />
          Laundry Services
        </button>

        <button
          onClick={() => setActiveTab('sickbay')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 gap-2 flex items-center break-keep whitespace-nowrap ${
            activeTab === 'sickbay' ? 'text-emerald-400 border-emerald-500 bg-[#15161a] font-bold' : 'text-gray-500 hover:text-white border-transparent'
          }`}
        >
          <HeartPulse className="h-4 w-4 text-emerald-450" />
          Medical Bay Ward Registry
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'dormitories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Hostel Occupancy List */}
          <div className="lg:col-span-2 bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-sm">
            <div className="pb-3 border-[#1f1f23] border-b mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Dorm Bed Allocation & Hygiene Kits</h3>
                <p className="text-[10px] text-gray-500">Track student sleeping allocations and distribute weekly hygiene essentials.</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-650/15 border border-emerald-500/20 text-emerald-400 font-bold font-mono text-[9px] uppercase rounded">
                Weekly Recheck Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1f1f23] text-gray-500">
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Dormitory</th>
                    <th className="py-2.5 px-3">Room & Bed No.</th>
                    <th className="py-2.5 px-3 text-right">Toiletries pack status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f23]/60">
                  {dormRecords.map((d) => {
                    const st = students.find(s => s.id === d.studentId);
                    return (
                      <tr key={d.studentId} className="hover:bg-[#15161a]/30 transition text-[11px]">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{st?.avatar || '👤'}</span>
                            <div>
                              <span className="font-bold text-white block">{d.studentName}</span>
                              <span className="text-[9px] text-gray-500 font-mono font-bold uppercase">{d.studentId} • Room: {d.roomNo}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-300 font-medium">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9.5px] uppercase font-bold font-mono">
                            ⛰ {d.dorm}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-400 font-mono font-bold">{d.bedNo}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => handleToggleToiletry(d.studentId, 'soap')}
                              className={`p-1 text-[9px] font-bold rounded border uppercase font-mono ${
                                d.toiletriesKit.soap ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-[#0d0d10] text-gray-500 border-[#1f1f23]'
                              }`}
                              title="Toggle Soap bar given"
                            >
                              🫧 Soap
                            </button>
                            <button
                              onClick={() => handleToggleToiletry(d.studentId, 'tissue')}
                              className={`p-1 text-[9px] font-bold rounded border uppercase font-mono ${
                                d.toiletriesKit.tissue ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-[#0d0d10] text-gray-500 border-[#1f1f23]'
                              }`}
                              title="Toggle Tissue given"
                            >
                              🧻 Tissue
                            </button>
                            <button
                              onClick={() => handleToggleToiletry(d.studentId, 'toothpaste')}
                              className={`p-1 text-[9px] font-bold rounded border uppercase font-mono ${
                                d.toiletriesKit.toothpaste ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-[#0d0d10] text-gray-500 border-[#1f1f23]'
                              }`}
                              title="Toggle Toothpaste given"
                            >
                              🪥 Paste
                            </button>
                            <button
                              onClick={() => handleToggleToiletry(d.studentId, 'shoePolish')}
                              className={`p-1 text-[9px] font-bold rounded border uppercase font-mono ${
                                d.toiletriesKit.shoePolish ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-[#0d0d10] text-gray-500 border-[#1f1f23]'
                              }`}
                              title="Toggle Shoe Polish given"
                            >
                              👞 Polish
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dorm statistics bento */}
          <div className="space-y-4">
            <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-sm">
              <div className="pb-3 border-[#1f1f23] border-b mb-4">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Dorm Occupancy Rate</h3>
                <p className="text-[10px] text-gray-500">Current boarder density count across key blocks.</p>
              </div>

              <div className="space-y-3 pb-3">
                {['Kilimanjaro', 'Ruwenzori', 'Mount Kenya', 'Elgon'].map((dm) => {
                  const occupants = dormSummary[dm] || 0;
                  const percent = Math.min(100, occupants * 25); // simple map: cap of 4 beds
                  return (
                    <div key={dm} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-300">{dm} House</span>
                        <span className="font-mono text-gray-500 font-bold">{occupants}/4 beds occupied</span>
                      </div>
                      <div className="w-full bg-[#1c1c21] rounded-full h-1.5 border border-[#1f1f23]">
                        <div 
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-semibold text-xs uppercase font-mono text-gray-400">Hygiene Checklist Instructions</h4>
              <p className="text-[10.5px] leading-relaxed text-gray-500">
                Weekly toiletries distribution occurs on Wednesday and Sunday evenings. Mark kit allocations accordingly to keep track of store inventories. Missing toiletries report directly to the bursar procurement stream.
              </p>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'rollcall' && (
        <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 max-w-3xl mx-auto shadow-md">
          <div className="pb-3 border-[#1f1f23] border-b mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">9:00 PM Bedtime Roll Call</h3>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
              </div>
              <p className="text-[10px] text-gray-500">Boarder curfew verification logging and school bounds checking.</p>
            </div>

            <div>
              <input
                type="date"
                value={rollCallDate}
                onChange={(e) => setRollCallDate(e.target.value)}
                className="bg-[#0d0d10] border border-[#1f1f23] text-xs p-2 rounded-lg text-white"
              />
            </div>
          </div>

          {rollCallFinished ? (
            <div className="text-center p-8 bg-[#0d0d10] border border-[#1f1f23] rounded-xl space-y-4">
              <div className="h-12 w-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full flex items-center justify-center font-bold text-lg mx-auto">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Roll Call Ledger Submitted successfully</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Records locked. Unaccounted boarders have been flagged in the central administration feed.</p>
              </div>

              <div className="text-left max-w-sm mx-auto p-4 bg-[#15161a] rounded-xl text-xs space-y-2">
                <p className="font-bold text-[10px] uppercase font-mono text-gray-400">Night Log Summary:</p>
                <div className="flex justify-between text-gray-300">
                  <span>Present in Bed:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {students.filter(s => presentStatuses[s.id] === 'Present').length} / {students.length}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>In Sick Bay:</span>
                  <span className="font-mono text-rose-450 font-bold">
                    {students.filter(s => s.status === 'Sick Bay').length} boarders
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Approved Leave (Away):</span>
                  <span className="font-mono text-blue-400 font-bold">
                    {students.filter(s => s.status === 'Out of School').length} boarders
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setPresentStatuses({});
                  setRollCallFinished(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
              >
                Start New Cycle
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {students.map((st) => {
                  const dormAlloc = dormRecords.find(d => d.studentId === st.id);
                  const isSickBay = st.status === 'Sick Bay';
                  const isAway = st.status === 'Out of School';
                  
                  // Auto-suggest excuses based on live bounds state
                  let badge = null;
                  if (isSickBay) {
                    badge = <span className="px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">EXCUSED: SICK BAY</span>;
                  } else if (isAway) {
                    badge = <span className="px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold">EXCUSED: GATE PASS ACTIVE</span>;
                  }

                  const activeChoice = presentStatuses[st.id] || (isSickBay || isAway ? 'Excused' : 'Present');

                  return (
                    <div key={st.id} className="p-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{st.avatar}</span>
                          <span className="font-bold text-xs text-white">{st.name}</span>
                          <span className="text-[9px] font-mono font-bold text-gray-500 uppercase">{st.id}</span>
                          {badge}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 font-sans">
                          🏠 Dorm: <span className="text-emerald-400 font-bold">{dormAlloc?.dorm || 'Unallocated'}</span> - Room: {dormAlloc?.roomNo || 'N/A'}, Room Bed: {dormAlloc?.bedNo || 'N/A'}
                        </p>
                      </div>

                      <div className="flex gap-1.5 mt-2 sm:mt-0">
                        <button
                          type="button"
                          onClick={() => setPresentStatuses(prev => ({ ...prev, [st.id]: 'Present' }))}
                          disabled={isSickBay || isAway}
                          className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold font-mono transition border ${
                            activeChoice === 'Present' 
                              ? 'bg-emerald-600 border-emerald-500 text-white' 
                              : 'bg-[#15161a] border-[#1f1f23] text-gray-400'
                          }`}
                        >
                          🛌 IN BED
                        </button>
                        <button
                          type="button"
                          onClick={() => setPresentStatuses(prev => ({ ...prev, [st.id]: 'Absent' }))}
                          disabled={isSickBay || isAway}
                          className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold font-mono transition border ${
                            activeChoice === 'Absent' 
                              ? 'bg-rose-600 border-rose-550 text-white' 
                              : 'bg-[#15161a] border-[#1f1f23] text-gray-400'
                          }`}
                        >
                          🚨 ABSENT
                        </button>
                        {(isSickBay || isAway) && (
                          <button
                            type="button"
                            disabled
                            className="px-3 py-1.5 rounded-lg text-[10.5px] font-bold font-mono bg-blue-600/10 border border-blue-500/20 text-blue-405 text-blue-400"
                          >
                            Excused
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#1f1f23] flex justify-end">
                <button
                  type="button"
                  onClick={handleRollCallSubmit}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl tracking-wider uppercase transition shadow-sm"
                >
                  Submit Night Roll Report
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'laundry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Laundry Parcel */}
          <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-sm h-fit">
            <div className="pb-3 border-[#1f1f23] border-b mb-4">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Check-in Laundry parcel</h3>
              <p className="text-[10px] text-gray-500">Record a boarder clothing collection for sanitization and ironing.</p>
            </div>

            <form onSubmit={handleAddLaundryObj} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                  1. Boarder Student
                </label>
                <select
                  value={newLndStudentId}
                  onChange={(e) => setNewLndStudentId(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-sans"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                  2. List of Items checked in
                </label>
                <input
                  type="text"
                  required
                  value={newLndItems}
                  onChange={(e) => setNewLndItems(e.target.value)}
                  placeholder="e.g. 2 Shirts, Heavy Bed Sheets, 1 Pullover"
                  className="w-full text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder-gray-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Log wash parcel
              </button>
            </form>
          </div>

          {/* Active laundry queues queue */}
          <div className="lg:col-span-2 bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-sm">
            <div className="pb-3 border-[#1f1f23] border-b mb-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono font-bold">Laundry Queue Tracking</h3>
                <p className="text-[10px] text-gray-500">Oversee active cycles, spinner spins, and ready items for sorting.</p>
              </div>
              <span className="text-[9px] font-mono text-gray-500">Live sorting queue</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {laundries.length === 0 ? (
                <p className="text-center py-10 text-gray-500 text-xs italic">No laundry parcels in system.</p>
              ) : (
                [...laundries].reverse().map((lnd) => (
                  <div key={lnd.id} className="p-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[8px] font-bold font-mono text-gray-500 uppercase">{lnd.id}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase font-mono">
                          ⛰ {lnd.dorm}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mt-1">{lnd.studentName}</p>
                      <p className="text-[10.5px] text-gray-400 italic">"{lnd.items}"</p>
                      <p className="text-[9.5px] font-mono text-gray-500">Checkin: {lnd.dateAdded}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <select
                        value={lnd.status}
                        onChange={(e) => handleUpdateLaundryStatus(lnd.id, e.target.value as any)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 border rounded-lg bg-[#111216] text-white focus:outline-none focus:border-emerald-500 font-sans ${
                          lnd.status === 'Ready for Pickup' 
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                            : 'border-[#1f1f23]'
                        }`}
                      >
                        <option value="Pending">⏳ Pending</option>
                        <option value="Washing">🫧 Washing Cycle</option>
                        <option value="Ironing">💨 Ironing / Folding</option>
                        <option value="Ready for Pickup">🎁 Ready for Student Kiosk pickup</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'sickbay' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Clinical Intake */}
          <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-sm h-fit">
            <div className="pb-3 border-[#1f1f23] border-b mb-4">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Sickbay admission form</h3>
              <p className="text-[10px] text-gray-500">Admit boarders presenting symptoms immediately to sick-bay observations.</p>
            </div>

            <form onSubmit={handleIntakeSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                  1. Sick Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-sans"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.id}) - Currently {st.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                  2. Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Mild', 'Moderate', 'Severe'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-2 rounded-lg text-xs font-bold transition font-mono border ${
                        severity === sev 
                          ? 'bg-rose-500/10 text-rose-450 border-rose-500' 
                          : 'bg-[#0d0d10] border-[#1f1f23] text-gray-500 hover:text-white'
                      }`}
                    >
                      {sev === 'Severe' ? '🚨 ' : sev === 'Moderate' ? '⚠️ ' : '🩺 '} {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                  3. Symptoms presented
                </label>
                <input
                  type="text"
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Cough, high fever, abdominal cramps"
                  className="w-full text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                  4. Immediate Action taken
                </label>
                <input
                  type="text"
                  required
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="e.g. Administered paracetamol, given ward bed 2 to sleep"
                  className="w-full text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                  5. Medical status disposition
                </label>
                <select
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-sans"
                >
                  <option value="Observation">🛌 Ward Observation (mark student 'Sick Bay')</option>
                  <option value="Discharged To Class">🏫 Discharge (send student back to Class/Dorm)</option>
                  <option value="Sent Home">🏠 Outflow: Sent Home (needs Gate Leave Pass)</option>
                  <option value="Referred to Hospital">🏥 Hospital: Transfer to local clinic</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Log Medical Intake
              </button>
            </form>
          </div>

          {/* Active health admissions and histories log */}
          <div className="lg:col-span-2 bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-sm">
            <div className="pb-3 border-[#1f1f23] border-b mb-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Sickbay Admission Board</h3>
                <p className="text-[10px] text-gray-500">Historical records of health treatment logs and actions logged by caretakers.</p>
              </div>
              <span className="text-[9px] font-mono text-gray-500">Medical Journal logs</span>
            </div>

            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              {healthRecords.length === 0 ? (
                <p className="text-center py-10 text-gray-500 text-xs italic">No clinical records found.</p>
              ) : (
                [...healthRecords].reverse().map((rec) => (
                  <div key={rec.id} className="p-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white">{rec.studentName}</span>
                        <span className="text-[9px] font-mono font-bold text-gray-500 uppercase">{rec.studentId} • {rec.grade}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                          rec.severity === 'Severe' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : rec.severity === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {rec.severity} Symptoms
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-300 font-medium">🌡 Symptoms: <span className="text-gray-400 font-sans italic">"{rec.symptoms}"</span></p>
                      <p className="text-xs text-gray-300 font-medium font-sans">💊 Treatment Action: <span className="text-emerald-400 font-sans">"{rec.actionTaken}"</span></p>
                      <p className="text-[10px] text-gray-500 font-mono">Admitted by: {rec.loggedBy} on {rec.dateLogged}</p>
                    </div>

                    <div className="sm:self-center shrink-0">
                      <span className={`px-2.5 py-1 border text-[9.5px] uppercase font-bold font-mono rounded-lg block text-center ${
                        rec.status === 'Observation' 
                          ? 'bg-rose-500/10 text-rose-450 border-rose-500/20 text-rose-400' 
                          : rec.status === 'Discharged To Class' 
                          ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20 text-emerald-450' 
                          : 'bg-blue-500/10 text-blue-405 border-blue-500/20 text-blue-400'
                      }`}>
                        {rec.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
