import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
function LineChartComponent ({data}){
  const chartData=data.map((item)=>({
    Date:item[0],
    Clicks:item[1]
  }))
  return (
    <div className="w-full max-w-2xl p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Click Trends</h3>
        <p className="text-sm text-gray-600">Daily clicks across all your links</p>
      </div>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="Date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '0.5px solid #d2d4d8' }}
              labelStyle={{ color: '#9CA3AF' }}
              itemStyle={{ color: '#3B82F6' }}
            />
            <Line type="monotone" dataKey="Clicks" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default LineChartComponent