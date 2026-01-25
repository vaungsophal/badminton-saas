'use client'

import React from "react"

import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Lock, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: '',
    phone: '',
  })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    bookingReminders: true,
    promotions: false,
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert('Settings saved successfully')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Account Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-400" />
              <Input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="bg-gray-100"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Contact support to change email
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h2>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={() =>
                  toggleNotification(key as keyof typeof notifications)
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-900">
                {key === 'emailNotifications'
                  ? 'Email Notifications'
                  : key === 'bookingReminders'
                    ? 'Booking Reminders'
                    : 'Promotional Emails'}
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </h2>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Current Password"
            className="bg-gray-50"
          />
          <Input
            type="password"
            placeholder="New Password"
            className="bg-gray-50"
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            className="bg-gray-50"
          />
          <Button className="bg-blue-600 hover:bg-blue-700">
            Update Password
          </Button>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          Cancel
        </Button>
      </div>
    </div>
  )
}
