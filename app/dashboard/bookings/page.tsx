'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users, Mail, Phone } from 'lucide-react'

interface CourtBooking {
  id: string
  customerName: string
  customerEmail: string
  court: string
  date: string
  time: string
  players: number
  status: 'confirmed' | 'completed' | 'cancelled'
}

export default function BookingsPage() {
  const [filter, setFilter] = useState<'all' | 'today' | 'pending'>('all')

  const bookings: CourtBooking[] = [
    {
      id: '1',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      court: 'Court 1',
      date: '2024-02-10',
      time: '18:00 - 19:00',
      players: 4,
      status: 'confirmed',
    },
    {
      id: '2',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      court: 'Court 2',
      date: '2024-02-10',
      time: '19:00 - 20:00',
      players: 2,
      status: 'confirmed',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings Management</h1>
        <p className="text-gray-600">View and manage customer bookings</p>
      </div>

      <div className="flex gap-3">
        {(['all', 'today', 'pending'] as const).map((f) => (
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
        {bookings.map((booking) => (
          <Card key={booking.id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {booking.customerName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{booking.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{booking.date} • {booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{booking.court} • {booking.players} players</span>
                  </div>
                  <div className="font-semibold text-blue-600">
                    {booking.status === 'completed' ? '✓ Completed' : '⏱ Confirmed'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="text-blue-600 bg-transparent">
                  Contact
                </Button>
                <Button variant="outline" className="text-red-600 bg-transparent">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
