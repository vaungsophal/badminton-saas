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
import { Search, Filter, MapPin, Clock, DollarSign, X, Star } from 'lucide-react'

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
    <div className="space-y-4">
      {/* Search Header */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          {/* Main Search Bar */}
          <div className="flex gap-2">
            <Input
              placeholder="Search courts, clubs, or locations..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="flex-1 text-sm"
            />
            <Button onClick={searchCourts} disabled={loading} size="sm" className="px-4">
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative px-3"
              size="sm"
            >
              <Filter className="w-4 h-4" />
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
              <SelectTrigger className="w-full sm:w-40 text-sm">
                <MapPin className="w-3 h-3 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="phnom-penh">Phnom Penh</SelectItem>
                <SelectItem value="siem-reap">Siem Reap</SelectItem>
                <SelectItem value="sihanoukville">Sihanoukville</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full sm:w-32 text-sm"
            />

            <Input
              type="time"
              value={filters.startTime}
              onChange={(e) => handleFilterChange('startTime', e.target.value)}
              placeholder="Start time"
              className="w-full sm:w-28 text-sm"
            />

            <Input
              type="time"
              value={filters.endTime}
              onChange={(e) => handleFilterChange('endTime', e.target.value)}
              placeholder="End time"
              className="w-full sm:w-28 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </div>

            {/* Price Range */}
            <div>
              <Label className="flex items-center gap-2 mb-3 text-sm font-medium">
                <DollarSign className="w-4 h-4" />
                Price: ${filters.minPrice} - ${filters.maxPrice}
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

            {/* Rating */}
            <div>
              <Label className="block mb-2 text-sm font-medium">Minimum Rating</Label>
              <Select value={filters.rating.toString()} onValueChange={(value) => handleFilterChange('rating', parseInt(value))}>
                <SelectTrigger className="w-full sm:w-48 text-sm">
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
              <Label className="block mb-3 text-sm font-medium">Amenities</Label>
              <div className="grid grid-cols-2 gap-2">
                {amenityOptions.slice(0, 6).map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={filters.amenities.includes(amenity)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                    />
                    <Label htmlFor={amenity} className="text-xs">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courts.map((court) => (
          <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm">
            <div className="aspect-video bg-gray-200 relative">
              {court.images?.length > 0 ? (
                <img
                  src={court.images[0]}
                  alt={court.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MapPin className="w-8 h-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {court.distance && (
                <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs">
                  {court.distance.toFixed(1)} km
                </Badge>
              )}

              {court.rating && (
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-blue-600 shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {typeof court.rating === 'number' ? court.rating.toFixed(1) : court.rating}
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{court.name}</h3>
                {court.club_name && (
                  <p className="text-xs text-gray-500 font-medium">{court.club_name}</p>
                )}
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{court.address}</span>
                </p>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <span className="text-lg font-bold text-blue-600">
                    ${court.price_per_hour}
                    <span className="text-xs text-gray-400 font-normal">/hr</span>
                  </span>

                  {court.available_slots !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Clock className="w-3 h-3" />
                      {court.available_slots} slots
                    </div>
                  )}
                </div>

                <Button className="w-full mt-3 text-xs font-bold" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courts.length === 0 && !loading && (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courts found</h3>
            <p className="text-gray-600 text-sm">Try adjusting your search filters</p>
            <Button onClick={clearFilters} variant="outline" className="mt-4">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}