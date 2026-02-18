'use client'

import React from "react"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ChevronLeft, Loader2 } from 'lucide-react'

export default function NewCourtPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    courts: '1',
    pricePerHour: '',
    description: '',
    amenities: [] as string[],
  })

  const amenitiesOptions = ['AC', 'Parking', 'WiFi', 'Shower', 'Locker', 'Canteen']

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const toggleAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter((a) => a !== amenity)
        : [...formData.amenities, amenity],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/dashboard?success=true')
    } catch (error) {
      alert('Failed to create court')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-20 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-orange-500 font-medium text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Court</h1>
        <p className="text-sm text-gray-500">Create a new court listing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Court Name</label>
              <Input
                type="text"
                name="name"
                placeholder="e.g., Court 1"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-11 rounded-lg border-gray-200 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Location</label>
              <Input
                type="text"
                name="location"
                placeholder="e.g., Phnom Penh"
                value={formData.location}
                onChange={handleChange}
                required
                className="h-11 rounded-lg border-gray-200 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Address</label>
              <textarea
                name="address"
                placeholder="Full address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm min-h-[80px]"
                required
              />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Courts</label>
              <select
                name="courts"
                value={formData.courts}
                onChange={handleChange}
                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Price/hr ($)</label>
              <Input
                type="number"
                name="pricePerHour"
                placeholder="25"
                value={formData.pricePerHour}
                onChange={handleChange}
                min="1"
                required
                className="h-11 rounded-lg border-gray-200 bg-white"
              />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
          <div className="grid grid-cols-3 gap-2">
            {amenitiesOptions.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  formData.amenities.includes(amenity)
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </Card>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Creating...' : 'Create Court'}
          </Button>
        </div>
      </form>
    </div>
  )
}
