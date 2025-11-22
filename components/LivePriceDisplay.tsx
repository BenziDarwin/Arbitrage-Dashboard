import React from "react";
import { formatDistanceToNow } from "date-fns";

interface LivePriceDisplayProps {
  pancakeswapPrice: string | number;
  biswapPrice: string | number;
  spread: string | number;
  lastUpdate: Date;
  isLive: boolean;
}

const LivePriceDisplay: React.FC<LivePriceDisplayProps> = ({
  pancakeswapPrice,
  biswapPrice,
  spread,
  lastUpdate,
  isLive,
}) => {
  const pcsPrice = parseFloat(pancakeswapPrice?.toString() || "0");
  const bisPrice = parseFloat(biswapPrice?.toString() || "0");
  const spreadValue = parseFloat(spread?.toString() || "0");
  const isProfitable = spreadValue > 0.5;

  return (
    <div className="bg-gray-900 border border-gray-800 p-3 h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
          Live Prices
        </span>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400">LIVE</span>
            </div>
          )}
          <span className="text-[10px] text-gray-600">
            {formatDistanceToNow(lastUpdate, { addSuffix: true })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-950 p-2 border-l-2 border-l-amber-500">
          <p className="text-[10px] text-amber-500 mb-0.5">PancakeSwap</p>
          <p className="text-lg font-mono font-bold text-white">
            ${pcsPrice.toFixed(5)}
          </p>
        </div>
        <div className="bg-gray-950 p-2 border-l-2 border-l-pink-500">
          <p className="text-[10px] text-pink-500 mb-0.5">BiSwap</p>
          <p className="text-lg font-mono font-bold text-white">
            ${bisPrice.toFixed(5)}
          </p>
        </div>
      </div>

      <div
        className={`p-3 ${isProfitable ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-gray-950 border border-gray-800"}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase">
              Current Spread
            </p>
            <p
              className={`text-2xl font-bold font-mono ${isProfitable ? "text-emerald-400" : "text-white"}`}
            >
              {spreadValue.toFixed(4)}%
            </p>
          </div>
          {isProfitable && (
            <div className="bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white">
              OPPORTUNITY
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          Δ ${Math.abs(pcsPrice - bisPrice).toFixed(6)}
        </p>
      </div>

      <div className="mt-2 text-[10px] text-gray-600 text-center">
        {isProfitable
          ? "✓ Above 0.5% threshold"
          : "✗ Below profitable threshold"}
      </div>
    </div>
  );
};

export default LivePriceDisplay;
