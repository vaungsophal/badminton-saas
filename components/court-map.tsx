'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'

// TypeScript declaration for Google Maps
declare global {
  interface Window {
    google: any
  }
}

interface CourtLocation {
  id: string
  name: string
  lat: number
  lng: number
  address: string
}

interface CourtMapProps {
  courts: CourtLocation[]
  selectedCourtId?: string
}

export function CourtMap({ courts, selectedCourtId }: CourtMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initMap
      script.onerror = () => {
        console.error('Failed to load Google Maps script')
        setLoading(false)
      }
      document.head.appendChild(script)
    } else {
      initMap()
    }
  }, [courts])

  const initMap = () => {
    if (!mapContainer.current || !window.google) return

    // Center on first court or default location
    const center = courts.length > 0 
      ? { lat: courts[0].lat, lng: courts[0].lng }
      : { lat: 40.7128, lng: -74.006 }

    map.current = new window.google.maps.Map(mapContainer.current, {
      zoom: 12,
      center,
      mapTypeControl: false,
      fullscreenControl: false,
    })

    // Add markers for each court
    courts.forEach((court) => {
      const marker = new window.google.maps.Marker({
        position: { lat: court.lat, lng: court.lng },
        map: map.current,
        title: court.name,
        icon: selectedCourtId === court.id 
          ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="padding: 10px;">
          <h3 style="font-weight: bold; margin: 0 0 5px 0;">${court.name}</h3>
          <p style="margin: 0; font-size: 12px;">${court.address}</p>
        </div>`,
      })

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker)
      })
    })

    setLoading(false)
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200">
      {loading && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}

// Browse courts page component using the map
export function BrowseCourtsWithMap() {
  const [selectedCourtId, setSelectedCourtId] = useState<string>('1')

  const courts: CourtLocation[] = [
    {
      id: '1',
      name: 'Downtown Badminton Club',
      lat: 40.7128,
      lng: -74.006,
      address: 'City Center',
    },
    {
      id: '2',
      name: 'Sports Arena',
      lat: 40.7580,
      lng: -73.9855,
      address: 'North District',
    },
    {
      id: '3',
      name: 'Community Sports Hall',
      lat: 40.6892,
      lng: -74.0445,
      address: 'South Park',
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      <div className="lg:col-span-2">
        <CourtMap courts={courts} selectedCourtId={selectedCourtId} />
      </div>
      <div className="overflow-y-auto space-y-3">
        {courts.map((court) => (
          <button
            key={court.id}
            onClick={() => setSelectedCourtId(court.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
              selectedCourtId === court.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <MapPin className={`w-5 h-5 flex-shrink-0 ${
                selectedCourtId === court.id ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <div>
                <h3 className="font-semibold text-gray-900">{court.name}</h3>
                <p className="text-sm text-gray-600">{court.address}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
