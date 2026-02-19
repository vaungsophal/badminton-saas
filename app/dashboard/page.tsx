'use client'

import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Users, Clock, Star, TrendingUp, Heart, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (user?.role === 'club_owner') {
    return <ClubOwnerDashboard />
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  return <CustomerDashboard />
}

function CustomerDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const [featuredCourts, setFeaturedCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'weekend'>('today')

  useEffect(() => {
    fetchFeaturedCourts()
  }, [])

  const fetchFeaturedCourts = async () => {
    try {
      const response = await fetch('/api/courts/search?limit=6')
      const data = await response.json()
      setFeaturedCourts(data.courts?.slice(0, 6) || [])
    } catch (error) {
      console.error('Error fetching courts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-20 space-y-6 sm:space-y-8">
      {/* Header & Welcome */}
      {/* <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <img src="/logo.png" alt="badmintonzone.com" className="h-10" />
          </h1>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <MapPin className="w-3 h-3" />
            <span>Phnom Penh</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
          <Users className="w-5 h-5 text-emerald-500" />
        </div>
      </div> */}

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search courts, clubs..."
          className="w-full bg-white border border-gray-100 py-3.5 pl-11 pr-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
        />
      </div>

      {/* Promo Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-green-500 p-6 text-white shadow-lg shadow-green-200">
        <div className="relative z-10 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">30% off</p>
          <h3 className="text-xl font-bold leading-tight">Today&apos;s Special</h3>
          <p className="text-xs opacity-90 max-w-[200px]">Get Premium membership today & enjoy 30% discount...</p>
        </div>
        {/* Abstract shapes for decoration */}
        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-[-20%] left-[40%] w-24 h-24 bg-white/5 rounded-full blur-xl" />
        {/* Simulated Image */}
        <div className="absolute right-4 bottom-0 w-24 h-24 translate-y-4 rotate-12 opacity-50">
          <TrendingUp className="w-full h-full text-white" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <MapPin className="w-5 h-5" />, label: 'Book Court', color: 'bg-green-500' },
          { icon: <TrendingUp className="w-5 h-5" />, label: 'Buy Racket', color: 'bg-blue-500' },
          { icon: <StarsIcon className="w-5 h-5" />, label: 'Take Lesson', color: 'bg-emerald-500' },
        ].map((action, i) => (
          <button key={i} className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all active:scale-95 group">
            <div className={`${action.color} p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className="text-[11px] font-bold text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Featured Courts Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Featured Courts</h2>
          <button
            onClick={() => router.push('/dashboard/browse')}
            className="text-emerald-500 text-sm font-bold hover:underline"
          >
            View All
          </button>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide no-scrollbar">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="min-w-[260px] h-64 bg-gray-100 rounded-2xl animate-pulse" />
            ))
          ) : (
            featuredCourts.map((court) => (
              <div
                key={court.id}
                onClick={() => router.push(`/dashboard/book/${court.id}`)}
                className="min-w-[260px] max-w-[280px] bg-white rounded-2xl overflow-hidden border border-gray-50 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="h-40 bg-gray-100 relative">
                  {court.images?.[0] ? (
                    <img src={court.images[0]} alt={court.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Featured
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-500 transition-colors">{court.name}</h3>
                  <p className="text-xs text-gray-500">{court.club_name || 'Racket Badminton Club'}</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-emerald-500 font-black">${court.price_per_hour}/hr</span>
                    <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Open Now
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Booking Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Quick Booking</h2>

        {/* Custom Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['today', 'tomorrow', 'weekend'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Booking List */}
        <div className="space-y-3">
          {featuredCourts.slice(0, 3).map((court, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-50 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 truncate">
                  {i === 0 ? '10:00 - 11:00 AM' : i === 1 ? '2:00 - 3:00 PM' : '5:00 - 6:00 PM'}
                </h4>
                <p className="text-xs text-gray-500 truncate">{court.name}, {court.club_name || 'Racket Club'}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-black text-gray-900">${court.price_per_hour}</span>
                <Button
                  size="sm"
                  onClick={() => router.push(`/dashboard/book/${court.id}`)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-8 px-4 rounded-lg shadow-lg shadow-emerald-100 active:scale-95"
                >
                  Book
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StarsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}


function ClubOwnerDashboard() {
  const router = useRouter()

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Owner Dashboard</h1>
          <p className="text-gray-500 font-medium">Manage your racket business overview</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/dashboard/courts/new')}
            className="h-12 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center gap-2"
          >
            Add New Court
          </Button>
          <Button
            onClick={() => router.push('/dashboard/bookings')}
            variant="outline"
            className="h-12 px-6 border-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all"
          >
            All Bookings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={MapPin}
          label="Active Courts"
          value="4"
          trend="+1 this month"
          color="emerald"
        />
        <StatCard
          icon={Clock}
          label="Today's Games"
          value="8"
          trend="Next: 2:00 PM"
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Estimated Revenue"
          value="$2,400"
          trend="↑ 12% vs last month"
          color="green"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-gray-900">Recent Activity</h2>
          <Button variant="ghost" className="text-emerald-500 font-bold hover:bg-emerald-50">View Report</Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">New Booking - Court #{i + 1}</p>
                  <p className="text-xs text-gray-400 font-medium">2 hours ago</p>
                </div>
              </div>
              <span className="text-xs font-black text-green-500 uppercase tracking-widest">+ $30.00</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, trend, color }: { icon: any, label: string, value: string, trend: string, color: 'emerald' | 'blue' | 'green' | 'purple' }) {
  const colorStyles = {
    emerald: 'bg-emerald-50 text-emerald-500',
    blue: 'bg-blue-50 text-blue-500',
    green: 'bg-green-50 text-green-500',
    purple: 'bg-purple-50 text-purple-500'
  }

  return (
    <Card className="rounded-[2.5rem] border-none shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-gray-100 group">
      <div className="p-8 sm:p-10 space-y-6">
        <div className="flex items-start justify-between">
          <div className={`w-14 h-14 ${colorStyles[color]} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-4xl font-black text-gray-900">{value}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-50">
          <p className="text-xs font-bold text-gray-400 italic">{trend}</p>
        </div>
      </div>
    </Card>
  )
}


function AdminDashboard() {
  const router = useRouter()

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight text-emerald-500">Platform Admin</h1>
          <p className="text-gray-500 font-medium">Global racket network management</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/dashboard/admin/courts')}
            className="h-12 px-6 bg-gray-900 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-gray-200 transition-all active:scale-95 flex items-center gap-2"
          >
            Manage Courts
          </Button>
          <Button
            onClick={() => router.push('/dashboard/admin/users')}
            variant="outline"
            className="h-12 px-6 border-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all"
          >
            Manage Users
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value="1,234"
          trend="↑ 45 today"
          color="emerald"
        />
        <StatCard
          icon={MapPin}
          label="Total Courts"
          value="156"
          trend="In 12 cities"
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Daily Games"
          value="342"
          trend="Record high: 410"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] p-8 border border-gray-50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16" />
          <h2 className="text-xl font-black text-gray-900 mb-6">System Health</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">API Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-black text-gray-900">OPERATIONAL</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs font-black text-gray-900">HEALTHY</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2.5rem] p-8 border border-gray-50 shadow-sm bg-emerald-500 text-white">
          <h2 className="text-xl font-black mb-2">Pro Subscription</h2>
          <p className="text-emerald-100 font-medium text-sm mb-6">You have 12 pending club owner applications to review.</p>
          <Button className="w-full bg-white text-emerald-500 hover:bg-emerald-50 font-black rounded-2xl h-12 shadow-xl shadow-emerald-600/20">Review Applications</Button>
        </Card>
      </div>
    </div>
  )
}

