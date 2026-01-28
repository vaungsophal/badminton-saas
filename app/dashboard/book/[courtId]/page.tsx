'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Clock, Users, MapPin, ChevronLeft, AlertCircle, CreditCard, CheckCircle } from 'lucide-react'

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const courtId = params.courtId as string

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [playerCount, setPlayerCount] = useState('2')
  const [paymentMethod, setPaymentMethod] = useState('aba_payway')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [court, setCourt] = useState<any>(null)
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [bookingCompleted, setBookingCompleted] = useState(false)

  useEffect(() => {
    if (courtId) {
      fetchCourtDetails()
    }
  }, [courtId])

  useEffect(() => {
    if (selectedDate && courtId) {
      fetchTimeSlots()
    }
  }, [selectedDate, courtId])

  async function fetchCourtDetails() {
    try {
      const response = await fetch(`/api/courts?id=${courtId}`)
      if (!response.ok) {
        throw new Error('Court not found')
      }
      const courtData = await response.json()
      setCourt(courtData)
    } catch (err) {
      setError('Failed to load court details')
      console.error('Error fetching court:', err)
    }
  }

  async function fetchTimeSlots() {
    if (!selectedDate || !courtId) return
    
    setLoadingSlots(true)
    try {
      const response = await fetch(`/api/time-slots?court_id=${courtId}&date=${selectedDate}`)
      if (!response.ok) {
        throw new Error('Failed to fetch time slots')
      }
      const data = await response.json()
      setTimeSlots(data.timeSlots || [])
    } catch (err) {
      setError('Failed to load available time slots')
      console.error('Error fetching time slots:', err)
    } finally {
      setLoadingSlots(false)
    }
  }

const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous messages
    setError('')
    setSuccessMessage('')
    
    // Validate inputs
    if (!selectedDate) {
      setError('Please select a date')
      return
    }
    
    if (!selectedSlot) {
      setError('Please select a time slot')
      return
    }

    if (!user?.id) {
      setError('Please log in to make a booking')
      return
    }

    if (!court) {
      setError('Court information not available')
      return
    }

    setLoading(true)
    
    try {
      const bookingData = {
        time_slot_id: selectedSlot,
        court_id: courtId,
        customer_id: user.id,
        player_count: parseInt(playerCount),
        booking_date: selectedDate,
        payment_method: paymentMethod,
      }

      console.log('Creating booking:', bookingData)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('Booking API error:', responseData)
        throw new Error(responseData.error || `Failed to create booking (${response.status})`)
      }

      console.log('Booking successful:', responseData)
      
      // Show success message
      setSuccessMessage(responseData.message || 'Booking created successfully!')
      setBookingCompleted(true)
      
    } catch (error) {
      console.error('Booking error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Booking failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

if (!court) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading court details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-700 font-medium">{successMessage}</p>
            <p className="text-green-600 text-sm mt-1">
              {paymentMethod === 'aba_payway' 
                ? 'Your booking has been confirmed and payment processed.'
                : 'Your booking is pending confirmation. You will receive an email when confirmed.'
              }
            </p>
            <div className="mt-3">
              <button
                onClick={() => router.push('/dashboard/my-bookings')}
                className="text-green-700 hover:text-green-800 font-medium text-sm"
              >
                View My Bookings →
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {court.name}
        </h1>
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{court.club_name || 'Badminton Club'}</span>
          </div>
          <div className="text-gray-400">•</div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>${court.price_per_hour}/hour</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date</h2>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full"
              required
            />
          </Card>

{selectedDate && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Time Slots</h2>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No time slots available for this date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        if (slot.is_available) {
                          setSelectedSlot(slot.id)
                        }
                      }}
                      disabled={!slot.is_available}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedSlot === slot.id
                          ? 'border-blue-600 bg-blue-50'
                          : slot.is_available
                            ? 'border-gray-200 hover:border-blue-400'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {slot.start_time} - {slot.end_time}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {slot.is_available ? 'Available' : 'Booked'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Number of Players</h2>
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-gray-400" />
              <select
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num.toString()}>
                    {num} {num === 1 ? 'player' : 'players'}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:border-blue-400">
                <input
                  type="radio"
                  name="payment_method"
                  value="aba_payway"
                  checked={paymentMethod === 'aba_payway'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex items-center gap-2 flex-1">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium">ABA PayWay</div>
                    <div className="text-sm text-gray-500">Pay now - Instant confirmation</div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:border-blue-400">
                <input
                  type="radio"
                  name="payment_method"
                  value="pay_later"
                  checked={paymentMethod === 'pay_later'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <div>
                    <div className="font-medium">Pay Later</div>
                    <div className="text-sm text-gray-500">Pay at the venue - Pending confirmation</div>
                  </div>
                </div>
              </label>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Date:</span>
                <span className="font-medium text-gray-900">
                  {selectedDate || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Time:</span>
                <span className="font-medium text-gray-900">
                  {selectedSlot
                    ? timeSlots.find((s) => s.id === selectedSlot)?.start_time + ' - ' + timeSlots.find((s) => s.id === selectedSlot)?.end_time
                    : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Players:</span>
                <span className="font-medium text-gray-900">{playerCount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment:</span>
                <span className="font-medium text-gray-900">
                  {paymentMethod === 'aba_payway' ? 'ABA PayWay' : 'Pay Later'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Status:</span>
                <span className={`font-medium ${
                  paymentMethod === 'aba_payway' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {paymentMethod === 'aba_payway' ? 'Auto-confirmed' : 'Pending confirmation'}
                </span>
              </div>
<div className="border-t pt-3 flex justify-between">
                 <span className="font-semibold text-gray-900">Total:</span>
                 <span className="text-2xl font-bold text-blue-600">
                   ${court ? court.price_per_hour : '25'}
                 </span>
               </div>
            </div>

            {bookingCompleted ? (
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
                <p className="text-green-700 font-medium">Booking Completed!</p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                  >
                    Make Another Booking
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/my-bookings')}
                    className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg"
                  >
                    View My Bookings
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  type="submit"
                  disabled={loading || !selectedDate || !selectedSlot}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  {paymentMethod === 'aba_payway' 
                    ? 'You will be redirected to ABA PayWay for payment'
                    : 'Booking will be pending confirmation from the venue'
                  }
                </p>
              </>
            )}
          </Card>
        </div>
      </form>
    </div>
  )
}
