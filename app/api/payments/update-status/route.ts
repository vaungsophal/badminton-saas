import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { abaPayway } from '@/lib/aba-payway'

export async function POST(request: NextRequest) {
  try {
    const { transaction_id, status, payment_reference, ...responseParams } = await request.json()

    if (!transaction_id || !status) {
      return NextResponse.json(
        { error: 'Missing transaction_id or status' },
        { status: 400 }
      )
    }

    // Verify payment response if it's from ABA Payway
    if (responseParams.hash) {
      const isValid = abaPayway.verifyPaymentResponse(responseParams)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid payment signature' },
          { status: 400 }
        )
      }
    }

    // Update payment record
    const paymentResult = await db.query(`
      UPDATE payments 
      SET status = $1, updated_at = NOW(), gateway_response = $2
      WHERE transaction_id = $3 
      RETURNING *
    `, [
      status,
      JSON.stringify(responseParams),
      transaction_id
    ])

    if (paymentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      )
    }

    const payment = paymentResult.rows[0]

    // If payment is successful, update booking status
    if (status === 'completed' && payment.booking_id) {
      await db.query(`
        UPDATE bookings 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
      `, [
        'confirmed',
        payment.booking_id
      ])
    }

    return NextResponse.json({ success: true, payment })
  } catch (error) {
    console.error('Payment update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}