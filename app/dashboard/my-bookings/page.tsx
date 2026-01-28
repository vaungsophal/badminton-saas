'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Users, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import Link from 'next/link'

interface Booking {
  id: string
  court_name: string
  club_name: string
  booking_date: string
  start_time: string
  end_time: string
  player_count: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_price: number
  payment_method?: string
  commission_amount: number
  created_at: string
  updated_at: string
}

export default function MyBookingsPage() {
  const { user, token } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending'>('all')

  useEffect(() => {
    fetchBookings()
  }, [user, filter])

  async function fetchBookings() {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams({
        customer_id: user!.id
      })

      // Add date filtering for upcoming/completed
      const today = new Date().toISOString().split('T')[0]
      if (filter === 'upcoming') {
        params.append('start_date', today)
      } else if (filter === 'completed') {
        params.append('end_date', today)
        params.append('status', 'completed')
      } else if (filter === 'pending') {
        params.append('status', 'pending')
      }

      const response = await fetch(`/api/bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      
      // Ensure numeric fields are properly typed
      const processedData = data.map((booking: any) => ({
        ...booking,
        total_price: parseFloat(booking.total_price) || 0,
        commission_amount: parseFloat(booking.commission_amount) || 0,
        player_count: parseInt(booking.player_count) || 1
      }))
      
      setBookings(processedData)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  async function cancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: bookingId,
          customer_id: user!.id,
          status: 'cancelled'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel booking')
      }

      await fetchBookings()
    } catch (err) {
      console.error('Error cancelling booking:', err)
      setError('Failed to cancel booking')
    }
  }

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">View and manage your court bookings</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        {(['all', 'upcoming', 'completed', 'pending'] as const).map((f) => (
          <Button
            key={f}
            onClick={() => setFilter(f)}
            variant={filter === f ? 'default' : 'outline'}
            className={filter === f ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.court_name}
                    </h3>
                    <span className="text-sm text-gray-500">at {booking.club_name}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{booking.booking_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{booking.start_time} - {booking.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{booking.player_count} players</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {booking.payment_method === 'aba_payway' ? 'ABA PayWay' : 'Pay Later'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      ${booking.total_price.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-medium">Completed</span>
                        </>
                      ) : booking.status === 'cancelled' ? (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-600 font-medium">Cancelled</span>
                        </>
                      ) : booking.status === 'pending' ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-yellow-600 font-medium">Pending</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-600 font-medium">Confirmed</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {booking.status === 'confirmed' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="text-red-600 bg-transparent"
                        onClick={() => cancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <Link href="/dashboard">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Book Again
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">No bookings found</p>
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700">Browse Courts</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
