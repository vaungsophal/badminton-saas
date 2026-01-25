'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, TrendingUp, Trash2, Check, X, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Court {
    id: string
    name: string
    owner: string
    location: string
    courts: number
    status: 'active' | 'pending' | 'suspended'
    rating: number
    bookings: number
}

export default function AdminCourtsPage() {
    const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all')
    const [search, setSearch] = useState('')

    const courts: Court[] = [
        {
            id: '1',
            name: 'Downtown Badminton Club',
            owner: 'John Business',
            location: 'City Center',
            courts: 4,
            status: 'active',
            rating: 4.8,
            bookings: 245,
        },
        {
            id: '2',
            name: 'Sports Arena',
            owner: 'Sports Management Inc',
            location: 'North District',
            courts: 6,
            status: 'active',
            rating: 4.6,
            bookings: 198,
        },
        {
            id: '3',
            name: 'New Club',
            owner: 'Pending Owner',
            location: 'South Park',
            courts: 3,
            status: 'pending',
            rating: 0,
            bookings: 0,
        },
        {
            id: '4',
            name: 'Old Town Hall',
            owner: 'Legacy Sports',
            location: 'East Side',
            courts: 2,
            status: 'suspended',
            rating: 3.2,
            bookings: 12,
        },
    ]

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
                {(['all', 'pending', 'active', 'suspended'] as const).map((f) => (
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
                {filteredCourts.map((court) => (
                    <Card key={court.id} className="p-6 transition-all hover:shadow-md border border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${court.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : court.status === 'pending'
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
                                        <p className="text-xs text-gray-400 uppercase font-medium">Courts</p>
                                        <p className="font-semibold text-gray-900">{court.courts}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-400 uppercase font-medium">Bookings</p>
                                        <p className="font-semibold text-gray-900">{court.bookings}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-400 uppercase font-medium">Rating</p>
                                        <p className="font-semibold text-yellow-600 flex items-center gap-1">
                                            ⭐ {court.rating}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-400 uppercase font-medium">Revenue</p>
                                        <p className="font-semibold text-gray-900">${(court.bookings * 15).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex shrink-0 gap-3">
                                {court.status === 'pending' && (
                                    <>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-red-600 border-red-100 hover:bg-red-50 min-w-[100px]"
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}
                                {court.status === 'active' && (
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-red-100 hover:bg-red-50 min-w-[100px]"
                                    >
                                        Suspend
                                    </Button>
                                )}
                                {court.status === 'suspended' && (
                                    <Button
                                        variant="outline"
                                        className="text-green-600 border-green-100 hover:bg-green-50 min-w-[100px]"
                                    >
                                        Activate
                                    </Button>
                                )}
                                <Button variant="ghost" className="text-gray-400">
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
