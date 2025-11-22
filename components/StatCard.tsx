// components/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'pink';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'blue',
}) => {
  const colorClasses = {
    green: {
      gradient: 'from-green-500 to-emerald-600',
      bg: 'from-green-500/10 to-emerald-600/5',
      border: 'border-green-500/20',
      text: 'text-green-400',
      shadow: 'shadow-green-500/10',
    },
    blue: {
      gradient: 'from-blue-500 to-cyan-600',
      bg: 'from-blue-500/10 to-cyan-600/5',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      shadow: 'shadow-blue-500/10',
    },
    red: {
      gradient: 'from-red-500 to-rose-600',
      bg: 'from-red-500/10 to-rose-600/5',
      border: 'border-red-500/20',
      text: 'text-red-400',
      shadow: 'shadow-red-500/10',
    },
    yellow: {
      gradient: 'from-yellow-500 to-amber-600',
      bg: 'from-yellow-500/10 to-amber-600/5',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400',
      shadow: 'shadow-yellow-500/10',
    },
    purple: {
      gradient: 'from-purple-500 to-violet-600',
      bg: 'from-purple-500/10 to-violet-600/5',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      shadow: 'shadow-purple-500/10',
    },
    pink: {
      gradient: 'from-pink-500 to-rose-600',
      bg: 'from-pink-500/10 to-rose-600/5',
      border: 'border-pink-500/20',
      text: 'text-pink-400',
      shadow: 'shadow-pink-500/10',
    },
  };
  
  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  const trendColors = {
    up: 'text-green-400 bg-green-500/10',
    down: 'text-red-400 bg-red-500/10',
    neutral: 'text-gray-400 bg-gray-500/10',
  };
  
  return (
    <div className={`relative bg-gradient-to-br ${colorClasses[color].bg} rounded-xl p-6 shadow-xl border ${colorClasses[color].border} hover:shadow-2xl ${colorClasses[color].shadow} transition-all duration-300 hover:scale-105 group overflow-hidden backdrop-blur-sm`}>
      {/* Animated Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color].gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className={`${colorClasses[color].text} text-xs font-bold uppercase tracking-wider mb-2`}>
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-white">
              {value}
            </p>
            {trendValue && trend && (
              <span
                className={`flex items-center space-x-1 text-xs font-semibold px-2 py-1 rounded-full ${trendColors[trend]}`}
              >
                <span>{trendIcons[trend]}</span>
                <span>{trendValue}</span>
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-400 font-medium">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={`ml-4 flex-shrink-0 bg-gradient-to-br ${colorClasses[color].gradient} rounded-2xl p-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
          >
            <span className="text-3xl filter drop-shadow-lg">{icon}</span>
          </div>
        )}
      </div>

      {/* Decorative Corner */}
      <div className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${colorClasses[color].gradient} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity`}></div>
    </div>
  );
};

export default StatCard;