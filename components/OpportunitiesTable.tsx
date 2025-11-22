// components/OpportunitiesTable.tsx
import React, { useState } from 'react';
import { format } from 'date-fns';

interface Opportunity {
  id: number;
  opportunity_timestamp: Date;
  buy_dex: string;
  sell_dex: string;
  spread_percentage: string;
  net_profit: string;
  roi_percentage: string;
  buy_price?: string;
  sell_price?: string;
}

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
}

const OpportunitiesTable: React.FC<OpportunitiesTableProps> = ({
  opportunities,
}) => {
  const [sortBy, setSortBy] = useState<'time' | 'profit' | 'spread'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'time') {
      comparison = new Date(a.opportunity_timestamp).getTime() - new Date(b.opportunity_timestamp).getTime();
    } else if (sortBy === 'profit') {
      comparison = parseFloat(a.net_profit) - parseFloat(b.net_profit);
    } else if (sortBy === 'spread') {
      comparison = parseFloat(a.spread_percentage) - parseFloat(b.spread_percentage);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column: 'time' | 'profit' | 'spread') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <span>Recent Opportunities</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {opportunities.length} {opportunities.length === 1 ? 'opportunity' : 'opportunities'} detected
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-400 font-semibold">
              Live Tracking
            </span>
          </div>
        </div>
      </div>
      
      {opportunities.length === 0 ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700/50 mb-4">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-gray-400 text-lg font-medium">No opportunities found yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Keep the bot running to detect profitable arbitrage opportunities
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr className="text-left">
                <th 
                  className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('time')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Time</span>
                    {sortBy === 'time' && (
                      <span className="text-blue-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Strategy
                </th>
                <th 
                  className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('spread')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Spread</span>
                    {sortBy === 'spread' && (
                      <span className="text-blue-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('profit')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Profit</span>
                    {sortBy === 'profit' && (
                      <span className="text-blue-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                  ROI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {sortedOpportunities.map((opp, index) => {
                const profit = parseFloat(opp.net_profit);
                const spread = parseFloat(opp.spread_percentage);
                const isHighProfit = profit > 5;
                const isHighSpread = spread > 0.7;
                
                return (
                  <tr 
                    key={opp.id} 
                    className="hover:bg-gray-700/30 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-300 font-medium">
                          {format(new Date(opp.opportunity_timestamp), 'HH:mm:ss')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(opp.opportunity_timestamp), 'MMM dd')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400 font-semibold">
                          {opp.buy_dex}
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        <span className="px-2 py-1 bg-pink-500/20 border border-pink-500/30 rounded text-xs text-pink-400 font-semibold">
                          {opp.sell_dex}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          isHighSpread
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : spread > 0.5
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {spread.toFixed(4)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span
                          className={`text-base font-bold ${
                            isHighProfit
                              ? 'text-green-400'
                              : profit > 1
                              ? 'text-green-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ${profit.toFixed(2)}
                        </span>
                        {isHighProfit && (
                          <span className="text-green-400">🚀</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-300 font-medium">
                        {parseFloat(opp.roi_percentage).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Footer */}
      {opportunities.length > 0 && (
        <div className="bg-gray-900/50 px-6 py-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Total Profit Potential: 
              <span className="text-green-400 font-bold ml-2">
                ${opportunities.reduce((sum, opp) => sum + parseFloat(opp.net_profit), 0).toFixed(2)}
              </span>
            </span>
            <span>Showing {opportunities.length} most recent opportunities</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesTable;