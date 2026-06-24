"use client";
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Default data agar props se data na aaye
const defaultData = [
  { day: 'Mon', views: 0 },
  { day: 'Tue', views: 0 },
  { day: 'Wed', views: 0 },
  { day: 'Thu', views: 0 },
  { day: 'Fri', views: 0 },
  { day: 'Sat', views: 0 },
  { day: 'Sun', views: 0 },
];

const ViewsTrendChart = ({ data }) => {
  // Agar prop mein data hai toh use karein, nahi toh default
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="w-full h-48 min-h-[192px] bg-white rounded-2xl">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
          {/* XAxis mapping logic */}
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#429466', fontSize: 12, fontWeight: 500 }}
            dy={10}
          />
          <YAxis hide={true} />
          <Tooltip 
            cursor={{ fill: 'transparent' }} 
            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          
          <Bar 
            dataKey="views" 
            fill="#429466" 
            radius={[20, 20, 0, 0]} 
            barSize={40} 
            animationDuration={1500} // Smooth loading animation
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ViewsTrendChart;