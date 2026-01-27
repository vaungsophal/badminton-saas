'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin, Crosshair } from 'lucide-react'

// Global variable to track if Google Maps script is loading
let isGoogleMapsLoading = false

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  initialLat?: number
  initialLng?: number
}

export function LocationPicker({ onLocationSelect, initialLat = 11.5564, initialLng = 104.9282 }: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const marker = useRef<any>(null)
  const geocoder = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [address, setAddress] = useState('')
  const [currentLocation, setCurrentLocation] = useState({ lat: initialLat, lng: initialLng })

  useEffect(() => {
    // Load Google Maps script
    if (!window.google && !isGoogleMapsLoading) {
      isGoogleMapsLoading = true
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        isGoogleMapsLoading = false
        initMap()
      }
      script.onerror = () => {
        isGoogleMapsLoading = false
        console.error('Failed to load Google Maps')
        setLoading(false)
      }
      document.head.appendChild(script)
    } else if (window.google) {
      initMap()
    }
  }, [])

  const initMap = () => {
    if (!mapContainer.current || !window.google) return

    // Initialize map
    map.current = new window.google.maps.Map(mapContainer.current, {
      zoom: 13,
      center: { lat: currentLocation.lat, lng: currentLocation.lng },
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: true,
    })

    // Initialize geocoder
    geocoder.current = new window.google.maps.Geocoder()

    // Add initial marker
    marker.current = new window.google.maps.Marker({
      position: { lat: currentLocation.lat, lng: currentLocation.lng },
      map: map.current,
      draggable: true,
    })

    // Handle marker drag
    marker.current.addListener('dragend', (event: any) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      setCurrentLocation({ lat, lng })
      reverseGeocode(lat, lng)
    })

    // Handle map click
    map.current.addListener('click', (event: any) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      updateLocation(lat, lng)
    })

    // Get initial address
    reverseGeocode(currentLocation.lat, currentLocation.lng)
    setLoading(false)
  }

  const updateLocation = (lat: number, lng: number) => {
    setCurrentLocation({ lat, lng })
    if (marker.current) {
      marker.current.setPosition({ lat, lng })
    }
    if (map.current) {
      map.current.setCenter({ lat, lng })
    }
    reverseGeocode(lat, lng)
  }

  const reverseGeocode = (lat: number, lng: number) => {
    if (!geocoder.current) return

    geocoder.current.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const formattedAddress = results[0].formatted_address
        setAddress(formattedAddress)
        onLocationSelect(lat, lng, formattedAddress)
      }
    })
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          updateLocation(latitude, longitude)
        },
        (error) => {
          console.error('Error getting current location:', error)
        }
      )
    }
  }

  const handleAddressSearch = (searchAddress: string) => {
    if (!geocoder.current) return

    geocoder.current.geocode({ address: searchAddress }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const { lat, lng } = results[0].geometry.location
        updateLocation(lat(), lng())
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search for an address..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddressSearch(e.currentTarget.value)
            }
          }}
        />
        <button
          onClick={handleGetCurrentLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Crosshair className="w-4 h-4" />
          Use My Location
        </button>
      </div>

      {/* Selected Address */}
      {address && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Selected Location</p>
              <p className="text-sm text-blue-700">{address}</p>
              <p className="text-xs text-blue-600 mt-1">
                Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200">
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

      <p className="text-sm text-gray-600">
        Click on the map or drag the marker to select the exact location of your club.
      </p>
    </div>
  )
}