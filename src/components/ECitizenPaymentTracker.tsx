import React, { useState } from 'react';
import { CreditCard, Send, AlertCircle } from 'lucide-react';

export default function ECitizenPaymentTracker() {
  const [amount, setAmount] = useState('');
  const [studentId, setStudentId] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [success, setSuccess] = useState('');

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !studentId || !transactionCode) return;
    
    // In a real app, this would call an API to save this to a database
    console.log('Logging eCitizen payment:', { amount, studentId, transactionCode });
    setSuccess('Payment record submitted successfully.');
    setAmount('');
    setStudentId('');
    setTransactionCode('');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="text-blue-500 h-5 w-5" />
        <h3 className="font-semibold text-slate-900 leading-tight">Log eCitizen Payment</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">Record payments made via the public eCitizen paybill for boarding students.</p>

      <form onSubmit={handlePaymentSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Student ID</label>
          <input
            type="text"
            required
            placeholder="STU-XXX"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-150 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-gray-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Amount (KES)</label>
          <input
            type="number"
            required
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-150 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-gray-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">eCitizen Transaction Code</label>
          <input
            type="text"
            required
            placeholder="e.g. QWE123RTY4"
            value={transactionCode}
            onChange={(e) => setTransactionCode(e.target.value)}
            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-150 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-gray-400"
          />
        </div>

        {success && (
          <p className="text-[10px] text-emerald-800 bg-emerald-50 p-2.5 border border-emerald-250 rounded-lg text-center font-medium">
            {success}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Send className="h-4 w-4" /> Log Payment
        </button>
      </form>
    </div>
  );
}
