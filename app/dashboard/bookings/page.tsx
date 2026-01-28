'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users, Mail, Phone, CreditCard, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import Link from 'next/link'

interface CourtBooking {
  id: string
  customer_name: string
  customer_email: string
  court_name: string
  club_name: string
  booking_date: string
  start_time: string
  end_time: string
  player_count: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_price: number
  payment_method?: string
}

export default function BookingsPage() {
  const { user, token } = useAuth()
  const [bookings, setBookings] = useState<CourtBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'today' | 'pending'>('all')
  const [processingBooking, setProcessingBooking] = useState<string | null>(null)

useEffect(() => {
    fetchBookings()
  }, [user, filter])

  async function fetchBookings() {
    if (!user?.id) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        owner_id: user.id
      })

      if (filter === 'pending') {
        params.append('status', 'pending')
      } else if (filter === 'today') {
        params.append('start_date', new Date().toISOString().split('T')[0])
      }

      const response = await fetch(`/api/bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch bookings')

      const data = await response.json()
      setBookings(data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  async function updateBookingStatus(bookingId: string, status: string, createPayment = false) {
    if (!user?.id) return

    try {
      setProcessingBooking(bookingId)
      
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: bookingId,
          owner_id: user.id,
          status,
          create_payment: createPayment
        })
      })

      if (!response.ok) throw new Error('Failed to update booking')

      await fetchBookings()
    } catch (err) {
      console.error('Error updating booking:', err)
      setError('Failed to update booking')
    } finally {
      setProcessingBooking(null)
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

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'pending') return booking.status === 'pending'
    if (filter === 'today') return booking.booking_date === new Date().toISOString().split('T')[0]
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings Management</h1>
        <p className="text-gray-600">View and manage customer bookings</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        {(['all', 'today', 'pending'] as const).map((f) => (
          <Button
            key={f}
            onClick={() => setFilter(f)}
            variant={filter === f ? 'default' : 'outline'}
            className={filter === f ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && (
              <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            )}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No bookings found</p>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.customer_name || booking.customer_email}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{booking.customer_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{booking.booking_date} • {booking.start_time} - {booking.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{booking.court_name} • {booking.player_count} players</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span>${booking.total_price.toFixed(2)} • {booking.payment_method || 'aba_payway'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <>
                      {booking.payment_method === 'aba_payway' ? (
                        <Button 
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          disabled={processingBooking === booking.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingBooking === booking.id ? 'Processing...' : 'Approve'}
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => updateBookingStatus(booking.id, 'confirmed', true)}
                            disabled={processingBooking === booking.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingBooking === booking.id ? 'Processing...' : 'Confirm Payment'}
                          </Button>
                          <Button 
                            onClick={() => updateBookingStatus(booking.id, 'confirmed', false)}
                            disabled={processingBooking === booking.id}
                            variant="outline"
                          >
                            Approve Without Payment
                          </Button>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        disabled={processingBooking === booking.id}
                        className="text-red-600 bg-transparent"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <Link href={`/company/bookings/${booking.id}`}>
                      <Button variant="outline" className="text-blue-600 bg-transparent">
                        View Details
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
