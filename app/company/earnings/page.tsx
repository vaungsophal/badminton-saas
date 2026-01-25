'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Download, BarChart3, TrendingUp, Calendar } from 'lucide-react'
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
} from 'recharts'

export default function EarningsPage() {
  const { user } = useAuth()
  const [earnings, setEarnings] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState<'month' | 'year' | 'all'>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchEarnings()
  }, [user, dateRange])

  async function fetchEarnings() {
    try {
      if (!user?.id) return

      let query = supabase
        .from('bookings')
        .select('total_price, booking_date, status')
        .eq('owner_id', user.id)
        .eq('status', 'confirmed')

      // Filter by date range
      if (dateRange === 'month') {
        const now = new Date()
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
        query = query.gte('booking_date', monthAgo.toISOString())
      } else if (dateRange === 'year') {
        const now = new Date()
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        query = query.gte('booking_date', yearAgo.toISOString())
      }

      const { data: bookings, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Calculate earnings
      const totalEarnings = bookings?.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0) || 0
      const averageEarning = bookings?.length ? (totalEarnings / bookings.length).toFixed(2) : '0.00'
      const commission = (totalEarnings * 0.1).toFixed(2) // 10% commission
      const netEarnings = (totalEarnings - parseFloat(commission as string)).toFixed(2)

      // Group by date
      const byDate: any = {}
      bookings?.forEach((b: any) => {
        const date = b.booking_date?.split('T')[0] || 'Unknown'
        byDate[date] = (byDate[date] || 0) + b.total_price
      })

      const data = Object.entries(byDate)
        .slice(-30)
        .map(([date, amount]) => ({
          date: new Date(date as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          earnings: parseFloat(amount as any),
        }))

      setEarnings({
        totalEarnings: totalEarnings.toFixed(2),
        averageEarning,
        commission,
        netEarnings,
        bookingCount: bookings?.length || 0,
      })

      setChartData(data)
      setLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching earnings:', err)
      setError('Failed to load earnings data')
      setLoading(false)
    }
  }

  async function exportReport() {
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('owner_id', user?.id)
        .eq('status', 'confirmed')

      if (!bookings) return

      // Create CSV content
      const headers = ['Date', 'Court', 'Customer', 'Time', 'Amount']
      const rows = bookings.map(b => [
        new Date(b.booking_date).toLocaleDateString(),
        b.court_name,
        b.customer_email,
        `${b.start_time} - ${b.end_time}`,
        `$${b.total_price.toFixed(2)}`,
      ])

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `earnings_report_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[v0] Error exporting report:', err)
      setError('Failed to export report')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings & Revenue</h1>
          <p className="text-gray-600 mt-2">Track your income and financial performance</p>
        </div>
        <Button onClick={exportReport} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="flex gap-2 mb-6">
        {(['month', 'year', 'all'] as const).map((range) => (
          <Button
            key={range}
            variant={dateRange === range ? 'default' : 'outline'}
            onClick={() => setDateRange(range)}
            className={dateRange === range ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {range === 'all' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">${earnings?.totalEarnings || '0.00'}</p>
                <p className="text-xs text-gray-500 mt-1">Gross revenue</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Net Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">${earnings?.netEarnings || '0.00'}</p>
                <p className="text-xs text-gray-500 mt-1">After commission</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">${earnings?.commission || '0.00'}</p>
                <p className="text-xs text-gray-500 mt-1">Platform fees (10%)</p>
              </div>
              <Calendar className="w-8 h-8 text-red-100" />
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
                <p className="text-2xl font-bold text-gray-900">${earnings?.averageEarning || '0.00'}</p>
                <p className="text-xs text-gray-500 mt-1">{earnings?.bookingCount} bookings</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Earnings Trend</CardTitle>
            <CardDescription>Daily earnings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Earnings by date</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="earnings" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
