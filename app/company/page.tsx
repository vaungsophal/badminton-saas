'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { TrendingUp, Users, Calendar, Wallet, Building2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardStats()
  }, [user])

async function fetchDashboardStats() {
    try {
      if (!user?.id) return

      const response = await fetch(`/api/dashboard/summary?owner_id=${user.id}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to fetch dashboard summary')

      setStats(data)
      setLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching dashboard stats:', err)
      setError('Failed to load dashboard data')
      setLoading(false)
    }
  }

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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 text-blue-600">Club Owner Dashboard</h1>
        <p className="text-gray-500 font-medium mt-2">Welcome back! Here's your badminton business overview.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clubs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview?.totalClubs || 0}</p>
                <p className="text-xs text-gray-500 mt-1">{stats?.overview?.activeClubs || 0} active</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Courts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview?.totalCourts || 0}</p>
                <p className="text-xs text-gray-500 mt-1">{stats?.overview?.openCourts || 0} open</p>
              </div>
              <Calendar className="w-8 h-8 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview?.totalBookings || 0}</p>
                <p className="text-xs text-gray-500 mt-1">{stats?.overview?.confirmedBookings || 0} confirmed</p>
              </div>
              <Users className="w-8 h-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">${(stats?.overview?.totalRevenue || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">This week: ${(stats?.thisWeek?.revenue || 0).toFixed(2)}</p>
              </div>
              <Wallet className="w-8 h-8 text-yellow-100" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg per Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">${(stats?.overview?.averagePerBooking || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Per booking</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Bookings Trend</CardTitle>
            <CardDescription>Last 7 days booking activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {stats?.bookingsTrend?.length > 0 ? (
                <LineChart data={stats.bookingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Booking data will appear here</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>By courts</CardDescription>
          </CardHeader>
<CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {stats?.revenueDistribution?.length > 0 ? (
                <PieChart>
                  <Pie
                    data={stats.revenueDistribution}
                    dataKey="totalRevenue"
                    nameKey="courtName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {stats.revenueDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Revenue data will appear here</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

{/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/company/clubs/new">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Add New Club</Button>
            </Link>
            <Link href="/company/courts/new">
              <Button className="w-full bg-green-600 hover:bg-green-700">Add New Court</Button>
            </Link>
            <Link href="/company/bookings">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">View Bookings</Button>
            </Link>
            <Link href="/company/earnings">
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700">View Earnings</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Bookings awaiting your confirmation</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.overview?.pendingBookings > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">Pending Approvals</p>
                    <p className="text-sm text-gray-600">Need your confirmation</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">{stats.overview.pendingBookings}</p>
                    <p className="text-sm text-gray-600">bookings</p>
                  </div>
                </div>
                <Link href="/company/bookings?filter=pending">
                  <Button variant="outline" className="w-full">
                    View All Pending Bookings
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No pending bookings</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest booking activity</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 3).map((activity: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.customer}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        activity.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">${activity.total_price}</p>
                    </div>
                  </div>
                ))}
                {stats.recentActivity.length > 3 && (
                  <Link href="/company/bookings">
                    <Button variant="outline" className="w-full">View All Bookings</Button>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No recent bookings</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
