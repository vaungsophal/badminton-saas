import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { booking_id, tran_id, amount, payment_method, status } = await request.json()

    if (!booking_id || !tran_id || !amount || !payment_method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create payment record
    const payment = await db.insert('payments', {
      booking_id,
      amount,
      status,
      payment_method,
      stripe_payment_intent_id: tran_id, // Using this field for ABA transaction ID
      created_at: new Date(),
      updated_at: new Date()
    })

    return NextResponse.json({ success: true, payment })
  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}