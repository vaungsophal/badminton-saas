'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, Users, Mail, CreditCard, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'

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
      const params = new URLSearchParams({ owner_id: user.id })

      if (filter === 'pending') {
        params.append('status', 'pending')
      } else if (filter === 'today') {
        params.append('start_date', new Date().toISOString().split('T')[0])
      }

      const response = await fetch(`/api/bookings?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      setBookings(data)
    } catch (err) {
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
      setError('Failed to update booking')
    } finally {
      setProcessingBooking(null)
    }
  }

  if (loading) {
    return (
      <div className="pb-20 space-y-4">
        <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'pending') return booking.status === 'pending'
    if (filter === 'today') return booking.booking_date === new Date().toISOString().split('T')[0]
    return true
  })

  const pendingCount = bookings.filter(b => b.status === 'pending').length

  return (
    <div className="pb-20 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500">{bookings.length} total bookings</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-yellow-700">{pendingCount} pending</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        {(['all', 'today', 'pending'] as const).map((f) => {
          const count = f === 'all' ? bookings.length : 
            f === 'today' ? bookings.filter(b => b.booking_date === new Date().toISOString().split('T')[0]).length :
            bookings.filter(b => b.status === 'pending').length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === f ? 'bg-white/20' : 'bg-gray-100'
              }`}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex">
                <div className="w-16 sm:w-20 bg-gray-50 flex flex-col items-center justify-center p-2 shrink-0">
                  <span className="text-[10px] font-medium text-gray-400 uppercase">
                    {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {new Date(booking.booking_date).getDate()}
                  </span>
                </div>
                
                <div className="flex-1 p-3 sm:p-4 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{booking.customer_name || booking.customer_email}</h3>
                      <p className="text-xs text-gray-500 truncate">{booking.court_name}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.start_time} - {booking.end_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {booking.player_count}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-orange-500">${booking.total_price.toFixed(2)}</span>
                    
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            disabled={processingBooking === booking.id}
                            className="h-8 px-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg text-xs"
                          >
                            {processingBooking === booking.id ? '...' : 'Confirm'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            disabled={processingBooking === booking.id}
                            className="h-8 px-3 text-red-600 border-red-100 hover:bg-red-50 rounded-lg text-xs"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Confirmed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, bg: string, text: string }> = {
    confirmed: { label: 'Confirmed', bg: 'bg-green-50', text: 'text-green-700' },
    pending: { label: 'Pending', bg: 'bg-yellow-50', text: 'text-yellow-700' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700' },
    completed: { label: 'Done', bg: 'bg-gray-50', text: 'text-gray-700' },
  }
  const { label, bg, text } = configs[status] || configs.pending

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${bg} ${text}`}>
      {label}
    </span>
  )
}
