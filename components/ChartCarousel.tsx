"use client"

import type React from "react"
import { useState } from "react"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"

interface ChartCarouselProps {
  recentScans: any[]
  opportunities: any[]
  stats: any
}

const ChartCarousel: React.FC<ChartCarouselProps> = ({ recentScans, opportunities, stats }) => {
  const [activeChart, setActiveChart] = useState(0)
  const [dateRange, setDateRange] = useState({ start: null as Date | null, end: null as Date | null })

  // Generate date range from data
  const allDates = [...recentScans, ...opportunities]
    .map((item) => new Date(item.scan_timestamp || item.opportunity_timestamp))
    .filter((date) => !isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  const dateRangeStart = allDates.length > 0 ? allDates[0] : new Date()
  const dateRangeEnd = allDates.length > 0 ? allDates[allDates.length - 1] : new Date()

  const dailyTrendData: { [key: string]: any } = {}
  recentScans.forEach((scan) => {
    const date = format(new Date(scan.scan_timestamp), "yyyy-MM-dd")
    if (!dailyTrendData[date]) {
      dailyTrendData[date] = { date, scans: 0, opportunities: 0, totalProfit: 0, avgSpread: 0, spreadSum: 0 }
    }
    dailyTrendData[date].scans++
    dailyTrendData[date].avgSpread += Number.parseFloat(scan.spread_percentage)
  })

  opportunities.forEach((opp) => {
    const date = format(new Date(opp.opportunity_timestamp), "yyyy-MM-dd")
    if (!dailyTrendData[date]) {
      dailyTrendData[date] = { date, scans: 0, opportunities: 0, totalProfit: 0, avgSpread: 0, spreadSum: 0 }
    }
    dailyTrendData[date].opportunities++
    dailyTrendData[date].totalProfit += Number.parseFloat(opp.net_profit)
  })

  const priceTrendData = Object.values(dailyTrendData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      ...item,
      avgSpread: item.scans > 0 ? item.avgSpread / item.scans : 0,
    }))

  const hourlyProfitData: { [key: number]: any } = {}
  for (let i = 0; i < 24; i++) {
    hourlyProfitData[i] = { hour: `${String(i).padStart(2, "0")}:00`, profit: 0, count: 0 }
  }

  opportunities.forEach((opp) => {
    const hour = new Date(opp.opportunity_timestamp).getHours()
    hourlyProfitData[hour].profit += Number.parseFloat(opp.net_profit)
    hourlyProfitData[hour].count++
  })

  const hourlyData = Object.values(hourlyProfitData).map((item) => ({
    ...item,
    avgProfit: item.count > 0 ? item.profit / item.count : 0,
  }))

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dayOfWeekData: { [key: number]: any } = {}
  for (let i = 0; i < 7; i++) {
    dayOfWeekData[i] = { day: dayNames[i], profit: 0, opportunities: 0 }
  }

  opportunities.forEach((opp) => {
    const dayOfWeek = new Date(opp.opportunity_timestamp).getDay()
    dayOfWeekData[dayOfWeek].profit += Number.parseFloat(opp.net_profit)
    dayOfWeekData[dayOfWeek].opportunities++
  })

  const dayOfWeekChartData = Object.values(dayOfWeekData)

  // Prepare data for Spread Distribution
  const spreadRanges = [
    { range: "0.0-0.2%", count: 0, color: "#ef4444" },
    { range: "0.2-0.4%", count: 0, color: "#f59e0b" },
    { range: "0.4-0.6%", count: 0, color: "#eab308" },
    { range: "0.6-0.8%", count: 0, color: "#84cc16" },
    { range: "0.8-1.0%", count: 0, color: "#22c55e" },
    { range: "1.0%+", count: 0, color: "#10b981" },
  ]

  recentScans.forEach((scan) => {
    const spread = Number.parseFloat(scan.spread_percentage)
    if (spread < 0.2) spreadRanges[0].count++
    else if (spread < 0.4) spreadRanges[1].count++
    else if (spread < 0.6) spreadRanges[2].count++
    else if (spread < 0.8) spreadRanges[3].count++
    else if (spread < 1.0) spreadRanges[4].count++
    else spreadRanges[5].count++
  })

  const profitRanges = [
    { range: "$0-$10", count: 0, avgSpread: 0, color: "#ef4444" },
    { range: "$10-$50", count: 0, avgSpread: 0, color: "#f59e0b" },
    { range: "$50-$100", count: 0, avgSpread: 0, color: "#eab308" },
    { range: "$100-$500", count: 0, avgSpread: 0, color: "#22c55e" },
    { range: "$500+", count: 0, avgSpread: 0, color: "#10b981" },
  ]

  opportunities.forEach((opp) => {
    const profit = Number.parseFloat(opp.net_profit)
    const spread = Number.parseFloat(opp.spread_percentage)
    if (profit < 10) {
      profitRanges[0].count++
      profitRanges[0].avgSpread += spread
    } else if (profit < 50) {
      profitRanges[1].count++
      profitRanges[1].avgSpread += spread
    } else if (profit < 100) {
      profitRanges[2].count++
      profitRanges[2].avgSpread += spread
    } else if (profit < 500) {
      profitRanges[3].count++
      profitRanges[3].avgSpread += spread
    } else {
      profitRanges[4].count++
      profitRanges[4].avgSpread += spread
    }
  })

  const profitRatioData = profitRanges.map((range) => ({
    ...range,
    avgSpread: range.count > 0 ? range.avgSpread / range.count : 0,
  }))

  const charts = [
    {
      id: 0,
      title: "Long-Term Profit Trend",
      description: `Daily performance from ${format(dateRangeStart, "MMM d")} to ${format(dateRangeEnd, "MMM d")}`,
      component: (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={priceTrendData}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "11px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "11px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: any) => `$${Number.parseFloat(value).toFixed(2)}`}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Area
              type="monotone"
              dataKey="totalProfit"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#profitGradient)"
              name="Daily Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: 1,
      title: "Hourly Profit Distribution",
      description: "Which hours generate the most profit",
      component: (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hour" stroke="#9ca3af" style={{ fontSize: "11px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "11px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: any) => `$${Number.parseFloat(value).toFixed(2)}`}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="avgProfit" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Avg Profit" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: 2,
      title: "Daily Performance by Day of Week",
      description: "Most profitable days of the week",
      component: (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dayOfWeekChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: "11px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "11px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: any) => `$${Number.parseFloat(value).toFixed(2)}`}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="profit" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Total Profit" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: 3,
      title: "Spread Distribution",
      description: "Frequency of spread percentages across all scans",
      component: (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={spreadRanges}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="range" stroke="#9ca3af" style={{ fontSize: "11px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "11px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
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
      id: 4,
      title: "Profit Ratio Analysis",
      description: "Opportunities categorized by profit size",
      component: (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={profitRatioData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="range" stroke="#9ca3af" style={{ fontSize: "11px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "11px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: any, name: string) => {
                if (name === "Avg Spread") return `${Number.parseFloat(value).toFixed(3)}%`
                return value
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Count" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ]

  const nextChart = () => {
    setActiveChart((prev) => (prev + 1) % charts.length)
  }

  const prevChart = () => {
    setActiveChart((prev) => (prev - 1 + charts.length) % charts.length)
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
      {/* Header with Navigation */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{charts[activeChart].title}</h3>
            <p className="text-xs text-gray-400 mt-1">{charts[activeChart].description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevChart}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              aria-label="Previous chart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex space-x-1">
              {charts.map((chart, index) => (
                <button
                  key={chart.id}
                  onClick={() => setActiveChart(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeChart ? "bg-blue-500 w-6" : "bg-gray-600 hover:bg-gray-500"
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">{charts[activeChart].component}</div>

      {/* Chart Info Footer */}
      <div className="bg-gray-900/50 px-6 py-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Chart {activeChart + 1} of {charts.length}
          </span>
          <span>Auto-updates every 2 seconds</span>
        </div>
      </div>
    </div>
  )
}

export default ChartCarousel
