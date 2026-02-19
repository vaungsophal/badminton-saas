'use client'

import { useState, useEffect } from 'react'
import { Bell, Clock, Calendar, CheckCircle, XCircle, AlertCircle, MapPin } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'

interface Notification {
  id: string
  type: 'booking' | 'reminder' | 'cancellation' | 'confirmation'
  title: string
  message: string
  court_name?: string
  booking_date?: string
  created_at: string
  read: boolean
}

export default function AlertsPage() {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="pb-20 space-y-3">
        <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="pb-20 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">{notifications.length} total</p>
        </div>
        {unreadCount > 0 && (
          <div className="px-3 py-1.5 bg-orange-50 rounded-full">
            <span className="text-xs font-semibold text-orange-600">{unreadCount} new</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationCard({ notification }: { notification: Notification }) {
  const icons = {
    booking: Calendar,
    reminder: Clock,
    cancellation: XCircle,
    confirmation: CheckCircle,
  }

  const colors = {
    booking: 'bg-blue-50 text-blue-500',
    reminder: 'bg-orange-50 text-orange-500',
    cancellation: 'bg-red-50 text-red-500',
    confirmation: 'bg-green-50 text-green-500',
  }

  const Icon = icons[notification.type] || AlertCircle
  const colorClass = colors[notification.type] || 'bg-gray-50 text-gray-500'

  return (
    <div className={`bg-white rounded-2xl border p-4 transition-all ${notification.read ? 'border-gray-100' : 'border-orange-200 shadow-sm'}`}>
      <div className="flex gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">{notification.title}</h3>
            {!notification.read && (
              <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
          {notification.court_name && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              {notification.court_name}
            </div>
          )}
          {notification.booking_date && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {notification.booking_date}
            </div>
          )}
          <p className="text-[10px] text-gray-300 mt-2">
            {new Date(notification.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
