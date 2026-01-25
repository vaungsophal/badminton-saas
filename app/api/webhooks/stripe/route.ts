import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/auth'
import { sendBookingConfirmation } from '@/lib/email'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !webhookSecret) {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any

    if (session.payment_status === 'paid' && session.metadata?.bookingId) {
      try {
        // Update booking status
        await supabase
          .from('bookings')
          .update({ status: 'paid' })
          .eq('id', session.metadata.bookingId)

        // Get booking details to send confirmation
        const { data: booking } = await supabase
          .from('bookings')
          .select('*, user_profiles(email)')
          .eq('id', session.metadata.bookingId)
          .single()

        if (booking && booking.user_profiles?.email) {
          // Send confirmation email
          await sendBookingConfirmation(booking.user_profiles.email, {
            courtName: session.metadata.courtName || 'Court',
            date: booking.date || '',
            time: booking.time || '',
            amount: session.amount_total ? session.amount_total / 100 : 0,
            bookingId: session.metadata.bookingId,
          })
        }
      } catch (error) {
        console.error('Error processing successful payment:', error)
      }
    }
  }

  return new Response('Webhook processed', { status: 200 })
}
