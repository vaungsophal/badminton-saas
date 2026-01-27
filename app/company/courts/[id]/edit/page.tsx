'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ImageUpload } from '@/components/image-upload'

export default function EditCourtPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [court, setCourt] = useState<any>(null)
  const [clubs, setClubs] = useState<any[]>([])
  const [formData, setFormData] = useState({
    club_id: '',
    court_name: '',
    price_per_hour: '',
    status: 'open',
    images: [] as string[],
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  async function fetchData() {
    try {
      if (!user?.id || !params.id) return

      // Fetch court details
      const courtResponse = await fetch(`/api/courts?id=${params.id}`)
      const courtData = await courtResponse.json()

      if (!courtResponse.ok) {
        if (courtResponse.status === 404) {
          throw new Error('Court not found')
        }
        throw new Error(courtData.error || 'Failed to fetch court')
      }

      setCourt(courtData)

      // Fetch clubs for dropdown
      const clubsResponse = await fetch(`/api/clubs?owner_id=${user.id}`)
      const clubsData = await clubsResponse.json()

      if (!clubsResponse.ok) {
        throw new Error(clubsData.error || 'Failed to fetch clubs')
      }

      const userClubs = clubsData.clubs || []
      setClubs(userClubs)

      // Set form data
      setFormData({
        club_id: courtData.club_id || (userClubs.length > 0 ? userClubs[0].id : ''),
        court_name: courtData.name || '',
        price_per_hour: courtData.price_per_hour?.toString() || '',
        status: courtData.status || 'open',
        images: courtData.images || [],
      })

      setFetchLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching court data:', err)
      setError((err as any).message || 'Failed to load court data')
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

      if (!formData.club_id || !formData.court_name || !formData.price_per_hour) {
        throw new Error('Please fill in all required fields')
      }

      const response = await fetch(`/api/courts?id=${params.id}&owner_id=${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          club_id: formData.club_id,
          court_name: formData.court_name,
          price_per_hour: parseFloat(formData.price_per_hour),
          status: formData.status,
          images: formData.images,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to update court')

      router.push('/company/courts')
    } catch (err) {
      console.error('[v0] Error updating court:', err)
      setError((err as any).message || 'Failed to update court')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading court...</p>
        </div>
      </div>
    )
  }

  if (error && !court) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
        <Link href="/company/courts" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Courts
        </Link>

        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-red-600">{error}</p>
            <Link href="/company/courts" className="mt-4 inline-block">
              <Button className="bg-blue-600 hover:bg-blue-700">Back to Courts</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
      <Link href="/company/courts" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Courts
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Court</CardTitle>
          <CardDescription>Update court information for {court?.name}</CardDescription>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Club *</label>
              <select
                required
                value={formData.club_id}
                onChange={(e) => setFormData({ ...formData, club_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a club</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court Name/Number *</label>
              <input
                type="text"
                required
                value={formData.court_name}
                onChange={(e) => setFormData({ ...formData, court_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Court A or Court 1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price_per_hour}
                  onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 25.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court Images</label>
              <ImageUpload
                onImagesChange={(images) => setFormData({ ...formData, images })}
                initialImages={formData.images}
                maxImages={5}
                folder="courts"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Link href="/company/courts" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {loading ? 'Updating...' : 'Update Court'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}