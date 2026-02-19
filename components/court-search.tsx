'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Clock, Star, Wifi, Car, Waves, Users, Calendar } from 'lucide-react'

interface Court {
  id: string
  name: string
  club_name: string
  address: string
  price_per_hour: number
  images: string[]
  rating: number
  amenities: string[]
  available_slots?: number
}

export function CourtSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('all')
  const [playDate, setPlayDate] = useState('')
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(false)

  const quickAmenities = ['AC', 'Parking', 'WiFi']

  useEffect(() => {
    searchCourts()
  }, [])

  const searchCourts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('query', searchQuery)
      if (location && location !== 'all') params.append('location', location)
      if (playDate) params.append('date', playDate)

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchCourts()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch}>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search courts or club name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10 pr-3 bg-gray-50 border-gray-200 rounded-lg text-sm"
            />
          </div>
          
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="h-11 w-full sm:w-[150px] rounded-lg border-gray-200 bg-gray-50 text-sm">
              <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="phnom-penh">Phnom Penh</SelectItem>
              <SelectItem value="siem-reap">Siem Reap</SelectItem>
              <SelectItem value="sihanoukville">Sihanoukville</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={playDate}
            onChange={(e) => setPlayDate(e.target.value)}
            className="h-11 w-full sm:w-[150px] rounded-lg border-gray-200 bg-gray-50 text-sm"
          />

          <Button
            type="submit"
            disabled={loading}
            className="h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow transition-all active:scale-95 text-sm"
          >
            {loading ? '...' : 'Search'}
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-[280px] animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {courts.map((court) => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>
      )}

      {courts.length === 0 && !loading && (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No courts found</h3>
          <p className="text-gray-500 text-sm">Try different search terms or location</p>
        </div>
      )}
    </div>
  )
}

function CourtCard({ court }: { court: Court }) {
  const amenities = court.amenities?.slice(0, 3) || ['AC', 'Parking', 'WiFi']

  return (
    <div
      onClick={() => window.location.href = `/dashboard/book/${court.id}`}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-pointer group"
    >
      <div className="h-40 sm:h-44 bg-gray-100 relative overflow-hidden">
        {court.images?.[0] ? (
          <img src={court.images[0]} alt={court.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-2 left-2">
          <div className="bg-white/95 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-gray-900 flex items-center gap-1">
            <Star className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
            {typeof court.rating === 'number' ? court.rating.toFixed(1) : '4.5'}
          </div>
        </div>

        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="text-white font-bold text-base leading-tight truncate">{court.name}</h3>
          <p className="text-white/70 text-xs font-medium truncate">{court.club_name || court.address}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-black text-emerald-500">${court.price_per_hour}<span className="text-xs font-semibold text-gray-400 ml-1">/hr</span></p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
            <Clock className="w-3 h-3 text-green-600" />
            <span className="text-[10px] font-bold text-green-600">{court.available_slots || 8}</span>
          </div>
        </div>

        <div className="flex gap-1.5">
          {amenities.map((amenity, i) => (
            <div key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md text-[9px] font-medium text-gray-500">
              {amenity === 'WiFi' && <Wifi className="w-2.5 h-2.5" />}
              {amenity === 'Parking' && <Car className="w-2.5 h-2.5" />}
              {(amenity === 'AC' || amenity === 'Air Conditioning') && <Waves className="w-2.5 h-2.5" />}
              {amenity}
            </div>
          ))}
        </div>

        <Button
          className="w-full h-10 bg-gray-900 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
        >
          <Calendar className="w-3.5 h-3.5" />
          Book Now
        </Button>
      </div>
    </div>
  )
}
