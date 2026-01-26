'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, MapPin, Clock, DollarSign, X } from 'lucide-react'

interface SearchFilters {
  query: string
  location: string
  maxDistance: number
  minPrice: number
  maxPrice: number
  date: string
  startTime: string
  endTime: string
  amenities: string[]
  rating: number
}

interface Court {
  id: string
  name: string
  club_name: string
  address: string
  latitude: number
  longitude: number
  price_per_hour: number
  images: string[]
  rating: number
  amenities: string[]
  distance?: number
  available_slots?: number
}

export function CourtSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    maxDistance: 25,
    minPrice: 0,
    maxPrice: 100,
    date: '',
    startTime: '',
    endTime: '',
    amenities: [],
    rating: 0,
  })

  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const amenityOptions = [
    'Air Conditioning', 'Parking', 'WiFi', 'Shower', 'Canteen', 'Lockers',
    'Pro Shop', 'Video Recording', 'Coaching', 'Equipment Rental'
  ]

  useEffect(() => {
    // Load initial courts
    searchCourts()
  }, [])

  const searchCourts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (filters.query) params.append('query', filters.query)
      if (filters.location) params.append('location', filters.location)
      if (filters.maxDistance) params.append('max_distance', filters.maxDistance.toString())
      if (filters.minPrice) params.append('min_price', filters.minPrice.toString())
      if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString())
      if (filters.date) params.append('date', filters.date)
      if (filters.startTime) params.append('start_time', filters.startTime)
      if (filters.endTime) params.append('end_time', filters.endTime)
      if (filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','))
      if (filters.rating) params.append('rating', filters.rating.toString())

      const response = await fetch(`/api/courts/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCourts(data.courts || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      maxDistance: 25,
      minPrice: 0,
      maxPrice: 100,
      date: '',
      startTime: '',
      endTime: '',
      amenities: [],
      rating: 0,
    })
  }

  const activeFilterCount = [
    filters.query,
    filters.location,
    filters.date,
    filters.startTime,
    filters.endTime
  ].filter(Boolean).length + filters.amenities.length

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Badminton Courts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex gap-2">
            <Input
              placeholder="Search courts, clubs, or locations..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="flex-1"
            />
            <Button onClick={searchCourts} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger className="w-48">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                <SelectItem value="phnom-penh">Phnom Penh</SelectItem>
                <SelectItem value="siem-reap">Siem Reap</SelectItem>
                <SelectItem value="sihanoukville">Sihanoukville</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-40"
            />

            <Input
              type="time"
              value={filters.startTime}
              onChange={(e) => handleFilterChange('startTime', e.target.value)}
              placeholder="Start time"
              className="w-32"
            />

            <Input
              type="time"
              value={filters.endTime}
              onChange={(e) => handleFilterChange('endTime', e.target.value)}
              placeholder="End time"
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Advanced Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Range */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4" />
                Price per Hour: ${filters.minPrice} - ${filters.maxPrice}
              </Label>
              <div className="px-2">
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={([min, max]) => {
                    handleFilterChange('minPrice', min)
                    handleFilterChange('maxPrice', max)
                  }}
                  max={200}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Distance Range */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />
                Max Distance: {filters.maxDistance} km
              </Label>
              <div className="px-2">
                <Slider
                  value={[filters.maxDistance]}
                  onValueChange={([max]) => handleFilterChange('maxDistance', max)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <Label className="block mb-2">Minimum Rating</Label>
              <Select value={filters.rating.toString()} onValueChange={(value) => handleFilterChange('rating', parseInt(value))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="5">5 Stars Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amenities */}
            <div>
              <Label className="block mb-2">Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenityOptions.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={filters.amenities.includes(amenity)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                    />
                    <Label htmlFor={amenity} className="text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map((court) => (
          <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-200 relative">
              {court.images.length > 0 ? (
                <img
                  src={court.images[0]}
                  alt={court.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              {court.distance && (
                <Badge className="absolute top-2 left-2">
                  {court.distance.toFixed(1)} km
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{court.name}</h3>
                <p className="text-sm text-gray-600">{court.club_name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {court.address}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-blue-600">
                    ${court.price_per_hour}/hr
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm">{court.rating.toFixed(1)}</span>
                  </div>
                </div>

                {court.available_slots !== undefined && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <Clock className="w-3 h-3" />
                    {court.available_slots} slots available
                  </div>
                )}

                <Button className="w-full mt-3">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courts.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courts found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}