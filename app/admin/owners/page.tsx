'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCheck, UserX, Building2, Mail, Phone, ExternalLink, ShieldAlert } from 'lucide-react'

interface Owner {
    id: string
    name: string
    email: string
    phone: string
    company: string
    courts: number
    status: 'active' | 'pending' | 'suspended'
    joinedDate: string
}

export default function AdminOwnersPage() {
    const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')

    const owners: Owner[] = [
        {
            id: '1',
            name: 'John Business',
            email: 'john@example.com',
            phone: '+1 234 567 890',
            company: 'Downtown Badminton Club',
            courts: 4,
            status: 'active',
            joinedDate: '2025-10-12',
        },
        {
            id: '2',
            name: 'Sarah Smith',
            email: 'sarah@sportsmgmt.com',
            phone: '+1 987 654 321',
            company: 'Sports Arena',
            courts: 6,
            status: 'active',
            joinedDate: '2025-11-05',
        },
        {
            id: '3',
            name: 'Mike Pending',
            email: 'mike@newclub.com',
            phone: '+1 555 123 456',
            company: 'New Club',
            courts: 0,
            status: 'pending',
            joinedDate: '2026-01-20',
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Club Owners</h1>
                    <p className="text-gray-600">Register and manage platform partners</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">Add New Owner</Button>
            </div>

            <div className="flex gap-4 p-1 bg-gray-100 rounded-lg w-fit">
                {(['all', 'pending', 'active'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-md transition-all ${filter === f
                            ? 'bg-white text-blue-600 shadow-sm font-semibold'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {owners.map((owner) => (
                    <Card key={owner.id} className="p-6 border border-gray-100 hover:shadow-lg transition-shadow bg-white">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{owner.name}</h3>
                                    <p className="text-sm text-gray-500">{owner.company}</p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${owner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {owner.status}
                            </span>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                <Mail className="w-4 h-4" />
                                <span>{owner.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                <Phone className="w-4 h-4" />
                                <span>{owner.phone}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm pt-2">
                                <span className="text-gray-400">Courts Managed</span>
                                <span className="font-bold text-gray-900">{owner.courts}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Joined Date</span>
                                <span className="font-medium text-gray-700">{owner.joinedDate}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {owner.status === 'pending' ? (
                                <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2">
                                    <UserCheck className="w-4 h-4" />
                                    Approve
                                </Button>
                            ) : (
                                <Button variant="outline" className="flex-1 text-red-600 border-red-100 hover:bg-red-50 gap-2">
                                    <ShieldAlert className="w-4 h-4" />
                                    Suspend
                                </Button>
                            )}
                            <Button variant="secondary" className="px-3" title="View Details">
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
