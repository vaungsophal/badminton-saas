'use client'

import React from 'react'
import { useAuth } from '@/components/auth-provider'
import { CompanyNav } from '@/components/company-nav'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

useEffect(() => {
    if (loading) return // Don't redirect while loading

    if (!user) {
      console.log('Company layout - no user, redirecting to auth')
      router.push('/auth')
      return
    }

    if (user.role !== 'club_owner') {
      console.log('Company layout - user role mismatch, redirecting to dashboard. User role:', user.role)
      router.push('/dashboard')
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

  if (!user || user.role !== 'club_owner') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
