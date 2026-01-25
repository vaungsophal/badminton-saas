'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/auth'
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

      // Fetch clubs
      const { data: clubs } = await supabase
        .from('courts')
        .select('id, club_name, owner_id')
        .eq('owner_id', user.id)
        .limit(1)

      // Fetch total bookings
      const { data: bookings, count: bookingCount } = await supabase
        .from('bookings')
        .select('id, total_price, booking_date', { count: 'exact' })
        .eq('owner_id', user.id)

      // Fetch courts
      const { data: courts, count: courtCount } = await supabase
        .from('courts')
        .select('id', { count: 'exact' })
        .eq('owner_id', user.id)

      // Calculate total revenue
      const totalRevenue = bookings?.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0) || 0

      // Group bookings by date for chart
      const bookingsByDate: any = {}
      bookings?.forEach((b: any) => {
        const date = b.booking_date?.split('T')[0] || 'Unknown'
        bookingsByDate[date] = (bookingsByDate[date] || 0) + 1
      })

      const chartData = Object.entries(bookingsByDate)
        .slice(-7)
        .map(([date, count]) => ({
          date: new Date(date as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          bookings: count,
        }))

      setStats({
        totalClubs: clubs?.length || 1,
        totalCourts: courtCount || 0,
        totalBookings: bookingCount || 0,
        totalRevenue: totalRevenue,
        averagePerBooking: bookingCount ? (totalRevenue / bookingCount).toFixed(2) : 0,
        chartData,
      })

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
        <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your badminton business overview.</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats?.totalClubs || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Active clubs</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCourts || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Available courts</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <Users className="w-8 h-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">${(stats?.totalRevenue || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Total earnings</p>
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
                <p className="text-2xl font-bold text-gray-900">${stats?.averagePerBooking || '0.00'}</p>
                <p className="text-xs text-gray-500 mt-1">Per booking</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-100" />
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
              <LineChart data={stats?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
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
              <BarChart data={stats?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
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
    </div>
  )
}
