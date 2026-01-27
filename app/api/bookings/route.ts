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