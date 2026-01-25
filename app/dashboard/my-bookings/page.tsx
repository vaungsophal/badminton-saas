'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Users, CheckCircle, XCircle } from 'lucide-react'

interface Booking {
  id: string
  courtName: string
  date: string
  time: string
  players: number
  status: 'confirmed' | 'completed' | 'cancelled'
  price: number
}

export default function MyBookingsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')

  const bookings: Booking[] = [
    {
      id: '1',
      courtName: 'Downtown Badminton Club',
      date: '2024-02-10',
      time: '18:00 - 19:00',
      players: 4,
      status: 'confirmed',
      price: 25,
    },
    {
      id: '2',
      courtName: 'Sports Arena',
      date: '2024-02-12',
      time: '19:00 - 20:00',
      players: 6,
      status: 'confirmed',
      price: 30,
    },
    {
      id: '3',
      courtName: 'Community Sports Hall',
      date: '2024-01-28',
      time: '17:00 - 18:00',
      players: 2,
      status: 'completed',
      price: 20,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">View and manage your court bookings</p>
      </div>

      <div className="flex gap-3">
        {(['all', 'upcoming', 'completed'] as const).map((f) => (
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {booking.courtName}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{booking.date} at {booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{booking.players} players</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      ${booking.price}
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
                      <Button variant="outline" className="text-blue-600 bg-transparent">
                        Edit
                      </Button>
                      <Button variant="outline" className="text-red-600 bg-transparent">
                        Cancel
                      </Button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Book Again
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">No bookings found</p>
            <Button className="bg-blue-600 hover:bg-blue-700">Browse Courts</Button>
          </Card>
        )}
      </div>
    </div>
  )
}
