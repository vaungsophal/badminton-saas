'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { LocationPicker } from '@/components/location-picker'
import { ImageUpload } from '@/components/image-upload'

export default function EditClubPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [club, setClub] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    phone: '',
    email: '',
    images: [] as string[],
  })

  useEffect(() => {
    fetchClub()
  }, [params.id])

  async function fetchClub() {
    try {
      if (!user?.id || !params.id) return

      const response = await fetch(`/api/clubs?id=${params.id}&owner_id=${user.id}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Club not found or unauthorized')
        }
        throw new Error(data.error || 'Failed to fetch club')
      }

      setClub(data)
      setFormData({
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        latitude: data.latitude || 11.5564,
        longitude: data.longitude || 104.9282,
        phone: data.phone || '',
        email: data.email || '',
        images: data.images || [],
      })
      setFetchLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching club:', err)
      setError((err as any).message || 'Failed to load club')
      setFetchLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      if (!formData.name || !formData.address) {
        throw new Error('Please fill in all required fields')
      }

      const response = await fetch(`/api/clubs?id=${params.id}&owner_id=${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          phone: formData.phone,
          email: formData.email,
          images: formData.images,
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to update club')

      router.push('/company/clubs')
    } catch (err) {
      console.error('[v0] Error updating club:', err)
      setError((err as any).message || 'Failed to update club')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading club...</p>
        </div>
      </div>
    )
  }

  if (error && !club) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
        <Link href="/company/clubs" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Clubs
        </Link>

        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-red-600">{error}</p>
            <Link href="/company/clubs" className="mt-4 inline-block">
              <Button className="bg-blue-600 hover:bg-blue-700">Back to Clubs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
      <Link href="/company/clubs" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Clubs
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Club</CardTitle>
          <CardDescription>Update club information for {club?.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Downtown Badminton Club"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your club..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club Location *</label>
              <LocationPicker 
                onLocationSelect={(lat, lng, address) => {
                  setFormData({ 
                    ...formData, 
                    address, 
                    latitude: lat, 
                    longitude: lng 
                  })
                }}
                initialLat={formData.latitude}
                initialLng={formData.longitude}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club Images</label>
              <ImageUpload
                onImagesChange={(images) => setFormData({ ...formData, images })}
                initialImages={formData.images}
                maxImages={5}
                folder="clubs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@club.com"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Link href="/company/clubs" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {loading ? 'Updating...' : 'Update Club'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}