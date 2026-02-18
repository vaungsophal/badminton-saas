'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Clock, Star, ChevronLeft, Phone, Mail, Wifi, Car, Waves, Users, Calendar, Navigation, MessageSquare } from 'lucide-react'

interface Court {
  id: string
  name: string
  price_per_hour: number
  images: string[]
  available_slots?: number
}

interface Review {
  id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
}

interface Club {
  id: string
  name: string
  address: string
  description: string
  phone: string
  email: string
  images: string[]
  rating: number
  review_count: number
  amenities: string[]
  latitude?: number
  longitude?: number
}

export default function ClubDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const clubId = params.clubId as string

  const [club, setClub] = useState<Club | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'courts' | 'info' | 'reviews'>('courts')

  useEffect(() => {
    fetchClubData()
  }, [clubId])

  const fetchClubData = async () => {
    try {
      const [clubRes, courtsRes, reviewsRes] = await Promise.all([
        fetch(`/api/clubs/${clubId}`),
        fetch(`/api/clubs/${clubId}/courts`),
        fetch(`/api/clubs/${clubId}/reviews`)
      ])

      if (clubRes.ok) setClub(await clubRes.json())
      if (courtsRes.ok) {
        const data = await courtsRes.json()
        setCourts(data.courts || [])
      }
      if (reviewsRes.ok) {
        const data = await reviewsRes.json()
        setReviews(data.reviews || [])
      }
    } catch (err) {
      console.error('Error fetching club data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="pb-20 space-y-4">
        <div className="h-48 bg-gray-200 rounded-b-3xl animate-pulse" />
        <div className="px-4 space-y-4">
          <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="pb-20 text-center py-12">
        <p className="text-gray-500">Club not found</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="relative h-48 sm:h-56 bg-gray-200">
        {club.images?.[0] ? (
          <img src={club.images[0]} alt={club.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-orange-300" />
          </div>
        )}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-t-3xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{club.name}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {club.address}
              </p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 rounded-full">
              <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-sm font-bold text-orange-600">{club.rating?.toFixed(1) || '4.5'}</span>
              <span className="text-xs text-gray-400">({club.review_count || 0})</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            {(['courts', 'info', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab === 'courts' ? `Courts (${courts.length})` : 
                 tab === 'info' ? 'Info' : 
                 `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'courts' && (
          <div className="mt-4 space-y-3">
            {courts.length > 0 ? (
              courts.map((court) => (
                <div
                  key={court.id}
                  onClick={() => router.push(`/dashboard/book/${court.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    {court.images?.[0] ? (
                      <img src={court.images[0]} alt={court.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{court.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded">
                        <Clock className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-medium text-green-600">{court.available_slots || 5} slots</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-orange-500">${court.price_per_hour}<span className="text-xs font-normal text-gray-400">/hr</span></span>
                      <Button size="sm" className="h-8 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm">
                        Book
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No courts available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="mt-4 space-y-4">
            <Card className="rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{club.description || 'No description available.'}</p>
            </Card>

            <Card className="rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
              <div className="space-y-3">
                {club.phone && (
                  <a href={`tel:${club.phone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-orange-500">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    {club.phone}
                  </a>
                )}
                {club.email && (
                  <a href={`mailto:${club.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-orange-500">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    {club.email}
                  </a>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  {club.address}
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {(club.amenities || []).map((amenity, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-600">
                    {amenity === 'WiFi' && <Wifi className="w-3.5 h-3.5" />}
                    {amenity === 'Parking' && <Car className="w-3.5 h-3.5" />}
                    {(amenity === 'AC' || amenity === 'Air Conditioning') && <Waves className="w-3.5 h-3.5" />}
                    {amenity}
                  </div>
                ))}
              </div>
            </Card>

            {club.latitude && club.longitude && (
              <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">View on map</p>
                  </div>
                </div>
                <div className="p-3">
                  <Button variant="outline" className="w-full h-10 text-sm font-medium rounded-lg">
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="mt-4 space-y-3">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                        {review.user_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{review.user_name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-orange-500 fill-orange-500' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No reviews yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
