'use server'

import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/auth'

export async function createCheckoutSession(
  bookingId: string,
  amount: number,
  courtName: string,
  date: string,
  time: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      throw new Error('User not authenticated')
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      redirect_on_completion: 'never',
      customer_email: user.email,
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
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'paid' })
      .eq('id', bookingId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Payment success error:', error)
    throw error
  }
}
