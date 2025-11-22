import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color = 'blue' }) => {
  const colors = {
    blue: 'border-l-blue-500 bg-blue-500/5',
    green: 'border-l-emerald-500 bg-emerald-500/5',
    yellow: 'border-l-amber-500 bg-amber-500/5',
    purple: 'border-l-violet-500 bg-violet-500/5',
    red: 'border-l-red-500 bg-red-500/5'
  };

  return (
    <div className={`border-l-2 ${colors[color]} p-3 bg-gray-900`}>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{title}</p>
      <p className="text-xl font-bold text-white mt-0.5">{value}</p>
      {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
};

export default StatCard;