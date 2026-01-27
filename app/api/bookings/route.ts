import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')

    let query = `
      SELECT 
        b.*,
        c.name as court_name,
        c.club_id,
        cl.name as club_name,
        cl.owner_id,
        up.email as customer_email,
        up.full_name as customer_name
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

    if (status) {
      conditions.push('b.status = $' + (params.length + 1))
      params.push(status)
    }

    if (startDate) {
      conditions.push('b.booking_date >= $' + (params.length + 1))
      params.push(startDate)
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
    const { time_slot_id, court_id, customer_id, player_count, booking_date } = body

    if (!time_slot_id || !court_id || !customer_id || !player_count || !booking_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Start a transaction
    await db.query('BEGIN')

    try {
      // Check if the time slot is still available
      const slotCheck = await db.query(
        'SELECT * FROM time_slots WHERE id = $1 AND is_available = true FOR UPDATE',
        [time_slot_id]
      )

      if (slotCheck.rows.length === 0) {
        await db.query('ROLLBACK')
        return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 409 })
      }

      // Get court details for pricing
      const courtResult = await db.query(
        'SELECT price_per_hour FROM courts WHERE id = $1',
        [court_id]
      )

      if (courtResult.rows.length === 0) {
        await db.query('ROLLBACK')
        return NextResponse.json({ error: 'Court not found' }, { status: 404 })
      }

      const court = courtResult.rows[0]
      const totalPrice = court.price_per_hour

      // Create the booking
      const bookingResult = await db.query(
        `INSERT INTO bookings (time_slot_id, court_id, customer_id, player_count, booking_date, total_price, status, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW()) 
         RETURNING *`,
        [time_slot_id, court_id, customer_id, player_count, booking_date, totalPrice]
      )

      const booking = bookingResult.rows[0]

      // Mark the time slot as unavailable
      await db.query(
        'UPDATE time_slots SET is_available = false, updated_at = NOW() WHERE id = $1',
        [time_slot_id]
      )

      // Commit the transaction
      await db.query('COMMIT')

      return NextResponse.json({ booking, status: 'pending' }, { status: 201 })
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
    const { id, owner_id, status } = body

    const result = await db.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 AND owner_id = $3 RETURNING *',
      [status, id, owner_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}