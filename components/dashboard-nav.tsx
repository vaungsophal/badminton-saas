'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { Settings, LogOut, ChevronDown } from 'lucide-react'

export function DashboardNav() {
  const { user, signOut } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  if (!user) return null

  return (
    <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo-main.png" alt="badmintonzone.com" className="h-10" />
          </Link>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-2 py-1.5 hover:bg-gray-50 rounded-full transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {profileOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
            <div className="absolute top-14 right-4 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900 text-sm truncate">{user.email?.split('@')[0]}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-full uppercase">
                  {user.role?.replace('_', ' ')}
                </span>
              </div>
              <Link 
                href="/dashboard/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-orange-500 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
