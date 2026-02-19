'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { UserRole } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LayoutDashboard, Mail, Lock, Building, User, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('customer')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin'
      const body = {
        email,
        password,
        ...(isSignUp && { role, companyName: role === 'club_owner' ? companyName : undefined })
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Authentication failed')
      }

      const result = await response.json()

      if (result.token && result.user) {
        localStorage.setItem('auth_token', result.token)
        const targetUrl = result.user.role === 'admin' ? '/admin' :
          result.user.role === 'club_owner' ? '/company' : '/dashboard'
        window.location.replace(targetUrl)
      } else {
        throw new Error('Authentication failed - no session received')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'telegram') => {
    setSocialLoading(provider)
    setError('')

    try {
      const response = await fetch(`/api/auth/${provider}`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.url) {
        window.location.href = result.url
      } else {
        throw new Error(`Failed to initiate ${provider} login`)
      }
    } catch (err) {
      setError(`${provider} login failed. Please try again.`)
      setSocialLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="badmintonzone.com" className="h-16 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Book your badminton court</p>
        </div>

        <Card className="border-0 shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
          <div className="p-5">
            <div className="flex bg-gray-100 p-1 rounded-lg mb-5">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isSignUp ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isSignUp ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2.5 mb-4">
              <Button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={socialLoading !== null}
                className="w-full h-10 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm flex items-center justify-center gap-2"
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Continue with Google
              </Button>

              <Button
                type="button"
                onClick={() => handleSocialLogin('telegram')}
                disabled={socialLoading !== null}
                className="w-full h-10 bg-[#0088cc] hover:bg-[#0077b3] text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2"
              >
                {socialLoading === 'telegram' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                )}
                Continue with Telegram
              </Button>
            </div>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {isSignUp && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${role === 'customer'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Player
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('club_owner')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${role === 'club_owner'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <Building className="w-3.5 h-3.5" />
                      Club
                    </button>
                  </div>

                  {role === 'club_owner' && (
                    <Input
                      type="text"
                      placeholder="Club Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="h-10 rounded-lg text-sm"
                    />
                  )}
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 pl-10 rounded-lg text-sm"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 pl-10 rounded-lg text-sm"
                />
              </div>

              {!isSignUp && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-emerald-500 hover:text-emerald-600 font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-4">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  )
}
