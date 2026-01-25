'use client'

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

  if (!user) return null

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-gray-900">Badminton Pro</span>
            </Link>

            <div className="hidden sm:flex items-center gap-6">
              {user.role === 'admin' && (
                <>
                  <Link href="/dashboard/admin" className="text-gray-600 hover:text-gray-900">
                    Admin
                  </Link>
                  <Link href="/dashboard/admin/courts" className="text-gray-600 hover:text-gray-900">
                    Courts
                  </Link>
                </>
              )}
              {user.role === 'club_owner' && (
                <>
                  <Link href="/company" className="text-gray-600 hover:text-gray-900 font-medium text-blue-600">
                    Club Owner Dashboard
                  </Link>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                    My Courts
                  </Link>
                  <Link href="/dashboard/bookings" className="text-gray-600 hover:text-gray-900">
                    Bookings
                  </Link>
                </>
              )}
              {user.role === 'customer' && (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                    Browse Courts
                  </Link>
                  <Link href="/dashboard/my-bookings" className="text-gray-600 hover:text-gray-900">
                    My Bookings
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <RealtimeNotifications />
            <Link href="/dashboard/settings" className="text-gray-600 hover:text-gray-900">
              <Settings className="w-5 h-5" />
            </Link>
            <div className="text-sm">
              <p className="text-gray-900 font-medium">{user.email}</p>
              <p className="text-gray-500 text-xs capitalize">{user.role.replace('_', ' ')}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
