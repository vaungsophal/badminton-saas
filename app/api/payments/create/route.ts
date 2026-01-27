import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
    const payment = await db.query(`
      INSERT INTO payments (booking_id, amount, status, payment_method, transaction_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [
      booking_id,
      amount,
      status || 'pending',
      payment_method,
      tran_id
    ])

    return NextResponse.json({ success: true, payment: payment.rows[0] })
  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}