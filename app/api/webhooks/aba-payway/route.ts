import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { abaPayway } from '@/lib/aba-payway'
import { sendBookingConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const responseParams = Object.fromEntries(new URLSearchParams(body))

    // Verify the payment response
    const isValid = abaPayway.verifyPaymentResponse(responseParams)
    
    if (!isValid) {
      console.error('Invalid ABA Payway signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const { tran_id, status, amount, payment_description } = responseParams

    if (!tran_id || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Update payment record
    const paymentResult = await db.query(`
      UPDATE payments 
      SET status = $1, updated_at = NOW(), gateway_response = $2
      WHERE transaction_id = $3 
      RETURNING *
    `, [
      status === '00' ? 'completed' : 'failed',
      JSON.stringify(responseParams),
      tran_id
    ])

    if (paymentResult.rows.length === 0) {
      console.error('Payment record not found for transaction:', tran_id)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const payment = paymentResult.rows[0]

    // If payment is successful, update booking status
    if (status === '00' && payment.booking_id) {
      await db.query(`
        UPDATE bookings 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [
        'confirmed',
        payment.booking_id
      ])

      // Get booking details to send confirmation
      const booking = await db.query(`
        SELECT b.*, c.name as court_name, cl.name as club_name, up.email as customer_email, up.full_name as customer_name
        FROM bookings b
        LEFT JOIN courts c ON b.court_id = c.id
        LEFT JOIN clubs cl ON c.club_id = cl.id
        LEFT JOIN user_profiles up ON b.customer_id = up.id
        WHERE b.id = $1
      `, [payment.booking_id])

      if (booking.rows.length > 0) {
        const bookingData = booking.rows[0]
        
        // Send confirmation email
        try {
          await sendBookingConfirmation(bookingData.customer_email, {
            courtName: bookingData.court_name,
            date: bookingData.booking_date,
            time: `${bookingData.start_time} - ${bookingData.end_time}`,
            amount: parseFloat(amount),
            bookingId: bookingData.id
          })
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError)
        }
      }
    }

    console.log('ABA Payway webhook processed successfully:', { tran_id, status, amount })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('ABA Payway webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}