'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, TrendingUp, Trash2, Check, X } from 'lucide-react'

interface Court {
  id: string
  name: string
  owner: string
  location: string
  courts: number
  status: 'active' | 'pending' | 'suspended'
  rating: number
  bookings: number
}

export default function AdminCourtsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')

  const courts: Court[] = [
    {
      id: '1',
      name: 'Downtown Badminton Club',
      owner: 'John Business',
      location: 'City Center',
      courts: 4,
      status: 'active',
      rating: 4.8,
      bookings: 245,
    },
    {
      id: '2',
      name: 'Sports Arena',
      owner: 'Sports Management Inc',
      location: 'North District',
      courts: 6,
      status: 'active',
      rating: 4.6,
      bookings: 198,
    },
    {
      id: '3',
      name: 'New Club',
      owner: 'Pending Owner',
      location: 'South Park',
      courts: 3,
      status: 'pending',
      rating: 0,
      bookings: 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Court Management</h1>
        <p className="text-gray-600">Review and manage all courts on the platform</p>
      </div>

      <div className="flex gap-3">
        {(['all', 'pending', 'active'] as const).map((f) => (
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
        {courts.map((court) => (
          <Card key={court.id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      court.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : court.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {court.status.charAt(0).toUpperCase() + court.status.slice(1)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">Owner: {court.owner}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{court.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{court.courts} courts</span>
                  </div>
                  {court.status === 'active' && (
                    <>
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>{court.bookings} bookings</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium text-yellow-600">⭐ {court.rating}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {court.status === 'pending' && (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700 gap-2"
                      size="sm"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 gap-2 bg-transparent"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </>
                )}
                {court.status === 'active' && (
                  <Button
                    variant="outline"
                    className="text-red-600 gap-2 bg-transparent"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Suspend
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
