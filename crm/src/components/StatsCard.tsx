'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
}

const getTrendIcon = (change: number) => {
  if (change === 0) return null;
  if (change > 0) {
    return (
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8L5.586 19.414M3 15v6h6" />
      </svg>
    );
  } else {
    return (
      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8L5.586 4.586M3 9V3h6" />
      </svg>
    );
  }
};

const getIconBgColor = (color?: string) => {
  switch (color) {
    case 'green':
      return 'bg-green-100';
    case 'red':
      return 'bg-red-100';
    case 'purple':
      return 'bg-purple-100';
    case 'yellow':
      return 'bg-yellow-100';
    default:
      return 'bg-blue-100';
  }
};

const getIconColor = (color?: string) => {
  switch (color) {
    case 'green':
      return 'text-green-600';
    case 'red':
      return 'text-red-600';
    case 'purple':
      return 'text-purple-600';
    case 'yellow':
      return 'text-yellow-600';
    default:
      return 'text-blue-600';
  }
};

export default function StatsCard({
  title,
  value,
  icon,
  change,
  color = 'blue',
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(change)}
              <span
                className={`text-sm font-semibold ${
                  change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-lg ${getIconBgColor(
            color
          )} ${getIconColor(color)}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
