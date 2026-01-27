'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, AlertCircle, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function CourtsPage() {
  const { user } = useAuth()
  const [courts, setCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourts()
  }, [user])

async function fetchCourts() {
    try {
      if (!user?.id) return

      const response = await fetch(`/api/courts?owner_id=${user.id}`)
      const data = await response.json()
 
      if (!response.ok) throw new Error(data.error || 'Failed to fetch courts')
 
      setCourts(data.courts || [])
      setLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching courts:', err)
      setError('Failed to load courts')
      setLoading(false)
    }
  }

async function deleteCourt(courtId: string) {
    if (!confirm('Are you sure you want to delete this court?')) return

    try {
      const response = await fetch(`/api/courts?id=${courtId}&owner_id=${user?.id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to delete court')

      setCourts(courts.filter(c => c.id !== courtId))
    } catch (err) {
      console.error('[v0] Error deleting court:', err)
      setError('Failed to delete court')
    }
  }

async function toggleStatus(courtId: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'open' ? 'maintenance' : 'open'
      const response = await fetch(`/api/courts?id=${courtId}&owner_id=${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to update court status')

      setCourts(courts.map(c => c.id === courtId ? { ...c, status: newStatus } : c))
    } catch (err) {
      console.error('[v0] Error updating court status:', err)
      setError('Failed to update court status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courts Management</h1>
          <p className="text-gray-600 mt-2">Manage your badminton courts and time slots</p>
        </div>
        <Link href="/company/courts/new">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" />
            Add Court
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {courts.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-gray-600 mb-4">No courts yet. Create your first court to get started.</p>
            <Link href="/company/courts/new">
              <Button className="bg-blue-600 hover:bg-blue-700">Create First Court</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{courts.map((court) => (
            <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {court.images && court.images.length > 0 ? (
                <img
                  src={court.images[0] || "/placeholder.jpg"}
                  alt={court.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.jpg"
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{court.name}</CardTitle>
                    <CardDescription className="mt-1">{court.club_name}</CardDescription>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      court.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {court.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">${court.price_per_hour}/hour</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{court.available_time_slots || 'Multiple'} slots</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/company/courts/${court.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(court.id, court.status)}
                    className="flex-1"
                  >
                    {court.status === 'open' ? 'Close' : 'Open'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCourt(court.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
