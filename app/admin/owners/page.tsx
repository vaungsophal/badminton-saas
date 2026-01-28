'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCheck, UserX, Building2, Mail, Phone, ExternalLink, ShieldAlert } from 'lucide-react'

interface Owner {
    id: string
    full_name: string
    email: string
    phone: string
    company_name: string
    status: 'active' | 'suspended'
    is_verified: boolean
    created_at: string
    club_count: number
    court_count: number
}

export default function AdminOwnersPage() {
    const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')
    const [owners, setOwners] = useState<Owner[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOwners()
    }, [filter])

    const fetchOwners = async () => {
        try {
            const params = new URLSearchParams()
            if (filter !== 'all') {
                params.append('status', filter)
            }
            const response = await fetch(`/api/owners?${params.toString()}`)
            const data = await response.json()
            setOwners(data.owners || [])
        } catch (error) {
            console.error('Error fetching owners:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (ownerId: string) => {
        try {
            const response = await fetch(`/api/owners?id=${ownerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_verified: true, status: 'active' })
            })
            if (response.ok) {
                fetchOwners()
            }
        } catch (error) {
            console.error('Error approving owner:', error)
        }
    }

    const handleSuspend = async (ownerId: string) => {
        try {
            const response = await fetch(`/api/owners?id=${ownerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'suspended' })
            })
            if (response.ok) {
                fetchOwners()
            }
        } catch (error) {
            console.error('Error suspending owner:', error)
        }
    }

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

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading owners...</div>
                </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {owners.map((owner) => (
                    <Card key={owner.id} className="p-6 border border-gray-100 hover:shadow-lg transition-shadow bg-white">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
<div>
                                    <h3 className="font-bold text-gray-900 text-lg">{owner.full_name}</h3>
                                    <p className="text-sm text-gray-500">{owner.company_name || 'No company'}</p>
                                </div>
                            </div>
<span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                owner.is_verified && owner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {owner.is_verified && owner.status === 'active' ? 'active' : 'pending'}
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
                                <span className="font-bold text-gray-900">{owner.court_count}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Joined Date</span>
                                <span className="font-medium text-gray-700">{new Date(owner.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

<div className="flex gap-2">
                            {(!owner.is_verified || owner.status !== 'active') ? (
                                <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2" onClick={() => handleApprove(owner.id)}>
                                    <UserCheck className="w-4 h-4" />
                                    Approve
                                </Button>
                            ) : (
                                <Button variant="outline" className="flex-1 text-red-600 border-red-100 hover:bg-red-50 gap-2" onClick={() => handleSuspend(owner.id)}>
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
            )}
        </div>
    )
}
