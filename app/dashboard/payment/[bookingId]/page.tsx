'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PaymentCheckout } from '@/components/payment-checkout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Loader2 } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      const searchParams = new URLSearchParams(window.location.search)
      setBookingData({
        id: bookingId,
        courtName: searchParams.get('court') || 'Badminton Court',
        date: searchParams.get('date') || new Date().toISOString().split('T')[0],
        time: searchParams.get('time') || '09:00 - 10:00',
        amount: parseInt(searchParams.get('amount') || '25'),
      })
      setLoading(false)
    }, 500)
  }, [bookingId])

  if (loading || !bookingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Loading payment...</p>
      </div>
    )
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payment</h1>
        <p className="text-sm text-gray-500">{bookingData.courtName}</p>
      </div>

      <Card className="rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Court</span>
            <span className="text-sm font-medium text-gray-900">{bookingData.courtName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm font-medium text-gray-900">{bookingData.date}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Time</span>
            <span className="text-sm font-medium text-gray-900">{bookingData.time}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-orange-500">${bookingData.amount}</span>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <PaymentCheckout
          bookingId={bookingData.id}
          amount={bookingData.amount}
          courtName={bookingData.courtName}
          date={bookingData.date}
          time={bookingData.time}
        />
      </Card>

      <p className="text-center text-xs text-gray-400">
        Secured by ABA PayWay
      </p>
    </div>
  )
}
