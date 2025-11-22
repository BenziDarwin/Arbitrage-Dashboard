// components/SpreadChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';

interface SpreadChartProps {
  data: Array<{
    hour: Date;
    avgSpread: number;
    maxSpread: number;
  }>;
}

const SpreadChart: React.FC<SpreadChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    time: format(new Date(item.hour), 'HH:mm'),
    avgSpread: item.avgSpread,
    maxSpread: item.maxSpread,
  }));
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        Spread Over Time (24h)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            label={{
              value: 'Spread %',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#9ca3af' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => `${value.toFixed(4)}%`}
          />
          <Legend wrapperStyle={{ color: '#9ca3af' }} />
          <ReferenceLine
            y={0.5}
            stroke="#10b981"
            strokeDasharray="3 3"
            label={{
              value: 'Profitable (0.5%)',
              fill: '#10b981',
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="avgSpread"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Avg Spread"
          />
          <Line
            type="monotone"
            dataKey="maxSpread"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            name="Max Spread"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpreadChart;
