// components/LivePriceDisplay.tsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

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
  const pancakePrice = parseFloat(pancakeswapPrice?.toString() || '0');
  const biswPrice = parseFloat(biswapPrice?.toString() || '0');
  const spreadValue = parseFloat(spread?.toString() || '0');
  
  const isProfitable = spreadValue > 0.5;
  const isHighProfit = spreadValue > 0.7;
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <span className="text-2xl">💹</span>
            <span>Live Prices</span>
          </h3>
          <div className="flex items-center space-x-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isLive ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-gray-500'
              }`}
            />
            <span className={`text-xs font-semibold ${isLive ? 'text-green-400' : 'text-gray-400'}`}>
              {isLive ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Price Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* PancakeSwap */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🥞</span>
              <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">
                PancakeSwap
              </p>
            </div>
            <p className="text-2xl font-bold text-white">
              ${pancakePrice.toFixed(5)}
            </p>
          </div>
          
          {/* BiSwap */}
          <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🔄</span>
              <p className="text-xs text-pink-400 font-semibold uppercase tracking-wide">
                BiSwap
              </p>
            </div>
            <p className="text-2xl font-bold text-white">
              ${biswPrice.toFixed(5)}
            </p>
          </div>
        </div>
        
        {/* Spread Display */}
        <div
          className={`rounded-xl p-5 transition-all duration-300 ${
            isHighProfit
              ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-green-500/50 shadow-lg shadow-green-500/20'
              : isProfitable
              ? 'bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30'
              : 'bg-gray-900/50 border border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                Current Spread
              </p>
              <p
                className={`text-4xl font-bold ${
                  isHighProfit
                    ? 'text-green-400'
                    : isProfitable
                    ? 'text-green-400'
                    : 'text-white'
                }`}
              >
                {spreadValue.toFixed(4)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isProfitable ? '✓ Above threshold (0.5%)' : '✗ Below profitable threshold'}
              </p>
            </div>
            {isProfitable && (
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-2 ${
                  isHighProfit
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-green-600'
                } text-white text-xs font-bold rounded-full shadow-lg`}>
                  {isHighProfit ? '🚀 HIGH PROFIT!' : '💰 OPPORTUNITY'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Price Difference */}
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Price Difference:</span>
            <span className="text-white font-semibold">
              ${Math.abs(pancakePrice - biswPrice).toFixed(6)}
            </span>
          </div>
        </div>
        
        {/* Last Update */}
        <div className="pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500 flex items-center justify-center space-x-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LivePriceDisplay;