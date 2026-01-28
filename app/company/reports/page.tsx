'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Download, Calendar, Users, TrendingUp } from 'lucide-react'

export default function ReportsPage() {
const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [earningsData, setEarningsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState<'month' | 'year' | 'all'>('all')

useEffect(() => {
    fetchReportData()
  }, [user, dateRange])

async function fetchReportData() {
    try {
      if (!user?.id) return

      // Fetch all data via API
      const [earningsRes, courtsRes, clubsRes] = await Promise.all([
        fetch(`/api/earnings?owner_id=${user.id}&date_range=${dateRange}`),
        fetch(`/api/courts?owner_id=${user.id}`),
        fetch(`/api/clubs?owner_id=${user.id}`)
      ])

      const earningsData = earningsRes.ok ? await earningsRes.json() : null
      const courts = courtsRes.ok ? await courtsRes.json() : []
      const clubs = clubsRes.ok ? await clubsRes.json() : []

      // Fetch detailed booking data for status breakdown
      const bookingsRes = await fetch(`/api/bookings?owner_id=${user.id}`)
      const bookings = bookingsRes.ok ? await bookingsRes.json() : []

      // Calculate booking status stats
      const confirmedBookings = bookings?.filter((b: any) => b.status === 'confirmed').length || 0
      const pendingBookings = bookings?.filter((b: any) => b.status === 'pending').length || 0
      const cancelledBookings = bookings?.filter((b: any) => b.status === 'cancelled').length || 0

      // Popular courts (from earnings data or fallback to bookings)
      let popularCourts = []
      if (earningsData?.courtPerformance) {
        popularCourts = earningsData.courtPerformance
          .sort((a: any, b: any) => b.bookingCount - a.bookingCount)
          .slice(0, 5)
          .map((court: any) => ({ name: court.courtName, count: court.bookingCount }))
      } else {
        const courtStats: any = {}
        bookings?.forEach((b: any) => {
          if (b.status === 'confirmed') {
            courtStats[b.court_name] = (courtStats[b.court_name] || 0) + 1
          }
        })
        popularCourts = Object.entries(courtStats)
          .sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }))
      }

      setStats({
        totalClubs: clubs?.length || 0,
        totalCourts: courts?.length || 0,
        totalBookings: bookings?.length || 0,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue: earningsData?.summary?.totalEarnings || '0.00',
        netEarnings: earningsData?.summary?.netEarnings || '0.00',
        totalCommission: earningsData?.summary?.totalCommission || '0.00',
        averagePerBooking: earningsData?.summary?.averageEarning || '0.00',
        popularCourts,
      })

      setEarningsData(earningsData)
      setLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching report data:', err)
      setError('Failed to load report data')
      setLoading(false)
    }
  }

  async function exportPDF() {
    alert('PDF export will be available soon.')
  }

async function exportCSV() {
    try {
      const [bookingsRes, earningsRes] = await Promise.all([
        fetch(`/api/bookings?owner_id=${user?.id}`),
        fetch(`/api/earnings?owner_id=${user?.id}&date_range=all`)
      ])

      const bookings = bookingsRes.ok ? await bookingsRes.json() : []
      const earningsData = earningsRes.ok ? await earningsRes.json() : null

      if (!bookings || bookings.length === 0) {
        setError('No data available to export')
        return
      }

      // Create comprehensive CSV with summary data first
      const summaryHeaders = ['Report Summary', '', '', '', '']
      const summaryData = [
        ['Report Generated', new Date().toLocaleDateString(), '', '', ''],
        ['Date Range', dateRange === 'all' ? 'All Time' : dateRange, '', '', ''],
        ['Total Bookings', bookings?.length || 0, '', '', ''],
        ['Total Revenue', `$${earningsData?.summary?.totalEarnings || '0.00'}`, '', '', ''],
        ['Net Earnings', `$${earningsData?.summary?.netEarnings || '0.00'}`, '', '', ''],
        ['Total Commission', `$${earningsData?.summary?.totalCommission || '0.00'}`, '', '', ''],
        ['', '', '', '', ''],
        ['Booking Details', '', '', '', '']
      ]

      const bookingHeaders = ['Booking Date', 'Court', 'Customer Email', 'Start Time', 'End Time', 'Amount', 'Commission', 'Net Amount', 'Status']
      const bookingRows = bookings.map((b: any) => [
        new Date(b.booking_date).toLocaleDateString(),
        b.court_name || 'N/A',
        b.customer_email || 'N/A',
        b.start_time,
        b.end_time,
        `$${parseFloat(b.total_price || 0).toFixed(2)}`,
        `$${parseFloat(b.commission_amount || 0).toFixed(2)}`,
        `$${(parseFloat(b.total_price || 0) - parseFloat(b.commission_amount || 0)).toFixed(2)}`,
        b.status
      ])

      const csv = [
        ...summaryData.map(row => row.join(',')),
        bookingHeaders.join(','),
        ...bookingRows.map(row => row.join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `comprehensive_report_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[v0] Error exporting CSV:', err)
      setError('Failed to export CSV')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">View comprehensive business reports and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={exportPDF} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Business Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Clubs & Courts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 mb-2">{stats?.totalClubs} Clubs</p>
            <p className="text-sm text-gray-600">{stats?.totalCourts} Courts Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Booking Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 mb-2">{stats?.totalBookings} Total</p>
            <div className="text-sm space-y-1">
              <p className="text-green-600">✓ {stats?.confirmedBookings} Confirmed</p>
              <p className="text-yellow-600">⊙ {stats?.pendingBookings} Pending</p>
              <p className="text-red-600">✕ {stats?.cancelledBookings} Cancelled</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 mb-2">${stats?.totalRevenue}</p>
            <p className="text-sm text-gray-600">Avg: ${stats?.averagePerBooking} per booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Courts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Courts</CardTitle>
          <CardDescription>Courts with most bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.popularCourts?.length > 0 ? (
            <div className="space-y-3">
              {stats.popularCourts.map((court: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">#{idx + 1} {court.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{court.count}</p>
                    <p className="text-xs text-gray-600">bookings</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No booking data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Facts */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Facts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Your platform has hosted {stats?.totalBookings} bookings</li>
            <li>• Average booking value is ${stats?.averagePerBooking}</li>
            <li>• You're operating {stats?.totalCourts} courts across {stats?.totalClubs} clubs</li>
            <li>• {((stats?.confirmedBookings / stats?.totalBookings) * 100).toFixed(0)}% of bookings are confirmed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
