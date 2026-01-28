import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')
    const customerId = searchParams.get('customer_id')
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = `
SELECT 
        b.*,
        c.name as court_name,
        c.club_id,
        cl.name as club_name,
        cl.owner_id,
        up.email as customer_email,
        up.full_name as customer_name,
        CAST(b.total_price AS DECIMAL) as total_price,
        CAST(b.commission_amount AS DECIMAL) as commission_amount
      FROM bookings b
      LEFT JOIN courts c ON b.court_id = c.id
      LEFT JOIN clubs cl ON c.club_id = cl.id
      LEFT JOIN user_profiles up ON b.customer_id = up.id
    `
    const params = []
    const conditions = []

if (ownerId) {
      conditions.push('cl.owner_id = $' + (params.length + 1))
      params.push(ownerId)
    }

    if (customerId) {
      conditions.push('b.customer_id = $' + (params.length + 1))
      params.push(customerId)
    }

    if (status) {
      conditions.push('b.status = $' + (params.length + 1))
      params.push(status)
    }

if (startDate) {
      conditions.push('b.booking_date >= $' + (params.length + 1))
      params.push(startDate)
    }

    if (endDate) {
      conditions.push('b.booking_date <= $' + (params.length + 1))
      params.push(endDate)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY b.booking_date DESC, b.start_time DESC'

    const result = await db.query(query, params)
    const bookings = result.rows
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      court_id, 
      customer_id, 
      player_count, 
      booking_date, 
      time_slot_id,
      payment_method = 'aba_payway' 
    } = body

    // Validate required fields
    const requiredFields = ['court_id', 'customer_id', 'player_count', 'booking_date', 'time_slot_id'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }

    // Validate player count
    const playerCountNum = parseInt(player_count);
    if (isNaN(playerCountNum) || playerCountNum < 1 || playerCountNum > 6) {
      return NextResponse.json({ 
        error: 'Player count must be between 1 and 6' 
      }, { status: 400 })
    }

    // Start a transaction
    await db.query('BEGIN')

    try {
      // Get court and club details
      const courtResult = await db.query(`
        SELECT c.*, cl.owner_id, cl.name as club_name 
        FROM courts c 
        JOIN clubs cl ON c.club_id = cl.id 
        WHERE c.id = $1
      `, [court_id])

      if (courtResult.rows.length === 0) {
        await db.query('ROLLBACK')
        return NextResponse.json({ error: 'Court not found' }, { status: 404 })
      }

      const court = courtResult.rows[0]
      const totalPrice = parseFloat(court.price_per_hour)
      
      if (isNaN(totalPrice) || totalPrice <= 0) {
        await db.query('ROLLBACK')
        return NextResponse.json({ error: 'Invalid court price' }, { status: 400 })
      }

      // Get time slot details and check if it's already booked
      const timeSlotResult = await db.query(`
        SELECT ts.*, b.id as booking_id 
        FROM time_slots ts 
        LEFT JOIN bookings b ON ts.booking_id = b.id AND b.status NOT IN ('cancelled', 'completed')
        WHERE ts.id = $1
      `, [time_slot_id])

      if (timeSlotResult.rows.length === 0) {
        await db.query('ROLLBACK')
        return NextResponse.json({ error: 'Time slot not found' }, { status: 404 })
      }

      const timeSlot = timeSlotResult.rows[0]
      if (timeSlot.booking_id) {
        await db.query('ROLLBACK')
        return NextResponse.json({ error: 'Time slot is already booked' }, { status: 409 })
      }

      

      // Calculate commission (10% by default, but get from platform settings)
      const platformSettings = await db.query('SELECT commission_rate FROM platform_settings LIMIT 1')
      const commissionRate = parseFloat(platformSettings.rows[0]?.commission_rate) || 10
      const commissionAmount = (totalPrice * commissionRate) / 100

      // Determine booking status based on payment method
      const bookingStatus = payment_method === 'aba_payway' ? 'confirmed' : 'pending'

      // Create the booking
      const bookingResult = await db.query(`
        INSERT INTO bookings (
          court_id, 
          club_id, 
          customer_id, 
          owner_id, 
          booking_date, 
          start_time, 
          end_time, 
          total_price, 
          commission_amount, 
          status, 
          payment_method, 
          player_count, 
          time_slot_id,
          created_at, 
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) 
        RETURNING *
      `, [
        court_id,
        court.club_id,
        customer_id,
        court.owner_id,
        booking_date,
        timeSlot.start_time,
        timeSlot.end_time,
        totalPrice,
        commissionAmount,
        bookingStatus,
        payment_method,
        player_count,
        time_slot_id
      ])

      const booking = bookingResult.rows[0]

      // Create payment record if ABA PayWay
      if (payment_method === 'aba_payway') {
        await db.query(`
          INSERT INTO payments (
            booking_id, 
            amount, 
            status, 
            payment_method, 
            transaction_id,
            created_at, 
            updated_at
          ) VALUES ($1, $2, 'completed', $3, 'AUTO_APPROVED', NOW(), NOW())
        `, [booking.id, totalPrice, payment_method])
      }

      // Commit the transaction
      await db.query('COMMIT')

      return NextResponse.json({ 
        booking: booking, 
        status: bookingStatus,
        message: bookingStatus === 'confirmed' 
          ? 'Booking confirmed and payment processed successfully' 
          : 'Booking created pending payment confirmation',
        id: booking.id
      }, { status: 201 })

    } catch (error) {
      // Rollback on any error
      await db.query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, owner_id, customer_id, status, create_payment } = body

    // Start a transaction
    await db.query('BEGIN')

    try {
      let result
      
      if (owner_id) {
        // Owner update
        result = await db.query(
          'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 AND owner_id = $3 RETURNING *',
          [status, id, owner_id]
        )
      } else if (customer_id) {
        // Customer update (for cancellation)
        result = await db.query(
          'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 AND customer_id = $3 RETURNING *',
          [status, id, customer_id]
        )
      } else {
        await db.query('ROLLBACK')
        return NextResponse.json({ error: 'Unauthorized update' }, { status: 401 })
      }

      if (result.rows.length === 0) {
        await db.query('ROLLBACK')
        return NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 })
      }

      const booking = result.rows[0]

      // If confirming a pending booking and it's pay later, create payment record
      if (create_payment && status === 'confirmed' && booking.payment_method === 'pay_later') {
        await db.query(`
          INSERT INTO payments (
            booking_id, 
            amount, 
            status, 
            payment_method, 
            transaction_id,
            created_at, 
            updated_at
          ) VALUES ($1, $2, 'completed', $3, 'MANUAL_CONFIRMED', NOW(), NOW())
        `, [booking.id, booking.total_price, booking.payment_method])
      }

      await db.query('COMMIT')
      return NextResponse.json(booking)
    } catch (error) {
      await db.query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}