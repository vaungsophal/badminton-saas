'use client'

import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Users, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (user?.role === 'club_owner') {
    return <ClubOwnerDashboard />
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  return <CustomerDashboard />
}

function CustomerDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const featuredCourts = [
    {
      id: '1',
      name: 'Downtown Badminton Club',
      location: 'City Center',
      courts: 4,
      pricePerHour: 25,
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Sports Arena',
      location: 'North District',
      courts: 6,
      pricePerHour: 30,
      rating: 4.6,
    },
    {
      id: '3',
      name: 'Community Sports Hall',
      location: 'South Park',
      courts: 3,
      pricePerHour: 20,
      rating: 4.5,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600">Book your favorite badminton courts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 rounded-lg p-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Bookings</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 rounded-lg p-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Players</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 rounded-lg p-3">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Favorite Courts</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Courts</h2>
          <Button
            onClick={() => router.push('/dashboard/browse')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            View All Courts
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCourts.map((court) => (
            <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600" />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{court.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{court.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{court.courts} courts available</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">${court.pricePerHour}</p>
                    <p className="text-xs text-gray-500">per hour</p>
                  </div>
                  <Button
                    onClick={() => router.push(`/dashboard/book/${court.id}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function ClubOwnerDashboard() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Club Owner Dashboard</h1>
        <p className="text-gray-600">Manage your clubs, courts and bookings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 rounded-lg p-3">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Courts</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 rounded-lg p-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Bookings</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 rounded-lg p-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$2,400</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => router.push('/dashboard/courts/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add New Court
        </Button>
        <Button
          onClick={() => router.push('/dashboard/bookings')}
          variant="outline"
        >
          View Bookings
        </Button>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 rounded-lg p-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 rounded-lg p-3">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Courts</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 rounded-lg p-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Daily Bookings</p>
              <p className="text-2xl font-bold text-gray-900">342</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => router.push('/dashboard/admin/courts')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Manage Courts
        </Button>
        <Button
          onClick={() => router.push('/dashboard/admin/users')}
          variant="outline"
        >
          Manage Users
        </Button>
      </div>
    </div>
  )
}
