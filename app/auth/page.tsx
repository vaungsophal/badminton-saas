'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { UserRole } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('customer')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Sign up logic - ensure profile is created
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            role,
            companyName: role === 'club_owner' ? companyName : undefined,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Sign up failed')
        }

        const result = await response.json()

if (result.token && result.user) {
          localStorage.setItem('auth_token', result.token)
          console.log('User signed up successfully:', result.user.role)
          
          // Trigger a page reload to ensure auth context picks up the new token
          // This is more reliable than relying on the auth context to update immediately
          window.location.href = result.user.role === 'admin' ? '/admin' : 
                               result.user.role === 'club_owner' ? '/company' : '/dashboard'
        } else {
          throw new Error('Sign up failed - no token received')
        }
      } else {
        // Sign in logic - fetch user from database and verify role
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Sign in failed')
        }

        const result = await response.json()

if (result.token && result.user) {
          localStorage.setItem('auth_token', result.token)
          console.log('User signed in successfully:', result.user.role)
          
          // Trigger a page reload to ensure auth context picks up the new token
          // This is more reliable than relying on the auth context to update immediately
          window.location.href = result.user.role === 'admin' ? '/admin' : 
                               result.user.role === 'club_owner' ? '/company' : '/dashboard'
        } else {
          throw new Error('Sign in failed - no token received')
        }
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white overflow-hidden rounded-2xl">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold uppercase tracking-widest">{isSignUp ? 'Join Us' : 'Welcome Back'}</h1>
          <p className="text-blue-100 text-sm mt-1 opacity-80">{isSignUp ? 'Start your badminton journey' : 'Sign in to your dashboard'}</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded flex items-center gap-3">
              <span className="font-bold cursor-default">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">User Type</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
                  >
                    <option value="customer">Player / Customer</option>
                    <option value="club_owner">Club / Court Owner</option>
                    <option value="admin">Platform Admin</option>
                  </select>
                </div>

                {role === 'club_owner' && (
                  <Input
                    type="text"
                    placeholder="Club / Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="h-11 rounded-xl border-gray-200"
                  />
                )}
              </div>
            )}

            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-xl border-gray-200"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-xl border-gray-200"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In Now'}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-gray-500 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                className="ml-2 text-blue-600 hover:underline font-bold"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
