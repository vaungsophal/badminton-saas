'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function NewCourtPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clubs, setClubs] = useState<any[]>([])
  const [formData, setFormData] = useState({
    club_id: '',
    court_name: '',
    price_per_hour: '',
    available_time_slots: '',
    status: 'open',
  })

  useEffect(() => {
    fetchClubs()
  }, [user])

  async function fetchClubs() {
    try {
      if (!user?.id) return

      const { data } = await supabase
        .from('clubs')
        .select('*')
        .eq('owner_id', user.id)

      if (data && data.length > 0) {
        setClubs(data)
        setFormData({ ...formData, club_id: data[0].id })
      }
    } catch (err) {
      console.error('[v0] Error fetching clubs:', err)
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

      const { error: insertError } = await supabase
        .from('courts')
        .insert([
          {
            owner_id: user.id,
            club_id: formData.club_id,
            court_name: formData.court_name,
            price_per_hour: parseFloat(formData.price_per_hour),
            available_time_slots: formData.available_time_slots || '8',
            status: formData.status,
          },
        ])

      if (insertError) throw insertError

      router.push('/company/courts')
    } catch (err) {
      console.error('[v0] Error creating court:', err)
      setError((err as any).message || 'Failed to create court')
    } finally {
      setLoading(false)
    }
  }

  if (clubs.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl mx-auto">
        <Link href="/company/courts" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Courts
        </Link>

        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-gray-600 mb-4">Please create a club first before adding courts.</p>
            <Link href="/company/clubs/new">
              <Button className="bg-blue-600 hover:bg-blue-700">Create Club</Button>
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
          <CardTitle>Create New Court</CardTitle>
          <CardDescription>Add a new badminton court to your club</CardDescription>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Time Slots</label>
                <input
                  type="number"
                  min="1"
                  value={formData.available_time_slots}
                  onChange={(e) => setFormData({ ...formData, available_time_slots: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 8"
                />
              </div>
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

            <div className="flex gap-3 pt-4">
              <Link href="/company/courts" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {loading ? 'Creating...' : 'Create Court'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
