'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { ABAPayment } from '@/components/aba-payment'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface PaymentCheckoutProps {
  bookingId: string
  amount: number
  courtName: string
  date: string
  time: string
}

export function PaymentCheckout({
  bookingId,
  amount,
  courtName,
  date,
  time,
}: PaymentCheckoutProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Simulate loading payment info
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Preparing payment...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <ABAPayment
      bookingId={bookingId}
      amount={amount}
      courtName={courtName}
      date={date}
      time={time}
      customerInfo={{
        firstname: user?.full_name?.split(' ')[0] || '',
        lastname: user?.full_name?.split(' ')[1] || '',
        email: user?.email || '',
        phone: user?.phone || ''
      }}
    />
  )
}
