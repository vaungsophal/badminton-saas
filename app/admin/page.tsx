'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import {
    Users,
    Building2,
    CalendarCheck,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts'

const revenueData = [
    { month: 'Jan', revenue: 4000, bookings: 240 },
    { month: 'Feb', revenue: 3000, bookings: 198 },
    { month: 'Mar', revenue: 2000, bookings: 150 },
    { month: 'Apr', revenue: 2780, bookings: 190 },
    { month: 'May', revenue: 1890, bookings: 120 },
    { month: 'Jun', revenue: 2390, bookings: 170 },
    { month: 'Jul', revenue: 3490, bookings: 210 },
]

const stats = [
    {
        label: 'Total Users',
        value: '1,284',
        icon: Users,
        change: '+12%',
        isPositive: true
    },
    {
        label: 'Club Owners',
        value: '42',
        icon: Building2,
        change: '+5%',
        isPositive: true
    },
    {
        label: 'Total Courts',
        value: '156',
        icon: Building2,
        change: '+8%',
        isPositive: true
    },
    {
        label: 'Total Bookings',
        value: '3,842',
        icon: CalendarCheck,
        change: '+18%',
        isPositive: true
    },
]

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back, Platform Manager. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="bg-blue-50 p-3 rounded-xl">
                                <stat.icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {stat.change}
                                {stat.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Revenue Section */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Platform Revenue</h2>
                        <p className="text-sm text-gray-500">Total earnings from booking commissions</p>
                    </div>
                    <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-700">$24,482.00</span>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Volume Bar Chart */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Volume</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Growth Statistics */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Growth Statistics</h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Active Owners</p>
                                    <p className="text-xs text-gray-500">Compared to last month</p>
                                </div>
                            </div>
                            <span className="text-green-600 font-bold">+18.2%</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Users className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">New Users</p>
                                    <p className="text-xs text-gray-500">Compared to last month</p>
                                </div>
                            </div>
                            <span className="text-green-600 font-bold">+24.5%</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Retention Rate</p>
                                    <p className="text-xs text-gray-500">Monthly active users</p>
                                </div>
                            </div>
                            <span className="text-blue-600 font-bold">88.4%</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
