'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react'
import { abaPayway, type PaymentRequest } from '@/lib/aba-payway'

interface ABAPaymentProps {
  bookingId: string
  amount: number
  courtName: string
  date: string
  time: string
  customerInfo?: {
    firstname?: string
    lastname?: string
    email?: string
    phone?: string
  }
}

export function ABAPayment({
  bookingId,
  amount,
  courtName,
  date,
  time,
  customerInfo = {}
}: ABAPaymentProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstname: customerInfo.firstname || '',
    lastname: customerInfo.lastname || '',
    email: customerInfo.email || '',
    phone: customerInfo.phone || ''
  })

  const handlePayment = async () => {
    if (!formData.firstname || !formData.lastname || !formData.email || !formData.phone) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Generate unique transaction ID
      const tranId = abaPayway.generateTransactionId()

      // Create payment request
      const paymentRequest: PaymentRequest = {
        tran_id: tranId,
        amount: amount,
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        payment_description: `Court booking: ${courtName} on ${date} at ${time}`,
        return_url: `${window.location.origin}/dashboard/payment/${bookingId}/success`,
        continue_success_url: `${window.location.origin}/dashboard/payment/${bookingId}/success`
      }

      // Create payment and get redirect URL
      const { paymentUrl, tranId: transactionId } = abaPayway.createPaymentRequest(paymentRequest)

      // Save transaction info to database
      await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          tran_id: transactionId,
          amount: amount,
          payment_method: 'aba_payway',
          status: 'pending'
        })
      })

      // Redirect to ABA Payway
      window.location.href = paymentUrl

    } catch (err) {
      console.error('Payment error:', err)
      setError('Failed to initiate payment. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Secure Payment</h2>
          <p className="text-sm text-gray-600 mt-1">
            Pay with ABA Payway - Cambodia's trusted payment gateway
          </p>
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Court:</span>
              <span className="font-medium">{courtName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{time}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Total:</span>
              <span className="text-blue-600">${amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstname">First Name *</Label>
              <Input
                id="firstname"
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                placeholder="John"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastname">Last Name *</Label>
              <Input
                id="lastname"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+85512345678"
              required
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-600" />
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>ABA Payway Verified</span>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)} with ABA Payway`
          )}
        </Button>

        {/* ABA Payway Branding */}
        <div className="text-center text-xs text-gray-500">
          Powered by ABA Payway
        </div>
      </div>
    </Card>
  )
}