import React, { useState } from 'react';
import { 
  Landmark, Receipt, PlusCircle, CreditCard, DollarSign, Wallet, 
  ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2, Search, Filter, 
  Settings, TrendingUp, AlertCircle, RefreshCw, Printer, User
} from 'lucide-react';
import { Student, PocketMoneyTransaction, FeePayment } from '../types';

interface BursarDashboardProps {
  students: Student[];
  transactions: PocketMoneyTransaction[];
  feePayments: FeePayment[];
  onAddFeePayment: (payment: Omit<FeePayment, 'id' | 'timestamp'>) => void;
  onAddTransaction: (tx: Omit<PocketMoneyTransaction, 'id' | 'timestamp'>) => void;
}

export default function BursarDashboard({
  students,
  transactions,
  feePayments,
  onAddFeePayment,
  onAddTransaction,
}: BursarDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'pocket-money' | 'structure'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('bursarTab');
      if (tabParam && ['overview', 'payments', 'pocket-money', 'structure'].includes(tabParam)) {
        return tabParam as any;
      }
    }
    return 'overview';
  });

  // Sync state changes with URL parameters to enable instant address-bar bookmarking
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('bursarTab') !== activeTab) {
        url.searchParams.set('bursarTab', activeTab);
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    }
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  
  // New Payment Form States
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'M-Pesa' | 'Bank Transfer' | 'Cheque'>('M-Pesa');
  const [payRef, setPayRef] = useState('');
  
  // Pocket Money States
  const [pmAmount, setPmAmount] = useState('');
  const [pmActionType, setPmActionType] = useState<'Deposit' | 'Withdraw'>('Deposit');
  const [pmRef, setPmRef] = useState('');

  // Selected receipt simulation
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);

  // Stats calculation
  const totalInvoiced = students.reduce((acc, curr) => acc + (curr.totalFees || 45000), 0);
  const totalPaid = students.reduce((acc, curr) => acc + (curr.paidFees || 0), 0) + 
                    feePayments.reduce((acc, curr) => acc + curr.amount, 0); // Include latest payment state additions
  const totalOutstanding = totalInvoiced - totalPaid;
  const paymentCollectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  const mpesaPayments = feePayments.filter(p => p.method === 'M-Pesa').reduce((acc, p) => acc + p.amount, 0);
  const bankPayments = feePayments.filter(p => p.method === 'Bank Transfer').reduce((acc, p) => acc + p.amount, 0);
  const chequePayments = feePayments.filter(p => p.method === 'Cheque').reduce((acc, p) => acc + p.amount, 0);

  // Filter accounts list
  const filteredStudents = students.filter(st => {
    const term = searchQuery.toLowerCase();
    return st.name.toLowerCase().includes(term) || 
           st.id.toLowerCase().includes(term) || 
           st.parentName.toLowerCase().includes(term);
  });

  const handlePostFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || isNaN(Number(payAmount)) || Number(payAmount) <= 0) return;
    
    const amt = Number(payAmount);
    onAddFeePayment({
      studentId: selectedStudentId,
      studentName: students.find(s => s.id === selectedStudentId)?.name || 'Unknown Student',
      amount: amt,
      method: payMethod,
      reference: payRef.trim() || 'BUR-' + Math.floor(Math.random() * 90000 + 10000)
    });

    // Reset fields
    setPayAmount('');
    setPayRef('');
    
    // Alert or Notify user locally
    alert('Fee payment posted successfully and synchronized to student ledger!');
  };

  const handlePostPocketMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmAmount || isNaN(Number(pmAmount)) || Number(pmAmount) <= 0) return;
    
    const amt = Number(pmAmount);
    const targetStudent = students.find(s => s.id === selectedStudentId);
    
    if (pmActionType === 'Withdraw' && targetStudent && targetStudent.pocketMoneyBalance < amt) {
      alert('Insufficient pocket money balance for this student withdrawal.');
      return;
    }

    onAddTransaction({
      studentId: selectedStudentId,
      studentName: targetStudent?.name || 'Unknown Student',
      amount: amt,
      type: pmActionType === 'Deposit' ? 'Deposit' : 'Withdraw',
      source: 'Bursar Office',
      reference: pmRef.trim() || 'BUR-TX-' + Math.floor(Math.random() * 900000)
    });

    setPmAmount('');
    setPmRef('');
    alert(`Pocket money ${pmActionType === 'Deposit' ? 'deposit' : 'withdrawal'} of ${amt}/- KES posted successfully!`);
  };

  return (
    <div id="bursar-panel" className="bg-[#0a0a0c] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#e2e2e2]">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-[#1f1f23] border-b">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-600/10 text-rose-450 border border-rose-500/20 rounded-md text-xs font-semibold tracking-wider uppercase font-mono">Bursar Hub</span>
            <span className="text-gray-500 text-sm font-medium">Finance & Accounts Ledger</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mt-1">Financial Operations Desk</h1>
          <p className="text-sm text-gray-500 mt-0.5">Control center for boarding fee reconciliations, payment invoices, and auxiliary cash accounts.</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <div className="bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] rounded-xl p-3 text-xs flex items-center gap-2.5 font-medium shadow-sm">
            <TrendingUp className="h-4 w-4" />
            Clearance Status: {paymentCollectionRate}% of Term Fees Collected
          </div>
        </div>
      </div>

      {/* 2. Visual Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Total Invoiced */}
        <div className="bg-[#111216] border border-[#1f1f23] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider font-mono">Total Invoiced</span>
            <p className="text-xl md:text-2xl font-bold font-mono text-white mt-1">KSh {totalInvoiced.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">All boarding streams</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Landmark className="h-5 w-5" />
          </div>
        </div>

        {/* Total Collections */}
        <div className="bg-[#111216] border border-[#1f1f23] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider font-mono">Total Collections</span>
            <p className="text-xl md:text-2xl font-bold font-mono text-emerald-400 mt-1">KSh {totalPaid.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-500/85 mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live reconciliations
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-[#111216] border border-[#1f1f23] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider font-mono">Total Outstanding</span>
            <p className="text-xl md:text-2xl font-bold font-mono text-rose-400 mt-1">KSh {totalOutstanding.toLocaleString()}</p>
            <p className="text-[10px] text-rose-400/80 mt-0.5">Clearing invoices</p>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Payment Channels */}
        <div className="bg-[#111216] border border-[#1f1f23] rounded-xl p-4 flex flex-col justify-center shadow-sm">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider font-mono mb-1.5">Collection Channels</span>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between font-mono">
              <span className="text-gray-400">📲 M-Pesa:</span>
              <span className="text-emerald-400 font-bold">KSh {mpesaPayments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-gray-400">🏦 Bank Transfer:</span>
              <span className="text-blue-400 font-bold">KSh {bankPayments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-gray-400">✍️ Cheques:</span>
              <span className="text-amber-400 font-bold">KSh {chequePayments.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Navigation Controls */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-[#1f1f23] pb-px mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 gap-2 flex items-center break-keep whitespace-nowrap ${
            activeTab === 'overview' ? 'text-rose-400 border-rose-500 bg-[#15161a] font-bold' : 'text-gray-500 hover:text-white border-transparent'
          }`}
        >
          <Landmark className="h-4 w-4 text-rose-450" />
          Overview & Accounts
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 gap-2 flex items-center break-keep whitespace-nowrap ${
            activeTab === 'payments' ? 'text-rose-400 border-rose-500 bg-[#15161a] font-bold' : 'text-gray-500 hover:text-white border-transparent'
          }`}
        >
          <Receipt className="h-4 w-4 text-rose-450" />
          Post Fee Payment
        </button>

        <button
          onClick={() => setActiveTab('pocket-money')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 gap-2 flex items-center break-keep whitespace-nowrap ${
            activeTab === 'pocket-money' ? 'text-rose-400 border-rose-500 bg-[#15161a] font-bold' : 'text-gray-500 hover:text-white border-transparent'
          }`}
        >
          <Wallet className="h-4 w-4 text-rose-450" />
          Pocket Money Desk
        </button>

        <button
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 gap-2 flex items-center break-keep whitespace-nowrap ${
            activeTab === 'structure' ? 'text-rose-400 border-rose-500 bg-[#15161a] font-bold' : 'text-gray-500 hover:text-white border-transparent'
          }`}
        >
          <Settings className="h-4 w-4 text-rose-450" />
          Fee structures Setup
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Accounts Register - Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 mb-4">
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">TDBK Student Ledgers</h3>
                  <p className="text-[10px] text-gray-500">Search and check real-time balances, invoiced fees and M-Pesa records.</p>
                </div>
                
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, ID or parent..."
                    className="w-full text-xs px-3 py-2 bg-[#0d0d10] border border-[#1f1f23] rounded-xl focus:outline-none focus:border-rose-500 text-white placeholder-gray-500"
                  />
                  <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1f1f23] text-gray-500">
                      <th className="py-2.5 px-3">Student / ID</th>
                      <th className="py-2.5 px-3">Parent Name</th>
                      <th className="py-2.5 px-3">Invoiced fees</th>
                      <th className="py-2.5 px-3">Paid Ledger</th>
                      <th className="py-2.5 px-3">Pocket Balance</th>
                      <th className="py-2.5 px-3 text-right">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f23]/60">
                    {filteredStudents.map((st) => {
                      const outstanding = (st.totalFees || 45000) - st.paidFees;
                      const percentPaid = Math.round((st.paidFees / (st.totalFees || 45000)) * 100);

                      return (
                        <tr key={st.id} className="hover:bg-[#15161a]/35 transition text-[11px]">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base select-none">{st.avatar}</span>
                              <div>
                                <span className="font-bold text-white block">{st.name}</span>
                                <span className="text-[9px] text-gray-500 font-mono font-bold uppercase">{st.id} ({st.grade})</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-300 font-medium">{st.parentName}</td>
                          <td className="py-3 px-3 font-mono text-gray-400">KSh {((st.totalFees || 45000)).toLocaleString()}</td>
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <span className="font-mono text-emerald-450 font-bold block">KSh {st.paidFees.toLocaleString()}</span>
                              <div className="w-20 bg-gray-800 rounded-full h-1">
                                <div 
                                  className={`h-1 rounded-full ${percentPaid >= 90 ? 'bg-emerald-500' : percentPaid >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                                  style={{ width: `${percentPaid}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-500">KSh {st.pocketMoneyBalance.toLocaleString()}</td>
                          <td className="py-3 px-3 font-mono text-right font-extrabold text-white">
                            {outstanding === 0 ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-bold">CLEARED</span>
                            ) : (
                              <span className="text-rose-400">KSh {outstanding.toLocaleString()}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Fee Payments Audit Log */}
          <div className="space-y-4">
            <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-sm">
              <div className="pb-3 border-[#1f1f23] border-b mb-3">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Recent Payments Reconciled</h3>
                <p className="text-[10px] text-gray-500">Live feed of processed bank slips & parent mobile deposits.</p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {feePayments.length === 0 ? (
                  <p className="text-center text-gray-500 py-6 text-xs italic">No fee payments found.</p>
                ) : (
                  [...feePayments].reverse().map((pay) => (
                    <div key={pay.id} className="p-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl relative flex items-start justify-between shadow-xs">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1 rounded text-[8px] font-mono font-extrabold uppercase ${
                            pay.method === 'M-Pesa' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {pay.method}
                          </span>
                          <span className="text-[9.5px] font-mono text-gray-500 font-bold uppercase">{pay.reference}</span>
                        </div>
                        <p className="text-xs font-bold text-white mt-1.5">{pay.studentName}</p>
                        <p className="text-[9.5px] text-gray-400">Reconciled successfully</p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs font-mono font-extrabold text-emerald-400">KSh {pay.amount.toLocaleString()}</span>
                        <button
                          onClick={() => setSelectedReceipt(pay)}
                          className="flex items-center gap-1 text-[9px] font-bold text-blue-400 hover:underline hover:text-blue-300 font-mono"
                        >
                          <Printer className="h-2.5 w-2.5" /> RECEIPT
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Post New Payment */}
          <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-lg">
            <div className="pb-3 border-[#1f1f23] border-b mb-5">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Invoice fee payment</h3>
              <p className="text-[10px] text-gray-500">Record payments processed via manual banker deposits, cheques, or verified parent school pay codes.</p>
            </div>

            <form onSubmit={handlePostFee} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                  1. Target Boarder Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl text-white focus:outline-none focus:border-rose-500 font-sans"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.id}) - Current Balance: KSh {(st.totalFees - st.paidFees).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                    2. Payment Channel
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl text-white focus:outline-none focus:border-rose-500 font-sans"
                  >
                    <option value="M-Pesa">📲 Safaricom M-Pesa</option>
                    <option value="Bank Transfer">🏦 KCB / Equity Bank Wire</option>
                    <option value="Cheque">✍️ Physical Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                    3. Transaction Reference Code
                  </label>
                  <input
                    type="text"
                    required
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="e.g. OEF18SH2KS or CHQ-091"
                    className="w-full text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl focus:outline-none focus:border-rose-500 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                  4. Exact Amount Deposited (KSh)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs text-gray-500 font-bold font-mono">KES</span>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full pl-12 text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl focus:outline-none focus:border-rose-500 text-white font-mono placeholder-gray-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold tracking-wider transition uppercase"
              >
                Reconcile & Print Receipt
              </button>
            </form>
          </div>

          {/* Selected Receipt Print View Mock */}
          <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="pb-3 border-[#1f1f23] border-b mb-4">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Receipt Generator</h3>
              <p className="text-[10px] text-gray-500">Highlight a payment in the audit list to preview printable thermal voucher slip.</p>
            </div>

            {selectedReceipt ? (
              <div className="bg-white text-[#111216] rounded-2xl p-6 font-mono text-[11px] shadow-lg border border-gray-100 flex-1 flex flex-col justify-between relative">
                
                {/* Decorative cut paper header */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
                
                <div className="space-y-4">
                  <div className="text-center pb-3 border-b border-dashed border-gray-300">
                    <h4 className="font-bold text-sm uppercase tracking-tight text-[#0a0a0c]">TDBK BOARDING ACADEMY</h4>
                    <p className="text-[9px] text-gray-600 mt-0.5">PO Box 192, Mwatate, Kenya</p>
                    <p className="text-[8.5px] text-gray-500 mt-0.2 select-none">OFFICIAL FINANCE RECEIPT</p>
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">RECEIPT NO:</span>
                      <span className="font-bold text-slate-900">REC-{selectedReceipt.id.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">REF CODE:</span>
                      <span className="font-bold text-slate-900 uppercase">{selectedReceipt.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">DATE RECORDED:</span>
                      <span className="font-bold text-slate-800">
                        {new Date(selectedReceipt.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-150 pt-1.5 mt-1.5">
                      <span className="text-gray-500">STUDENT NAME:</span>
                      <span className="font-bold text-slate-900">{selectedReceipt.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">STUDENT ID:</span>
                      <span className="font-bold text-slate-900">{selectedReceipt.studentId}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-gray-150">
                      <span className="text-gray-500">PAYMENT TYPE:</span>
                      <span className="font-bold text-slate-900">{selectedReceipt.method}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    <span className="font-bold text-[10px] text-slate-700">TOTAL PAID:</span>
                    <span className="text-sm font-black text-[#111216] font-mono">KSh {selectedReceipt.amount.toLocaleString()}.00</span>
                  </div>
                </div>

                <div className="text-center mt-6 pt-3 border-t border-dashed border-gray-200 text-[8.5px] text-gray-500 space-y-1">
                  <p>Paid amounts post to child pocket-ledger instantly.</p>
                  <p className="font-bold">Bursar Reconciled Slip. Thank you!</p>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-gray-500 border border-dashed border-[#1f1f23] rounded-2xl p-6">
                <Receipt className="h-10 w-10 text-gray-600 mb-2" />
                <p className="text-xs font-bold text-gray-400">Invoice Voucher Blank</p>
                <p className="text-[10px] mt-0.5">Click the receipt button next to any deposit in the right audit list to load the receipt.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pocket-money' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Post auxiliary ledger action */}
          <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-lg">
            <div className="pb-3 border-[#1f1f23] border-b mb-5">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono font-bold">Auxiliary Cash Register</h3>
              <p className="text-[10px] text-gray-500">Record hand-delivered petty cash deposits or process physical emergency coin claims from boarders.</p>
            </div>

            <form onSubmit={handlePostPocketMoney} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                  1. Target Boarder Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl text-white focus:outline-none focus:border-rose-500 font-sans"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.id}) - Current Balance: KSh {st.pocketMoneyBalance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                    2. Cash Action Flow
                  </label>
                  <select
                    value={pmActionType}
                    onChange={(e) => setPmActionType(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl text-white focus:outline-none focus:border-rose-500 font-sans"
                  >
                    <option value="Deposit">💵 Cash Deposit (add money)</option>
                    <option value="Withdraw">🪙 Emergency Cash out (claim)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                    3. Source Voucher / Slip Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={pmRef}
                    onChange={(e) => setPmRef(e.target.value)}
                    placeholder="e.g. CASH-HAND-01"
                    className="w-full text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl focus:outline-none focus:border-rose-500 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                  4. Amount (KES)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs text-gray-500 font-bold font-mono">KES</span>
                  <input
                    type="number"
                    required
                    value={pmAmount}
                    onChange={(e) => setPmAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full pl-12 text-xs px-3.5 py-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl focus:outline-none focus:border-rose-500 text-white font-mono placeholder-gray-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold tracking-wider transition uppercase"
              >
                Execute Petty transaction
              </button>
            </form>
          </div>

          {/* Petty claims monitor ledger */}
          <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-sm">
            <div className="pb-3 border-[#1f1f23] border-b mb-3">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Bursar Auxiliary Cash Ledger</h3>
              <p className="text-[10px] text-gray-500">Audit trail of physical cash transactions logged by the board office.</p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {transactions.filter(t => t.source === 'Bursar Office').length === 0 ? (
                <div className="text-center py-10 text-gray-500 italic text-xs">
                  No bursar cash transactions found.
                </div>
              ) : (
                [...transactions].filter(t => t.source === 'Bursar Office').reverse().map((tx) => (
                  <div key={tx.id} className="p-3 bg-[#0d0d10] border border-[#1f1f23] rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1 text-[8px] font-bold font-mono uppercase rounded ${
                          tx.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-40 border border-rose-500/20'
                        }`}>
                          {tx.type}
                        </span>
                        <span className="text-[9px] font-mono text-gray-500">{tx.reference}</span>
                      </div>
                      <p className="text-xs font-bold text-white mt-1.5">{tx.studentName}</p>
                      <p className="text-[9.5px] text-gray-400 font-mono">
                        {new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <span className={`text-xs font-mono font-extrabold ${tx.type === 'Deposit' ? 'text-emerald-400' : 'text-rose-450'}`}>
                      {tx.type === 'Deposit' ? '+' : '-'} {tx.amount}/-
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'structure' && (
        <div className="bg-[#111216] border border-[#1f1f23] rounded-2xl p-5 shadow-sm max-w-2xl mx-auto">
          <div className="pb-3 border-[#1f1f23] border-b mb-5">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Boarding Fee Structure (Term II, 2026)</h3>
            <p className="text-[10px] text-gray-500">Official items approved by the Board of Management (BOM) for boarding Streams.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-[#1f1f23] font-sans">
                <span className="text-gray-400 font-medium">1. Tuition Fees</span>
                <span className="font-mono text-white font-bold">KSh 18,500</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1f1f23]">
                <span className="text-gray-400 font-medium">2. Boarding & Upkeep Levy</span>
                <span className="font-mono text-white font-bold">KSh 16,000</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1f1f23]">
                <span className="text-gray-400 font-medium">3. Competency Assessment Pack (CBC)</span>
                <span className="font-mono text-white font-bold">KSh 4,500</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1f1f23]">
                <span className="text-gray-400 font-medium">4. Medical & Accidental Insurance covers</span>
                <span className="font-mono text-white font-bold">KSh 3,500</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1f1f23]">
                <span className="text-gray-400 font-medium">5. Canteen Petty Account float</span>
                <span className="font-mono text-white font-bold">KSh 2,500</span>
              </div>
              <div className="flex justify-between py-2.5 font-sans pt-3 font-bold border-t border-[#1f1f23] mt-2 text-sm text-white">
                <span className="text-gray-300">Total Structural Invoice (per term)</span>
                <span className="font-mono text-rose-400">KSh 45,000</span>
              </div>
            </div>

            <div className="p-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10.5px] rounded-xl leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <div>
                <span className="font-bold block">Invoicing Automations Active:</span>
                New students registering inside the school simulator are automatically debited this default fee structural invoice. Outstanding balances clear progressively in real-time as parents post wire deposits.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
