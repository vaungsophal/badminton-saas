'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Check, X, Calendar, User, DollarSign } from 'lucide-react'

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
}

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')

  useEffect(() => {
    fetchBookings()
  }, [user])

  async function fetchBookings() {
    try {
      if (!user?.id) return

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('owner_id', user.id)
        .order('booking_date', { ascending: false })

      if (fetchError) throw fetchError

      setBookings(data || [])
      setLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching bookings:', err)
      setError('Failed to load bookings')
      setLoading(false)
    }
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .eq('owner_id', user?.id)

      if (updateError) throw updateError

      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b))
    } catch (err) {
      console.error('[v0] Error updating booking:', err)
      setError('Failed to update booking')
    }
  }

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter)

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
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
        <p className="text-gray-600 mt-2">View and manage all customer bookings</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-gray-600">No bookings found for this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Date & Time</p>
                          <p className="font-medium">
                            {new Date(booking.booking_date).toLocaleDateString()} •{' '}
                            {booking.start_time} - {booking.end_time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Court</p>
                          <p className="font-medium">{booking.court_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-medium">{booking.customer_email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Price</p>
                          <p className="font-medium text-lg text-green-600">${booking.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>

                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 gap-2"
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 gap-2 bg-transparent"
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 gap-2 bg-transparent"
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
