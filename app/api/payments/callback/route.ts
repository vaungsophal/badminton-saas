import { NextRequest, NextResponse } from 'next/server'
import { abaPayway } from '@/lib/aba-payway'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)

    // Verify the payment response
    const isValid = abaPayway.verifyPaymentResponse(params)

    if (!isValid) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/payment/error?error=invalid_signature`
      )
    }

    const { tran_id, status, payment_reference } = params

    if (status === 'success') {
      // Update payment status in database
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: tran_id,
          status: 'completed',
          payment_reference
        })
      })

      if (!response.ok) {
        console.error('Failed to update payment status')
      }

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/payment/success?transaction_id=${tran_id}&status=success`
      )
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/payment/error?transaction_id=${tran_id}&status=${status}`
      )
    }
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/payment/error?error=server_error`
    )
  }
}