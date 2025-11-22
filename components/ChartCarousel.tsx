"use client";

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ComposedChart, ScatterChart, Scatter
} from 'recharts';
import { format } from 'date-fns';

interface ChartCarouselProps {
  recentScans: any[];
  opportunities: any[];
  stats: any;
}

const ChartCarousel: React.FC<ChartCarouselProps> = ({ recentScans, opportunities, stats }) => {
  const [activeChart, setActiveChart] = useState(0);

  // Generate cumulative profit data by day
  const cumulativeData = useMemo(() => {
    const dailyMap: { [key: string]: number } = {};
    opportunities.forEach((opp) => {
      const day = format(new Date(opp.opportunity_timestamp), 'MMM dd');
      dailyMap[day] = (dailyMap[day] || 0) + parseFloat(opp.net_profit || 0);
    });
    
    let cumulative = 0;
    return Object.entries(dailyMap)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([day, daily]) => {
        cumulative += daily;
        return { day, daily: +daily.toFixed(2), cumulative: +cumulative.toFixed(2) };
      });
  }, [opportunities]);

  // Spread vs Profit correlation data - sorted by spread ascending
  const spreadVsProfit = useMemo(() => {
    return opportunities
      .map((opp) => ({
        spread: parseFloat(opp.spread_percentage || 0),
        profit: parseFloat(opp.net_profit || 0),
      }))
      .sort((a, b) => a.spread - b.spread);
  }, [opportunities]);

  // Hourly activity data
  const hourlyData = useMemo(() => {
    const hourMap: { [key: number]: { scans: number; opportunities: number; profit: number } } = {};
    for (let i = 0; i < 24; i++) {
      hourMap[i] = { scans: 0, opportunities: 0, profit: 0 };
    }

    recentScans.forEach((scan) => {
      const hour = new Date(scan.scan_timestamp).getHours();
      hourMap[hour].scans++;
    });

    opportunities.forEach((opp) => {
      const hour = new Date(opp.opportunity_timestamp).getHours();
      hourMap[hour].opportunities++;
      hourMap[hour].profit += parseFloat(opp.net_profit || 0);
    });

    return Object.entries(hourMap).map(([hour, data]) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      ...data,
    }));
  }, [recentScans, opportunities]);

  // Detection efficiency (hit rate by hour)
  const efficiencyData = useMemo(() => {
    const hourMap: { [key: number]: { scans: number; hits: number } } = {};
    for (let i = 0; i < 24; i++) {
      hourMap[i] = { scans: 0, hits: 0 };
    }

    recentScans.forEach((scan) => {
      const hour = new Date(scan.scan_timestamp).getHours();
      hourMap[hour].scans++;
    });

    opportunities.forEach((opp) => {
      const hour = new Date(opp.opportunity_timestamp).getHours();
      hourMap[hour].hits++;
    });

    return Object.entries(hourMap).map(([hour, data]) => ({
      hour: parseInt(hour),
      hitRate: data.scans > 0 ? data.hits / data.scans : 0,
      scans: data.scans,
    }));
  }, [recentScans, opportunities]);

  const tooltipStyle = {
    contentStyle: { background: '#111827', border: '1px solid #374151', fontSize: 11, color: '#fff' },
  };

  const charts = [
    {
      title: 'Cumulative Profit',
      subtitle: 'Daily profit with running total',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#6b7280' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#6b7280' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#6b7280' }} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => `$${v.toFixed(2)}`} />
            <Bar yAxisId="left" dataKey="daily" fill="#3b82f6" opacity={0.6} name="Daily" />
            <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={2} dot={false} name="Cumulative" />
          </ComposedChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Spread vs Profit',
      subtitle: 'Correlation analysis',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={spreadVsProfit}>
            <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" />
            <XAxis dataKey="spread" name="Spread" unit="%" tick={{ fontSize: 9, fill: '#6b7280' }} />
            <YAxis dataKey="profit" name="Profit" unit="$" tick={{ fontSize: 9, fill: '#6b7280' }} />
            <Tooltip {...tooltipStyle} formatter={(v: number, name: string) => name === 'spread' ? `${Number(v).toFixed(3)}%` : `${Number(v).toFixed(2)}`} />
            <Line type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Hourly Activity',
      subtitle: 'Scans and opportunities by hour',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={hourlyData}>
            <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" />
            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#6b7280' }} interval={3} />
            <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#6b7280' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#6b7280' }} />
            <Tooltip {...tooltipStyle} />
            <Area yAxisId="left" type="monotone" dataKey="scans" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" name="Scans" />
            <Bar yAxisId="right" dataKey="opportunities" fill="#f59e0b" name="Opportunities" />
          </ComposedChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Detection Efficiency',
      subtitle: 'Hit rate by hour',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={efficiencyData}>
            <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" />
            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 9, fill: '#dee0e4ff' }} domain={[0, 'auto']} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => `${(v * 100).toFixed(2)}%`} />
            <Bar dataKey="hitRate" name="Hit Rate">
              {efficiencyData.map((entry, i) => (
                <Cell key={i} fill={entry.hitRate > 0.003 ? '#10b981' : '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <div>
          <h3 className="text-xs font-medium text-white">{charts[activeChart].title}</h3>
          <p className="text-[10px] text-gray-500">{charts[activeChart].subtitle}</p>
        </div>
        <div className="flex items-center gap-1">
          {charts.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveChart(i)}
              className={`h-1.5 transition-all ${i === activeChart ? 'bg-blue-500 w-4' : 'bg-gray-700 hover:bg-gray-600 w-1.5'}`}
            />
          ))}
        </div>
      </div>
      <div className="p-3">{charts[activeChart].chart}</div>
    </div>
  );
};

export default ChartCarousel;