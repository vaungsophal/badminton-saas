'use client'

import React from "react"

import { createContext, useContext, useEffect, useState } from 'react'
import type { UserRole } from '@/lib/auth'

interface User {
  id: string
  email: string
  role: UserRole
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
            }
          } else {
            console.log('Auth provider - token invalid, removing')
            // Token invalid, remove it
            localStorage.removeItem('auth_token')
            setToken(null)
          }
        } catch (error) {
          console.error('Error fetching current user:', error)
          localStorage.removeItem('auth_token')
          setToken(null)
        }
      }

      setLoading(false)
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
