import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
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
        await db.query(
          'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2',
          ['paid', session.metadata.bookingId]
        )

        // Get booking details to send confirmation
        const booking = await db.get(
          `SELECT b.*, up.email 
           FROM bookings b 
           JOIN user_profiles up ON b.user_id = up.id 
           WHERE b.id = $1`,
          [session.metadata.bookingId]
        )

        if (booking && booking.email) {
          // Get time slot details
          const timeSlot = await db.get(
            'SELECT date, start_time, end_time FROM time_slots WHERE id = $1',
            [booking.time_slot_id]
          )

          // Send confirmation email
          await sendBookingConfirmation(booking.email, {
            courtName: session.metadata.courtName || 'Court',
            date: timeSlot?.date || '',
            time: `${timeSlot?.start_time} - ${timeSlot?.end_time}` || '',
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
