'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Users,
    Search,
    Trash2,
    UserMinus,
    MoreVertical,
    Mail,
    Calendar,
    Shield
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface User {
    id: string
    name: string
    email: string
    role: 'customer' | 'club_owner' | 'admin'
    joinedDate: string
    status: 'active' | 'suspended'
}

export default function AdminUsersPage() {
    const [search, setSearch] = useState('')

    const users: User[] = [
        {
            id: '1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'customer',
            joinedDate: '2025-12-15',
            status: 'active',
        },
        {
            id: '2',
            name: 'Bob Smith',
            email: 'bob@example.com',
            role: 'customer',
            joinedDate: '2026-01-02',
            status: 'active',
        },
        {
            id: '3',
            name: 'Charlie Brown',
            email: 'charlie@owner.com',
            role: 'club_owner',
            joinedDate: '2025-10-20',
            status: 'active',
        },
        {
            id: '4',
            name: 'Doris Day',
            email: 'doris@example.com',
            role: 'customer',
            joinedDate: '2026-01-10',
            status: 'suspended',
        },
    ]

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                    <p className="text-gray-600">View and manage all platform participants</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        className="pl-10 w-64 shadow-sm border-gray-200"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card className="overflow-hidden border-gray-100 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Role</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Joined Date</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-700'
                                            : user.role === 'club_owner'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {user.joinedDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-2 text-sm ${user.status === 'active' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
                                            }`}>
                                            <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {user.status === 'active' ? (
                                                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" title="Suspend User">
                                                    <UserMinus className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50" title="Activate User">
                                                    <Shield className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" className="text-gray-400">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
