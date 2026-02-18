'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, Users, CheckCircle, XCircle, AlertCircle, Calendar, ArrowRight } from 'lucide-react'
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
      const params = new URLSearchParams({ customer_id: user!.id })
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
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      setBookings(data.map((b: any) => ({
        ...b,
        total_price: parseFloat(b.total_price) || 0,
        player_count: parseInt(b.player_count) || 1
      })))
    } catch (err) {
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  async function cancelBooking(bookingId: string) {
    if (!confirm('Cancel this booking?')) return
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: bookingId, customer_id: user!.id, status: 'cancelled' })
      })
      if (!response.ok) throw new Error('Failed to cancel')
      await fetchBookings()
    } catch (err) {
      setError('Failed to cancel booking')
    }
  }

  const upcomingCount = bookings.filter(b => b.status === 'confirmed').length

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

  return (
    <div className="pb-20 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-500">{bookings.length} total bookings</p>
        </div>
        {upcomingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-700">{upcomingCount} upcoming</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        {(['all', 'upcoming', 'pending', 'completed'] as const).map((f) => {
          const count = f === 'all' ? bookings.length : 
            f === 'upcoming' ? bookings.filter(b => b.status === 'confirmed').length :
            f === 'pending' ? bookings.filter(b => b.status === 'pending').length :
            bookings.filter(b => b.status === 'completed').length
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

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="space-y-3">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              onCancel={cancelBooking}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No bookings found</h3>
            <p className="text-sm text-gray-500 mb-4">Book your first court to get started</p>
            <Link href="/dashboard/browse">
              <Button className="h-10 px-6 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm">
                Browse Courts
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking, onCancel }: { booking: Booking, onCancel: (id: string) => void }) {
  const isUpcoming = new Date(booking.booking_date) >= new Date()
  const date = new Date(booking.booking_date)
  
  const statusConfig = {
    confirmed: { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    pending: { label: 'Pending', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    completed: { label: 'Done', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  }
  const status = statusConfig[booking.status] || statusConfig.pending

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <div className="w-16 sm:w-20 bg-gray-50 flex flex-col items-center justify-center p-2 shrink-0">
          <span className="text-[10px] font-medium text-gray-400 uppercase">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
          <span className="text-xl font-bold text-gray-900">{date.getDate()}</span>
        </div>
        
        <div className="flex-1 p-3 sm:p-4 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{booking.court_name}</h3>
              <p className="text-xs text-gray-500 truncate">{booking.club_name}</p>
            </div>
            <div className={`px-2 py-1 rounded-full text-[10px] font-medium ${status.bg} ${status.text} flex items-center gap-1 shrink-0`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </div>
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
              {booking.status === 'confirmed' && isUpcoming && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(booking.id)}
                  className="h-8 px-3 text-xs font-medium text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 rounded-lg"
                >
                  Cancel
                </Button>
              )}
              {booking.status === 'completed' && (
                <Link href="/dashboard/browse" className="h-8 px-3 flex items-center gap-1 bg-gray-900 hover:bg-orange-500 text-white text-xs font-medium rounded-lg transition-colors">
                  Book Again
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
              {booking.status === 'pending' && (
                <span className="text-xs text-yellow-600 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Awaiting confirmation
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
