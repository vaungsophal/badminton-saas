'use server'

import { abaPayway, type PaymentRequest } from '@/lib/aba-payway'
import { db } from '@/lib/db'

export async function createABAPayment(
  bookingId: string,
  amount: number,
  courtName: string,
  date: string,
  time: string,
  customerInfo: {
    firstname: string
    lastname: string
    email: string
    phone: string
  }
) {
  try {
    if (!customerInfo.email) {
      throw new Error('Customer email is required')
    }

    // Generate unique transaction ID
    const tranId = abaPayway.generateTransactionId()

    // Create payment request
    const paymentRequest: PaymentRequest = {
      tran_id: tranId,
      amount: amount,
      firstname: customerInfo.firstname,
      lastname: customerInfo.lastname,
      email: customerInfo.email,
      phone: customerInfo.phone,
      payment_description: `Court booking: ${courtName} on ${date} at ${time}`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/payment/${bookingId}/success`,
      continue_success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/payment/${bookingId}/success`
    }

    // Create payment and get redirect URL
    const { paymentUrl, tranId: transactionId } = abaPayway.createPaymentRequest(paymentRequest)

    // Save transaction info to database
    const payment = await db.query(`
      INSERT INTO payments (booking_id, amount, status, payment_method, transaction_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [
      bookingId,
      amount,
      'pending',
      'aba_payway',
      transactionId
    ])

    return {
      success: true,
      paymentUrl,
      tranId: transactionId,
      paymentId: payment.rows[0].id
    }
  } catch (error) {
    console.error('ABA Payway payment creation error:', error)
    throw error
  }
}

export async function verifyABAPayment(transactionId: string, responseParams: Record<string, string>) {
  try {
    // Verify the payment response hash
    const isValid = abaPayway.verifyPaymentResponse(responseParams)
    
    if (!isValid) {
      throw new Error('Invalid payment response signature')
    }

    // Update payment record
    const paymentResult = await db.query(`
      UPDATE payments 
      SET status = $1, updated_at = NOW() 
      WHERE transaction_id = $2 
      RETURNING *
    `, [
      responseParams.status === '00' ? 'completed' : 'failed',
      transactionId
    ])

    if (paymentResult.rows.length === 0) {
      throw new Error('Payment record not found')
    }

    const payment = paymentResult.rows[0]

    // If payment is successful, update booking status
    if (responseParams.status === '00' && payment.booking_id) {
      await db.query(`
        UPDATE bookings 
        SET status = $1, updated_at = NOW() 
        WHERE id = $2
      `, [
        'confirmed',
        payment.booking_id
      ])
    }

    return { 
      success: true, 
      payment: payment,
      bookingStatus: responseParams.status === '00' ? 'confirmed' : 'pending'
    }
  } catch (error) {
    console.error('ABA Payway verification error:', error)
    throw error
  }
}

export async function getTransactionStatus(transactionId: string) {
  try {
    const status = await abaPayway.checkTransactionStatus(transactionId)
    return status
  } catch (error) {
    console.error('Transaction status check error:', error)
    throw error
  }
}