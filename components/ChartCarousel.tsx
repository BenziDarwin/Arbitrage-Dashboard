// components/ChartCarousel.tsx
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';

interface ChartCarouselProps {
  recentScans: any[];
  opportunities: any[];
  stats: any;
}

const ChartCarousel: React.FC<ChartCarouselProps> = ({
  recentScans,
  opportunities,
  stats,
}) => {
  const [activeChart, setActiveChart] = useState(0);

  // Prepare data for Price Trend Chart
  const priceTrendData = recentScans.slice(0, 20).reverse().map((scan, index) => ({
    time: format(new Date(scan.scan_timestamp), 'HH:mm:ss'),
    pancakeswap: parseFloat(scan.pancakeswap_price),
    biswap: parseFloat(scan.biswap_price),
    spread: parseFloat(scan.spread_percentage),
  }));

  // Prepare data for Spread Distribution
  const spreadRanges = [
    { range: '0.0-0.2%', count: 0, color: '#ef4444' },
    { range: '0.2-0.4%', count: 0, color: '#f59e0b' },
    { range: '0.4-0.6%', count: 0, color: '#eab308' },
    { range: '0.6-0.8%', count: 0, color: '#84cc16' },
    { range: '0.8-1.0%', count: 0, color: '#22c55e' },
    { range: '1.0%+', count: 0, color: '#10b981' },
  ];

  recentScans.forEach((scan) => {
    const spread = parseFloat(scan.spread_percentage);
    if (spread < 0.2) spreadRanges[0].count++;
    else if (spread < 0.4) spreadRanges[1].count++;
    else if (spread < 0.6) spreadRanges[2].count++;
    else if (spread < 0.8) spreadRanges[3].count++;
    else if (spread < 1.0) spreadRanges[4].count++;
    else spreadRanges[5].count++;
  });

  // Prepare data for Opportunities Over Time
  const opportunityTimeData = opportunities.slice(0, 10).reverse().map((opp) => ({
    time: format(new Date(opp.opportunity_timestamp), 'HH:mm'),
    profit: parseFloat(opp.net_profit),
    spread: parseFloat(opp.spread_percentage),
  }));

  // Prepare data for Performance Metrics
  const performanceData = [
    { name: 'Total Scans', value: stats.totalScans, color: '#3b82f6' },
    { name: 'Price Changes', value: stats.priceChanges, color: '#22c55e' },
    { name: 'Opportunities', value: stats.totalOpportunities, color: '#f59e0b' },
  ];

  const charts = [
    {
      id: 0,
      title: 'Live Price Trends',
      description: 'Real-time price comparison across DEXes',
      component: (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={priceTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: any) => `$${parseFloat(value).toFixed(6)}`}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="pancakeswap"
              stroke="#eab308"
              strokeWidth={2}
              dot={false}
              name="PancakeSwap"
            />
            <Line
              type="monotone"
              dataKey="biswap"
              stroke="#ec4899"
              strokeWidth={2}
              dot={false}
              name="BiSwap"
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: 1,
      title: 'Spread Distribution',
      description: 'Frequency of spread percentages',
      component: (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={spreadRanges}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="range"
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <ReferenceLine
              y={0}
              stroke="#4b5563"
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {spreadRanges.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: 2,
      title: 'Opportunity Profits',
      description: 'Recent arbitrage opportunities',
      component: (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={opportunityTimeData}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: any) => `$${parseFloat(value).toFixed(2)}`}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#profitGradient)"
              name="Net Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: 3,
      title: 'Performance Overview',
      description: 'Scan statistics breakdown',
      component: (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={performanceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {performanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
  ];

  const nextChart = () => {
    setActiveChart((prev) => (prev + 1) % charts.length);
  };

  const prevChart = () => {
    setActiveChart((prev) => (prev - 1 + charts.length) % charts.length);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
      {/* Header with Navigation */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {charts[activeChart].title}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {charts[activeChart].description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevChart}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              aria-label="Previous chart"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex space-x-1">
              {charts.map((chart, index) => (
                <button
                  key={chart.id}
                  onClick={() => setActiveChart(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeChart
                      ? 'bg-blue-500 w-6'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to chart ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextChart}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              aria-label="Next chart"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        {charts[activeChart].component}
      </div>

      {/* Chart Info Footer */}
      <div className="bg-gray-900/50 px-6 py-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Chart {activeChart + 1} of {charts.length}</span>
          <span>Auto-updates every 2 seconds</span>
        </div>
      </div>
    </div>
  );
};

export default ChartCarousel;