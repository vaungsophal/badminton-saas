import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmation(
  email: string,
  bookingDetails: {
    courtName: string
    date: string
    time: string
    amount: number
    bookingId: string
  }
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">Booking Confirmed!</h1>
      <p>Your badminton court booking has been confirmed.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #1f2937; margin-top: 0;">Booking Details</h2>
        <p><strong>Court:</strong> ${bookingDetails.courtName}</p>
        <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${bookingDetails.time}</p>
        <p><strong>Amount Paid:</strong> $${bookingDetails.amount}</p>
        <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
      </div>
      
      <p style="color: #6b7280;">Thank you for booking with Badminton Pro!</p>
    </div>
  `

  return resend.emails.send({
    from: 'bookings@badmintonpro.com',
    to: email,
    subject: 'Your Badminton Booking Confirmed',
    html,
  })
}

export async function sendBookingReminder(
  email: string,
  bookingDetails: {
    courtName: string
    date: string
    time: string
    hoursUntil: number
  }
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">Booking Reminder</h1>
      <p>Your badminton court booking is coming up!</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #1f2937; margin-top: 0;">Booking Details</h2>
        <p><strong>Court:</strong> ${bookingDetails.courtName}</p>
        <p><strong>Date & Time:</strong> ${bookingDetails.date} at ${bookingDetails.time}</p>
        <p><strong>Time Until Booking:</strong> ${bookingDetails.hoursUntil} hours</p>
      </div>
      
      <p style="color: #6b7280;">Please arrive 10 minutes early!</p>
    </div>
  `

  return resend.emails.send({
    from: 'bookings@badmintonpro.com',
    to: email,
    subject: 'Reminder: Your Badminton Booking',
    html,
  })
}

export async function sendOwnerBookingNotification(
  ownerEmail: string,
  bookingDetails: {
    customerName: string
    customerEmail: string
    courtName: string
    date: string
    time: string
  }
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">New Booking</h1>
      <p>You have a new booking for your court!</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #1f2937; margin-top: 0;">Customer</h2>
        <p><strong>Name:</strong> ${bookingDetails.customerName}</p>
        <p><strong>Email:</strong> ${bookingDetails.customerEmail}</p>
        
        <h2 style="color: #1f2937; margin-top: 20px;">Booking Details</h2>
        <p><strong>Court:</strong> ${bookingDetails.courtName}</p>
        <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${bookingDetails.time}</p>
      </div>
      
      <p style="color: #6b7280;">Log in to your dashboard to view more details.</p>
    </div>
  `

  return resend.emails.send({
    from: 'bookings@badmintonpro.com',
    to: ownerEmail,
    subject: 'New Booking for Your Court',
    html,
  })
}
