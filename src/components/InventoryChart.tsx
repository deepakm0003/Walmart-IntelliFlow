import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InventoryItem } from '../types';

interface InventoryChartProps {
  items: InventoryItem[];
}

const InventoryChart: React.FC<InventoryChartProps> = ({ items }) => {
  const chartData = items.map(item => ({
    name: item.name.split(' - ')[0],
    current: item.currentStock,
    threshold: item.minThreshold,
    capacity: item.maxCapacity,
    percentage: (item.currentStock / item.maxCapacity) * 100
  }));

  const getBarColor = (percentage: number) => {
    if (percentage < 25) return '#ef4444'; // Red
    if (percentage < 50) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Levels</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, name === 'current' ? 'Current Stock' : name === 'threshold' ? 'Min Threshold' : 'Max Capacity']}
            />
            <Bar dataKey="current" name="current">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
              ))}
            </Bar>
            <Bar dataKey="threshold" fill="#94a3b8" opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Critical (&lt;25%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Low (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Healthy (≥50%)</span>
        </div>
      </div>
    </div>
  );
};

export default InventoryChart;