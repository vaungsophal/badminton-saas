'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { createCheckoutSession } from '@/app/actions/payment'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
)

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
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const startCheckout = useCallback(async () => {
    try {
      setLoading(true)
      const response = await createCheckoutSession(
        bookingId,
        amount,
        courtName,
        date,
        time
      )
      setClientSecret(response.clientSecret)
    } catch (error) {
      console.error('Checkout error:', error)
      setLoading(false)
    }
  }, [bookingId, amount, courtName, date, time])

  useEffect(() => {
    startCheckout()
  }, [startCheckout])

  if (loading || !clientSecret) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Preparing payment...</p>
        </div>
      </Card>
    )
  }

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}
