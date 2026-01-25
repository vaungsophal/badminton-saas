'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PaymentCheckout } from '@/components/payment-checkout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string
  const [bookingData, setBookingData] = useState<{
    id: string
    courtName: string
    date: string
    time: string
    amount: number
  } | null>(null)

  useEffect(() => {
    // In a real app, this would fetch from the database
    // For now, we'll use query params or stored state
    const searchParams = new URLSearchParams(window.location.search)
    setBookingData({
      id: bookingId,
      courtName: searchParams.get('court') || 'Downtown Badminton Club',
      date: searchParams.get('date') || '2024-02-10',
      time: searchParams.get('time') || '18:00 - 19:00',
      amount: parseInt(searchParams.get('amount') || '25'),
    })
  }, [bookingId])

  if (!bookingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
        <p className="text-gray-600">
          Secure payment for {bookingData.courtName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PaymentCheckout
            bookingId={bookingData.id}
            amount={bookingData.amount}
            courtName={bookingData.courtName}
            date={bookingData.date}
            time={bookingData.time}
          />
        </div>

        <div>
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Court</p>
                <p className="font-semibold text-gray-900">{bookingData.courtName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-semibold text-gray-900">
                  {bookingData.date} at {bookingData.time}
                </p>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${bookingData.amount}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Your payment is secured with Stripe encryption
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
