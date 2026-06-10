import React from 'react';
import { Staff } from '../types';
import { BadgeInfo, PhoneCall, Trash2 } from 'lucide-react';

interface StaffListProps {
  staff: Staff[];
  staffSearch: string;
  roleFilter: 'all' | 'Active' | 'Terminated';
  handleDeleteStaffLog: (id: string) => void;
  handleToggleStaffStatus: (id: string, status: 'Active' | 'Terminated') => void;
}

export default function StaffList({ staff, staffSearch, roleFilter, handleDeleteStaffLog, handleToggleStaffStatus }: StaffListProps) {
  const filteredStaff = staff.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(staffSearch.toLowerCase()) || 
                      m.role.toLowerCase().includes(staffSearch.toLowerCase()) ||
                      m.id.toLowerCase().includes(staffSearch.toLowerCase());
    const matchStatus = roleFilter === 'all' || m.status === roleFilter;
    return matchSearch && matchStatus;
  });

  if (filteredStaff.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 border border-dashed rounded-xl">
        <p className="text-sm text-gray-500 font-medium">No matching staff members found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredStaff.map((person) => (
        <div 
          key={person.id} 
          className={`p-4 border rounded-xl transition shadow-xs flex flex-col justify-between ${
            person.status === 'Terminated' 
              ? 'bg-red-50/20 border-red-100 opacity-75' 
              : 'bg-slate-50/40 border-gray-150 hover:border-blue-200 hover:bg-white'
          }`}
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800 text-sm">{person.name}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    person.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {person.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono tracking-wide">{person.id} | {person.role}</p>
              </div>
              <span className="p-1.5 bg-[#f1f2f6] text-[#3c3e4a] rounded-lg text-xs font-semibold font-mono">
                ID: {person.nationalId}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-white border border-gray-100 p-2.5 rounded-lg">
              <p className="flex items-center gap-1.5 text-slate-700">
                <BadgeInfo className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-semibold">Specialization:</span> {person.specialization}
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <PhoneCall className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-semibold">Contact:</span> {person.phone}
              </p>
              <p className="text-[10px] text-gray-400 font-mono">Enrolled on: {person.dateJoined}</p>
            </div>
          </div>

          <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-150 mt-3 text-xs">
            <button
              type="button"
              onClick={() => handleDeleteStaffLog(person.id)}
              className="p-1.5 text-red-650 bg-red-50 hover:bg-red-100 rounded-lg text-xs transition border border-red-250 cursor-pointer"
              title="Completely Purge Official Record"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            
            <button
              type="button"
              onClick={() => handleToggleStaffStatus(person.id, person.status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono border transition cursor-pointer ${
                person.status === 'Active' 
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {person.status === 'Active' ? 'Terminate Privileges' : 'Re-Activate Staff'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
