'use client'

import React from "react"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Clock, Users, MapPin, ChevronLeft } from 'lucide-react'

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const courtId = params.courtId as string

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [playerCount, setPlayerCount] = useState('2')
  const [loading, setLoading] = useState(false)

  const timeSlots = [
    { id: '1', time: '06:00 - 07:00', available: true },
    { id: '2', time: '07:00 - 08:00', available: true },
    { id: '3', time: '08:00 - 09:00', available: false },
    { id: '4', time: '17:00 - 18:00', available: true },
    { id: '5', time: '18:00 - 19:00', available: true },
    { id: '6', time: '19:00 - 20:00', available: true },
  ]

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedSlot) {
      alert('Please select a date and time slot')
      return
    }

    setLoading(true)
    try {
      // API call would happen here
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/dashboard/my-bookings?success=true')
    } catch (error) {
      alert('Booking failed')
    } finally {
      setLoading(false)
    }
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

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Downtown Badminton Club
        </h1>
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>City Center</span>
          </div>
          <div className="text-gray-400">•</div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>$25/hour</span>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => {
                      if (slot.available) {
                        setSelectedSlot(slot.id)
                      }
                    }}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedSlot === slot.id
                        ? 'border-blue-600 bg-blue-50'
                        : slot.available
                          ? 'border-gray-200 hover:border-blue-400'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-medium text-sm">{slot.time}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {slot.available ? 'Available' : 'Booked'}
                    </div>
                  </button>
                ))}
              </div>
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
                    ? timeSlots.find((s) => s.id === selectedSlot)?.time
                    : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Players:</span>
                <span className="font-medium text-gray-900">{playerCount}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">$25</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !selectedDate || !selectedSlot}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              You will be redirected to payment
            </p>
          </Card>
        </div>
      </form>
    </div>
  )
}
