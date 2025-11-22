// pages/index.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import StatCard from '../components/StatCard';
import LivePriceDisplay from '../components/LivePriceDisplay';
import ChartCarousel from '../components/ChartCarousel';
import OpportunitiesTable from '../components/OpportunitiesTable';

interface DashboardData {
  stats: any;
  recentScans: any[];
  opportunities: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [hourlyStats, setHourlyStats] = useState<any[]>([]);
  const [scanLimit, setScanLimit] = useState(1000);
  
  // WebSocket connection
 // WebSocket connection
useEffect(() => {
  let ws: WebSocket | null = null;
  let reconnectTimeout: NodeJS.Timeout;

  const connect = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;

    console.log('Connecting to WebSocket:', wsUrl);
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✓ WebSocket connected');
      setIsConnected(true);

      // Request update with current scan limit
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'request_update',
          limit: scanLimit // assume scanLimit is a state variable
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        console.log("=== WebSocket Message Received ===");
        console.log("Message Type:", message.type);
        console.log("Data:", message.data);

        if (message.type === 'update') {
          setData(message.data);
          setLastUpdate(new Date(message.timestamp));
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('✗ WebSocket disconnected');
      setIsConnected(false);

      // Attempt to reconnect after 3 seconds
      reconnectTimeout = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 3000);
    };
  };

  connect();

  return () => {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (ws) ws.close();
  };
}, [scanLimit]); // <-- add scanLimit as dependency to resend request when it changes

  
  // Fetch hourly stats
  useEffect(() => {
    const fetchHourlyStats = async () => {
      try {
        const response = await fetch('/api/stats?hours=24');
        const result = await response.json();
        setHourlyStats(result.hourlyStats || []);
      } catch (error) {
        console.error('Error fetching hourly stats:', error);
      }
    };
    
    fetchHourlyStats();
    const interval = setInterval(fetchHourlyStats, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-white text-xl font-semibold mt-6">Loading dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">
            {isConnected ? '✓ Connected to WebSocket' : '⟳ Connecting...'}
          </p>
        </div>
      </div>
    );
  }
  
  const stats = data.stats;
  const latestScan = data.recentScans[0];
  const opportunities = data.opportunities;
  
  // Calculate profit ratios
  const profitPerDay = stats.daysRunning > 0
    ? stats.totalPotentialProfit / stats.daysRunning
    : 0;
  
  const opportunityRate = stats.totalScans > 0
    ? (stats.totalOpportunities / stats.totalScans) * 100
    : 0;
  
  return (
    <>
      <Head>
        <title>BSC Arbitrage Dashboard | Real-Time Analytics</title>
        <meta name="description" content="Real-time BSC arbitrage monitoring dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header with Gradient */}
        <header className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-b border-gray-700 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  BSC Arbitrage Dashboard
                </h1>
                <p className="text-sm text-gray-400 mt-2 flex items-center space-x-2">
                  <span>Real-time monitoring of</span>
                  <span className="text-yellow-400 font-semibold">PancakeSwap</span>
                  <span>⇄</span>
                  <span className="text-pink-400 font-semibold">BiSwap</span>
                  <span>arbitrage</span>
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Connection Status */}
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm ${
                  isConnected 
                    ? 'bg-green-500/20 border border-green-500/50' 
                    : 'bg-red-500/20 border border-red-500/50'
                }`}>
                  <div className={`h-3 w-3 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500'
                  }`} />
                  <span className="text-sm font-semibold text-white">
                    {isConnected ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Stats Row with Animation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            <StatCard
              title="Days Running"
              value={stats.daysRunning}
              subtitle={`${stats.totalScans.toLocaleString()} total scans`}
              icon="📅"
              color="blue"
            />
            <StatCard
              title="Opportunities Found"
              value={stats.totalOpportunities}
              subtitle={`${opportunityRate.toFixed(3)}% of scans`}
              icon="🎯"
              color="green"
              trend={stats.totalOpportunities > 0 ? 'up' : 'neutral'}
            />
            <StatCard
              title="Total Potential"
              value={`$${stats.totalPotentialProfit.toFixed(2)}`}
              subtitle={`$${profitPerDay.toFixed(2)}/day avg`}
              icon="💰"
              color="yellow"
            />
            <StatCard
              title="Best Opportunity"
              value={`$${stats.maxProfit.toFixed(2)}`}
              subtitle={`Avg: $${stats.avgProfit.toFixed(2)}`}
              icon="⭐"
              color="purple"
            />
          </div>
          
          {/* Live Price and Chart Carousel Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              {latestScan ? (
                <LivePriceDisplay
                  pancakeswapPrice={latestScan.pancakeswap_price}
                  biswapPrice={latestScan.biswap_price}
                  spread={latestScan.spread_percentage}
                  lastUpdate={lastUpdate}
                  isLive={isConnected}
                />
              ) : (
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Waiting for price data...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-2">
              <ChartCarousel 
                recentScans={data.recentScans}
                opportunities={opportunities}
                stats={stats}
              />
            </div>
          </div>
          
          {/* Quick Stats Row with Gradient Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-xs text-blue-400 mb-1 uppercase tracking-wide">Change Rate</p>
              <p className="text-2xl font-bold text-white">
                {((stats.priceChanges / stats.totalScans) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-xs text-green-400 mb-1 uppercase tracking-wide">Scans/Day</p>
              <p className="text-2xl font-bold text-white">
                {(stats.totalScans / (stats.daysRunning || 1)).toFixed(0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-xs text-purple-400 mb-1 uppercase tracking-wide">Opps/Day</p>
              <p className="text-2xl font-bold text-white">
                {(stats.totalOpportunities / (stats.daysRunning || 1)).toFixed(1)}
              </p>
            </div>
            <div className={`bg-gradient-to-br ${stats.currentSession ? 'from-green-500/10 to-green-600/5 border-green-500/20' : 'from-gray-500/10 to-gray-600/5 border-gray-500/20'} border rounded-lg p-4 backdrop-blur-sm`}>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Bot Status</p>
              <p className={`text-2xl font-bold ${stats.currentSession ? 'text-green-400' : 'text-gray-400'}`}>
                {stats.currentSession ? '● Active' : '○ Idle'}
              </p>
            </div>
          </div>
          
          {/* Opportunities Table */}
          <OpportunitiesTable opportunities={opportunities} />
          
          {/* Footer Stats */}
          <div className="mt-8 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-lg p-6 shadow-2xl border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Average Spread</p>
                <p className="text-3xl font-bold text-blue-400">
                  {stats.avgSpread.toFixed(4)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Range: {stats.minSpread.toFixed(4)}% - {stats.maxSpread.toFixed(4)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Price Changes</p>
                <p className="text-3xl font-bold text-green-400">
                  {stats.priceChanges.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.priceChanges / stats.totalScans) * 100).toFixed(1)}% of scans
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Max Spread</p>
                <p className={`text-3xl font-bold ${stats.maxSpread > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.maxSpread.toFixed(4)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.maxSpread > 0.5 ? '✓ Profitable!' : '✗ Below threshold'}
                </p>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-900/50 border-t border-gray-800 mt-12 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Last updated: <span className="text-white font-medium">{lastUpdate.toLocaleString()}</span>
              </p>
              <p className="text-sm text-gray-500">
                Updates every 2 seconds • Real-time monitoring
              </p>
            </div>
          </div>
        </footer>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </>
  );
}