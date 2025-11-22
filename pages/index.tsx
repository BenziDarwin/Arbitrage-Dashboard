import React, { useEffect, useState, useRef, useCallback } from "react";
import Head from "next/head";
import StatCard from "../components/StatCard";
import SessionTimer from "../components/SessionTimer";
import LivePriceDisplay from "../components/LivePriceDisplay";
import ChartCarousel from "../components/ChartCarousel";
import OpportunitiesTable from "../components/OpportunitiesTable";

interface DashboardData {
  stats: any;
  recentScans: any[];
  opportunities: any[];
}

const LIMIT_OPTIONS = [
  { label: "100", value: 100 },
  { label: "500", value: 500 },
  { label: "1K", value: 1000 },
  { label: "5K", value: 5000 },
  { label: "10K", value: 10000 },
  { label: "All", value: 999999999 },
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [scanLimit, setScanLimit] = useState(1000);
  const [customLimit, setCustomLimit] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Send request to server
  const requestUpdate = useCallback((limit: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsLoading(true);
      console.log("Sending request_update with limit:", limit);
      wsRef.current.send(JSON.stringify({ type: "request_update", limit }));
    }
  }, []);

  // WebSocket connection
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;
      console.log("Connecting to:", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        // Request with current limit on connect
        ws.send(JSON.stringify({ type: "request_update", limit: scanLimit }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log(
            "Received:",
            message.type,
            "Scans:",
            message.data?.recentScans?.length,
          );

          if (message.type === "update") {
            setData(message.data);
            setLastUpdate(new Date(message.timestamp));
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
          setIsLoading(false);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        setIsLoading(false);
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        setIsConnected(false);
        wsRef.current = null;
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Handle limit change
  const handleLimitChange = (value: number) => {
    console.log("Limit changed to:", value);
    setScanLimit(value);
    setShowCustomInput(false);
    requestUpdate(value);
  };

  const handleCustomLimitSubmit = () => {
    const num = parseInt(customLimit);
    if (num > 0) {
      console.log("Custom limit:", num);
      setScanLimit(num);
      setShowCustomInput(false);
      requestUpdate(num);
      setCustomLimit("");
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent mx-auto" />
          <p className="text-white mt-4">Loading dashboard...</p>
          <p className="text-gray-500 text-xs mt-1">
            {isConnected ? "✓ Connected" : "Connecting..."}
          </p>
        </div>
      </div>
    );
  }

  const { stats, recentScans, opportunities } = data;
  const latestScan = recentScans[0];
  const hitRate =
    stats.totalScans > 0
      ? (stats.totalOpportunities / stats.totalScans) * 100
      : 0;
  const profitPerDay =
    stats.daysRunning > 0 ? stats.totalPotentialProfit / stats.daysRunning : 0;
  const oppsPerDay =
    stats.daysRunning > 0 ? stats.totalOpportunities / stats.daysRunning : 0;
  const scansPerHour =
    stats.daysRunning > 0
      ? Math.floor(stats.totalScans / (stats.daysRunning * 24))
      : 0;
  const changeRate =
    stats.totalScans > 0 ? (stats.priceChanges / stats.totalScans) * 100 : 0;

  return (
    <>
      <Head>
        <title>BSC Arbitrage Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-950 text-white text-sm">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold">BSC Arbitrage</h1>
              <span className="text-[10px] text-gray-500">PCS ⇄ BiSwap</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Limit Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500">Limit:</span>
                <div className="flex items-center">
                  {LIMIT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleLimitChange(opt.value)}
                      disabled={isLoading}
                      className={`px-2 py-1 text-[10px] font-medium transition-colors border-r border-gray-700 last:border-r-0 ${
                        scanLimit === opt.value && !showCustomInput
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className={`px-2 py-1 text-[10px] font-medium transition-colors ${
                      showCustomInput
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    #
                  </button>
                </div>
                {showCustomInput && (
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={customLimit}
                      onChange={(e) => setCustomLimit(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCustomLimitSubmit()
                      }
                      placeholder="Number"
                      className="w-20 px-2 py-1 text-[10px] bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={handleCustomLimitSubmit}
                      disabled={isLoading}
                      className="px-2 py-1 text-[10px] bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
                    >
                      Go
                    </button>
                  </div>
                )}
                {isLoading && (
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent animate-spin" />
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Session:</span>
                <SessionTimer
                  startTime={stats.currentSession?.session_start || null}
                />
              </div>

              <div
                className={`flex items-center gap-1.5 px-2 py-1 ${isConnected ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"}`}
              >
                <div
                  className={`w-1.5 h-1.5 ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
                />
                <span
                  className={`text-[10px] font-medium ${isConnected ? "text-emerald-400" : "text-red-400"}`}
                >
                  {isConnected ? "LIVE" : "OFFLINE"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4">
          {/* Data Info Bar */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-4 text-[10px] text-gray-500">
              <span>
                Loaded:{" "}
                <span className="text-white font-medium">
                  {recentScans.length.toLocaleString()}
                </span>{" "}
                scans
              </span>
              <span>•</span>
              <span>
                <span className="text-white font-medium">
                  {opportunities.length.toLocaleString()}
                </span>{" "}
                opportunities
              </span>
            </div>
            <div className="text-[10px] text-gray-600">
              Requested:{" "}
              {scanLimit >= 999999999 ? "All" : scanLimit.toLocaleString()}
            </div>
          </div>

          {/* Top Stats Grid */}
          <div className="grid grid-cols-6 gap-2 mb-4">
            <StatCard
              title="Runtime"
              value={`${stats.daysRunning}d`}
              subtitle={`${stats.totalScans.toLocaleString()} scans`}
              color="blue"
            />
            <StatCard
              title="Opportunities"
              value={stats.totalOpportunities}
              subtitle={`${hitRate.toFixed(3)}% hit rate`}
              color="green"
            />
            <StatCard
              title="Total Profit"
              value={`$${stats.totalPotentialProfit.toFixed(0)}`}
              subtitle={`$${profitPerDay.toFixed(0)}/day`}
              color="yellow"
            />
            <StatCard
              title="Best Trade"
              value={`$${stats.maxProfit.toFixed(0)}`}
              subtitle={`Avg: $${stats.avgProfit.toFixed(2)}`}
              color="purple"
            />
            <StatCard
              title="Max Spread"
              value={`${stats.maxSpread.toFixed(2)}%`}
              subtitle={`Avg: ${stats.avgSpread.toFixed(3)}%`}
              color="blue"
            />
            <StatCard
              title="Price Changes"
              value={stats.priceChanges.toLocaleString()}
              subtitle={`${changeRate.toFixed(1)}% of scans`}
              color="red"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-1">
              {latestScan ? (
                <LivePriceDisplay
                  pancakeswapPrice={latestScan.pancakeswap_price}
                  biswapPrice={latestScan.biswap_price}
                  spread={latestScan.spread_percentage}
                  lastUpdate={lastUpdate}
                  isLive={isConnected}
                />
              ) : (
                <div className="bg-gray-900 border border-gray-800 p-6 h-full flex items-center justify-center">
                  <p className="text-gray-500 text-xs">
                    Waiting for price data...
                  </p>
                </div>
              )}
            </div>
            <div className="col-span-2">
              <ChartCarousel
                recentScans={recentScans}
                opportunities={opportunities}
                stats={stats}
              />
            </div>
          </div>

          {/* Opportunities Table */}
          <OpportunitiesTable opportunities={opportunities} />

          {/* Footer Stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="bg-gray-900 border border-gray-800 p-2 text-center">
              <p className="text-[10px] text-gray-500">Scans/Hour</p>
              <p className="text-sm font-bold text-white">
                {scansPerHour.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-2 text-center">
              <p className="text-[10px] text-gray-500">Opps/Day</p>
              <p className="text-sm font-bold text-white">
                {oppsPerDay.toFixed(1)}
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-2 text-center">
              <p className="text-[10px] text-gray-500">Avg Spread</p>
              <p className="text-sm font-bold text-white">
                {stats.avgSpread.toFixed(4)}%
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-2 text-center">
              <p className="text-[10px] text-gray-500">Spread Range</p>
              <p className="text-sm font-bold text-white">
                {stats.minSpread.toFixed(3)}% – {stats.maxSpread.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Last Update Footer */}
          <div className="mt-4 text-center text-[10px] text-gray-600">
            Last updated: {lastUpdate.toLocaleString()} • Updates every 10s
          </div>
        </main>
      </div>
    </>
  );
}
