'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import StatsCard from '@/components/StatsCard';
import { getStore } from '@/lib/store';
import { DashboardStats, DealStage } from '@/lib/types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const STAGE_NAMES: Record<DealStage, string> = {
  lead: 'Лид',
  qualified: 'Квалификация',
  proposal: 'Предложение',
  negotiation: 'Переговоры',
  closed_won: 'Закрыта (выиграна)',
  closed_lost: 'Закрыта (проиграна)',
};

const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

const ACTIVITY_ICONS: Record<string, JSX.Element> = {
  contact: (
    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
    </svg>
  ),
  company: (
    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  deal: (
    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  ),
  task: (
    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V7z" clipRule="evenodd" />
    </svg>
  ),
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
          <svg
            className="w-6 h-6 text-blue-600 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const store = getStore();
      const dashboardStats = store.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading || !stats) {
    return <LoadingSpinner />;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Prepare chart data
  const dealValueByStageData = (Object.keys(STAGE_NAMES) as DealStage[]).map((stage) => ({
    name: STAGE_NAMES[stage],
    value: stats.dealValueByStage[stage],
  }));

  const pieChartData = (Object.keys(STAGE_NAMES) as DealStage[]).map((stage) => ({
    name: STAGE_NAMES[stage],
    value: stats.dealsByStage[stage],
  }));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your CRM overview.</p>
      </div>

      {/* Stats Cards - 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Contacts"
          value={stats.totalContacts}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3.645A2.645 2.645 0 011 18.355V6.645A2.645 2.645 0 013.645 4h12.71A2.645 2.645 0 0119 6.645v11.71a2.645 2.645 0 01-2.645 2.645z"
              />
            </svg>
          }
          color="blue"
        />

        <StatsCard
          title="Total Companies"
          value={stats.totalCompanies}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
          color="purple"
        />

        <StatsCard
          title="Active Deals"
          value={formatCurrency(stats.totalDealValue)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="green"
        />

        <StatsCard
          title="Open Tasks"
          value={stats.openTasks}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          }
          color="yellow"
        />
      </div>

      {/* Charts Section - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Deal Value by Stage - Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Value by Stage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dealValueByStageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Deals - Line Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Deals (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyDeals}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                formatter={(value: any) => {
                  if (typeof value === 'number' && value > 100) {
                    return formatCurrency(value);
                  }
                  return value;
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#22c55e"
                strokeWidth={2}
                name="Deal Count"
                dot={{ fill: '#22c55e', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Deal Value"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deals by Stage Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {CHART_COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
            ) : (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex-shrink-0 mt-1">
                    {ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.task}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {activity.type === 'contact'
                        ? `Контакт ${activity.action}`
                        : activity.type === 'company'
                        ? `Компания ${activity.action}`
                        : activity.type === 'deal'
                        ? `Сделка ${activity.action}`
                        : `Задача ${activity.action}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString('ru-RU', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
