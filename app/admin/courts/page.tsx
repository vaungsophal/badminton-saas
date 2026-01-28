'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, TrendingUp, Trash2, Check, X, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

interface Court {
    id: string
    name: string
    owner: string
    location: string
    courts: number
    status: 'open' | 'closed' | 'maintenance'
    rating: number
    bookings: number
    price_per_hour: number
    revenue: number
    club_name: string
    created_at: string
    updated_at: string
}

export default function AdminCourtsPage() {
    const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'maintenance'>('all')
    const [search, setSearch] = useState('')
    const [courts, setCourts] = useState<Court[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        fetchCourts()
    }, [filter, search])

    const fetchCourts = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (filter !== 'all') params.append('status', filter)
            if (search) params.append('search', search)

            const response = await fetch(`/api/admin/courts?${params}`)
            if (!response.ok) throw new Error('Failed to fetch courts')
            
            const data = await response.json()
            setCourts(data.courts || [])
        } catch (error) {
            console.error('Error fetching courts:', error)
            toast({ title: 'Error', description: 'Failed to load courts', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const updateCourtStatus = async (courtId: string, newStatus: string) => {
        try {
            setActionLoading(courtId)
            const response = await fetch(`/api/admin/courts?id=${courtId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) throw new Error('Failed to update court')
            
            toast({ title: 'Success', description: `Court ${newStatus} successfully` })
            fetchCourts()
        } catch (error) {
            console.error('Error updating court:', error)
            toast({ title: 'Error', description: 'Failed to update court', variant: 'destructive' })
        } finally {
            setActionLoading(null)
        }
    }

    const deleteCourt = async (courtId: string) => {
        if (!confirm('Are you sure you want to delete this court? This action cannot be undone.')) {
            return
        }

        try {
            setActionLoading(courtId)
            const response = await fetch(`/api/admin/courts?id=${courtId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete court')
            }
            
            toast({ title: 'Success', description: 'Court deleted successfully' })
            fetchCourts()
        } catch (error) {
            console.error('Error deleting court:', error)
            toast({ 
                title: 'Error', 
                description: error instanceof Error ? error.message : 'Failed to delete court',
                variant: 'destructive' 
            })
        } finally {
            setActionLoading(null)
        }
    }

    const filteredCourts = courts.filter(court => {
        if (filter !== 'all' && court.status !== filter) return false
        if (search && !court.name.toLowerCase().includes(search.toLowerCase()) && !court.owner.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Court Management</h1>
                    <p className="text-gray-600">Review and manage all courts on the platform</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            className="pl-10 w-64"
                            placeholder="Search courts or owners..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                {(['all', 'open', 'closed', 'maintenance'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-md transition-all ${filter === f
                                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : filteredCourts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No courts found</p>
                    </div>
                ) : (
                    filteredCourts.map((court) => (
                        <Card key={court.id} className="p-6 transition-all hover:shadow-md border border-gray-100">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${court.status === 'open'
                                                    ? 'bg-green-100 text-green-700'
                                                    : court.status === 'maintenance'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {court.status.charAt(0).toUpperCase() + court.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4" />
                                            {court.owner}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {court.location}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400 uppercase font-medium">Price/Hour</p>
                                            <p className="font-semibold text-gray-900">${court.price_per_hour}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400 uppercase font-medium">Bookings</p>
                                            <p className="font-semibold text-gray-900">{court.bookings}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400 uppercase font-medium">Rating</p>
                                            <p className="font-semibold text-yellow-600 flex items-center gap-1">
                                                ⭐ {court.rating.toFixed(1)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400 uppercase font-medium">Revenue</p>
                                            <p className="font-semibold text-gray-900">${court.revenue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex shrink-0 gap-3">
                                    {court.status === 'maintenance' && (
                                        <>
                                            <Button
                                                className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                                                onClick={() => updateCourtStatus(court.id, 'open')}
                                                disabled={actionLoading === court.id}
                                            >
                                                {actionLoading === court.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Open'
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="text-red-600 border-red-100 hover:bg-red-50 min-w-[100px]"
                                                onClick={() => updateCourtStatus(court.id, 'closed')}
                                                disabled={actionLoading === court.id}
                                            >
                                                {actionLoading === court.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Close'
                                                )}
                                            </Button>
                                        </>
                                    )}
                                    {court.status === 'open' && (
                                        <Button
                                            variant="outline"
                                            className="text-red-600 border-red-100 hover:bg-red-50 min-w-[100px]"
                                            onClick={() => updateCourtStatus(court.id, 'closed')}
                                            disabled={actionLoading === court.id}
                                        >
                                            {actionLoading === court.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Close'
                                            )}
                                        </Button>
                                    )}
                                    {court.status === 'closed' && (
                                        <Button
                                            variant="outline"
                                            className="text-green-600 border-green-100 hover:bg-green-50 min-w-[100px]"
                                            onClick={() => updateCourtStatus(court.id, 'open')}
                                            disabled={actionLoading === court.id}
                                        >
                                            {actionLoading === court.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Open'
                                            )}
                                        </Button>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        className="text-gray-400"
                                        onClick={() => deleteCourt(court.id)}
                                        disabled={actionLoading === court.id}
                                    >
                                        {actionLoading === court.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}