import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { transaction_id, status, payment_reference } = await request.json()

    if (!transaction_id || !status) {
      return NextResponse.json(
        { error: 'Missing transaction_id or status' },
        { status: 400 }
      )
    }

    // Update payment record
    const paymentData = await db.update(
      'payments', 
      'stripe_payment_intent_id', 
      transaction_id,
      {
        status,
        updated_at: new Date(),
        metadata: payment_reference ? { payment_reference } : {}
      }
    )

    // If payment is successful, update booking status
    if (status === 'completed' && paymentData?.booking_id) {
      await db.update(
        'bookings',
        'id',
        paymentData.booking_id,
        {
          status: 'confirmed',
          updated_at: new Date()
        }
      )
    }

    return NextResponse.json({ success: true, payment: paymentData })
  } catch (error) {
    console.error('Payment update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}