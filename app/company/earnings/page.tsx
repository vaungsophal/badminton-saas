'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'

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
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [courtPerformance, setCourtPerformance] = useState<any[]>([])
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

      let url = `/api/earnings?owner_id=${user.id}&date_range=${dateRange}`
      
      // Add custom date range if specified
      if (startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch earnings data')
      const data = await response.json()

      setEarnings(data.summary)
      setChartData(data.dailyEarnings)
      setMonthlyData(data.monthlyEarnings)
      setCourtPerformance(data.courtPerformance)
      setLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching earnings:', err)
      setError('Failed to load earnings data')
      setLoading(false)
    }
  }

async function exportReport() {
    try {
      // Fetch detailed booking data for export
      const response = await fetch(`/api/bookings?owner_id=${user?.id}&status=confirmed`)
      const bookings = response.ok ? await response.json() : []

      if (!bookings || bookings.length === 0) {
        setError('No data available to export')
        return
      }

      // Create CSV content
      const headers = ['Date', 'Court', 'Customer', 'Time', 'Amount', 'Commission', 'Net Earnings']
      const rows = bookings.map((b: any) => [
        new Date(b.booking_date).toLocaleDateString(),
        b.court_name,
        b.customer_email || 'N/A',
        `${b.start_time} - ${b.end_time}`,
        `$${parseFloat(b.total_price || 0).toFixed(2)}`,
        `$${parseFloat(b.commission_amount || 0).toFixed(2)}`,
        `$${(parseFloat(b.total_price || 0) - parseFloat(b.commission_amount || 0)).toFixed(2)}`,
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
                 <Tooltip formatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
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
                 <Tooltip formatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
                 <Bar dataKey="earnings" fill="#3b82f6" />
               </BarChart>
             </ResponsiveContainer>
           </CardContent>
</Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>12-month earnings overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
                <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Court Performance */}
      {courtPerformance.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Court Performance</CardTitle>
            <CardDescription>Earnings breakdown by court</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Court Name</th>
                    <th className="text-right py-2 px-4">Bookings</th>
                    <th className="text-right py-2 px-4">Total Earnings</th>
                    <th className="text-right py-2 px-4">Avg per Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {courtPerformance.map((court: any, index: number) => (
                    <tr key={court.courtId} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                      <td className="py-2 px-4 font-medium">{court.courtName}</td>
                      <td className="text-right py-2 px-4">{court.bookingCount}</td>
                      <td className="text-right py-2 px-4 font-semibold">${court.totalEarnings}</td>
                      <td className="text-right py-2 px-4">${court.averageEarning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
