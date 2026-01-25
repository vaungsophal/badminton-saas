'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Star, Users, DollarSign, Search } from 'lucide-react'

interface Court {
  id: string
  name: string
  location: string
  courts: number
  price: number
  rating: number
  reviews: number
  amenities: string[]
}

export default function BrowseCourtPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(100)

  const allCourts: Court[] = [
    {
      id: '1',
      name: 'Downtown Badminton Club',
      location: 'City Center',
      courts: 4,
      price: 25,
      rating: 4.8,
      reviews: 124,
      amenities: ['AC', 'Parking', 'Canteen', 'Locker'],
    },
    {
      id: '2',
      name: 'Sports Arena',
      location: 'North District',
      courts: 6,
      price: 30,
      rating: 4.6,
      reviews: 98,
      amenities: ['AC', 'Parking', 'Canteen', 'Shower', 'WiFi'],
    },
    {
      id: '3',
      name: 'Community Sports Hall',
      location: 'South Park',
      courts: 3,
      price: 20,
      rating: 4.5,
      reviews: 76,
      amenities: ['Parking', 'Canteen', 'Locker'],
    },
    {
      id: '4',
      name: 'Elite Sports Club',
      location: 'West End',
      courts: 5,
      price: 35,
      rating: 4.9,
      reviews: 156,
      amenities: ['AC', 'Parking', 'Canteen', 'Shower', 'Locker', 'WiFi', 'Event Space'],
    },
  ]

  const amenitiesOptions = ['AC', 'Parking', 'Canteen', 'Shower', 'Locker', 'WiFi']

  const filteredCourts = allCourts.filter((court) => {
    const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPrice = court.price <= maxPrice
    const matchesAmenities =
      selectedAmenities.length === 0 ||
      selectedAmenities.every((amenity) => court.amenities.includes(amenity))

    return matchesSearch && matchesPrice && matchesAmenities
  })

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Courts</h1>
        <p className="text-gray-600">Find and book your perfect badminton court</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Court name or location"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price: ${maxPrice}/hour
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="space-y-2">
                  {amenitiesOptions.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Courts Grid */}
        <div className="lg:col-span-3 space-y-4">
          {filteredCourts.length > 0 ? (
            filteredCourts.map((court) => (
              <Card key={court.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg" />

                  <div className="md:col-span-3">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {court.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{court.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          ${court.price}
                        </div>
                        <p className="text-xs text-gray-500">per hour</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {court.courts} courts
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {court.rating} ({court.reviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {court.amenities.length} amenities
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {court.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => router.push(`/dashboard/book/${court.id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Book Now
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-gray-600 mb-4">No courts found matching your filters</p>
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setMaxPrice(100)
                  setSelectedAmenities([])
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Reset Filters
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
