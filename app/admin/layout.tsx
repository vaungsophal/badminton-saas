'use client'

import React from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard,
    Users,
    Building2,
    CalendarCheck,
    Settings,
    LogOut,
    ShieldCheck
} from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading, signOut } = useAuth()
    const router = useRouter()

useEffect(() => {
        if (loading) return // Don't redirect while loading

        if (!user) {
            console.log('Admin layout - no user, redirecting to auth')
            router.push('/auth')
            return
        }

        if (user.role !== 'admin') {
            console.log('Admin layout - user role mismatch, redirecting. User role:', user.role)
            router.push(user.role === 'club_owner' ? '/company' : '/dashboard')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user || user.role !== 'admin') return null

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { label: 'Club Owners', icon: Building2, href: '/admin/owners' },
        { label: 'Courts', icon: Building2, href: '/admin/courts' },
        { label: 'All Bookings', icon: CalendarCheck, href: '/admin/bookings' },
        { label: 'Users', icon: Users, href: '/admin/users' },
        { label: 'Platform Settings', icon: Settings, href: '/admin/settings' },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full shadow-sm">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl text-gray-900">Admin Pro</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                        >
                            <item.icon className="w-5 h-5 group-hover:text-blue-600" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                            <p className="text-xs text-gray-500">Platform Manager</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 md:hidden shadow-sm">
                    <span className="font-bold text-xl text-gray-900">Admin Pro</span>
                    <button className="p-2 text-gray-500">
                        <LayoutDashboard className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
