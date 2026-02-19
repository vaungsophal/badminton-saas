'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, Search, Calendar, Bell, User } from 'lucide-react'
import { useAuth } from './auth-provider'

export function BottomNav() {
    const { user } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    if (!user || user.role !== 'customer') return null

    const navItems = [
        { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
        { icon: Search, label: 'Explore', href: '/dashboard/browse' },
        { icon: Calendar, label: 'Bookings', href: '/dashboard/my-bookings' },
        { icon: Bell, label: 'Alerts', href: '/dashboard/alerts' },
        { icon: User, label: 'Profile', href: '/dashboard/settings' },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-gray-100 px-2 flex items-center justify-around md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                    <button
                        key={item.label}
                        onClick={() => item.href && router.push(item.href)}
                        className={`flex flex-col items-center justify-center gap-1 px-4 py-1 rounded-2xl transition-all ${
                            isActive 
                                ? 'text-emerald-500' 
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-emerald-50' : ''}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-500' : 'text-gray-400'}`}>
                            {item.label}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
