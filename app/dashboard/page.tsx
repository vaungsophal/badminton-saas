'use client'

import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Users, Clock, Star, TrendingUp, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'

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

  const [featuredCourts, setFeaturedCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedCourts()
  }, [])

  const fetchFeaturedCourts = async () => {
    try {
      const response = await fetch('/api/courts/search?limit=6')
      const data = await response.json()
      setFeaturedCourts(data.courts?.slice(0, 6) || [])
    } catch (error) {
      console.error('Error fetching courts:', error)
    } finally {
      setLoading(false)
    }
  }

  

return (
    <div className="space-y-8">
      {/* Featured Courts */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Featured Courts</h2>
          <Button
            onClick={() => router.push('/dashboard/browse')}
            className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2"
          >
            View All
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCourts.map((court) => (
              <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-0 shadow-sm hover:shadow-xl hover:-translate-y-1">
                {/* Court Image */}
                <div className="h-32 bg-gradient-to-br from-blue-400 to-indigo-600 relative overflow-hidden">
                  {court.images?.length > 0 ? (
                    <img
                      src={court.images[0]}
                      alt={court.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/80">
                      <MapPin className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  
                  {/* Rating Badge */}
                  {court.rating && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-blue-600 shadow-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {typeof court.rating === 'number' ? court.rating.toFixed(1) : court.rating}
                    </div>
                  )}
                </div>

                {/* Court Info */}
                <div className="p-4">
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                      {court.name}
                    </h3>
                    
                    {court.club_name && (
                      <p className="text-xs text-gray-500 font-medium">{court.club_name}</p>
                    )}

                    {court.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs line-clamp-1">{court.address}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-lg font-black text-blue-600">${court.price_per_hour}</p>
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">per hour</p>
                      </div>
                      <Button
                        onClick={() => router.push(`/dashboard/book/${court.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-xs px-4 py-2 font-bold shadow-lg shadow-blue-200/50"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:hidden z-40">
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => router.push('/dashboard/browse')}
            className="flex flex-col gap-1 h-auto py-2 text-xs"
            variant="outline"
          >
            <MapPin className="w-4 h-4" />
            Browse
          </Button>
          <Button
            onClick={() => router.push('/dashboard/my-bookings')}
            className="flex flex-col gap-1 h-auto py-2 text-xs"
            variant="outline"
          >
            <Clock className="w-4 h-4" />
            My Bookings
          </Button>
          <Button
            onClick={() => router.push('/dashboard/settings')}
            className="flex flex-col gap-1 h-auto py-2 text-xs"
            variant="outline"
          >
            <Users className="w-4 h-4" />
            Profile
          </Button>
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
