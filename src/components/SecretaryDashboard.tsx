import React, { useState } from 'react';
import { Mail, Users, FileText, Search, Filter } from 'lucide-react';
import { ChatMessage, VisitorLog } from '../types';

interface SecretaryDashboardProps {
  chatMessages: ChatMessage[];
  visitorLogs: VisitorLog[];
}

export default function SecretaryDashboard({ chatMessages, visitorLogs }: SecretaryDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Inside' | 'Checked-Out'>('All');

  const filteredVisitors = visitorLogs.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || v.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Secretary Office</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visitor Management */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="text-purple-600 h-5 w-5" />
              <h3 className="font-semibold text-slate-900">Visitor Logs</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="text-xs border rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="All">All</option>
                <option value="Inside">Inside</option>
                <option value="Checked-Out">Checked-Out</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filteredVisitors.map(visitor => (
              <div key={visitor.id} className="p-3 bg-gray-50 rounded-lg text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold">{visitor.name}</p>
                  <p className="text-gray-500">{visitor.purpose}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${visitor.status === 'Inside' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                    {visitor.status}
                  </span>
                  <p className="text-gray-400 mt-1">In: {new Date(visitor.timeIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Communications */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="text-blue-600 h-5 w-5" />
            <h3 className="font-semibold text-slate-900">Incoming Queries</h3>
          </div>
          <div className="space-y-2">
            {chatMessages.map(msg => (
                <div key={msg.id} className="p-3 border-b border-gray-100 text-xs">
                    <p className="font-bold">{msg.senderName}</p>
                    <p>{msg.content}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
