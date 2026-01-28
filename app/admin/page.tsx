'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
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

interface AdminDashboardData {
    overview: {
        totalUsers: number
        totalOwners: number
        totalClubs: number
        totalCourts: number
        totalBookings: number
        confirmedBookings: number
        pendingBookings: number
        cancelledBookings: number
        totalRevenue: number
        totalCommission: number
    }
    revenueData: Array<{
        month: string
        revenue: number
        bookings: number
    }>
    growth: {
        owners: {
            current: number
            previous: number
            percentage: number
        }
        users: {
            current: number
            previous: number
            percentage: number
        }
        retention: {
            rate: number
        }
    }
}

export default function AdminDashboardPage() {
    const { user } = useAuth()
    const [data, setData] = useState<AdminDashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchDashboardData()
    }, [user])

    async function fetchDashboardData() {
        try {
            if (!user?.id || user.role !== 'admin') return

            setLoading(true)
            setError('')
            
            const response = await fetch('/api/admin/dashboard')
            const result = await response.json()

            if (!response.ok) throw new Error(result.error || 'Failed to fetch dashboard data')

            setData(result)
        } catch (err) {
            console.error('Error fetching dashboard data:', err)
            setError('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const stats = data ? [
        {
            label: 'Total Users',
            value: data.overview.totalUsers.toLocaleString(),
            icon: Users,
            change: `${data.growth.users.percentage > 0 ? '+' : ''}${data.growth.users.percentage.toFixed(1)}%`,
            isPositive: data.growth.users.percentage > 0
        },
        {
            label: 'Club Owners',
            value: data.overview.totalOwners.toLocaleString(),
            icon: Building2,
            change: `${data.growth.owners.percentage > 0 ? '+' : ''}${data.growth.owners.percentage.toFixed(1)}%`,
            isPositive: data.growth.owners.percentage > 0
        },
        {
            label: 'Total Courts',
            value: data.overview.totalCourts.toLocaleString(),
            icon: Building2,
            change: '+8%',
            isPositive: true
        },
        {
            label: 'Total Bookings',
            value: data.overview.totalBookings.toLocaleString(),
            icon: CalendarCheck,
            change: '+18%',
            isPositive: true
        },
    ] : []

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 font-medium">Welcome back, Platform Manager. Here's your real-time data.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Updates</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="p-6 hover:shadow-xl transition-all duration-300 border-gray-100 group">
                        <div className="flex items-start justify-between">
                            <div className="bg-blue-50 p-3 rounded-2xl group-hover:bg-blue-600 transition-colors duration-300">
                                <stat.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {stat.change}
                                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            </div>
                        </div>
                        <div className="mt-5">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
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
                        <span className="text-2xl font-bold text-green-700">
                            ${data?.overview.totalRevenue.toFixed(2) || '0.00'}
                        </span>
                    </div>
                </div>

<div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data?.revenueData || []}>
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
                            <BarChart data={data?.revenueData || []}>
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
<span className="text-green-600 font-bold">
                            {(data?.growth.owners.percentage || 0) > 0 ? '+' : ''}{(data?.growth.owners.percentage || 0).toFixed(1)}%
                        </span>
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
                            <span className="text-green-600 font-bold">
                                {(data?.growth.users.percentage || 0) > 0 ? '+' : ''}{(data?.growth.users.percentage || 0).toFixed(1)}%
                            </span>
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
                            <span className="text-blue-600 font-bold">{(data?.growth.retention.rate || 0).toFixed(1)}%</span>
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
