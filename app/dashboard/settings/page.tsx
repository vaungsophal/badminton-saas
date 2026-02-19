'use client'

import React from "react"
import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Lock, Bell, Shield, MapPin, Navigation, Save, Loader2 } from 'lucide-react'

interface UserLocation {
  city: string
  district: string
  latitude?: number
  longitude?: number
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [location, setLocation] = useState<UserLocation>({
    city: '',
    district: '',
    latitude: undefined,
    longitude: undefined,
  })

  const handleLocationChange = (field: keyof UserLocation, value: string) => {
    setLocation(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }))
          setSaved(false)
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const cities = [
    { value: 'phnom-penh', label: 'Phnom Penh' },
    { value: 'siem-reap', label: 'Siem Reap' },
    { value: 'sihanoukville', label: 'Sihanoukville' },
    { value: 'battambang', label: 'Battambang' },
    { value: 'kampot', label: 'Kampot' },
  ]

  const districts: Record<string, { value: string; label: string }[]> = {
    'phnom-penh': [
      { value: 'chamkarmon', label: 'Chamkarmon' },
      { value: 'tuol-kouk', label: 'Tuol Kouk' },
      { value: 'prampir-meakara', label: 'Prampir Meakara' },
      { value: 'boeng-trakuon', label: 'Boeng Trakuon' },
      { value: 'mean-chey', label: 'Mean Chey' },
      { value: 'russea-ket', label: 'Russey Ket' },
      { value: 'chraoy-chongvar', label: 'Chraoy Chongvar' },
      { value: 'por-sen-chey', label: 'Por Sen Chey' },
    ],
    'siem-reap': [
      { value: 'siem-reap-city', label: 'Siem Reap City' },
      { value: 'angkor-thom', label: 'Angkor Thom' },
    ],
  }

  return (
    <div className="pb-20 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="space-y-4">
        <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Profile</h2>
                <p className="text-xs text-gray-500">Your personal information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="h-11 pl-10 bg-gray-50 border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Full Name</label>
                  <Input
                    type="text"
                    defaultValue={user?.full_name || ''}
                    placeholder="Your name"
                    className="h-11 rounded-lg border-gray-200 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Phone</label>
                  <Input
                    type="tel"
                    defaultValue={user?.phone || ''}
                    placeholder="+855 000 000"
                    className="h-11 rounded-lg border-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Your Location</h2>
                <p className="text-xs text-gray-500">For finding nearby courts</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Get Nearby Courts</span>
                </div>
                <Button
                  type="button"
                  onClick={detectLocation}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-green-200 text-green-700 hover:bg-green-100 rounded-lg"
                >
                  Use GPS
                </Button>
              </div>

              {location.latitude && location.longitude && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location detected: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">City <span className="text-red-500">*</span></label>
                  <Select value={location.city} onValueChange={(v) => handleLocationChange('city', v)}>
                    <SelectTrigger className="h-11 rounded-lg border-gray-200 bg-white">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">District</label>
                  <Select 
                    value={location.district} 
                    onValueChange={(v) => handleLocationChange('district', v)}
                    disabled={!location.city || !districts[location.city]}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-gray-200 bg-white">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts[location.city]?.map((d) => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Setting your location helps us recommend the nearest courts and clubs.
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Notifications</h2>
                <p className="text-xs text-gray-500">Manage your alerts</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { key: 'emailNotifications', label: 'Email Updates', desc: 'Receive updates via email' },
                { key: 'bookingReminders', label: 'Booking Reminders', desc: 'Get reminded before your game' },
                { key: 'promotions', label: 'Promotions', desc: 'Special offers and discounts' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <button className="w-11 h-6 bg-emerald-500 rounded-full relative transition-colors">
                    <span className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-100 transition-all"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : saved ? (
            <Save className="w-4 h-4 mr-2" />
          ) : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
