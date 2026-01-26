'use server'

import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function createCheckoutSession(
  bookingId: string,
  amount: number,
  courtName: string,
  date: string,
  time: string,
  userEmail: string
) {
  try {
    if (!userEmail) {
      throw new Error('User not authenticated')
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      redirect_on_completion: 'never',
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: courtName,
              description: `${date} at ${time}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        bookingId,
      },
    })

    return { clientSecret: session.client_secret }
  } catch (error) {
    console.error('Checkout error:', error)
    throw error
  }
}

export async function handlePaymentSuccess(bookingId: string) {
  try {
    // Update booking status to paid
    const result = await db.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['paid', bookingId]
    )

    if (!result.rows.length) throw new Error('Booking not found')

    return { success: true }
  } catch (error) {
    console.error('Payment success error:', error)
    throw error
  }
}