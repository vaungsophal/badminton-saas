'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { ChevronLeft, MapPin, Clock, Users, CheckCircle, AlertCircle, CreditCard } from 'lucide-react'
import { format, addDays, startOfToday, isSameDay } from 'date-fns'

interface TimeSlot {
  id: string
  start_time: string
  end_time: string
  is_available: boolean
}

function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const parts = timeStr.split(':')
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`
  }
  return timeStr
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const courtId = params.courtId as string

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [playerCount, setPlayerCount] = useState('2')
  const [paymentMethod, setPaymentMethod] = useState<'aba_payway' | 'cash'>('aba_payway')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [court, setCourt] = useState<any>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookingCompleted, setBookingCompleted] = useState(false)

  const dates = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i))

  useEffect(() => {
    if (courtId) fetchCourtDetails()
  }, [courtId])

  useEffect(() => {
    if (selectedDate && courtId) fetchTimeSlots()
  }, [selectedDate, courtId])

  async function fetchCourtDetails() {
    try {
      const response = await fetch(`/api/courts?id=${courtId}`)
      if (response.ok) {
        setCourt(await response.json())
      }
    } catch (err) {
      setError('Failed to load court details')
    }
  }

  async function fetchTimeSlots() {
    setLoadingSlots(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(`/api/time-slots?court_id=${courtId}&date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        setTimeSlots(data.timeSlots || [])
      }
    } catch (err) {
      setError('Failed to load available time slots')
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleBooking = async () => {
    setError('')
    if (!selectedDate || !selectedSlot) {
      setError('Please select date and time slot')
      return
    }
    if (!user?.id) {
      setError('Please log in to continue')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time_slot_id: selectedSlot.id,
          court_id: courtId,
          customer_id: user.id,
          player_count: parseInt(playerCount),
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          payment_method: paymentMethod,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        setBookingCompleted(true)
      } else {
        throw new Error(result.error || 'Failed to create booking')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  if (!court && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Finding your court...</p>
      </div>
    )
  }

  if (bookingCompleted) {
    return (
      <div className="pb-20">
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-xl shadow-green-100">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
            <p className="text-gray-500 font-medium mt-2">Your court is ready. See you there!</p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              onClick={() => router.push('/dashboard/my-bookings')}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg"
            >
              My Bookings
            </Button>
            <Button
              onClick={() => router.push('/dashboard/browse')}
              variant="outline"
              className="w-full h-12 border-gray-200 text-gray-600 font-medium rounded-xl"
            >
              Book Another
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 sm:pb-20 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-orange-500 font-medium text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{court?.name}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {court?.club_name || 'Premium Club'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-orange-500">${court?.price_per_hour}</p>
          <p className="text-xs text-gray-400">per hour</p>
        </div>
      </div>

      <div className="relative h-40 sm:h-48 rounded-2xl overflow-hidden">
        {court?.images?.[0] ? (
          <img src={court.images[0]} alt={court.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-orange-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-white/90 rounded-lg text-xs font-medium text-gray-900">
            <Clock className="w-3 h-3" />
            Available Now
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Select Date</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {dates.map((date) => {
            const isSelected = isSameDay(date, selectedDate)
            return (
              <button
                key={date.toString()}
                onClick={() => {
                  setSelectedDate(date)
                  setSelectedSlot(null)
                }}
                className={`flex flex-col items-center justify-center min-w-[60px] h-[70px] rounded-xl transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                }`}
              >
                <span className={`text-[10px] font-medium uppercase ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  {format(date, 'EEE')}
                </span>
                <span className="text-lg font-bold">{format(date, 'd')}</span>
                <span className={`text-[9px] ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                  {format(date, 'MMM')}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-600">Select Time</h2>
          {loadingSlots && <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />}
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {timeSlots.length === 0 && !loadingSlots ? (
            <div className="col-span-full py-6 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No slots available for this date
            </div>
          ) : (
            timeSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id
              return (
                <button
                  key={slot.id}
                  onClick={() => slot.is_available && setSelectedSlot(slot)}
                  disabled={!slot.is_available}
                  className={`py-3 px-2 rounded-xl text-center transition-all text-sm ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 font-semibold'
                      : slot.is_available
                        ? 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300 font-medium'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                  }`}
                >
                  {formatTime(slot.start_time)}
                </button>
              )
            })
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Players</h2>
        <div className="flex gap-2">
          {['2', '3', '4'].map((p) => (
            <button
              key={p}
              onClick={() => setPlayerCount(p)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                playerCount === p
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Payment</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setPaymentMethod('aba_payway')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              paymentMethod === 'aba_payway'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            ABA PayWay
          </button>
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              paymentMethod === 'cash'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            💵 Cash
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 sm:relative sm:bg-transparent sm:border-0 sm:p-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-bold text-orange-500">${court?.price_per_hour}</p>
          </div>
          <Button
            onClick={handleBooking}
            disabled={loading || !selectedSlot}
            className="flex-1 sm:flex-none h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          {paymentMethod === 'aba_payway' ? 'Pay via ABA PayWay' : 'Pay at venue'}
        </p>
      </div>
    </div>
  )
}
