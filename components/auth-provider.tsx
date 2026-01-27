'use client'

import React from "react"

import { createContext, useContext, useEffect, useState } from 'react'
import type { UserRole } from '@/lib/auth'

interface User {
  id: string
  email: string
  role: UserRole
  full_name?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function getUser() {
      const storedToken = localStorage.getItem('auth_token')
      
      if (storedToken && mounted) {
        setToken(storedToken)
        
        // Add retry mechanism for fetching user data
        let retryCount = 0
        const maxRetries = 3
        
        while (retryCount < maxRetries) {
          try {
            const response = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${storedToken}`
              }
            })
            
            if (response.ok) {
              const data = await response.json()
              if (mounted && data.user) {
                console.log('Auth provider - user loaded:', data.user.role)
                setUser(data.user)
                break // Success, exit retry loop
              }
            } else {
              console.log('Auth provider - token invalid, removing')
              localStorage.removeItem('auth_token')
              setToken(null)
              break
            }
          } catch (error) {
            console.error(`Error fetching current user (attempt ${retryCount + 1}):`, error)
            retryCount++
            
            if (retryCount < maxRetries) {
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 500))
            } else {
              localStorage.removeItem('auth_token')
              setToken(null)
            }
          }
        }
      }

      if (mounted) {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('auth_token')
    } catch (error) {
      console.error('Error during sign out:', error)
    } finally {
      setUser(null)
      setToken(null)
      // Force reload to clear all states and redirect
      window.location.href = '/auth'
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
