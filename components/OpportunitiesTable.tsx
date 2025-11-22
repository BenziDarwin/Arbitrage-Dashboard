import React, { useState } from "react";
import { format } from "date-fns";

interface Opportunity {
  id: number;
  opportunity_timestamp: Date;
  buy_dex: string;
  sell_dex: string;
  spread_percentage: string;
  net_profit: string;
  roi_percentage: string;
}

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
}

const OpportunitiesTable: React.FC<OpportunitiesTableProps> = ({
  opportunities,
}) => {
  const [sortBy, setSortBy] = useState<"time" | "profit" | "spread">("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "time") {
      cmp =
        new Date(a.opportunity_timestamp).getTime() -
        new Date(b.opportunity_timestamp).getTime();
    } else if (sortBy === "profit") {
      cmp = parseFloat(a.net_profit) - parseFloat(b.net_profit);
    } else if (sortBy === "spread") {
      cmp = parseFloat(a.spread_percentage) - parseFloat(b.spread_percentage);
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const handleSort = (col: "time" | "profit" | "spread") => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return null;
    return (
      <span className="text-blue-400 ml-1">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const totalProfit = opportunities.reduce(
    (sum, o) => sum + parseFloat(o.net_profit || "0"),
    0,
  );

  return (
    <div className="bg-gray-900 border border-gray-800">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-white">
            Recent Opportunities
          </h3>
          <span className="text-[10px] text-gray-500">
            {opportunities.length} found
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 font-medium">
          Total: ${totalProfit.toFixed(2)}
        </span>
      </div>

      {opportunities.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 text-sm">No opportunities detected yet</p>
          <p className="text-gray-600 text-[10px] mt-1">
            Keep the bot running to find arbitrage opportunities
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-950">
              <tr className="text-gray-500 text-[10px] uppercase tracking-wider">
                <th
                  className="text-left px-3 py-2 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort("time")}
                >
                  Time
                  <SortIcon col="time" />
                </th>
                <th className="text-left px-3 py-2 font-medium">Route</th>
                <th
                  className="text-right px-3 py-2 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort("spread")}
                >
                  Spread
                  <SortIcon col="spread" />
                </th>
                <th
                  className="text-right px-3 py-2 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort("profit")}
                >
                  Profit
                  <SortIcon col="profit" />
                </th>
                <th className="text-right px-3 py-2 font-medium">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {sortedOpportunities.slice(0, 15).map((opp) => {
                const spread = parseFloat(opp.spread_percentage);
                const profit = parseFloat(opp.net_profit);
                const isHighSpread = spread > 0.7;
                const isHighProfit = profit > 10;

                return (
                  <tr key={opp.id} className="hover:bg-gray-800/30">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 font-mono">
                          {format(
                            new Date(opp.opportunity_timestamp),
                            "HH:mm:ss",
                          )}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {format(
                            new Date(opp.opportunity_timestamp),
                            "MMM dd",
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px]">
                          {opp.buy_dex === "PancakeSwap" ? "PCS" : "BIS"}
                        </span>
                        <span className="text-gray-600">→</span>
                        <span className="px-1.5 py-0.5 bg-pink-500/20 text-pink-400 text-[10px]">
                          {opp.sell_dex === "PancakeSwap" ? "PCS" : "BIS"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`font-mono ${isHighSpread ? "text-emerald-400" : "text-gray-300"}`}
                      >
                        {spread.toFixed(4)}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`font-mono font-medium ${isHighProfit ? "text-emerald-400" : "text-emerald-400/70"}`}
                      >
                        ${profit.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="text-gray-400 font-mono">
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

      {opportunities.length > 15 && (
        <div className="px-3 py-2 border-t border-gray-800 text-center">
          <span className="text-[10px] text-gray-500">
            Showing 15 of {opportunities.length} opportunities
          </span>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesTable;
