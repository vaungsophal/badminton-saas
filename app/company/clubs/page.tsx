'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Edit2, Trash2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ClubsPage() {
  const { user } = useAuth()
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClubs()
  }, [user])

  async function fetchClubs() {
    try {
      if (!user?.id) return

      const { data, error: fetchError } = await supabase
        .from('clubs')
        .select('*')
        .eq('owner_id', user.id)

      if (fetchError) throw fetchError

      setClubs(data || [])
      setLoading(false)
    } catch (err) {
      console.error('[v0] Error fetching clubs:', err)
      setError('Failed to load clubs')
      setLoading(false)
    }
  }

  async function deleteClub(clubId: string) {
    if (!confirm('Are you sure you want to delete this club?')) return

    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', clubId)
        .eq('owner_id', user?.id)

      if (error) throw error

      setClubs(clubs.filter(c => c.id !== clubId))
    } catch (err) {
      console.error('[v0] Error deleting club:', err)
      setError('Failed to delete club')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clubs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clubs Management</h1>
          <p className="text-gray-600 mt-2">Manage your badminton clubs and venues</p>
        </div>
        <Link href="/company/clubs/new">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" />
            Add Club
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {clubs.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-gray-600 mb-4">No clubs yet. Create your first club to get started.</p>
            <Link href="/company/clubs/new">
              <Button className="bg-blue-600 hover:bg-blue-700">Create First Club</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Card key={club.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {club.image_url && (
                <img
                  src={club.image_url || "/placeholder.svg"}
                  alt={club.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardHeader>
                <CardTitle className="text-lg">{club.name}</CardTitle>
                <CardDescription className="flex gap-1 mt-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {club.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{club.description}</p>
                <div className="flex gap-2">
                  <Link href={`/company/clubs/${club.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteClub(club.id)}
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
