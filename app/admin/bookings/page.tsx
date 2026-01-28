'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  AlertCircle, 
  Check, 
  X, 
  Calendar, 
  User, 
  DollarSign, 
  Search,
  Filter,
  Download,
  Eye,
  Building2,
  Clock,
  TrendingUp
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Booking {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  court_name: string
  customer_email: string
  total_price: number
  status: string
  customer_name?: string
  owner_name?: string
  owner_email?: string
  club_name?: string
  commission_amount?: number
  player_count?: number
  created_at?: string
}

interface BookingStats {
  total: number
  pending: number
  confirmed: number
  cancelled: number
  totalRevenue: number
  totalCommission: number
}

export default function AdminBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    totalRevenue: 0,
    totalCommission: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClub, setSelectedClub] = useState<string>('all')
  const [clubs, setClubs] = useState<string[]>([])

  useEffect(() => {
    fetchBookings()
  }, [user, filter, searchTerm, selectedClub])

  async function fetchBookings() {
    try {
      if (!user?.id || user.role !== 'admin') return

      setLoading(true)
      setError('')
      
      const params = new URLSearchParams({
        admin_view: 'true'
      })

      // Add status filter if not 'all'
      if (filter !== 'all') {
        params.append('status', filter)
      }

      // Add search term if exists
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      // Add club filter if not 'all'
      if (selectedClub !== 'all') {
        params.append('club_name', selectedClub)
      }

      const response = await fetch(`/api/bookings?${params}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to fetch bookings')

      // Process data and extract unique clubs
      const processedData = data.bookings.map((booking: any) => ({
        ...booking,
        total_price: parseFloat(booking.total_price) || 0,
        commission_amount: parseFloat(booking.commission_amount) || 0,
        player_count: parseInt(booking.player_count) || 1
      }))

      setBookings(processedData || [])
      
      // Extract unique clubs for filter
      const uniqueClubs = [...new Set(processedData.map((b: Booking) => b.club_name).filter(Boolean))]
      setClubs(uniqueClubs)

      // Calculate stats
      const newStats = processedData.reduce((acc: BookingStats, booking: Booking) => {
        acc.total++
        acc[booking.status as keyof Omit<BookingStats, 'total' | 'totalRevenue' | 'totalCommission'>]++
        acc.totalRevenue += booking.total_price
        acc.totalCommission += booking.commission_amount || 0
        return acc
      }, {
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        totalRevenue: 0,
        totalCommission: 0
      })

      setStats(newStats)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    try {
      setError('')
      
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          admin_view: 'true',
          status
        })
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to update booking')

      // Refresh bookings to get updated stats
      fetchBookings()
    } catch (err) {
      console.error('Error updating booking:', err)
      setError('Failed to update booking')
    }
  }

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter
    const matchesSearch = !searchTerm || 
      b.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.court_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.owner_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.club_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClub = selectedClub === 'all' || b.club_name === selectedClub
    
    return matchesFilter && matchesSearch && matchesClub
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">All Bookings</h1>
          <p className="text-gray-500 font-medium">Manage bookings across all clubs and courts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Platform Commission</p>
              <p className="text-2xl font-bold text-purple-600">${stats.totalCommission.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by customer, court, club, or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Club Filter */}
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Club" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clubs</SelectItem>
                {clubs.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          <CardDescription>
            All bookings matching your filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No bookings found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Info</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Club & Court</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              {booking.start_time} - {booking.end_time}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{booking.customer_email}</div>
                          {booking.customer_name && (
                            <div className="text-sm text-gray-500">{booking.customer_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{booking.court_name}</div>
                          {booking.club_name && (
                            <div className="text-sm text-gray-500">{booking.club_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{booking.owner_email}</div>
                          {booking.owner_name && (
                            <div className="text-sm text-gray-500">{booking.owner_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">
                          ${booking.total_price.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-purple-600">
                          ${(booking.commission_amount || 0).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.status === 'confirmed'
                              ? 'default'
                              : booking.status === 'cancelled'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 gap-1"
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 gap-1"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              >
                                <X className="w-3 h-3" />
                                Reject
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 gap-1"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}