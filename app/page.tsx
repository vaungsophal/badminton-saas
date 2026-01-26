'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

useEffect(() => {
    if (!loading) {
      if (user) {
        console.log('Main page - redirecting user with role:', user.role)
        // Redirect based on user role
        switch (user.role) {
          case 'admin':
            router.push('/admin')
            break
          case 'club_owner':
            router.push('/company')
            break
          case 'customer':
          default:
            router.push('/dashboard')
            break
        }
      } else {
        console.log('Main page - no user found, redirecting to auth')
        router.push('/auth')
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
