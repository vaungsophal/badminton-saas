'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Wallet,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

interface CompanyNavProps {
  user: any
}

export function CompanyNav({ user }: CompanyNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  const isActive = (path: string) => pathname.startsWith(path)

  const menuItems = [
    { label: 'Dashboard', path: '/company', icon: LayoutDashboard },
    { label: 'Clubs', path: '/company/clubs', icon: Building2 },
    { label: 'Courts', path: '/company/courts', icon: Calendar },
    { label: 'Bookings', path: '/company/bookings', icon: Calendar },
    { label: 'Earnings', path: '/company/earnings', icon: Wallet },
    { label: 'Reports', path: '/company/reports', icon: FileText },
    { label: 'Settings', path: '/company/settings', icon: Settings },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/company" className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-gray-900 text-lg">BadmintonPro</span>
            <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">Owner</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right side - User & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-sm text-right">
                <p className="text-gray-900 font-medium">{user?.email}</p>
                <p className="text-gray-500 text-xs">Court Owner</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
