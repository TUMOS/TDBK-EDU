
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AttendanceRecord } from '../types';

interface AttendanceTrendChartProps {
  attendance: AttendanceRecord[];
}

export default function AttendanceTrendChart({ attendance }: AttendanceTrendChartProps) {
  const chartData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    
    // Sort by date just in case
    const sortedAttendance = [...attendance].sort((a, b) => a.date.localeCompare(b.date));

    sortedAttendance.forEach(rec => {
        if (rec.status === 'Present') {
            dailyData[rec.date] = (dailyData[rec.date] || 0) + 1;
        }
    });

    return Object.entries(dailyData).map(([date, count]) => ({
        date,
        present: count
    })).slice(-7); // Last 7 days
  }, [attendance]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs h-80">
      <h3 className="font-semibold text-slate-900 mb-4">Weekly Attendance Trend</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="present" 
            name="Students Present"
            stroke="#4F46E5" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#4F46E5' }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
