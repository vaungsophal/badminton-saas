'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { RealtimeNotifications } from './realtime-notifications'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Settings } from 'lucide-react'

export function DashboardNav() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  const [menuOpen, setMenuOpen] = useState(false)

  if (!user) return null

  const navLinks = [
    ...(user.role === 'admin' ? [
      { href: '/admin', label: 'Admin Dashboard' },
      { href: '/admin/courts', label: 'Manage Courts' },
    ] : []),
    ...(user.role === 'club_owner' ? [
      { href: '/company', label: 'Owner Dashboard' },
      { href: '/dashboard/bookings', label: 'Bookings' },
    ] : []),
    ...(user.role === 'customer' ? [
      { href: '/dashboard', label: 'Browse Courts' },
      { href: '/dashboard/my-bookings', label: 'My Bookings' },
    ] : []),
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-gray-900">Badminton Pro</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              <RealtimeNotifications />
              <Link href="/dashboard/settings" className="text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
              </Link>
              <div className="text-sm text-right">
                <p className="text-gray-900 font-medium leading-none mb-1">{user.email.split('@')[0]}</p>
                <p className="text-gray-500 text-xs capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>

            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="hidden sm:flex gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center px-3 mb-4">
              <div className="flex-1">
                <p className="text-base font-medium text-gray-800">{user.email}</p>
                <p className="text-sm font-medium text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <RealtimeNotifications />
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
